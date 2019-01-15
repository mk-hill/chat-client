//
// ─── DOM STUFF ──────────────────────────────────────────────────────────────────
//

const elems = {
  nsContainer: document.querySelector('.namespaces'),
  roomsContainer: document.querySelector('.room-list'),
  msgForm: document.querySelector('.message-form'),
  msgInput: document.getElementById('user-message'),
  memberCount: document.querySelector('.curr-room-num-users').childNodes[0],
  messages: document.querySelector('#messages'),
  currentRoomTitle: document.querySelector('.curr-room-text'),
};

const ui = {
  populateNsList(nsData) {
    elems.nsContainer.innerHTML = '';
    nsData.forEach((ns) => {
      const div = document.createElement('div');
      div.className = 'namespace';
      div.dataset.endpoint = ns.endpoint; // Adding data attribute for use in click handler
      const img = document.createElement('img');
      img.src = ns.img;
      div.appendChild(img);
      elems.nsContainer.appendChild(div);
    });
    // getElementsByClassName returns HTML collection instead of node list
    // Array.from/spread/querySelectorAll for forEach
    document.querySelectorAll('.namespace').forEach(div => div.addEventListener('click', (e) => {
      socket.joinNamespace(div.dataset.endpoint);
    }));
  },

  populateRoomList(roomsData) {
    elems.roomsContainer.innerHTML = '';
    roomsData.forEach((room) => {
      const li = document.createElement('li');
      li.className = 'room-title';
      li.textContent = room.title;
      const span = document.createElement('span');
      span.classList.add('glyphicon', room.isPrivate ? 'glyphicon-lock' : 'glyphicon-globe');
      li.prepend(span); // Adding span before textContent
      elems.roomsContainer.appendChild(li);
    });
    // join first room by default
    socket.joinRoom(roomsData[0].title);
    document.querySelectorAll('.room-title').forEach(li => li.addEventListener('click', (e) => {
      // Using li instead of e.target to account for clicks on icon span
      socket.joinRoom(li.textContent);
    }));
  },

  populateHistory(messages) {
    messages.forEach(ui.addMessage);
  },

  updateMemberCount(memberCount) {
    elems.memberCount.textContent = memberCount;
  },

  clearMessageList() {
    elems.messages.innerHTML = '';
  },

  displayRoomTitle(title) {
    elems.currentRoomTitle.textContent = title;
  },

  addMessage({
    text, avatar, username, time,
  }) {
    const li = document.createElement('li');
    // todo escape tags or manually create all elems
    li.innerHTML = `
      <div class="user-image">
        <img src=${avatar} />
      </div>
      <div class="user-message">
         <div class="user-name-time">${username} <span>${time}</span></div>
         <div class="message-text">${text}</div>
      </div>
    `;
    elems.messages.appendChild(li);
  },
};

elems.msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const fullMsg = {
    text: elems.msgInput.value,
    avatar: state.avatar,
    username: state.username,
    time: new Date().toLocaleString(),
  };
  if (!fullMsg.text) return;
  state.currentNamespace.emit('newUserMsg', fullMsg);
  elems.msgInput.value = ''; // Clear input
});

//
// ─── SOCKET.IO STUFF ────────────────────────────────────────────────────────────
//

const state = {
  avatar: 'https://via.placeholder.com/30',
  username: 'Guest',
  currentNamespace: null,
  currentRoom: null,
};

const socket = {
  url: 'http://localhost:59768',

  main: io(this.url), // "/" namespace

  joinNamespace(endpoint) {
    // remove slash from keys
    // const nsKey = endpoint.slice(1);
    // this[nsKey] = io(`${this.url}${endpoint}`);
    if (state.currentNamespace) {
      // close prior socket
      state.currentNamespace.close();
      // clean up event listeners
    }
    state.currentNamespace = io(`${this.url}${endpoint}`);
    state.currentNamespace.on('loadRooms', ui.populateRoomList);
    state.currentNamespace.on('newMsgToClient', msg => ui.addMessage(msg));
    state.currentNamespace.on('loadHistory', ui.populateHistory);
    state.currentNamespace.on('updateMemberCount', ui.updateMemberCount);
  },

  joinRoom(title) {
    // Increment room member count on ack
    // state.currentNamespace.emit('joinRoom', title, (memberCount) => {
    //   ui.updateMemberCount(memberCount);
    // });

    // ^ No longer necessary, all members updated by server on join
    state.currentNamespace.emit('joinRoom', title);
    state.currentRoom = title;
    ui.clearMessageList();
    ui.displayRoomTitle(title);
  },

  getNamespace(endpoint) {
    return this[endpoint.slice(1)];
  },
};

// Listen for incoming namespaces data
socket.main.on('nsData', (nsData) => {
  ui.populateNsList(nsData);
  // Join first namespace by default
  socket.joinNamespace(nsData[0].endpoint);
});

socket.main.on('connect', () => console.log(`Socket ID: ${socket.main.id}`));

// Custom events work the same way here in the client (any string except reserved ones)
socket.main.on('msgFromServer', (objectFromServer) => {
  const displayString = `Data Received: ${JSON.stringify(objectFromServer)}`;
  console.log(displayString); // Doesn't need to be an object, just happen to be sending one
  // p.textContent = displayString;
  socket.emit('msgToServer', { msg: 'Sent from client' });
});

// socket.on('msgToClients', ({ newMsg }) => addMessage(newMsg));
