const express = require("express");

const router = express.Router();

const {

    getWaitlist,

    getNotifications,

    findMatchingStudents

} = require("../controllers/waitlist.controller");

const { protect } = require("../middleware/auth.middleware");

/* Student */

router.get("/", protect, getWaitlist);

router.get("/notifications", protect, getNotifications);

/* Manager */

router.get("/match/:roomId", protect, findMatchingStudents);

module.exports = router;