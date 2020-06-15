const socket = io('http://localhost');
socket.on("welcome", (data) => {
  console.log(data);
});