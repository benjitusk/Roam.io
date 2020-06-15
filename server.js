cont FRAME_RATE = 20;
const express = require('express');
const app = express();
const server = require('http').Server(app);
let playerData = [];
const io = require('socket.io')(server, {
  'pingTimeout': 180000,
  'pingInterval': 25000
});
server.listen(80);
console.log('Server listening on *:80');

app.use('/', express.static('client'));

io.on('connection', (client) => {
  client.start = Date.now();
  console.log(`New Client ID: ${client.id}`);
  playerData.push({
    id: client.id,
    x: 100,
    y: 100,
  });
  client.on('clientMSG', (data) => {
    console.log(`Client ${client.id} says "${data}"`);
  });
  client.on('mouseMove', (data) => {

    for (let player of playerData) { // go through the playerData
      if (player.id == client.id) { // when we find the data corresponding with the updating client
        player.x = data.x; // update the data accordingly
        player.y = data.y;
        break; // stop looping, our job here is done
      }
    }
    console.log(data);

  });
  client.on('disconnect', (reason) => {
    for (let i = 0; i < playerData.length; i++) {
      if (playerData[i].id == client.id) {
        playerData.splice(i, 1);
        break; // stop looping, our job here is done
      }
    }
    console.log(`Client ID ${client.id} disconnected after ${(Date.now() - client.start)/1000} seconds because ${reason}, leaving ${playerData.length} clients left.`);
  });
});

setInterval(() => {
  io.emit('update', playerData);
}, 1000 / FRAME_RATE);