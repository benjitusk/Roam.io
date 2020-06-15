function setup() {
  frameRate(20);
  createCanvas(windowWidth, windowHeight);
  fill(255);
}

function draw() {
  background(0);
  socket.emit('mouseMove', {
    x: mouseX,
    y: mouseY,
    id: socket.id
  });

  for (let peer of peers) {
    ellipse(peer.x, peer.y, 10);
  }
}