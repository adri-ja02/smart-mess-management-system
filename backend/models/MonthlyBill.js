const mongoose = require("mongoose");

const monthlyBillSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
    },

    mealCharges: {
      type: Number,
      default: 0,
      min: 0,
    },

    fixedExpenses: {
      type: Number,
      default: 0,
      min: 0,
    },

    sharedExpenses: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["unpaid", "paid", "overdue"],
      default: "unpaid",
    },

    paymentId: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    receiptNumber: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

monthlyBillSchema.index(
  {
    resident: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

module.exports =
  mongoose.models.MonthlyBill ||
  mongoose.model("MonthlyBill", monthlyBillSchema);