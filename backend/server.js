const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const fs = require("fs");
const path = require("path");
const colors = require("colors");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

const __dirname1 = path.resolve();
const buildPath = path.join(__dirname1, "frontend", "build");

if (
  process.env.NODE_ENV === "production" ||
  process.env.RENDER ||
  fs.existsSync(path.join(buildPath, "index.html"))
) {
  app.use(express.static(buildPath));
  app.get("*", (req, res) =>
    res.sendFile(path.join(buildPath, "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running successfully.");
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    if (!userData) return;
    const userId = String(userData._id || userData);
    socket.join(userId);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    if (!room) return;
    const roomId = String(room._id || room);
    socket.join(roomId);
    console.log("User Joined Room: " + roomId);
  });

  socket.on("typing", (room) => {
    if (!room) return;
    const roomId = String(room._id || room);
    socket.in(roomId).emit("typing");
  });

  socket.on("stop typing", (room) => {
    if (!room) return;
    const roomId = String(room._id || room);
    socket.in(roomId).emit("stop typing");
  });

  socket.on("new message", (newMessageReceived) => {
    if (!newMessageReceived || !newMessageReceived.chat) return;
    const chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");

    const senderId = String(
      newMessageReceived.sender?._id || newMessageReceived.sender
    );

    chat.users.forEach((user) => {
      const targetUserId = String(user?._id || user);
      if (targetUserId === senderId) return;

      socket.in(targetUserId).emit("message received", newMessageReceived);
      socket.in(targetUserId).emit("message recieved", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(socket.id);
  });
});
