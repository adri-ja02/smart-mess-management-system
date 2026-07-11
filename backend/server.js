const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


/* =========================
   ROUTES
========================= */

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const profileRoutes = require("./routes/profile.routes");
const roomRoutes = require("./routes/room.routes");
const onboardingRoutes = require("./routes/onboarding.routes");
const spaceFitRoutes = require("./routes/spaceFit.routes");


app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/spacefit", spaceFitRoutes);


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