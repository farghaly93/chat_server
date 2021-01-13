const Chat = require('../models/messages.js');
const Users = require('../models/users.js');
const Rooms = require('../models/rooms');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { Buffer } = require('buffer');
const { update, bulkWrite } = require('../models/messages.js');
const { randomBytes } = require('crypto');
Cloudinary.config({
    cloud_name: 'farghaly-developments',
    api_key: '789929815277853',
    api_secret: 'GRYCOy1KymmaOkGu6BuPVNH0VLc'
});

var nodemailer = require('nodemailer');
const { reset } = require('nodemon');

var transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
    user: 'miserable.farghaly93@gmail.com',
    pass: 'saadawy_1993'
}
});

exports.getAllMessages = async(req, res) => {
    try{
        console.log('getmessages')
        const room = req.body.room;
        const skip = req.body.skip;
        const limit = req.body.limit;
        // return;
        console.log(skip, limit);
        const messages = await Chat.find({room}).skip(skip).limit(limit).sort({date: -1});
        console.log(messages);
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

exports.updateUser = async(req, res) => {
    try{
        const body = {...req.body};
        const update = await Users.updateOne({_id: body._id}, body);
        if(update.nModified === 1) {
            const authData = await Users.findOne({_id: body._id});
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
    } catch(e) {
        console.log(e);
    }
}

exports.changePassword = async(req, res) => {
    try{
        const body = req.body;
        const account = await Users.findOne({_id: body.userId});
        if(account != null) {
            const isValid = bcrypt.compare(body.old, account.password);
            console.log(isValid);
            if(!isValid) {
                res.json({done: false});
            } else {
                const newPass = bcrypt.hashSync(body.new, 10);
                const update = await Users.updateOne({_id: body.userId}, {password: newPass});
                if(update.nModified === 1) {
                    res.json({done: true});
                } else {
                    res.json({done: false});
                }
            }
        } else {
            res.json({done: false});
        }
    } catch(err) {
        console.log(err);
        res.json({done: false});
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
exports.uploadAudio = async(req, res) => {
    try{
        const audio = req.files.file;
        console.log(audio.tempFilePath);
        // return;
        Cloudinary.uploader.upload_large(audio.tempFilePath, (err, result) => {
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
        const body = req.body;
        const isRoomExisted = await Rooms.findOne({room: body.room});
        if(isRoomExisted != null) {
            const isUserExistedInTheRoom = isRoomExisted.users.includes(body.userId);
            if(!isUserExistedInTheRoom) {
                const add = await Rooms.updateOne({room: body.room}, {$push: {users: body.userId}});
                if(add.nModified == 1) res.json({added: true});
                else res.jdon({added: false});
            } else {
                res.json({added: true});
            }
        } else {
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
        const room = await Rooms.findOne({room: req.body.room});
        res.json({roomData: room});
    } catch(e) {
        console.log(e);
    }
}
exports.resetPassword = async(req, res) => {
    try{
        console.log(req.params.email);
        randomBytes(16, async(err, hexaBytes) => {
            // const decimalBytes = new Uint8Array(hexaBytes);
            // let stringBinary = ''
            // for(byte of decimalBytes) {
            //     stringBinary += String.fromCharCode(byte);
            // }
            const newPassword = hexaBytes.toString('base64');
            
            const update = await Users.updateOne({email: req.params.email}, {password: bcrypt.hashSync(newPassword, 10)});
            if(update.nModified === 1) {

            var mailOptions = {
            from: 'miserable.farghaly93@gmail.com',
            to: req.params.email,
            subject: 'your new password of farghaly_secret_chat',
            text: newPassword
            };
            transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                res.json({done: false});
            } else {
                console.log('Email sent: ' + info.response);
                res.
                json({done: true});
                }
            });
        }
        else {
            res.json({done: false});
        }
    });
    } catch(e) {
        console.log(e);
    }
}

