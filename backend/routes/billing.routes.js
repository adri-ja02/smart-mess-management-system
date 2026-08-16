const express = require("express");

const {
  generateMonthlyBill,
  getMyBill,
  getBillingOverview,
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  getPaymentStatus,
} = require("../controllers/billing.controller");

const {
  protect,
} = require("../middleware/auth.middleware");

const router = express.Router();

// ===========================================================
// STUDENT BILLING
// ===========================================================

router.post(
  "/generate",
  protect,
  generateMonthlyBill
);

router.get(
  "/my-bill",
  protect,
  getMyBill
);

router.post(
  "/pay/:billId",
  protect,
  initiatePayment
);

router.get(
  "/payment-status/:billId",
  protect,
  getPaymentStatus
);

// ===========================================================
// MANAGER BILLING OVERVIEW
// ===========================================================

router.get(
  "/overview",
  protect,
  getBillingOverview
);

// ===========================================================
// SSLCOMMERZ CALLBACKS
// ===========================================================

router.post(
  "/payment-success",
  paymentSuccess
);

router.post(
  "/payment-fail",
  paymentFail
);

router.post(
  "/payment-cancel",
  paymentCancel
);

module.exports = router;