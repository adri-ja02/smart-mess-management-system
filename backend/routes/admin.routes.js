const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getPendingManagers,
  approveManager,
  rejectManager,
  blockUser,
  unblockUser,
} = require("../controllers/admin.controller");

const { protect } = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

/* =========================
   ALL ADMIN ROUTES
   (Protected + Admin Only)
========================= */

// Get all users
router.get("/users", protect, adminMiddleware, getAllUsers);

// Get pending manager requests
router.get(
  "/pending-managers",
  protect,
  adminMiddleware,
  getPendingManagers
);

// Approve manager
router.put(
  "/approve/:id",
  protect,
  adminMiddleware,
  approveManager
);

// Reject manager
router.put(
  "/reject/:id",
  protect,
  adminMiddleware,
  rejectManager
);

// Block user
router.put(
  "/block/:id",
  protect,
  adminMiddleware,
  blockUser
);

// Unblock user
router.put(
  "/unblock/:id",
  protect,
  adminMiddleware,
  unblockUser
);

module.exports = router;