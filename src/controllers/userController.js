import userService from '../services/userService';

const handleLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    
    if(!email || !password) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing inputs parameter', 
        });
    }
    
    let userData = await userService.handleUserLogin(email, password);
    

    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.errMessage, 
        user: userData.user ? userData.user : {},
    });
}

const handleGetAllUsers = async (req, res) => {
    let id = req.query.id; // All, id

    if(!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameters',
            users: [],
        });
    }
    
    let users = await userService.getAllUsers(id);
    
    return res.status(200).json({
        errCode: 0,
        errMessage: 'Okay',
        users
    });
}

const handleCreateNewUser = async (req, res) => {
    let message = await userService.createNewUser(req.body);
    return res.status(200).json(message);
}

const handleEditUser = async (req, res) => {
    let data = req.body;
    let message = await userService.updateUserData(data);
    return res.status(200).json(message);
}

const handleDeleteUser = async (req, res) => {
    if(!req.body.id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameters!'
        })
    }
    let message = await userService.deleteUser(req.body.id);
    return res.status(200).json(message);
}

const getAllCode = async (req, res) => {
    try {
        let data = await userService.getAllCodeService(req.query.type);
        return res.status(200).json(data);
    } catch(err) {
        console.log('Get all code err: ', err);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        });
    }
}

module.exports = {
    handleLogin,
    handleGetAllUsers,
    handleCreateNewUser,
    handleEditUser,
    handleDeleteUser,
    getAllCode,
};