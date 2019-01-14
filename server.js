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
  });
});
