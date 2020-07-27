var gameObjects = [];
var spawnData;
var player;
const socket = io('https://roamio.abstractjs.com', {
  // transports: ['websocket'],
  // upgrade: false,
});

socket.on('spawnData', (data) => {
  spawnData = data;
  player = new Player(spawnData.x, spawnData.y, 25, random(255));
  player.UID = spawnData.UID;
});

socket.on('connect', () => {});

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