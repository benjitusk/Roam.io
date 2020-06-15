const http = require('http').createServer(handler);
const io = require('socket.io')(http);
const fs = require('fs');
http.listen(80);
console.log(`Server listening on *:80`);

function handler(req, res) {
  fs.readFile(`${__dirname}/client/index.html`,
    (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html')
      }

      res.writeHead(200);
      res.end(data);
    });
}

io.on(`connection`, (client) => {
  client.start = Date.now();
  console.log(`New Client`);
  client.emit(`welcome`, `Client connected.`);
  client.on('msg', (data) => {
    console.log(data);
  });
  client.on("disconnect", (reason) => {
    console.log(`Client disconnected after ${(Date.now() - client.start)/1000} seconds because ${reason}.`)
  })
});