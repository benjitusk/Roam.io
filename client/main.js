function setup() {
  frameRate(10);
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
  socket.emit('mouseMove', {
    x: mouseX,
    y: mouseY,
    id: socket.id
  });
}