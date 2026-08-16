const axios = require("axios");

const MealRecord = require("../models/MealRecord");
const Expense = require("../models/Expense");
const MonthlyBill = require("../models/MonthlyBill");
const User = require("../models/User");

// ===========================================================
// GENERATE MONTHLY BILL - STUDENT
// ===========================================================

const generateMonthlyBill = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year are required",
      });
    }

    const monthNumber = Number(month);
    const yearNumber = Number(year);

    if (
      monthNumber < 1 ||
      monthNumber > 12 ||
      yearNumber < 2000
    ) {
      return res.status(400).json({
        message: "Invalid month or year",
      });
    }

    // -------------------------------------------------------
    // GET CURRENT STUDENT'S CONFIRMED MEALS
    // collected + late = consumed/confirmed
    // -------------------------------------------------------

    const records = await MealRecord.find({
      resident: req.user._id,
      status: {
        $in: ["collected", "late"],
      },
    }).populate("mealMenu");

    let mealCharges = 0;

    records.forEach((record) => {
      if (!record.mealMenu) {
        return;
      }

      const mealDate = new Date(record.mealMenu.date);

      if (
        mealDate.getMonth() + 1 === monthNumber &&
        mealDate.getFullYear() === yearNumber
      ) {
        mealCharges += Number(
          record.mealMenu.price || 0
        );
      }
    });

    // -------------------------------------------------------
    // FIXED EXPENSES
    // -------------------------------------------------------

    const fixedExpenses = await Expense.aggregate([
      {
        $match: {
          month: monthNumber,
          year: yearNumber,
          category: "fixed",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    // -------------------------------------------------------
    // SHARED EXPENSES
    // -------------------------------------------------------

    const sharedExpenses = await Expense.aggregate([
      {
        $match: {
          month: monthNumber,
          year: yearNumber,
          category: "shared",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const fixedTotal = Number(
      fixedExpenses[0]?.total || 0
    );

    const sharedTotal = Number(
      sharedExpenses[0]?.total || 0
    );

    // -------------------------------------------------------
    // TOTAL
    // -------------------------------------------------------

    const totalAmount =
      mealCharges +
      fixedTotal +
      sharedTotal;

    // -------------------------------------------------------
    // CREATE / UPDATE BILL
    // -------------------------------------------------------

    const bill = await MonthlyBill.findOneAndUpdate(
      {
        resident: req.user._id,
        month: monthNumber,
        year: yearNumber,
      },
      {
        $set: {
          resident: req.user._id,
          month: monthNumber,
          year: yearNumber,
          mealCharges,
          fixedExpenses: fixedTotal,
          sharedExpenses: sharedTotal,
          totalAmount,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Monthly bill generated successfully",
      bill,
    });
  } catch (error) {
    console.error(
      "GENERATE BILL ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Server error while generating monthly bill",
    });
  }
};

// ===========================================================
// GET MY BILL - STUDENT
// ===========================================================

const getMyBill = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year are required",
      });
    }

    const monthNumber = Number(month);
    const yearNumber = Number(year);

    const bill = await MonthlyBill.findOne({
      resident: req.user._id,
      month: monthNumber,
      year: yearNumber,
    });

    if (!bill) {
      return res.status(404).json({
        message:
          "Monthly bill not found",
      });
    }

    return res.status(200).json(bill);
  } catch (error) {
    console.error(
      "GET MY BILL ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Server error while loading bill",
    });
  }
};

// ===========================================================
// GET BILLING OVERVIEW - MANAGER
// ===========================================================

