const express = require('express');
const app = express();
const server = require('http').createServer(app);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/users_router.js');
const Chat = require('./models/messages');
const upload = require('express-fileupload');
const io = require('socket.io')(server);
const port = 6969;
// const WebSocket = require('ws');
// const io = new WebSocket.Server({ server });








io.sockets.on('connection', (socket) => {
  socket.on('send', async(messageData) => {
    const rooms = io.sockets.adapter.rooms[messageData.room];
    console.log(rooms);
    const newMessage = await new Chat({
      message: messageData.message, 
      date: Date.now(), 
      userId: messageData.userId,
      imagePath: messageData.imagePath,
      room: messageData.room,
      type: messageData.type
    }).save();
    // socket.join(messageData.room);
    io.sockets.in(messageData.room).emit('message', newMessage);
  });



  socket.on('join', data => {
    const room = data.room;
    socket.join(room);
    const clients = io.nsps['/'].adapter.rooms[room].sockets;
    const clientsLength = Object.keys(clients).length;
    console.log(clientsLength, clients);
    if(clientsLength > 0) {
      io.sockets.to(room).emit('newUser', {message: `${data.username} has joined the chat..`, joined: true, joiners: clientsLength});
      socket.emit('newUser', {message: `Welcome to this chat room.. ${data.username}`, joined: true, joiners: clientsLength});
    } else {
      socket.emit('newUser', {joined: false});
    }
  }); 

  socket.on('leaveRoom', data => {
    socket.leave(data.room);
    console.log(io.nsps['/'].adapter.rooms);
    const clients = io.nsps['/'].adapter.rooms[data.room].sockets;
    const clientsLength = Object.keys(clients).length;
    io.sockets.to(data.room).emit('leftRoom', {message: data.username+' has left the room', joiners: clientsLength});
  });

  socket.on('deleteMessageForAll', (data) => {
    io.sockets.in(data.room).emit('deleteMessage', data.messageId);
  });

  socket.on('disconnected', () => console.log('disconnected'));

});









app.use(bodyParser.json({extended: true}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(upload({useTempFiles: true, preserveExtension: 4}));
app.use(usersRouter);



mongoose.connect('mongodb+srv://farghaly:farghaly_93@cluster0.kagup.mongodb.net/chat?retryWrites=true&w=majority', {useUnifiedTopology: true, useNewUrlParser: true}).then(() => {
  console.log('Connected successfully to database...');
  server.listen(process.env.PORT || port, () => {
    console.log('Server started and connected to port: '+port);
  });
}).catch(e => {
  console.log('Connection failed....');
  console.log(e);
});
