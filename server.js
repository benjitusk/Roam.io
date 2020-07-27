const agar = require('./agar');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const inquirer = require('./inquirer');
const clear = require('clear');
const readline = require('readline');
const table = require('console.table');
const {
  isBoolean
} = require('util');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

function log(input) {
  console.log(input);
}

clear();

// log(
//   '\nTODO:' +
//   '\n\nIn Progress' +
//   '\n|' +
//   '\n|- Handle client disconnect' +
//   '\n|- Handle Cell Death' +
//   '\n|- - Game Over scene' +
//   '\n|- Add touch controls' +
//   '\n\nHIGH PRIORITY' +
//   '\n|' +
//   '\n|- Fix random disenbodiment' +
//   '\n|- Cell ejecting mass' +
//   '\n|- Cell splitting' +
//   '\n\nMedium Priority' +
//   '\n|' +
//   '\n|- Making game options easy to change' +
//   '\n|- - Game border' +
//   '\n|- - Show Mass' +
//   '\n\nlow priority' +
//   '\n|' +
//   '\n|- Game modes' +
//   '\n|- - FFA' +
//   '\n|- - Teams' +
//   '\n|- Chat' +
//   '\n\nDone' +
//   '\n|' +
//   '\n|- Expand to WAN' +
//   '\n|- Find cause of and eliminate gameObject glitching on client side when food is eaten' +
//   '\n|- Fix Collision detection going out of bounds' +
//   '\n|- Update server and peers immediately when eating food' +
//   '\n|- Make some sort of "map"' +
//   '\n|- Change Controls to WASD' +
//   '\n|- Make a "Player" Object on the client' +
//   '\n|- Write a function for random distribution of stuffs' +
//   '\n|- Perform collision detection on client end\n');

const VERBOSE = true;
let PORT;


const FRAME_RATE = 30;
const GAME_ARENA = {
  x: 2500,
  y: 2500,
};
const foodSize = 15;
const playerSize = 25;

const foodAmount = 50;

let socketList = [];
let gameObjects = [];

let UIDs = [];

generateFood(foodAmount);

let playerCount = 0;

const io = require('socket.io')(server, {
  origins: '*:*',
});

server.listen(PORT || 8080);
log(`Server listening on *:${PORT || 8080}`);

app.use('/', express.static('client'));

io.on('connection', (client) => {
  socketList.push(client);
  client.start = Date.now();
  client.UID = generateUID();
  let spawnCoords = randomCoords();
  let spawnData = {
    x: spawnCoords.x,
    y: spawnCoords.y,
    color: randInt(255),
    size: playerSize,
    type: 'player',
    beenEaten: false,
    arenaSize: GAME_ARENA,
    UID: client.UID,
    name: undefined,
  };

  client.on('clientName', (data) => {
    log(`client ${client.UID} now goes by the name ${data}`);
    client.name = data;
  });

  if (!(spawnData.x && spawnData.y)) {
    // if we are unable to find available coords for new player
    client.emit('serverFull'); // kick 'em
  }

  client.emit('spawnData', spawnData);
  gameObjects.push(spawnData);
  log(`New Client ID: ${client.UID}. Total clients: ${getPlayerCount()}`);

  client.on('clientMSG', (data) => {
    log(`Client ${client.UID} says "${data}"`);
  });

  client.on('ate', (eaten) => {
    log(`${client.UID} ate ${eaten.UID}\n`);
    editObject(eaten, 'beenEaten', true);
    editObject(eaten, 'remove');
    generateFood();
  });

  client.on('heartbeat', () => {
    client.heartbeat = Date.now();
  });

  client.on('editObject', (newGameObjects) => {
    gameObjects = newGameObjects;
  });

  client.on('serverUpdate', (data) => {
    for (let player of gameObjects) {
      // go through the gameObjects
      if (player.UID == client.UID) {
        // when we find the data corresponding with the updating client
        player.x = data.x; // update the data accordingly
        player.y = data.y;
        player.size = data.size;
        player.color = data.color;
        player.beenEaten = data.beenEaten;
        player.name = data.name;

        break; // stop looping, our job here is done
      }
    }
  });

  client.on('disconnect', (reason) => {
    for (let i = 0; i < gameObjects.length; i++) {
      if (gameObjects[i].UID == client.UID) {
        gameObjects.splice(i, 1);
        break; // stop looping, our job here is done
      }
    }
    log(
      `Client ID ${client.UID} disconnected after ${
        (Date.now() - client.start) / 1000
      } seconds because ${reason}, leaving ${getPlayerCount()} client(s) left.`
    );
  });
});

setInterval(() => {
  for (let item of gameObjects) {
    if (item.beenEaten) {
      editObject(item, 'remove');
    }
  }
  io.emit('updateClients', gameObjects);
}, 1000 / FRAME_RATE);

setInterval(() => {
  checkPulse();
  io.sockets.emit('checkPulse');
}, 500);

function checkPulse() {
  for (let i in io.sockets.connected) {
    let s = io.sockets.connected[i];
    if (Date.now() - 1000 > s.heartbeat) {
      // dead connection
      out(
        `Client ${s.id} has lost connection, last heartbeat received ${
          (Date.now() - s.heartbeat)/1000
        } seconds ago.`
      );
      s.disconnect();
    }
  }

}