const getBillingOverview = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year are required",
      });
    }

    const monthNumber = Number(month);
    const yearNumber = Number(year);

    if (
      monthNumber < 1 ||
      monthNumber > 12 ||
      yearNumber < 2000
    ) {
      return res.status(400).json({
        message: "Invalid month or year",
      });
    }

    // -------------------------------------------------------
    // GET ALL ACTIVE STUDENTS
    // -------------------------------------------------------

    const students = await User.find({
      role: "student",
      accountStatus: "active",
    }).select("_id name email");

    // -------------------------------------------------------
    // GET BILLS FOR SELECTED MONTH
    // -------------------------------------------------------

    const bills = await MonthlyBill.find({
      month: monthNumber,
      year: yearNumber,
    });

    // -------------------------------------------------------
    // CREATE BILL LOOKUP
    // -------------------------------------------------------

    const billMap = new Map();

    bills.forEach((bill) => {
      if (bill.resident) {
        billMap.set(
          bill.resident.toString(),
          bill
        );
      }
    });

    // -------------------------------------------------------
    // GET CONFIRMED MEALS
    // collected + late = confirmed/consumed
    // -------------------------------------------------------

    const mealRecords = await MealRecord.find({
      status: {
        $in: ["collected", "late"],
      },
    }).populate("mealMenu");

    const mealMap = new Map();

    mealRecords.forEach((record) => {
      if (!record.mealMenu || !record.resident) {
        return;
      }

      const mealDate = new Date(
        record.mealMenu.date
      );

      if (
        mealDate.getMonth() + 1 !== monthNumber ||
        mealDate.getFullYear() !== yearNumber
      ) {
        return;
      }

      const studentId =
        record.resident.toString();

      if (!mealMap.has(studentId)) {
        mealMap.set(studentId, 0);
      }

      mealMap.set(
        studentId,
        mealMap.get(studentId) + 1
      );
    });

    // -------------------------------------------------------
    // COMBINE STUDENTS + BILLS + MEALS
    // -------------------------------------------------------

    const overview = students.map((student) => {
      const studentId =
        student._id.toString();

      const bill = billMap.get(studentId);

      const confirmedMeals =
        mealMap.get(studentId) || 0;

      return {
        studentId: student._id,

        name: student.name,

        email: student.email,

        confirmedMeals,

        billGenerated: Boolean(bill),

        mealCharges:
          bill?.mealCharges || 0,

        fixedExpenses:
          bill?.fixedExpenses || 0,

        sharedExpenses:
          bill?.sharedExpenses || 0,

        totalAmount:
          bill?.totalAmount || 0,

        status:
          bill?.status || "not-generated",

        paymentId:
          bill?.paymentId || null,

        paidAt:
          bill?.paidAt || null,

        receiptNumber:
          bill?.receiptNumber || null,

        billId:
          bill?._id || null,
      };
    });

    // -------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------

    const totalStudents =
      overview.length;

    const paidStudents =
      overview.filter(
        (student) =>
          student.status === "paid"
      ).length;

    const unpaidStudents =
      overview.filter(
        (student) =>
          student.billGenerated &&
          student.status !== "paid"
      ).length;

    const confirmedMealStudents =
      overview.filter(
        (student) =>
          student.confirmedMeals > 0
      ).length;

    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------

    return res.status(200).json({
      month: monthNumber,
      year: yearNumber,

      summary: {
        totalStudents,
        paidStudents,
        unpaidStudents,
        confirmedMealStudents,
      },

      students: overview,
    });
  } catch (error) {
    console.error(
      "BILLING OVERVIEW ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Server error while loading billing overview",
    });
  }
};

// ===========================================================
// INITIATE SSLCOMMERZ PAYMENT
// ===========================================================

