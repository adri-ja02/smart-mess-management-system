const express = require("express");

const {
  getWasteSummary,
  getWasteByMenu,
} = require("../controllers/waste.controller");

const {
  protect,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/summary",
  protect,
  getWasteSummary
);

// Per-menu / per-item waste-risk breakdown, used to flag
// low-demand items and high-waste-risk items before the next
// purchase or cook.
router.get(
  "/by-menu",
  protect,
  getWasteByMenu
);

module.exports = router;