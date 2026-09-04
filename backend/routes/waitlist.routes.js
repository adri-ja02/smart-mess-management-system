const express = require("express");

const router = express.Router();

const {
  getWaitlist,
  getNotifications,
  requestWaitlist,
  claimMatchedBed,
  findMatchingStudents,
  getAllWaitlistForManager,
  rejectWaitlistEntry,
  cancelWaitlist,
} = require("../controllers/waitlist.controller");

const {
  protect,
} = require("../middleware/auth.middleware");

// ===========================================================
// STUDENT
// ===========================================================

// My waitlist
router.get(
  "/",
  protect,
  getWaitlist
);

// Notifications
router.get(
  "/notifications",
  protect,
  getNotifications
);

// Join waitlist
router.post(
  "/",
  protect,
  requestWaitlist
);

// Claim matched bed
router.patch(
  "/:id/claim",
  protect,
  claimMatchedBed
);

// Leave waitlist
router.patch(
  "/:id/cancel",
  protect,
  cancelWaitlist
);

// ===========================================================
// MANAGER
// ===========================================================

// Matching students for a specific room
router.get(
  "/match/:roomId",
  protect,
  findMatchingStudents
);

// All waitlist entries
router.get(
  "/all",
  protect,
  getAllWaitlistForManager
);

// Reject waitlist entry
router.patch(
  "/:id/reject",
  protect,
  rejectWaitlistEntry
);

module.exports = router;