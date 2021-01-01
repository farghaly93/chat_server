const mongoose = require('mongoose');

const UsersCollection = mongoose.Schema({
    email: {
        type: String,
        // unique: true  
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    imagePath: {
        type: String,
        require: true
    }
})

module.exports = mongoose.model('users', UsersCollection);