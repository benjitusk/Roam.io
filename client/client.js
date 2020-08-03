let VERBOSE = false;
let eatenItems = [];
let keys = [];
let friction = 0.9;
var scene = 'welcome';
let canvas;

let options = {
  backgroundColor: 180, // Black (Monochrome)
  showMass: true,
  borderColor: 0, // Red (HSL)
  gridColor: 70, // Dark Grey (Monochrome)

};

document.body.addEventListener('keydown', function(e) {
  if (scene == 'play') {
    keys[e.keyCode] = true;
    switch (e.keyCode) {
      case 37:
      case 38:
      case 39:
      case 40:
      case 65:
      case 68:
      case 83:
      case 87:
        e.view.event.preventDefault();
        break;
    }
  }
});

document.body.addEventListener('keyup', function(e) {
  if (scene == 'play') {
    keys[e.keyCode] = false;
    switch (e.keyCode) {
      case 37:
      case 38:
      case 39:
      case 40:
      case 65:
      case 68:
      case 83:
      case 87:
        e.view.event.preventDefault();
        break;
    }
  }
});

function setup() {
  frameRate(1);
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.style.display = 'none';
  colorMode(HSB);
  textAlign(CENTER, CENTER);
  noStroke();
  textSize(50);
  rectMode(CORNERS);
}


function draw() {
  if (socket.io.readyState == 'open' && spawnData != undefined) {
    switch (scene) {
      case 'welcome':
        document.getElementById('WelcomeScreen').style.display = 'none';
        scene = 'play';
        // p5JS should not be involved in the welcome screen, this should br primarily HTML/CSS.
        // As such, effectively remove P5js from the scene
        break;
      case 'play':
        renderGame();
        break;
      default:

    }

  } else if (socket.io.readyState == 'connecting') {
    background(0);
    noStroke();
    textSize(50);
    fill(90, 255, 255);
    text('Connecting to server!', width / 2, height / 3);
  } else {
    background(0);
    noStroke();
    textSize(50);
    fill(0, 255, 255);
    text('Disconnected from server!', width / 2, height / 3);
  }
}
//
// function collision(item) {
//   if (item.UID != player.UID && dist(player.x, player.y, item.x, item.y) < (player.size + item.size) / 2) {
//     out(item);
//     if (player.size > item.size) {
//       player.size += item.size;
//       item.beenEaten = true;
//       eatenItems.push(item.UID);
//       socket.emit('ate', item);
//       killDeadCells();
//     } else if (player.size < item.size) {
//       socket.emit('eaten');
//
//     }
//   }
// }
//
// function killDeadCells() {
//   for (let item of gameObjects) {
//     if (item.beenEaten) {
//       editObject(item, 'remove');
//     }
//   }
// }
//
// function editObject(object, property, value) {
//   out(gameObjects);
//   if (property == 'remove') {
//     out(`Received request to destroy objectID ${object.UID}...`);
//     for (let i = 0; i < gameObjects.length; i++) {
//       if (object === gameObjects[i]) {
//         out(`Removing item ${object.UID} from gameObjects!`);
//         gameObjects.splice(i, 1);
//         break;
//       }
//     }
//   } else {
//     out(`Received request to edit objectID ${object.UID} property ${property} to ${value}`);
//     for (let item of gameObjects) {
//       out(`Searching for matching object...`);
//       if (item.UID == object.UID) {
//         out(`Found matching item, searching for key`);
//         for (let key in item) {
//           if (key == property) {
//             out(`Found matching key, changing value...`);
//             item[key] = value;
//             break;
//           }
//         }
//         break;
//       }
//     }
//   }
//   out(gameObjects);
//   socket.emit('editObject', gameObjects);
// }
//
// function out(data) {
//   if (VERBOSE) console.log(`[DEBUG]: ${JSON.stringify(data)}\n`);
// }
//
// function getRelativeCoords(item) {
//   // I think this is just a more complicated roundabout that does the same thing
//   // as the p5js translate() function... come back to this later...
//   return createVector(item.x - (player.x - (width / 2)), item.y - (player.y - (height / 2)));
// }
//
// function isObjectEaten(item) {
//   return eatenItems.includes(item.UID);
// }
//
// function renderGameObjects() {
//   for (let item of gameObjects) {
//     if (!isObjectEaten(item) && item.UID != player.UID) {
//       fill(item.color, 255, 255);
//       // let relativeCoords = item);
//       stroke(0);
//       strokeWeight(3);
//       ellipse(item.x, item.y, item.size);
//       stroke(255);
//       fill(255);
//       textSize(item.size * 2 / 3);
//       text(item.size, item.x, item.y);
//       collision(item);
//       if (item instanceof Player) {
//         stroke(item.color, 255, 255);
//         fill(item.color, 255, 255);
//         text(item.name, item.x, item.y - item.size);
//       }
//     }
//   }
// }
//
//
//
// function updateSelf() {
//   if (keys[38] || keys[87]) { // up    || W
//     /*if (this.vel.y < this.speed)*/
//     this.vel.y -= this.speed;
//   }
//   if (keys[39] || keys[68]) { // right || D
//     /*if (this.vel.x < this.speed)*/
//     this.vel.x += this.speed;
//   }
//   if (keys[37] || keys[65]) { // left  || A
//     /*if (this.vel.x < this.speed)*/
//     this.vel.x -= this.speed;
//   }
//   if (keys[40] || keys[83]) { // down  || S
//     /*if (this.vel.y < this.speed)*/
//     this.vel.y += this.speed;
//   }
//   this.vel.x *= friction;
//   this.vel.y *= friction;
//
//   this.x += this.vel.x;
//   this.y += this.vel.y;
//
//   if (this.x < 0) this.x = 0;
//   if (this.x > spawnData.arenaSize.x) this.x = spawnData.arenaSize.x;
//   if (this.y < 0) this.y = 0;
//   if (this.y > spawnData.arenaSize.y) this.y = spawnData.arenaSize.y;
// }


function renderGame() {
  push();
  // translate(-player.offset.x, -player.offset.y);
  renderArena();
  renderOtherGameObjects();

  // The new implementation of GameObject would also allow for the player
  // to be rendered smoothly, not waiting for 'permission' from the server
  // To that end, we will first update and render all of the GameObjects,
  // move the player, render the player, then notify the server.

  // 1)
  // renderGameObjects();
  // 2)
  // 3)
  // update Server
  // player.update();
  pop();
}

function renderArena() {
  background(options.backgroundColor);
  strokeWeight(3);

  if (options.borderColor !== false) {
    let arenaCorners = {
      topLeft: {
        x: 0,
        y: 0
      },
      bottomRight: {
        x: spawnData.arenaSize.x,
        y: spawnData.arenaSize.y
      }
    };
    noFill();
    stroke(options.borderColor, 255, 255);
    rect(arenaCorners.topLeft.x, arenaCorners.topLeft.y, arenaCorners.bottomRight.x, arenaCorners.bottomRight.y);
  }

  strokeWeight(1);
}

function renderOtherGameObjects() {
  for (let object of gameObjects) {
    fill(object.color, 255, 255);
    ellipse(object.x, object.y, object.size);
    if (object.tpye == 'food') {

    } else if (object.tpye == 'player') {
      fill(0);
      text(object.name, object.x, object.y);
    }
  }
}