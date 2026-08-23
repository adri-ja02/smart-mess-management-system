const express = require("express");

const {
  createComplaint,
  uploadComplaintEvidence,

  trackComplaint,
  addFollowUp,
  answerReviewQuestion,
  verifyRepair,
  acceptSiteInspection,

  getComplaintsForAdmin,
  getComplaintByIdForAdmin,
  askReviewQuestion,
  updateManagerConflict,
  assignAuthorizedAlternative,

  getComplaintsForManager,
  getComplaintStatsForManager,
  getComplaintByIdForManager,
  updateComplaintStatus,
  assignComplaint,
  uploadCompletionEvidence,

  reviewComplaintDecision,
  requestSiteInspection,
  withdrawComplaint,

  getComplaintAnalytics,
} = require("../controllers/complaint.Controller");

const {
  protect,
} = require("../middleware/auth.middleware");

const upload = require("../middleware/upload.middleware");

const router =
  express.Router();

/* =========================================================
   RESIDENT - SUBMIT
========================================================= */

router.post(
  "/",
  protect,
  createComplaint
);

/* =========================================================
   RESIDENT - EVIDENCE UPLOAD
========================================================= */

router.post(
  "/upload",
  upload.array("evidence", 5),
  uploadComplaintEvidence
);

/* =========================================================
   RESIDENT - PRIVATE TOKEN
========================================================= */

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

router.post(
  "/verify-repair",
  verifyRepair
);

router.post(
  "/accept-inspection",
  acceptSiteInspection
);

/* =========================================================
   ADMIN - INTEGRITY REVIEW
 *
 * These routes must appear BEFORE /:id.
========================================================= */

router.get(
  "/admin",
  protect,
  getComplaintsForAdmin
);

router.get(
  "/admin/analytics",
  protect,
  getComplaintAnalytics
);

router.get(
  "/admin/:id",
  protect,
  getComplaintByIdForAdmin
);

/*
 * Admin asks resident a confidential question.
 */
router.post(
  "/admin/:id/question",
  protect,
  askReviewQuestion
);

/*
 * Admin decides whether complaint concerns manager.
 */
router.put(
  "/admin/:id/manager-conflict",
  protect,
  updateManagerConflict
);

/*
 * Admin names the authorized alternative for a
 * manager-conflict complaint.
 */
router.put(
  "/admin/:id/alternative-handler",
  protect,
  assignAuthorizedAlternative
);

/* =========================================================
   MANAGER - VALID WORK ORDERS ONLY
========================================================= */

router.get(
  "/",
  protect,
  getComplaintsForManager
);

/*
 * Must appear BEFORE /:id, or "stats" would be
 * interpreted as a complaint id.
 */
router.get(
  "/stats",
  protect,
  getComplaintStatsForManager
);

router.get(
  "/:id",
  protect,
  getComplaintByIdForManager
);

router.put(
  "/:id/assign",
  protect,
  assignComplaint
);

router.put(
  "/:id/status",
  protect,
  updateComplaintStatus
);

/*
 * Completion evidence.
 *
 * Current application has no Worker role, so this is
 * performed through the maintenance/manager interface.
 */
router.post(
  "/:id/completion-evidence",
  protect,
  upload.array(
    "evidence",
    5
  ),
  uploadCompletionEvidence
);

/* =========================================================
   MALIHA - FINAL REVIEW
========================================================= */

router.put(
  "/:id/review",
  protect,
  reviewComplaintDecision
);

router.put(
  "/:id/inspection",
  protect,
  requestSiteInspection
);

router.put(
  "/:id/withdraw",
  protect,
  withdrawComplaint
);

module.exports = router;