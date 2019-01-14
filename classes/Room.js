class Room {
  constructor({
    id, title, namespace, isPrivate = false,
  }) {
    this.id = id;
    this.title = title;
    this.namespace = namespace;
    this.isPrivate = isPrivate;
    this.history = [];
  }

  addMessage(message) {
    this.history.push(message);
  }

  clearHistory() {
    this.history = [];
  }
}

module.exports = Room;
