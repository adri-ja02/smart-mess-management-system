const express = require("express");
const router = express.Router();

const {
  requestReservation,
  getMyReservations,
  getPendingReservations,
  approveReservation,
  rejectReservation,
  cancelReservation,
  getReservationStatus,
} = require("../controllers/reservation.controller");

const { protect } = require("../middleware/auth.middleware");

/* =====================================
   STUDENT
===================================== */

// Request a bed
router.post("/", protect, requestReservation);

// View own reservations
router.get("/my", protect, getMyReservations);

// Cancel reservation
router.patch("/:id/cancel", protect, cancelReservation);

/* =====================================
   MANAGER
===================================== */

// View pending requests
router.get("/pending", protect, getPendingReservations);

// Approve reservation
router.patch("/:id/approve", protect, approveReservation);

// Reject reservation
router.patch("/:id/reject", protect, rejectReservation);

router.get(
  "/status/:roomId",
  protect,
  getReservationStatus
);

module.exports = router;