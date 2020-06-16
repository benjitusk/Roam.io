/* TODO:

In Progress
|


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

Done
|
|- Make a "Player" Object on the client

*/
const VERBOSE = true;

const FRAME_RATE = 20;

const express = require('express');
const app = express();
const server = require('http').Server(app);
const foodAmount = 10;

let gameObjects = [];

for (let i = 0; i < foodAmount; i++) {
  let coordinateCandidate = randomCoords();
  if (coordinateCandidate == false) break; // if randomCoords could not find suitable coords, we ran out of room. stop making more food.
  let food = {
    id: gameObjects.length,
    x: coordinateCandidate.x,
    y: coordinateCandidate.y,
    size: 10,
    color: randInt(255),
    type: "food",
    beenEaten: false,
  };
  gameObjects.push(food);
}

let playerCount = 0;

/*
 * const width  = 5000;
 * const height = 5000;
 */

const io = require('socket.io')(server, {
  'pingTimeout': 180000,
  'pingInterval': 25000
});

server.listen(80);
console.log('Server listening on *:80');

app.use('/', express.static('client'));

io.on('connection', (client) => {
  client.start = Date.now();
  console.log(`New Client ID: ${client.id}. Total clients: ${++playerCount}`);
  playerCount++;
  gameObjects.push({
    id: client.id,
    x: 100,
    y: 100,
    size: 15,
    color: randInt(255),
    type: "player",
    beenEaten: false,
  });

  client.on('clientMSG', (data) => {
    console.log(`Client ${client.id} says "${data}"`);
  });

  client.on('ate', (eaten) => {
    console.log(`${client.id} ate ${eaten.id}\n`);
    editObject(eaten, "beenEaten", true);
    editObject(eaten, "remove");
  });

  client.on('editObject', (newGameObjects) => {
    gameObjects = newGameObjects;
  })

  client.on('serverUpdate', (data) => {

    for (let player of gameObjects) { // go through the gameObjects
      if (player.id == client.id) { // when we find the data corresponding with the updating client
        player.x = data.x; // update the data accordingly
        player.y = data.y;
        player.size = data.size;
        player.color = data.color;
        player.beenEaten = data.beenEaten;
        break; // stop looping, our job here is done
      }
    }

  });

  client.on('disconnect', (reason) => {
    playerCount -= 1;
    for (let i = 0; i < gameObjects.length; i++) {
      if (gameObjects[i].id == client.id) {
        gameObjects.splice(i, 1);
        break; // stop looping, our job here is done
      }
    }
    console.log(`Client ID ${client.id} disconnected after ${(Date.now() - client.start)/1000} seconds because ${reason}, leaving ${playerCount} client(s) left.`);
  });
});

setInterval(() => {
  for (let item of gameObjects) {
    if (item.beenEaten) {
      editObject(item, "remove");
    }
  }
  io.emit('updateClients', gameObjects);
}, 1000 / FRAME_RATE);

function randomCoords(distance = 25, attempts = 100) {

  for (let i = 0; i < attempts; i++) { // Loop a maximum of ${attempts} times
    // let x = random(width);
    // let y = random(height);

    // If chosen coords are invalid
    // Pick new ones
    let x = randInt(1000);
    let y = randInt(1000);


    if (gameObjects.length == 0) {
      return {
        x: x,
        y: y
      };
    } // if gameObjects array is empty, we would be stuck in an endless loop
    for (let j = 0; j < gameObjects.length; j++) {
      let item = gameObjects[j];
      if (dist(x, y, item.x, item.y) < item.size + distance) {
        break; // If we are too close, stop looking at these coords
      }
      if (j == gameObjects.length - 1) {
        // out(`Returning (${x}, ${y})`);
        return {
          x: x,
          y: y
        }; // If we went through each gameObject and had no issues, return these coords
      }
    }
  }
  return false; // if no suitable coords could be found, return false.
}

function out(data) {
  if (VERBOSE) console.log(`[DEBUG]: ${data}\n`);
}

function randInt(min, max) {
  if (max == undefined) {
    max = min;
    min = 0;
  }
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}


function editObject(object, property, value) {
  if (property == "remove") {
    out(`Received request to destroy objectID ${object.id}...`);
    for (let i = 0; i < gameObjects.length; i++) {
      if (object === gameObjects[i]) {
        out(`Object ${object.id} has been destroyed`);
        gameObjects.splice(i, 1);
        break;
      }
    }
  } else {
    out(`Received request to edit objectID ${object.id} property ${property} to ${value}`);
    for (let item of gameObjects) {
      out(`Searching for matching object...`);
      if (item.id == object.id) {
        out(`Found matching item, searching for key`);
        for (key in item) {
          if (key == property) {
            out(`Found matching key, changing value...`);
            item[key] = value;
            break;
          }
        }
        break;
      }
    }
  }
  io.emit('updateClients', gameObjects);
}