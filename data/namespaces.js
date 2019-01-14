// import classes
const Namespace = require('../classes/Namespace');

// Instantiate namespaces
const namespaces = [];
const jsNs = new Namespace(
  0,
  'JavaScript',
  'https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg',
  '/javascript',
);
const mozNs = new Namespace(
  1,
  'Mozilla',
  'https://www.mozilla.org/media/img/logos/firefox/logo-quantum.9c5e96634f92.png',
  '/mozilla',
);
const linuxNs = new Namespace(
  2,
  'Linux',
  'https://upload.wikimedia.org/wikipedia/commons/a/af/Tux.png',
  '/linux',
);

// Add rooms - Main room always 0
jsNs.addRoom('General');
jsNs.addRoom('Conferences');
jsNs.addRoom('ESNext');
jsNs.addRoom('Libraries');
jsNs.addRoom('Help');

mozNs.addRoom('Firefox');
mozNs.addRoom('SeaMonkey');
mozNs.addRoom('SpiderMonkey');
mozNs.addRoom('Rust');
mozNs.addRoom('WebAssembly');

linuxNs.addRoom('Debian');
linuxNs.addRoom('Red Hat');
linuxNs.addRoom('Kernel Development');

namespaces.push(jsNs, mozNs, linuxNs);

module.exports = namespaces;
