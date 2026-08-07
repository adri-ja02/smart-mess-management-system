const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

/* =====================================
   Middlewares
===================================== */

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/* =====================================
   Test Route
===================================== */

app.get("/", (req, res) => {
  res.send("Smart Mess Management API is running");
});

/* =====================================
   Routes
===================================== */

const authRoutes = require("./routes/auth.routes");
const reservationRoutes = require("./routes/reservation.routes");
const waitlistRoutes = require("./routes/waitlist.routes");

// Authentication
app.use("/api/auth", authRoutes);

// Bed Reservation Module
app.use("/api/reservations", reservationRoutes);

// Waitlist Module
app.use("/api/waitlist", waitlistRoutes);

module.exports = app;