import db from '../models/index';
import CRUDService from '../services/CRUDService';

const getHomePage = async (req, res) => {
    try {
        let data = await db.User.findAll();
        return res.render('homePage', {
            data: JSON.stringify(data)
        });
    } catch (err) {
        console.log(err);
    }
}

const getAboutPage = (req, res) => {
    return res.send('I\'m NNHiep! Nice to meet you!');
}

const getCRUDPage = (req, res) => {
    return res.render('crud');
}

const postCRUD = async (req, res) => {
    let message = await CRUDService.createNewUser(req.body);
    console.log(message);
    return res.send('Post crud');
}

const getCRUD = async (req, res) => {
    let data =  await CRUDService.getAllUser();
    return res.render('displayCRUD', { data });
}

const editCRUD = async (req, res) => {
    let userId = req.query.id;
    if(userId) {
        let userData = await CRUDService.getUserInfoById(userId);
        return res.render('editCRUD', {userData});
    } else {
        return res.send('User not found');
    }
}

const putCRUD = async (req, res) => {
    let data = req.body;
    await CRUDService.updateUserData(data);
    return res.redirect('get-crud');
}

const deleteCRUD = async (req, res) => {
    let id  = req.query.id;
    if(id) {
        await CRUDService.deleteUserById(id);
        return res.redirect('get-crud');
    } else {
        return res.send('User not found!');
    }
}

module.exports = {
    getHomePage,
    getAboutPage,
    getCRUDPage,
    postCRUD,
    getCRUD,
    editCRUD,
    putCRUD,
    deleteCRUD,
};