let size = 10;
let cellColor;

function setup() {
  frameRate(20);
  createCanvas(windowWidth, windowHeight);
  fill(255);
  colorMode(HSB);
  cellColor = random(255);
}

function draw() {
  background(0);
  socket.emit('mouseMove', {
    id: socket.id,
    x: mouseX,
    y: mouseY,
    size: size,
    color: cellColor
  });

  for (let peer of peers) {
    fill(peer.color, 255, 255);
    ellipse(peer.x, peer.y, peer.size);
  }

}

function collision() {
  // Check against all the foods, alert server if true
  for (let food of foods) {
    if (dist(player.x, player.y, food.x, food.y) < player.size + food.size) {
      // If overlap
      if (player.size >= food.size) {
        // If player is bigger
        socket.emit('ate', {
          clientEaten: fa
        });
      } else {
        // emit eaten and make food bigger
      }
    }
  }

  // Check against all peers, handle further before alerting server
  for (let peer of peers) {
    if (dist(player.x, player.y, peer.x, peer.y) < player.size + food.size && player.id != socket.id) {
      // if overlaping OTHER players
      if (player.size > peer.size) {
        // If we are bigger than them
        // eat them
      } else if (player.size < peer.size) {
        // If we are smaller than them
        // get eaten
      }
    }
  }
}

class Player {
  constructor() {
    this.x;
    this.y;
    this.color;
    this.size;
  }



}