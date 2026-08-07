const express = require("express");
const router = express.Router();

const {
  getDemandForecast,
  getFoodWaste,
  getBillingSummary,
} = require("../controllers/analytics.controller");

// Smart Demand Forecast
router.get("/forecast", getDemandForecast);

// Food Waste Monitor
router.get("/waste", getFoodWaste);

// Billing
router.get("/billing", getBillingSummary);

module.exports = router;