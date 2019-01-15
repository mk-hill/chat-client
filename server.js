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
});

// Listen for connection on each namespace
namespaces.forEach((namespace) => {
  server.of(namespace.endpoint).on('connect', (socket) => {
    console.log(`${socket.id} has joined ${namespace.title}`);
    // A socket connected to one of the namespaces, send associated room info
    socket.emit('loadRooms', namespace.rooms);
    socket.on('joinRoom', (roomTitle, ack) => {
      // todo deal with history
      console.log(roomTitle);
      socket.join(roomTitle);
      // Sending current room member count in ack
      server
        .of(namespace.endpoint)
        .in(roomTitle)
        .clients((err, clients) => ack(clients.length));
    });

    socket.on('newUserMsg', (msg) => {
      console.log(msg);
      // Send msg to all sockets in the same room
      // Socket.rooms returns all rooms socket is in, including the sockets own room it automatically
      // joins at index 0. index 1 is the room title.
      const roomTitle = Object.keys(socket.rooms)[1];
      server
        .of(namespace.endpoint)
        .to(roomTitle)
        .emit('newMsgToClients', msg);
    });
  });
});
