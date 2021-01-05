import { io } from './server';

class Socket {
    SocketEvents({event, data, room});
    
    deleteMessage() {
        io.on('connection', socket => {
            const room = io.sockets.adapter.rooms[room];
            console.log(room);
        });
    }
}

exports.Socket = Socket;