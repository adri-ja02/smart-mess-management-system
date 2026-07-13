const mongoose = require("mongoose");

const bedReservationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    bedNumber: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    holdUntil: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "BedReservation",
  bedReservationSchema
);