import db from '../models/index';
import _ from 'lodash';
require('dotenv').config();
import emailService from '../services/emailService';

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

const getTopDoctorHome = (limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limit,
                where: { roleId: 'R2' },
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: ['password'],
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
                ],
                raw: true,
                nest: true
            })
            resolve({
                errCode: 0,
                data: users
            });
        } catch(err) {
            reject(err);
        }
    })
}

const getAllDoctors = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image'],
                },
            });
            resolve({
                errCode: 0,
                data: doctors
            });
        } catch(err) {
            reject(err);
        }
    });
}

const checkRequiredFields = (data) => {
    let arrFields = ['doctorId', 'contentHTML', 'contentMarkdown', 'action', 'selectedPrice', 
            'selectedPayment', 'selectedProvince', 'nameClinic', 'addressClinic', 'note', 
            'specialtyId']
    let isValid = true;
    let element = '';
    for(let i = 0; i < arrFields.length; i++) {
        if(!data[arrFields[i]]) {
            isValid = false;
            element = arrFields[i];
            break;
        }
    }
    return {
        isValid,
        element
    }
}

const saveDetailInforDoctor = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkObj = checkRequiredFields(data);

            if(checkObj.isValid === false) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameters: ${checkObj.element}`
                })
            } else {
                // upsert to markdown
                if(data.action === 'CREATE') {
                    await db.Markdown.create({
                        contentHTML: data.contentHTML,
                        contentMarkdown: data.contentMarkdown,
                        description: data.description,
                        doctorId: data.doctorId
                    });
                } else if(data.action === 'EDIT') {
                    let markdown = await db.Markdown.findOne({
                        where: { doctorId: data.doctorId },
                        raw: false
                    })
                    if(markdown) {
                        markdown.contentHTML = data.contentHTML;
                        markdown.contentMarkdown = data.contentMarkdown;
                        markdown.description = data.description;
                        await markdown.save();
                    }
                }
                // upsert to doctor_infor table
                let doctorInfor = await db.Doctor_Infor.findOne({
                    where: { doctorId: data.doctorId },
                    raw: false
                });
                if(doctorInfor) {
                    // update
                    doctorInfor.doctorId = data.doctorId;
                    doctorInfor.priceId = data.selectedPrice;
                    doctorInfor.paymentId = data.selectedPayment;
                    doctorInfor.provinceId = data.selectedProvince;
                    doctorInfor.nameClinic = data.nameClinic;
                    doctorInfor.addressClinic = data.addressClinic;
                    doctorInfor.note = data.note;
                    doctorInfor.specialtyId = data.specialtyId;
                    doctorInfor.clinicId = data.clinicId;
                    await doctorInfor.save();
                } else {
                    // create
                    await db.Doctor_Infor.create({
                        doctorId: data.doctorId,
                        priceId: data.selectedPrice,
                        paymentId: data.selectedPayment,
                        provinceId: data.selectedProvince,
                        nameClinic: data.nameClinic,
                        addressClinic: data.addressClinic,
                        note: data.note,
                        specialtyId: data.specialtyId,
                        clinicId: data.clinicId,
                    });
                }
                resolve({
                    errCode: 0,
                    errMessage: 'Save infor doctor successfully!'
                });
            }
        } catch(err) {
            reject(err);
        }
    });
}

const getDetailDoctorById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                });
            } else {
                let data = await db.User.findOne({
                    where: { id: inputId },
                    attributes: {
                        exclude: ['password'],
                    },
                    include: [
                        { 
                            model: db.Markdown, 
                            attributes: [ 'description', 'contentHTML', 'contentMarkdown' ] 
                        },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                        { 
                            model: db.Doctor_Infor, 
                            attributes: {
                                exclude: [ 'id', 'doctorId' ],
                            },
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                            ]
                        },
                    ],
                    raw: false,
                    nest: true  
                });
                if(data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }
                if(!data) data = {};
                resolve({
                    errCode: 0,
                    data
                })
            }
        } catch(err) {
            reject(err);
        }
    });
}

const bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!data.arrSchedule || !data.doctorId || !data.formattedDate) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                });
            } else {
                let schedule = data.arrSchedule;
                if(schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    });
                }
                // get all existing data
                let existing = await db.Schedule.findAll({ 
                    where: { doctorId: data.doctorId, date: data.formattedDate },
                    attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
                    raw: true
                });
                // compare different
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date;
                });
                // create data
                if(toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate);
                }
                resolve({
                    errCode: 0,
                    errMessage: 'Okay'
                });
            }
        } catch(err) {
            reject(err);
        }
    });
}

const getSheduleByDate = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters',
                });
            } else {
                let data = await db.Schedule.findAll({
                    where: { doctorId: doctorId, date: date },
                    include: [
                        { model: db.Allcode, as: 'timeTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.User, as: 'doctorData', attributes: ['firstName', 'lastName'] },
                    ],
                    raw: false,
                    nest: true  
                });
                if(!data) data = [];
                resolve({
                    errCode: 0,
                    data: data
                });
            }
        } catch(err) {
            reject(err);
        }
    })
}

const getExtraInforDoctorById = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters',
                });
            } else {
                let data = await db.Doctor_Infor.findOne({
                    where: { 
                        doctorId: doctorId,
                    },
                    attributes: {
                        exclude: [ 'id', 'doctorId' ],
                    },
                    include: [
                        { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                    ],
                    raw: false,
                    nest: true
                })
                if(!data) data = {};
                resolve({
                    errCode: 0,
                    data: data
                });
            }
        } catch(err) {
            reject(err);
        }
    });
}

const getProfileDoctorById = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!doctorId) {
                resolve({
                    errCode: -1,
                    errMessage: 'Missing required parameters'
                });
            } else {
                let data = await db.User.findOne({
                    where: { id: doctorId },
                    attributes: {
                        exclude: ['password'],
                    },
                    include: [
                        { 
                            model: db.Markdown, 
                            attributes: [ 'description', 'contentHTML', 'contentMarkdown' ] 
                        },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                        { 
                            model: db.Doctor_Infor, 
                            attributes: {
                                exclude: [ 'id', 'doctorId' ],
                            },
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                            ]
                        },
                    ],
                    raw: false,
                    nest: true  
                });
                if(data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }
                if(!data) data = {};
                resolve({
                    errCode: 0,
                    data
                })
            }
        } catch(err) {
            reject(err);
        }
    })
} 

const getListPatientForDoctor = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                });
            } else {
                let data = await db.Booking.findAll({
                    where: { 
                        statusId: 'S2', 
                        doctorId: doctorId,
                        date: date
                    },
                    include: [
                        { 
                            model: db.User, as: 'patientData',
                            attributes: [ 'email', 'firstName', 'address', 'gender' ],
                            include: [
                                { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
                            ]
                        },
                        {
                            model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueEn', 'valueVi']
                        }
                    ],
                    raw: false,
                    nest: true
                })
                resolve({
                    errCode: 0,
                    data
                })
            }
        } catch(err) {  
            reject(err);
        }
    })
}

const sendRemedy = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!data.email || !data.doctorId || !data.patientId || !data.timeType) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                });
            } else {
                // update patient status
                let appointment = await db.Booking.findOne({
                    where: { 
                        doctorId: data.doctorId,
                        patientId: data.patientId,
                        timeType: data.timeType,
                        statusId: 'S2'
                    },
                    raw: false
                })
                if(appointment) {
                    appointment.statusId = 'S3';
                    await appointment.save();
                }

                // send email remedy
                await emailService.sendAttachment(data);
                resolve({
                    errCode: 0,
                    errMessage: 'Okay'
                })
            }
        } catch(err) {  
            reject(err);
        }
    })
}

module.exports = {
    getTopDoctorHome, getAllDoctors, saveDetailInforDoctor,
    getDetailDoctorById, bulkCreateSchedule, getSheduleByDate,
    getExtraInforDoctorById, getProfileDoctorById, getListPatientForDoctor,
    sendRemedy
}