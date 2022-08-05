import specialtyService from '../services/specialtyService';

const createSpecialty = async (req, res) => {
    try {
        let infor = await specialtyService.createSpecialty(req.body);
        return res.status(200).json(infor);
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        });
    }
} 

const getAllSpecialty = async (req, res) => {
    try {
        let infor = await specialtyService.getAllSpecialty();
        return res.status(200).json(infor);
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        });
    }
}

const getDetailSpecialtyById = async (req, res) => {
    try {
        let infor = await specialtyService.getDetailSpecialtyById(req.query.id, req.query.location);
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
    createSpecialty, getAllSpecialty, getDetailSpecialtyById
}