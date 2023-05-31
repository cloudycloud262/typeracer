const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const paragraphs = require("./public/paragraphs.json");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" },
});

let currGlobalRoom = null;
let openGlobalRoom = new Set();
let friendlyRooms = new Map();
let players = new Map();

app.use(cors({ origin: "http://localhost:3000" }));

const getRoom = (it) => {
  it.next();
  return it.next().value;
};
const joinRoom = (socket, room) => {
  socket.join(room);
  socket.emit("joined", {
    id: room,
    players: Array.from(io.sockets.adapter.rooms.get(room)).map((pl) => [
      pl,
      players.get(pl),
    ]),
    paragraph: Number.isInteger(room)
      ? paragraphs[room % 200]
      : paragraphs[room.split("-")[room.split("-").length - 1] % 200],
  });
  socket.to(room).emit("player-joined", [socket.id, players.get(socket.id)]);
};
const leaveRoom = (socket) => {
  const room = getRoom(socket.rooms.values());
  socket.to(room).emit("player-removed", socket.id);
  if (typeof room === "string") {
    if (
      friendlyRooms.get(room) &&
      io.sockets.adapter.rooms.get(room)?.size === 1
    ) {
      friendlyRooms.delete(room);
    }
  } else {
    const bool = openGlobalRoom.has(room);
    if (bool && io.sockets.adapter.rooms.get(room)?.size === 1) {
      openGlobalRoom.delete(room);
    } else if (room && room !== currGlobalRoom && !bool) {
      openGlobalRoom.add(room);
    }
  }
};

io.on("connection", (socket) => {
  socket.emit("socketId", socket.id);
  socket.on("add-global", (username) => {
    players.set(socket.id, username);
    if (
      io.sockets.adapter.rooms.get(currGlobalRoom)?.size < 4 &&
      60000 - (new Date().getTime() - currGlobalRoom) > 10000
    ) {
      joinRoom(socket, currGlobalRoom);
    } else {
      openGlobalRoom.forEach(
        (val) =>
          60000 - (new Date().getTime() - val) < 11000 &&
          openGlobalRoom.delete(val)
      );
      const bool = openGlobalRoom.entries().next().value;
      if (bool) {
        currGlobalRoom = bool[0];
        openGlobalRoom.delete(bool[0]);
        joinRoom(socket, currGlobalRoom);
      } else {
        currGlobalRoom = new Date().getTime();
        joinRoom(socket, currGlobalRoom);
      }
    }
  });
  socket.on("create-friendly", (username) => {
    players.set(socket.id, username);
    const url = `${socket.id}-${new Date().getTime()}`;
    socket.join(url);
    socket.emit("friendly-created", {
      url,
      paragraph: paragraphs[url.split("-")[url.split("-").length - 1] % 200],
    });
  });
  socket.on("join-friendly", ({ url, username }) => {
    players.set(socket.id, username);
    if (
      io.sockets.adapter.rooms.get(url)?.size < 4 &&
      !friendlyRooms.get(url)
    ) {
      socket.join(url);
      joinRoom(socket, url);
    } else {
      socket.emit("room-capacity-full");
    }
  });
  socket.on("friendly-start-countdown", (room) => {
    socket.emit("friendly-start-countdown");
    socket.to(room).emit("friendly-start-countdown");
    friendlyRooms.set(room, 1);
  });
  socket.on("set-progress", (obj) => {
    socket
      .to(obj.roomId)
      .emit("set-progress", { progress: obj.progress, player: socket.id });
  });
  socket.on("finished", (obj) => {
    socket.to(obj.roomId).emit("finished", {
      id: socket.id,
      time: obj.time,
      username: obj.username,
    });
  });
  socket.on("generate-paragraph", () => {
    socket.emit(
      "paragraph-generated",
      paragraphs[Math.floor(Math.random() * 200)]
    );
  });
  socket.on("leave-room", () => {
    leaveRoom(socket);
    socket.leave(getRoom(socket.rooms.values()));
  });
  socket.on("disconnecting", () => {
    leaveRoom(socket);
    players.delete(socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`Server Running on Port: http://localhost:${PORT}`)
);
