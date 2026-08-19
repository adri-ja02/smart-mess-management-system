const express = require("express");

const {
  generateMonthlyBill,
  getMyBill,
  getBillingOverview,
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN,
  getPaymentStatus,
  getOverdueBills,
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

// Residents with overdue reminders (manager-facing list)
router.get(
  "/overdue",
  protect,
  getOverdueBills
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

// FIX: ipn_url is sent to SSLCommerz as part of the payment
// session in initiatePayment, but no route ever handled it --
// server-to-server payment confirmation from SSLCommerz would
// silently 404. This is the authoritative payment-status
// source, independent of whether the resident's browser makes
// it back to success_url.
router.post(
  "/payment-ipn",
  paymentIPN
);

module.exports = router;