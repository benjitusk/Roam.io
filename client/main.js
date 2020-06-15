let size = 10;

function setup() {
  frameRate(20);
  createCanvas(windowWidth, windowHeight);
  fill(255);
}

function draw() {
  background(0);
  socket.emit('mouseMove', {
    id: socket.id,
    x: mouseX,
    y: mouseY,
    size: size
  });

  for (let peer of peers) {
    ellipse(peer.x, peer.y, peer.size);
  }
}