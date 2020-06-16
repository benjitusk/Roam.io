let c;

function setup() {
  frameRate(20);
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  c = random(255);
  player = new Player(100, 100, 15, random(255));
}

function draw() {
  background(0);
  player.updateSelf();
  player.updateServer();

  for (let item of gameObjects) {
    fill(item.color, 255, 255);
    ellipse(item.x, item.y, item.size);
    collision(item);
  }

}

function collision(item) {
  if (item.id != socket.id && dist(player.x, player.y, item.x, item.y) < player.size + item.size) {
    console.log(JSON.stringify(item));
    if (player.size > item.size) {
      player.size += item.size;
      item.beenEaten = true
      // Alert the server that ${item} was eaten
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

    });
  }

}