const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// Middlewares
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/", (req, res) => {
  res.send("Smart Mess Management API is running");
});

// Routes
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

module.exports = app;