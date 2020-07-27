class Player {
  constructor(x, y, size, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.beenEaten = false;
    this.speed = 2;
    this.vel = createVector(0, 0);
    this.name = name;
  }

  updateSelf() {
    if (keys[38] || keys[87]) { // up    || W
      /*if (this.vel.y < this.speed)*/
      this.vel.y -= this.speed;
    }
    if (keys[39] || keys[68]) { // right || D
      /*if (this.vel.x < this.speed)*/
      this.vel.x += this.speed;
    }
    if (keys[37] || keys[65]) { // left  || A
      /*if (this.vel.x < this.speed)*/
      this.vel.x -= this.speed;
    }
    if (keys[40] || keys[83]) { // down  || S
      /*if (this.vel.y < this.speed)*/
      this.vel.y += this.speed;
    }
    this.vel.x *= friction;
    this.vel.y *= friction;

    this.x += this.vel.x;
    this.y += this.vel.y;

    if (this.x < 0) this.x = 0;
    if (this.x > spawnData.arenaSize.x) this.x = spawnData.arenaSize.x;
    if (this.y < 0) this.y = 0;
    if (this.y > spawnData.arenaSize.y) this.y = spawnData.arenaSize.y;
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
      UID: this.UID,
      name: this.name,

    });
  }

}