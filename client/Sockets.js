var peers = [];
const socket = io('http://localhost');

socket.on('serverMSG', (data) => {
  console.log(`[SERVER]: ${data}`);
});

socket.on('update', (data) => {
  peers = data;
})