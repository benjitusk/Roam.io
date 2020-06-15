function setup() {
  frameRate(10);
  createCanvas(windowWidth, windowHeight);
  background(0);
}

function draw() {
  socket.emit('mouseMove', {
    x: mouseX,
    y: mouseY
  });
}