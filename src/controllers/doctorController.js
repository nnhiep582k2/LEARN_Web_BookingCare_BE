import doctorService from '../services/doctorService';

const getTopDoctorHome = async (req, res) => {
    let limit = req.query.limit;
    if(!limit) limit = 10;
    try {
        let response = await doctorService.getTopDoctorHome(+limit); //dấu cộng để convert từ string sang int
        return res.status(200).json(response);
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server!'
        })
    }
}

const getAllDoctors = async (req, res) => {
    try {
        let doctors = await doctorService.getAllDoctors();
        return res.status(200).json(doctors);
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        });
    }
}

const postInforDoctors = async (req, res) => {
    try {
        let response = await doctorService.saveDetailInforDoctor(req.body);
        return res.status(200).json(response);
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        });
    }
}

const getDetailDoctorById = async (req, res) => {
    try {
        let infor = await doctorService.getDetailDoctorById(req.query.id);
        return res.status(200).json(infor);
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        });
    }
}

const bulkCreateSchedule = async (req, res) => {
    try {
        let infor = await doctorService.bulkCreateSchedule(req.body);
        return res.status(200).json(infor);
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        });
    }
}

const getSheduleByDate = async (req, res) => {
    try {
        let infor = await doctorService.getSheduleByDate(req.query.doctorId, req.query.date);
        return res.status(200).json(infor);
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        });
    }
}

const getExtraInforDoctorById = async (req, res) => {
    try {
        let infor = await doctorService.getExtraInforDoctorById(req.query.doctorId);
        return res.status(200).json(infor);
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        });
    }
}

const getProfileDoctorById = async (req, res) => {
    try {
        let infor = await doctorService.getProfileDoctorById(req.query.doctorId);
        return res.status(200).json(infor);
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        });
    }
}

const getListPatientForDoctor = async (req, res) => {
    try {
        let infor = await doctorService.getListPatientForDoctor(req.query.doctorId, req.query.date);
        return res.status(200).json(infor);
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        });
    }
}

const sendRemedy = async (req, res) => {
    try {
        let infor = await doctorService.sendRemedy(req.body);
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
    getTopDoctorHome, getAllDoctors, postInforDoctors, getDetailDoctorById,
    bulkCreateSchedule, getSheduleByDate, getExtraInforDoctorById,
    getProfileDoctorById, getListPatientForDoctor, sendRemedy
}