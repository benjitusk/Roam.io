/* TODO:

In Progress
|
|- Make a "Player" Object on the client


HIGH PRIORITY
|
|- Make some sort of "map"
|- - have a viewport for the client
|- - this will definately be a pain, but it's important
|- - look at other GitHub repositories for inspiration
|
|- MAKE FOOD ARRAY, store it on server
|- Write a function for random distribution of stuffs
|- - pick random coords, if anything is within ? pixels, repeat, else, return.
|- Perform collision detection on client end

Medium Priority
|
|-Change Controls to WASD

low priority
|
|- Create scenes!!
|- - Setup
|- - - Pick name
|- - - Play
|- - - (Pause?)
|- - - Game Over
|- - Game modes
|- - - FFA
|- - - Teams
|- Expand to WAN
|- Chat

*/
const FRAME_RATE = 20;
const express = require('express');
const app = express();
const server = require('http').Server(app);
let playerData = [];
let food = [];
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
    size: 10,
    color: undefined,
  });

  client.on('clientMSG', (data) => {
    console.log(`Client ${client.id} says "${data}"`);
  });

  client.on('ate'(eaten) => {

  });

  client.on('mouseMove', (data) => {

    for (let player of playerData) { // go through the playerData
      if (player.id == client.id) { // when we find the data corresponding with the updating client
        player.x = data.x; // update the data accordingly
        player.y = data.y;
        player.size = data.size;
        player.color = data.color
        break; // stop looping, our job here is done
      }
    }

  });

  client.on('disconnect', (reason) => {
    for (let i = 0; i < playerData.length; i++) {
      if (playerData[i].id == client.id) {
        playerData.splice(i, 1);
        break; // stop looping, our job here is done
      }
    }
    console.log(`Client ID ${client.id} disconnected after ${(Date.now() - client.start)/1000} seconds because ${reason}, leaving ${playerData.length} client(s) left.`);
  });
});

setInterval(() => {
  io.emit('update', playerData);
}, 1000 / FRAME_RATE);