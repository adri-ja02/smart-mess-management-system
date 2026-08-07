const mongoose = require("mongoose");

const waitlistSchema = new mongoose.Schema(
  {
    // Student waiting for a bed
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Room the student wanted
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    // Preferences (from Living Needs Profile)
    budget: {
      type: Number,
      required: true,
    },

    roommatePreference: {
      type: String,
      default: "",
    },

    spacePreference: {
      type: String,
      default: "",
    },

    // Waiting status
    status: {
      type: String,
      enum: ["waiting", "matched", "allocated"],
      default: "waiting",
    },

    // Notification
    notified: {
      type: Boolean,
      default: false,
    },

    notificationMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Waitlist", waitlistSchema);