var gameObjects = [];
var spawnData;
var player;
let socket = io(window.location.href, {
  // transports: ['websocket'],
  // upgrade: false,
});

socket.on('spawnData', (data) => {
  console.log(data);
  spawnData = data;
  player = new Player(spawnData.UID, spawnData.x, spawnData.y, random(255), 25);
  player.UID = spawnData.UID;
});

socket.on('connect', () => {
  // let redirect = prompt(`You are connected to ${socket.io.uri}. If you want to connect somewhere else, type it in below:`);
  // if (redirect) {
  //   alert('aight, imma head out');
  //   socket.disconnect();
  //   socket = io(redirect);
  // }
});

socket.on('serverMSG', (data) => {
  alert(`[SERVER]: ${data}`);
});

socket.on('updateClients', (data) => {
  gameObjects = data;
});

socket.on('serverFull', () => {
  alert('The server is full. Please try again in a little bit.');
});

socket.on('checkPulse', () => {
  socket.emit('heartbeat');
});

socket.on('edit', (data) => {
  for (let key in player) {
    if (key == data.property) {
      out(`Found matching key, changing value...`);
      player[key] = data.value;
      return;
    }
  }
  alert('Data could not be edited!');
});