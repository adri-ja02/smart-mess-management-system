const mongoose = require("mongoose");

const mealMenuSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: true,
    },

    menu: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    dietaryNotes: {
      type: String,
      default: "",
      trim: true,
    },

    cutoffTime: {
      type: Date,
      required: true,
    },

    // Manager-defined window during which a check-in counts as
    // "collected". A check-in scanned/recorded after checkInEnd is
    // marked "late" instead. Set at publish time; editable afterwards.
    checkInStart: {
      type: Date,
      required: true,
    },

    checkInEnd: {
      type: Date,
      required: true,
    },

    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent two menus for the same meal type on the same date
mealMenuSchema.index(
  {
    date: 1,
    mealType: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("MealMenu", mealMenuSchema);