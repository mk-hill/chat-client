const express = require('express');

const app = express();
const SocketIoServer = require('socket.io'); // Exposes Server constructor func
const namespaces = require('./data/namespaces');

app.use(express.static(`${__dirname}/public`));

// Storing return value to bind socket.io server
const expressServer = app.listen(59768);

const server = new SocketIoServer(expressServer); // Default options kept

// Initial connection to main namespace
server.on('connect', (socket) => {
  // Extract img and endpoint for each namespace in array
  const nsData = namespaces.map(({ img, endpoint }) => ({ img, endpoint }));
  // Send array to only current socket
  socket.emit('nsData', nsData);
  console.log(socket.handshake);
});

// Alert all sockets in a given room that the member count has changed
function emitMemberUpdate(namespace, room) {
  server
    .of(namespace)
    .in(room)
    .clients((err, clients) => {
      server
        .of(namespace)
        .in(room)
        .emit('updateMemberCount', clients.length);
    });
}

// Listen for connection on each namespace
namespaces.forEach((namespace) => {
  const { endpoint, rooms, title } = namespace;
  server.of(endpoint).on('connect', (socket) => {
    console.log(`${socket.id} has joined ${title}`);
    // A socket connected to one of the namespaces, send associated room info
    socket.emit('loadRooms', rooms);
    socket.on('joinRoom', (roomTitle, ack) => {
      // Leave prior room
      const lastRoom = Object.keys(socket.rooms)[1];
      socket.leave(lastRoom);
      emitMemberUpdate(endpoint, lastRoom);
      socket.join(roomTitle);
      // Find room history and send to this socket only
      socket.emit('loadHistory', rooms.find(room => room.title === roomTitle).history);
      // Sending current room member count in ack upon join
      // server
      //   .of(endpoint)
      //   .in(roomTitle)
      //   .clients((err, clients) => ack(clients.length));

      // ^No longer necessary, updating all members below
      emitMemberUpdate(endpoint, roomTitle);
      // server
      //   .of(endpoint)
      //   .in(roomTitle)
      //   .clients((err, clients) => {
      //     server
      //       .of(endpoint)
      //       .in(roomTitle)
      //       .emit('updateMemberCount', clients.length);
      //   });
    });

    socket.on('newUserMsg', (msg) => {
      console.log(msg);
      // Send msg to all sockets in the same room
      // Socket.rooms returns all rooms socket is in, including the sockets own room it automatically
      // joins at index 0. index 1 is the room title.
      const roomTitle = Object.keys(socket.rooms)[1];
      // Find room object and add msg to its history
      rooms.find(room => room.title === roomTitle).addMessage(msg);
      server
        .of(endpoint)
        .to(roomTitle)
        .emit('newMsgToClient', msg);
    });

    // socket.on('disconnect', () => {
    //   namespace.rooms.forEach(({ title }) => {
    //     socket.leave(title);
    //     emitMemberUpdate(namespace, title);
    //   });
    // });
  });
});
