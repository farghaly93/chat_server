const mongoose = require('mongoose');

const roomsCollection = mongoose.Schema({
    room: {
        type: String,
        required: true,
        unique: true
    },
    users: {
        type: Array,
        required: true
    },
    owner: {
        type: String,
    },
    name: {
        type: String,
    }
})

module.exports = mongoose.model('rooms', roomsCollection);