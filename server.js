require("dotenv").config();
const connectDB = require("./config/db");
connectDB();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/stories", require("./routes/storyRoutes"));
app.use("/api/quiz", require("./routes/quizRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/badges", require("./routes/badgeRoutes"));
app.use("/uploads", express.static("uploads"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io accessible globally
global.io = io;

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
