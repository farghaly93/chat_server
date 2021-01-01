const mongoose = require('mongoose');

const messagesCollection = mongoose.Schema({
    message: {
        type: String,    
    },
    date: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    imagePath: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('messages', messagesCollection);