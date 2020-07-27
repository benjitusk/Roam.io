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
        // p5JS should not be involved in the welcome screen, this should br primarily HTML/CSS.
        // As such, effectively remove p5JS from the scene
        break;
      case 'play':
        renderArena();
        player.updateSelf();
        player.updateServer();
        renderGameObjects();
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

function collision(item) {
  if (item.UID != player.UID && dist(player.x, player.y, item.x, item.y) < (player.size + item.size) / 2) {
    out(item);
    if (player.size > item.size) {
      player.size += item.size;
      item.beenEaten = true;
      eatenItems.push(item.UID);
      socket.emit('ate', item);
      killDeadCells();
    } else if (player.size < item.size) {
      socket.emit('eaten');

    }
  }
}

function killDeadCells() {
  for (let item of gameObjects) {
    if (item.beenEaten) {
      editObject(item, 'remove');
    }
  }
}

function editObject(object, property, value) {
  out(gameObjects);
  if (property == 'remove') {
    out(`Received request to destroy objectID ${object.UID}...`);
    for (let i = 0; i < gameObjects.length; i++) {
      if (object === gameObjects[i]) {
        out(`Removing item ${object.UID} from gameObjects!`);
        gameObjects.splice(i, 1);
        break;
      }
    }
  } else {
    out(`Received request to edit objectID ${object.UID} property ${property} to ${value}`);
    for (let item of gameObjects) {
      out(`Searching for matching object...`);
      if (item.UID == object.UID) {
        out(`Found matching item, searching for key`);
        for (let key in item) {
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
  out(gameObjects);
  socket.emit('editObject', gameObjects);
}

function out(data) {
  if (VERBOSE) console.log(`[DEBUG]: ${JSON.stringify(data)}\n`);
}

function getRelativeCoords(item) {
  return createVector(item.x - (player.x - (width / 2)), item.y - (player.y - (height / 2)));
}

function isObjectEaten(item) {
  return eatenItems.includes(item.UID);
}

function renderGameObjects() {
  for (let item of gameObjects) {
    if (!isObjectEaten(item)) {
      fill(item.color, 255, 255);
      let relativeCoords = getRelativeCoords(item);
      noStroke();
      ellipse(relativeCoords.x, relativeCoords.y, item.size);
      stroke(255);
      fill(255);
      textSize(item.size * 2 / 3);
      text(item.size, relativeCoords.x, relativeCoords.y);
      collision(item);
      if (item.type == 'player') {
        stroke(item.color, 255, 255);
        fill(item.color, 255, 255);
        text(item.name, relativeCoords.x, relativeCoords.y - item.size);
      }
    }
  }
}

function renderArena() {
  background(options.backgroundColor);
  strokeWeight(3);
  if (options.gridColor !== false) {
    stroke(options.gridColor);
    for (let x = 0; x < width; x += 30) {
      line(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 30) {
      line(0, y, width, y);
    }
  }

  if (options.borderColor !== false) {
    let arenaCorners = {
      topLeft: getRelativeCoords({
        x: 0,
        y: 0
      }),
      bottomRight: getRelativeCoords({
        x: spawnData.arenaSize.x,
        y: spawnData.arenaSize.y
      })
    };
    noFill();
    stroke(options.borderColor, 255, 255);
    rect(arenaCorners.topLeft.x, arenaCorners.topLeft.y, arenaCorners.bottomRight.x, arenaCorners.bottomRight.y);
  }

  strokeWeight(1);

}