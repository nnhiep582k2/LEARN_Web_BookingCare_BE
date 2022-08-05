import clinicService from '../services/clinicService';

const createClinic = async (req, res) => {
    try {
        let infor = await clinicService.createClinic(req.body);
        return res.status(200).json(infor);
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        });
    }
}

const getAllClinic = async (req, res) => {
    try {
        let infor = await clinicService.getAllClinic();
        return res.status(200).json(infor);
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        });
    }
}

const getDetailClinicById = async (req, res) => {
    try {
        let infor = await clinicService.getDetailClinicById(req.query.id);
        return res.status(200).json(infor);
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        });
    }
}

module.exports = {
    createClinic, getAllClinic, getDetailClinicById
}