const Room = require('./Room');

class Namespace {
  constructor(id, title, img, endpoint) {
    this.id = id;
    this.title = title;
    this.img = img;
    this.endpoint = endpoint;
    this.rooms = [];
  }

  addRoom(title) {
    // Automatically assigning id based on next available rooms index
    // consider changing if room removal is added
    this.rooms.push(new Room({ id: this.rooms.length, title, namespace: this.title }));
  }
}

module.exports = Namespace;
