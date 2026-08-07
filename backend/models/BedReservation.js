const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
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
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",     // Temporary Hold
        "approved",    // Allocated
        "rejected",
        "cancelled",
      ],
      default: "pending",
    },

    holdExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), //10 minutes
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BedReservation", reservationSchema);