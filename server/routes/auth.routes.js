const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/auth.controller");

const { protect } = require("../middleware/auth.middleware");

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// PROFILE (PROTECTED ROUTE)
router.get("/profile", protect, getProfile);

module.exports = router;