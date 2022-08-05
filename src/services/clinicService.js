import db from "../models";

const createClinic = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!data.name || !data.imageBase64 || !data.address 
                || !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameters'
                })
            } else {
                await db.Clinic.create({
                    name: data.name,
                    address: data.address,
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

const getAllClinic = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Clinic.findAll();
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

const getDetailClinicById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameters'
                })
            } else {
                let data = await db.Clinic.findOne({
                    where: {id: id},
                    attributes: ['name', 'address', 'descriptionHTML', 'descriptionMarkdown']
                });
                if(data) {
                    let doctorClinic = [];
                    doctorClinic = await db.Doctor_Infor.findAll({
                        where: { clinicId: id },
                        attributes: ['doctorId', 'provinceId']
                    })
                    data.doctorClinic = doctorClinic;
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
    createClinic, getAllClinic, getDetailClinicById
}