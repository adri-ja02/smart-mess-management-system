
const mongoose = require("mongoose");

/*
  A MealRecord is the CONSUMPTION OUTCOME of a single MealToken
  (Maliha's Feature 1 model). One token -> at most one record.
  This is what Feature 3 (forecasting/billing) reads from.

  NOTE: no changes needed here — no bugs found in this file.
*/
const mealRecordSchema = new mongoose.Schema(
  {
    mealToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealToken",
      required: true,
      unique: true, // one consumption outcome per token — duplicate-check-in guard
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mealMenu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealMenu",
      required: true,
    },
    status: {
      type: String,
      enum: ["collected", "skipped", "late"],
      required: true,
    },
    method: {
      type: String,
      enum: ["QR", "Manual", "System"],
      required: true,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

mealRecordSchema.index({ mealMenu: 1, status: 1 });
mealRecordSchema.index({ resident: 1, createdAt: -1 });

module.exports =
  mongoose.models.MealRecord ||
  mongoose.model("MealRecord", mealRecordSchema);