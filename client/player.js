class GameObject {
  constructor(UID, x, y, size, color) {
    this.UID = UID;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
  }
  render() {
    ellipse(this.x, this.y, this.size);
  }
}

class Player extends GameObject {
  constructor(UID, x, y, color, size) {
    super(UID, x, y, size, color);
    this.name = name || 'undefined';
  }
  render() {
    super.render();
    fill(0);
    text(this.name, this.x, this.y);
  }
}









// // class Player {
// //   constructor(x, y, size, color) {
// //     this.x = x;
// //     this.y = y;
// //     this.size = size;
// //     this.color = color;
// //     this.beenEaten = false;
// //     this.speed = 2;
// //     this.vel = createVector(0, 0);
// //     this.name = name;
// //   }
// //
// // updateSelf() {
// //   if (keys[38] || keys[87]) { // up    || W
// //     /*if (this.vel.y < this.speed)*/
// //     this.vel.y -= this.speed;
// //   }
// //   if (keys[39] || keys[68]) { // right || D
// //     /*if (this.vel.x < this.speed)*/
// //     this.vel.x += this.speed;
// //   }
// //   if (keys[37] || keys[65]) { // left  || A
// //     /*if (this.vel.x < this.speed)*/
// //     this.vel.x -= this.speed;
// //   }
// //   if (keys[40] || keys[83]) { // down  || S
// //     /*if (this.vel.y < this.speed)*/
// //     this.vel.y += this.speed;
// //   }
// //   this.vel.x *= friction;
// //   this.vel.y *= friction;
// //
// //   this.x += this.vel.x;
// //   this.y += this.vel.y;
// //
// //   if (this.x < 0) this.x = 0;
// //   if (this.x > spawnData.arenaSize.x) this.x = spawnData.arenaSize.x;
// //   if (this.y < 0) this.y = 0;
// //   if (this.y > spawnData.arenaSize.y) this.y = spawnData.arenaSize.y;
// // }
// //
// //
// function updateServer() {
//   socket.emit('serverUpdate', {
//     id: socket.id,
//     x: this.x,
//     y: this.y,
//     size: this.size,
//     color: this.color,
//     type: "player",
//     beenEaten: this.beenEaten,
//     UID: this.UID,
//     name: this.name,
//
//   });
// }
// //
// // }
//
// class GameObject {
//   constructor(UID, x, y, size, color) {
//     this.UID = UID;
//     this.x = x;
//     this.y = y;
//     this.size = size;
//     this.color = color;
//   }
// }
//
// class Food extends GameObject {
//   constructor(UID, x, y, size, color) {
//     super(UID, x, y, size, color);
//     this.type = 'food';
//   }
//
//   render() {
//     noStroke();
//     if (!this.color) this.color = color(0);
//     fill(this.color);
//     ellipse(this.x, this.y, this.size);
//     noFill();
//     stroke(0);
//     ellipse(this.x, this.y, this.size * 1.1);
//   }
//
// }
//
// class Player extends GameObject {
//   constructor(UID, x, y, size, color, name) {
//     super(UID, x, y, size, color);
//     this.type = 'player';
//     this.name = name;
//     this.beenEaten = false;
//     this.speed = 50;
//     this.offset = createVector(0, 0);
//   }
//
//   update() {
//     // Move
//     if (keyIsDown(LEFT_ARROW)) {
//       this.offset.x -= this.speed;
//       this.x += this.speed;
//     }
//     if (keyIsDown(RIGHT_ARROW)) {
//       this.offset.x += this.speed;
//       this.x -= this.speed;
//     }
//     if (keyIsDown(UP_ARROW)) {
//       this.offset.y -= this.speed;
//       this.y += this.speed;
//     }
//     if (keyIsDown(DOWN_ARROW)) {
//       this.offset.y += this.speed;
//       this.y -= this.speed;
//     }
//     this.render();
//     this.updateServer();
//   }
//
//   render() {
//     noStroke();
//     if (!this.color) this.color = color(0);
//     fill(this.color);
//     ellipse(0, 0, this.size);
//     noFill();
//     stroke(0);
//     ellipse(this.x, this.y, this.size * 1.1);
//   }
//
//   updateServer() {
//     // emit new coords
//     socket.emit('serverUpdate', {
//       id: socket.id,
//       x: this.x,
//       y: this.y,
//       size: this.size,
//       color: this.color,
//       type: "player",
//       beenEaten: this.beenEaten,
//       UID: this.UID,
//       name: this.name,
//     });
//
//   }
//
// }