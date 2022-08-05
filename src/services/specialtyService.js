const { reject } = require("lodash");
const db = require("../models");

const createSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!data.name || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameters'
                })
            } else {
                await db.Specialty.create({
                    name: data.name,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown,
                });
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

const getAllSpecialty = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Specialty.findAll();
            if(data && data.length > 0) {
                data.map(item => {
                    item.image = new Buffer(item.image, 'base64').toString('binary');
                    return item;
                });
            }
            resolve({
                errCode: 0,
                errMessage: 'Okay',
                data
            });
        } catch(err) {
            reject(err);
        }
    });
}

const  getDetailSpecialtyById = (id, location) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!id || !location) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameters'
                })
            } else {
                let data = await db.Specialty.findOne({
                    where: {id: id},
                    attributes: ['descriptionHTML', 'descriptionMarkdown']
                });
                if(data) {
                    let doctorSpecialty = [];
                    if(location === 'All') {
                        doctorSpecialty = await db.Doctor_Infor.findAll({
                            where: { specialtyId: id },
                            attributes: ['doctorId', 'provinceId']
                        })
                    } else {
                        // find by location
                        doctorSpecialty = await db.Doctor_Infor.findAll({
                            where: { 
                                specialtyId: id, 
                                provinceId: location 
                            },
                            attributes: ['doctorId', 'provinceId']
                        })
                    }
                    data.doctorSpecialty = doctorSpecialty;
                } else data = {};
                resolve({
                    errCode: 0,
                    errMessage: 'Okay',
                    data
                });
            }
        } catch(err) {
            reject(err);
        }
    })
}

module.exports = {
    createSpecialty, getAllSpecialty, getDetailSpecialtyById
}