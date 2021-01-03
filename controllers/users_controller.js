const Chat = require('../models/messages.js');
const Users = require('../models/users.js');
const Rooms = require('../models/rooms');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { Buffer } = require('buffer');
Cloudinary.config({
    cloud_name: 'farghaly-developments',
    api_key: '789929815277853',
    api_secret: 'GRYCOy1KymmaOkGu6BuPVNH0VLc'
});

exports.getAllMessages = async(req, res) => {
    try{
        const room = req.body.room;
        const messagesPerView = req.body.messagesPerView;
        const messagesToShow = req.body.messagesToShow;
        // return;
        const messages = await Chat.find({room}).skip(messagesToShow).limit(messagesPerView).sort({date: -1});
         console.log(room, messagesPerView, messagesToShow);
        res.json({messages: messages});
    } catch(e) {
        console.log(e);
    }
}

exports.register = async(req, res) => {
    try{
        const body = {...req.body};
        const existingUser =await Users.find({email: body.email});
        if(existingUser.length < 1) {
            const password = bcrypt.hashSync(body.password, 10);
            body['password'] = password;
            const authData = await new Users(body).save();
            if(authData != null) {
                const token = jwt.sign({}, 'mohammadfarghalyalisaadawy', {expiresIn: '1000h'});
                res.json({userData: {
                    _id: authData._id,
                    email: authData.email,
                    password: authData.password,
                    username: authData.username,
                    imagePath: authData.imagePath,
                    token: token,
                 }
                });
            }
        }
    } catch(e) {
        console.log(e);
    }
}

exports.login = async(req, res) => {
    try{
        const body = {...req.body};
        const existingUser =await Users.findOne({email: body.email});
        if(existingUser != null) {
            const isAutherized = bcrypt.compareSync(body.password, existingUser.password);

            if(isAutherized) {
                const token = jwt.sign({}, 'mohammadfarghalyalisaadawy', {expiresIn: '1000h'});
                res.json({userData: {
                    _id: existingUser._id,
                    email: existingUser.email,
                    password: existingUser.password,
                    username: existingUser.username,
                    imagePath: existingUser.imagePath,
                    token: token,
                 },
                 error: null
                });
            } else {
                res.json({error: 'password is wrong'})
            }
        } else {
            res.json({error: 'Email is wrong..'});
        }
    } catch(e) {
        console.log(e);
        res.json({error: e});
    }
}

exports.uploadFile = async(req, res) => {
    try{
        const image = req.files.file;
        Cloudinary.uploader.upload(image.tempFilePath, (err, result) => {
            if(err) {console.log(err); return;}
            res.json({url: result.secure_url});
        });
    } catch(e) {
        console.log(e);
    }
}

exports.getAllUsers = async(req, res) => {
    try{
        const users = await Users.find();
        res.json({users});
    } catch(e) {
        console.log(e);
    }
}

exports.deleteMessage = async(req, res) => {
    try {
        const del = await Chat.deleteOne(req.body);
        if(del.n === 1) {
            res.json({deleted: true});
        }
    }catch(err) {
        console.log(err);
    }
}

exports.createRoom = async(req, res) => {
    try {
        const body = req.body;
        const newRoom = await new Rooms({
            room: body.room, 
            users :[body.userId],
            name: body.name,
            owner: body.userId
        }).save();
        if(newRoom != null) {
            res.json({added: true});
        }
    }catch(err) {
        console.log(err);
        res.json({added: false});
    }
}

exports.joinRoom = async(req, res) => {
    try {
        console.log('jooiiiiiiiiiiiinnnnnnnnnnnn')
        const body = req.body;
        const isRoomExisted = await Rooms.findOne({room: body.room});
        if(isRoomExisted != null) {
            console.log('Room found...');
            const isUserExistedInTheRoom = isRoomExisted.users.includes(body.userId);
            if(!isUserExistedInTheRoom) {
                console.log('User not found in this room');
                const add = await Rooms.updateOne({room: body.room}, {$push: {users: body.userId}});
                if(add.nModified == 1) res.json({added: true});
                else res.jdon({added: false});
            } else {
                console.log('User found in this room');
                res.json({added: true});
            }
        } else {
            console.log('Room not found...');
            res.json({added: false});
        }
       
    }catch(err) {
        console.log(err);
        res.json({added: false});
    }
}

exports.getRoomsForUser = async(req, res) => {
    try{
        const rooms = await Rooms.find({users: req.params.userId});
        res.json({rooms});
    } catch(e) {
        console.log(e);
    }
}

exports.deleteRoom = async(req, res) => {
    try{
        const delRoom = await Rooms.deleteOne({room: req.body.room, owner: req.body.userId});
        const delMessagesInRoom = await Chat.deleteMany({room: req.body.room});
        console.log(delRoom.n, delMessagesInRoom.n);
        if(delRoom.n && (delMessagesInRoom.n || await Chat.find({room: req.body.room}).count() === 0)) {
            res.json({deleted: true});
        } else {
            res.json({deleted: false, error: 'failed'});
        }
    } catch(e) {
        console.log(e);
        res.json({deleted: false, error: e});
    }
}


exports.getRoomData = async(req, res) => {
    try{
        console.log('kkkkkkkkkkkkkkkkkkkk', req.body.room);
        const room = await Rooms.findOne({room: req.body.room});
        console.log('rooooooooooom', room);
        res.json({roomData: room});
    } catch(e) {
        console.log(e);
    }
}

