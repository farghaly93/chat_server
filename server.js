const express = require('express');
const app = express();
const server = require('https').createServer(app);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/users_router.js');
const Chat = require('./models/messages');
const upload = require('express-fileupload');
const io = require('socket.io')(server);
const port = 6969;

// const WebSocket = require('ws');
// const io = new WebSocket.Server({ server });








io.on('connection', (socket) => {
  
//   socket.on('message', (data) => {
//     console.log(data);
//     io.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(data);
//       }
//     })
//   })
  socket.on('send', async(messageData) => {
    const newMessage = await new Chat({
      message: messageData.message, 
      date: Date.now(), 
      userId: messageData.userId,
      imagePath: messageData.imagePath,
      room: messageData.room,
      type: messageData.type
    }).save();
    socket.join(messageData.room);
    io.sockets.in(messageData.room).emit('message', newMessage);
  });



  socket.on('join', data => {
    console.log(data);
    const room = data.room;
    socket.join(room);
    const rooms = io.sockets.adapter.rooms[room];
    if(rooms.length > 0) {
      io.sockets.in(room).emit('newUser', {username: data.username, joined: true});
    } else {
      socket.emit('newUser', {joined: false});
    }
  }); 

  socket.on('disconnected', () => console.log('disconnected'));

});









app.use(bodyParser.json({extended: true}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(upload({useTempFiles: true, preserveExtension: 4}));
app.use(usersRouter);



mongoose.connect('mongodb+srv://farghaly:farghaly_93@cluster0.kagup.mongodb.net/chat?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useNewUrlParser: true}).then(() => {
  console.log('Connected successfully to database...');
  server.listen(process.env.PORT || port, () => {
    console.log('Server started and connected to port: '+port);
  });
}).catch(e => {
  console.log('Connection failed...');
  console.log(e);
});