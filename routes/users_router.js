const express = require('express');
const multer = require('multer');
const Router = express.Router();
const usersController = require('../controllers/users_controller.js');
const upload = multer();
Router.post('/getAllMessages', usersController.getAllMessages);
Router.get('/getAllUsers', usersController.getAllUsers);
Router.get('/getRoomsForUser/:userId', usersController.getRoomsForUser);
Router.post('/getRoomData', usersController.getRoomData);
Router.post('/register', usersController.register);
Router.post('/updateUser', usersController.updateUser);
Router.post('/login', usersController.login);
Router.post('/deleteMessage', usersController.deleteMessage);
Router.post('/createRoom', usersController.createRoom);
Router.post('/joinRoom', usersController.joinRoom);
Router.post('/deleteRoom', usersController.deleteRoom);
Router.post('/uploadFile', upload.single('file'), usersController.uploadFile);


module.exports = Router;