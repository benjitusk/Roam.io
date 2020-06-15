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