const initiatePayment = async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await MonthlyBill.findOne({
      _id: billId,
      resident: req.user._id,
    });

    if (!bill) {
      return res.status(404).json({
        message: "Bill not found",
      });
    }

    if (bill.status === "paid") {
      return res.status(400).json({
        message:
          "This bill has already been paid",
      });
    }

    if (
      !bill.totalAmount ||
      Number(bill.totalAmount) < 10
    ) {
      return res.status(400).json({
        message:
          "SSLCommerz payment amount must be at least 10 BDT",
      });
    }

    const transactionId =
      `MESS-${bill._id}-${Date.now()}`;

    const isLive =
      process.env.SSLCOMMERZ_IS_LIVE === "true";

    const sslUrl = isLive
      ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
      : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

    const backendUrl =
      process.env.BACKEND_URL ||
      "http://localhost:5000";

    const user = req.user;

    const paymentData = {
      store_id:
        process.env.SSLCOMMERZ_STORE_ID,

      store_passwd:
        process.env.SSLCOMMERZ_STORE_PASSWORD,

      total_amount:
        Number(bill.totalAmount).toFixed(2),

      currency: "BDT",

      tran_id: transactionId,

      success_url:
        `${backendUrl}/api/billing/payment-success`,

      fail_url:
        `${backendUrl}/api/billing/payment-fail`,

      cancel_url:
        `${backendUrl}/api/billing/payment-cancel`,

      ipn_url:
        `${backendUrl}/api/billing/payment-ipn`,

      cus_name:
        user.name || "Mess Resident",

      cus_email:
        user.email || "customer@example.com",

      cus_add1: "Smart Mess",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1200",
      cus_country: "Bangladesh",

      shipping_method: "NO",

      product_name:
        "Monthly Mess Bill",

      product_category:
        "Mess Service",

      product_profile:
        "general",

      value_a:
        bill._id.toString(),

      value_b:
        req.user._id.toString(),
    };

    const response = await axios.post(
      sslUrl,
      new URLSearchParams(
        paymentData
      ).toString(),
      {
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
      }
    );

    const sslResponse =
      response.data;

    if (
      !sslResponse.GatewayPageURL
    ) {
      console.error(
        "SSLCOMMERZ RESPONSE:",
        sslResponse
      );

      return res.status(400).json({
        message:
          "Could not create SSLCommerz payment session",
        response: sslResponse,
      });
    }

    bill.paymentId =
      transactionId;

    await bill.save();

    return res.status(200).json({
      message:
        "Payment session created",

      paymentUrl:
        sslResponse.GatewayPageURL,

      transactionId,
    });
  } catch (error) {
    console.error(
      "SSLCOMMERZ PAYMENT ERROR:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      message:
        error.response?.data?.failedreason ||
        error.message ||
        "Server error while initiating payment",
    });
  }
};

// ===========================================================
// PAYMENT SUCCESS
// ===========================================================

const paymentSuccess = async (
  req,
  res
) => {
  try {
    console.log(
      "SSLCommerz SUCCESS:",
      req.body
    );

    const {
      tran_id,
      status,
    } = req.body;

    if (!tran_id) {
      return res
        .status(400)
        .send(
          "Transaction ID missing"
        );
    }

    const bill =
      await MonthlyBill.findOne({
        paymentId: tran_id,
      });

    if (!bill) {
      return res
        .status(404)
        .send(
          "Bill not found"
        );
    }

    if (
      status === "VALID" ||
      status === "VALIDATED"
    ) {
      bill.status = "paid";

      bill.paidAt =
        new Date();

      bill.receiptNumber =
        `REC-${Date.now()}`;

      await bill.save();
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/billing?payment=success`
    );
  } catch (error) {
    console.error(
      "PAYMENT SUCCESS ERROR:",
      error
    );

    return res
      .status(500)
      .send(
        "Payment processing failed"
      );
  }
};

// ===========================================================
// PAYMENT FAILED
// ===========================================================

const paymentFail = async (
  req,
  res
) => {
  console.log(
    "SSLCommerz FAILED:",
    req.body
  );

  return res.redirect(
    `${process.env.FRONTEND_URL}/billing?payment=failed`
  );
};

// ===========================================================
// PAYMENT CANCELLED
// ===========================================================

const paymentCancel = async (
  req,
  res
) => {
  console.log(
    "SSLCommerz CANCELLED:",
    req.body
  );

  return res.redirect(
    `${process.env.FRONTEND_URL}/billing?payment=cancelled`
  );
};

// ===========================================================
// GET PAYMENT STATUS - STUDENT
// ===========================================================

const getPaymentStatus = async (
  req,
  res
) => {
  try {
    const { billId } =
      req.params;

    const bill =
      await MonthlyBill.findOne({
        _id: billId,
        resident: req.user._id,
      });

    if (!bill) {
      return res.status(404).json({
        message:
          "Bill not found",
      });
    }

    return res.status(200).json({
      billId: bill._id,

      status:
        bill.status,

      paymentId:
        bill.paymentId,

      paidAt:
        bill.paidAt,

      receiptNumber:
        bill.receiptNumber,

      totalAmount:
        bill.totalAmount,
    });
  } catch (error) {
    console.error(
      "PAYMENT STATUS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while getting payment status",
    });
  }
};

// ===========================================================
// EXPORTS
// ===========================================================

module.exports = {
  generateMonthlyBill,
  getMyBill,
  getBillingOverview,
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  getPaymentStatus,
};