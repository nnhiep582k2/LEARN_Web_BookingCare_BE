import patientService from '../services/patientService';

const postBookAppointment = async (req, res) => {
    try {
        let infor = await patientService.postBookAppointment(req.body);
        return res.status(200).json(infor);
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        });
    }
}

const postVerifyBookAppointment = async (req, res) => {
    try {
        let infor = await patientService.postVerifyBookAppointment(req.body);
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
    postBookAppointment, postVerifyBookAppointment
}