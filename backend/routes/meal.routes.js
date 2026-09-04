
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");

const {
  scanQrCheckIn,
  manualCheckIn,
  markSkippedMeals,
  getMyMealHistory,
  getResidentMealHistory,
  getMealStatusGrid,
  updateMealStatus,
  getMonthlySummary,
} = require("../controllers/meal.controller");

// Every route below requires a logged-in user.
// Manager-only routes are additionally checked inside each controller
// function (req.user.role !== "manager"), matching Maliha's pattern
// in mealPlanner.controller.js — keep both features consistent.
//
// NOTE: no changes needed here — no bugs found in this file.
router.use(protect);

/* ================= CHECK-IN ================= */
router.post("/checkin/qr", scanQrCheckIn);
router.post("/checkin/manual", manualCheckIn);

/* ================= SKIPPED-MEAL SWEEP (manager-triggered or cron) ================= */
router.post("/mark-skipped", markSkippedMeals);

/* ================= HISTORY & STATUS ================= */
router.get("/my-history", getMyMealHistory);
router.get("/history/:residentId", getResidentMealHistory);
router.get("/status/:mealMenuId", getMealStatusGrid);

/* ================= OVERRIDE & REPORTING ================= */
router.patch("/:id/status", updateMealStatus);
router.get("/summary", getMonthlySummary);

module.exports = router;