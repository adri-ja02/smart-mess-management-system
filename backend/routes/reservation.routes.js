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

const {
    protect,
} = require("../middleware/auth.middleware");

/* ===========================================================
   STUDENT - REQUEST BED
   POST /api/reservations/request
=========================================================== */

router.post(
    "/request",
    protect,
    requestReservation
);

/* ===========================================================
   STUDENT - MY RESERVATIONS
   GET /api/reservations/my
=========================================================== */

router.get(
    "/my",
    protect,
    getMyReservations
);

/* ===========================================================
   STUDENT - RESERVATION STATUS
   GET /api/reservations/status/:roomId
=========================================================== */

router.get(
    "/status/:roomId",
    protect,
    getReservationStatus
);

/* ===========================================================
   STUDENT - CANCEL RESERVATION
   DELETE /api/reservations/:id
=========================================================== */

router.delete(
    "/:id",
    protect,
    cancelReservation
);

/* ===========================================================
   MANAGER - ALL RESERVATIONS
   GET /api/reservations/pending
=========================================================== */

router.get(
    "/pending",
    protect,
    getPendingReservations
);

/* ===========================================================
   MANAGER - APPROVE RESERVATION
   PUT /api/reservations/:id/approve
=========================================================== */

router.put(
    "/:id/approve",
    protect,
    approveReservation
);

/* ===========================================================
   MANAGER - REJECT RESERVATION
   PUT /api/reservations/:id/reject
=========================================================== */

router.put(
    "/:id/reject",
    protect,
    rejectReservation
);

module.exports = router;