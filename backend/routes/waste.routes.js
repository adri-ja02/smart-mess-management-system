const express = require("express");

const {
  getWasteSummary,
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

module.exports = router;