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

app.use(cors({ origin: "http://localhost:3000" }));

io.on("connection", (socket) => {
  socket.on("generate-paragraph", () => {
    socket.emit(
      "paragraph-generated",
      paragraphs[Math.floor(Math.random() * 200)]
    );
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`Server Running on Port: http://localhost:${PORT}`)
);