function randomCoords(distance = 25, attempts = 100) {
  for (let i = 0; i < attempts; i++) {
    // Loop a maximum of ${attempts} times
    // let x = random(width);
    // let y = random(height);

    // If chosen coords are invalid
    // Pick new ones
    let x = randInt(GAME_ARENA.x);
    let y = randInt(GAME_ARENA.y);

    if (gameObjects.length == 0) {
      return {
        x: x,
        y: y,
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
          y: y,
        }; // If we went through each gameObject and had no issues, return these coords
      }
    }
  }
  return false; // if no suitable coords could be found, return false.
}

function out(data) {
  if (VERBOSE) log(`[DEBUG]: ${data}\n`);
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
  if (property == 'remove') {
    out(`Received request to destroy objectID ${object.UID}...`);
    for (let i = 0; i < gameObjects.length; i++) {
      if (object.UID == gameObjects[i].UID) {
        out(`Object ${object.UID} has been destroyed`);
        gameObjects.splice(i, 1);
        break;
      }
    }
  } else {
    out(
      `Received request to edit objectID ${object.UID} property ${property} to ${value}`
    );
    for (let item of gameObjects) {
      if (item.UID == object.UID) {
        for (let key in item) {
          if (key == property) {
            out(`Done`);
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

function getPlayerCount() {
  let total = 0;
  for (let object of gameObjects) {
    if (object.type == 'player' && !object.beenEaten) total++;
  }
  return total;
}

function generateUID() {
  while (true) {
    let testingUID = randInt(gameObjects.length * 2);
    if (!UIDs.includes(testingUID)) {
      UIDs.push(testingUID);
      return testingUID;
    }
  }
}

function getGameObjectByUID(uid) {
  uid = Number(uid);
  if (!UIDs.includes(uid)) log('Object should not exist');
  for (let object of gameObjects) {
    if (object.UID == uid) return object;
  }
}

function generateFood(amount = 1) {
  for (let i = 0; i < amount; i++) {
    let spawnCoords = randomCoords();
    if (spawnCoords == false) break; // if randomCoords could not find suitable coords, we ran out of room. stop making more food.
    let food = {
      id: gameObjects.length,
      x: spawnCoords.x,
      y: spawnCoords.y,
      size: foodSize,
      color: randInt(255),
      type: 'food',
      beenEaten: false,
      UID: generateUID(),
    };
    gameObjects.push(food);
  }
}

rl.setPrompt('ROAM.IO> ');
rl.prompt(true);

rl.on('line', function(line) {
  handleCommand(line.trim().split(' '));
  rl.prompt(true);
});

function handleCommand(command) {
  switch (command[0]) {
    case 'count':
      log(getPlayerCount());
      break;
    case 'exit':
      process.exit(command[1]);
      break;
    case 'stop':
      process.exit(0);
      break;
    case 'help':
      log(`\n\n\n${help}\n\n`);
      break;
    case 'list':
      if (getPlayerCount() == 0) {
        log('No players online');
        break;
      }
      for (let object of gameObjects) {
        if (object.type == 'player' && !object.beenEaten) {
          log(object);
        }
      }
      break;
    case 'edit':
      if (command.length < 4) {
        console.log('[WARNING]: Syntax Error');
        break;
      }
      for (let socket of socketList) {
        if (socket.UID == command[1]) {
          socket.emit("edit", {
            property: command[2],
            value: command[3]
          });
        }
      }
      break;
    case 'clear':
      // clear();
      break;
    case 'kickall':
      for (let i in io.sockets.connected) {
        let client = io.sockets.connected[i];
        client.disconnect('Kicked by server');
      }
      break;
    default:
      log('[WARNING]: Command not found!');
      break;
  }
}
const help = table.getTable([{
    command: 'count',
    description: 'shows the number of currently connected clients',
    usage: 'count',
  },
  {
    command: 'exit',
    description: 'terminates the process',
    usage: 'exit <EXIT_CODE>',
  },
  {
    command: 'stop',
    description: 'closes the server',
    usage: 'stop',
  },
  {
    command: 'help',
    description: 'display this help',
    usage: 'help',
  },
  {
    command: 'list',
    description: 'shows detailed information about each player',
    usage: 'list <ID>',
  },
  {
    command: 'edit',
    description: 'edit the properties of an entitiy',
    usage: 'edit [ID] [property] [value]',
  },
  {
    command: 'kick',
    description: 'disconnects a client',
    usage: 'kick [ID]',
  },
  {
    command: 'kickall',
    description: 'disconnects ALL clients',
    usage: 'kickall',
  },
  {
    command: 'clear',
    description: 'clears the screen',
    usage: 'clear',
    // }, {
    //   command: 'CMD',
    //   description: 'DESC',
    //   usage: '',
    // }, {
    //   command: 'CMD',
    //   description: 'DESC',
    //   usage: '',
    // }, {
    //   command: 'CMD',
    //   description: 'DESC',
    //   usage: '',
  },
]);