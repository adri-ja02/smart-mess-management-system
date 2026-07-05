const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");

const {
  getProfile,
  updateProfile,
  changePassword,

} = require("../controllers/profile.controller");

const { protect } = require("../middleware/auth.middleware");

// Profile
router.get("/", protect, getProfile);

// Update Profile
//router.put("/update", protect, updateProfile);

// Change Password
router.put("/change-password", protect, changePassword);



//upload profile picture
router.put(
  "/update",
  protect,
  upload.single("profilePhoto"),
  updateProfile
);

module.exports = router;