const mongoose = require("mongoose");

const waitlistSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    budget: Number,

    roommatePreference: String,

    spacePreference: String,

    status: {
      type: String,
      default: "waiting",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Waitlist",
  waitlistSchema
);