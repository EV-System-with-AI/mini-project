const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("New client connected");

 socket.on("location", (data) => {
    console.log("Received location data:", data);

    
  io.emit("location", data);
  });

  socket.on("timerUpdate",(data) => {
    console.log("Received timer data:", data);
    io.emit("timerUpdate", data);
  })

  socket.on("filteredlocations",(data) => {
    console.log("recieving filtered data",data);
    io.emit("filteredlocations",data);
  })

  socket.on("chargeNow",(data) =>{
    console.log("recieving filtered data",data);
    io.emit("chargeNow",data);
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

