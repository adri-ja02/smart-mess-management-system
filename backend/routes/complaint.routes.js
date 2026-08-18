const express = require("express");

const {
  createComplaint,
  uploadComplaintEvidence,
  trackComplaint,
  addFollowUp,
  answerReviewQuestion,
  getComplaintsForManager,
  getComplaintByIdForManager,
  askReviewQuestion,
  updateComplaintStatus,
  assignComplaint,
} = require("../controllers/complaint.controller");

const { protect } = require("../middleware/auth.middleware");

// IMPORTANT:
// Use the shared upload middleware.
// It creates backend/uploads automatically
// and will be configured for IMAGE ONLY.
const upload = require("../middleware/upload.middleware");

const router = express.Router();

/* ================= FEATURE 1: SUBMIT ================= */

router.post(
  "/",
  protect,
  createComplaint
);

/* ================= EVIDENCE IMAGE UPLOAD ================= */

router.post(
  "/upload",
  upload.array("evidence", 5),
  uploadComplaintEvidence
);

/* ================= FEATURE 2: TOKEN-ONLY FOLLOW-UP ================= */

router.post(
  "/track",
  trackComplaint
);

router.post(
  "/follow-up",
  addFollowUp
);

router.post(
  "/answer",
  answerReviewQuestion
);

/* ================= MANAGER / ADMIN ================= */

router.get(
  "/",
  protect,
  getComplaintsForManager
);

router.get(
  "/:id",
  protect,
  getComplaintByIdForManager
);

router.post(
  "/:id/question",
  protect,
  askReviewQuestion
);

router.put(
  "/:id/status",
  protect,
  updateComplaintStatus
);

router.put(
  "/:id/assign",
  protect,
  assignComplaint
);

module.exports = router;