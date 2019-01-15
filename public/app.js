//
// ─── DOM STUFF ──────────────────────────────────────────────────────────────────
//
/**
const p = document.querySelector('p');
const msgInput = document.getElementById('user-input');
const msgList = document.getElementById('msg-list');

document.getElementById('msg-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const userMsg = msgInput.value;
  if (!userMsg) return; // ignore empty submit
  msgInput.value = '';
  socket.emit('userMsg', { userMsg });
});

function addMessage(msg) {
  const newListItem = document.createElement('li');
  newListItem.className = 'text-secondary';
  newListItem.textContent = `${Date.now()}: ${msg}`;
  msgList.appendChild(newListItem);
}
 */
const elems = {
  nsContainer: document.querySelector('.namespaces'),
  roomsContainer: document.querySelector('.room-list'),
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
      console.log(e.target);
      console.log(div.dataset.endpoint);
    }));
  },

  populateRoomList(roomsData) {
    elems.roomsContainer.innerHTML = '';
    roomsData.forEach((room) => {
      const li = document.createElement('li');
      li.className = 'room-title';
      const span = document.createElement('span');
      span.textContent = ` ${room.title}`;
      span.classList.add('glyphicon', room.isPrivate ? 'glyphicon-lock' : 'glyphicon-globe');
      li.appendChild(span);
      elems.roomsContainer.appendChild(li);
    });

    document.querySelectorAll('.room-title').forEach(li => li.addEventListener('click', (e) => {
      console.log(e.target.textContent);
    }));
  },
};

/**
 * <li onclick="joinRoom(1,2)">
              <span class="glyphicon glyphicon-lock"></span>Main Room
            </li>
            <li onclick="joinRoom(2,1)">
              <span class="glyphicon glyphicon-globe"></span>Meeting Room
            </li>
 */
//
// ─── SOCKET.IO STUFF ────────────────────────────────────────────────────────────
//

/**
 * Client importable:
* import io from 'socket.io-client';

* Client also deliverable by server, loaded in separate script tag
* Invocation returns "Socket" (not the same class as the one used on the server),
* and creates new Manager
 */

const socket = {
  url: 'http://localhost:59768',

  main: io(this.url), // "/" namespace

  addNamespace(endpoint) {
    // remove slash from keys
    this[endpoint.slice(1)] = io(`${this.url}${endpoint}`);
  },
};

// Listen for incoming namespaces data
socket.main.on('nsData', (nsData) => {
  ui.populateNsList(nsData);
  nsData.map(ns => ns.endpoint).forEach(endpoint => socket.addNamespace(endpoint));
  socket.javascript.on('loadRooms', ui.populateRoomList);
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
