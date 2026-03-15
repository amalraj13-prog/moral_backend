require("dotenv").config();
const connectDB = require("./config/db");
connectDB();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "https://moral-frontend.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// Allow cross-origin requests for static files (videos, audio)
app.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
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
