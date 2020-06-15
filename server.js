const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
server.listen(80);
console.log(`Server listening on *:80`);

app.use("/", express.static("client"));

io.on(`connection`, (client) => {
  client.start = Date.now();
  console.log(`New Client`);
  client.emit(`welcome`, `Client connected.`);
  client.on('msg', (data) => {
    console.log(data);
  });
  client.on("disconnect", (reason) => {
    console.log(`Client disconnected after ${(Date.now() - client.start)/1000} seconds because ${reason}.`)
  });
});