let VERBOSE = true;
let eatenItems = [];

function setup() {
  frameRate(20);
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  player = new Player(100, 100, 15, random(255));
  textAlign(CENTER);
  noStroke();
  textSize(50);
}

function draw() {
  if (socket.io.readyState == "open") {
    background(0);
    player.updateSelf();
    player.updateServer();

    for (let item of gameObjects) {
      fill(item.color, 255, 255);
      ellipse(item.x, item.y, item.size);
      collision(item);
    }
  } else if (socket.io.readyState == "connecting") {
    background(0);
    fill(90, 255, 255);
    text("Connecting to server!", width / 2, height / 3);
  } else if (socket.io.readyState == "closed") {
    background(0);
    fill(0, 255, 255);
    text("Disconnected from server!", width / 2, height / 3);
  }
}

function collision(item) {
  if (item.id != socket.id && dist(player.x, player.y, item.x, item.y) < player.size + item.size && !item.beenEaten && !itemBeenEaten(item)) {
    console.log(JSON.stringify(item));
    if (player.size > item.size) {
      player.size += item.size;
      eatenItems.push(item);
      item.beenEaten = true;
      socket.emit('ate', item);
      killDeadCells();
    }
  }
}

class Player {
  constructor(x, y, size, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.beenEaten = false;
  }

  updateSelf() {
    this.x = mouseX;
    this.y = mouseY;
  }

  updateServer() {
    socket.emit('serverUpdate', {
      id: socket.id,
      x: this.x,
      y: this.y,
      size: this.size,
      color: this.color,
      type: "player",
      beenEaten: this.beenEaten,

    });
  }

}

function killDeadCells() {
  for (let item of gameObjects) {
    if (item.beenEaten) {
      editObject(item, "remove");
    }
  }
}

function editObject(object, property, value) {
  console.log(gameObjects);
  if (property == "remove") {
    out(`Received request to destroy objectID ${object.id}...`);
    for (let i = 0; i < gameObjects.length; i++) {
      if (object === gameObjects[i]) {
        out(`Removing item ${object.id} from gameObjects!`);
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
  console.log(gameObjects);
  socket.emit('editObject', gameObjects);
}

function out(data) {
  if (VERBOSE) console.log(`[DEBUG]: ${data}\n`);
}

function itemBeenEaten(item) {
  for (let object of eatenItems) {
    if (object === item) return true;
    return false;
  }
}