const express = require('express');
const app = express();
const server = require('http').Server(app);
let clientData = [];
const io = require('socket.io')(server, {
  'pingTimeout': 180000,
  'pingInterval': 25000
});
server.listen(80);
console.log('Server listening on *:80');

app.use('/', express.static('client'));

io.on('connection', (client) => {
  client.start = Date.now();
  console.log(`New Client ID: ${client.id}`);
  clientData.push({
    id: client.id,
    x: 100,
    y: 100,
  });
  client.on('clientMSG', (data) => {
    console.log(`Client ${client.id} says "${data}"`);
  });
  client.on('mouseMove', (data) => {
    console.log(data);
  });
  client.on('disconnect', (reason) => {
    console.log(`Client disconnected after ${(Date.now() - client.start)/1000} seconds because ${reason}.`)
  });
});

setInterval(() => {
  io.emit('update', clientData)
}, 100);