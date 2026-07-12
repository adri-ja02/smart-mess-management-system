const express = require("express");
const router = express.Router();

const { getSpaceFitMatches } = require("../controllers/spaceFit.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, getSpaceFitMatches);

module.exports = router;