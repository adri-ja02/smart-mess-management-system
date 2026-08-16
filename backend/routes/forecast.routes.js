const express = require("express");

const {
  getDemandForecast,
} = require("../controllers/forecast.controller");

const {
  protect,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/",
  protect,
  getDemandForecast
);

module.exports = router;