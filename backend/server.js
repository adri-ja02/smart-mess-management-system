const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load env
dotenv.config();

// Connect DB
connectDB();

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   ROUTES
========================= */
const authRoutes = require("./routes/auth.routes");

app.use("/api/auth", authRoutes);

const adminRoutes = require("./routes/admin.routes");

app.use("/api/admin", adminRoutes);

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Smart Mess Management API is running...");
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});