var gameObjects = [];
const socket = io('http://localhost');

socket.on('serverMSG', (data) => {
  console.log(`[SERVER]: ${data}`);
});

socket.on('updateClients', (data) => {
  gameObjects = data;
});