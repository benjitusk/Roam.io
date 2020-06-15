var peers = [];
const socket = io('http://192.168.0.160');

socket.on('serverMSG', (data) => {
  console.log(`[SERVER]: ${data}`);
});

socket.on('updateClients', (data) => {
  peers = data;
})