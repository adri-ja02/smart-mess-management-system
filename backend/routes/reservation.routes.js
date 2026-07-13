const express = require("express");
const router = express.Router();

const {
  requestReservation,
  getMyReservations,
} = require("../controllers/reservation.controller");

const { protect } = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

/* ===================================
   STUDENT ROUTES
=================================== */

// Request a bed
router.post("/", protect, requestReservation);

// View own reservations
router.get("/my", protect, getMyReservations);

module.exports = router;