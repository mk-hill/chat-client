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
};
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
const socket = io('http://localhost:59768'); // "/" namespace/endpoint

// Listen for incoming namespaces data
socket.on('nsData', ui.populateNsList);

socket.on('connect', () => console.log(`Socket ID: ${socket.id}`));

// Custom events work the same way here in the client (any string except reserved ones)
socket.on('msgFromServer', (objectFromServer) => {
  const displayString = `Data Received: ${JSON.stringify(objectFromServer)}`;
  console.log(displayString); // Doesn't need to be an object, just happen to be sending one
  // p.textContent = displayString;
  socket.emit('msgToServer', { msg: 'Sent from client' });
});

// socket.on('msgToClients', ({ newMsg }) => addMessage(newMsg));
