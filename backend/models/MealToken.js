const mongoose = require("mongoose");

const mealTokenSchema = new mongoose.Schema(
  {
    mealMenu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealMenu",
      required: true,
    },

    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tokenCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },

    confirmedAt: {
      type: Date,
      default: Date.now,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One resident can have only one token record for one meal
mealTokenSchema.index(
  {
    mealMenu: 1,
    resident: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("MealToken", mealTokenSchema);