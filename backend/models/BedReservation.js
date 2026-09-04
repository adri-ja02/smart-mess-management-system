const mongoose = require("mongoose");

// =========================
// APPLICANT DETAILS
//
// Collected from the student at request time so the manager
// has enough information to review the request before
// approving/rejecting it. Required on every new reservation —
// see requestReservation() in reservation.controller.js for
// server-side validation of these fields.
// =========================

const applicantDetailsSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    institutionName: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, trim: true },

    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    fatherName: { type: String, required: true, trim: true },
    fatherPhone: { type: String, required: true, trim: true },
    motherName: { type: String, required: true, trim: true },
    motherPhone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

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

    // Snapshot of the student's info at the time of this
    // specific request — intentionally NOT read from the
    // User profile, since it can change after submission and
    // the manager should review exactly what was submitted.
    applicantDetails: {
      type: applicantDetailsSchema,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",    // Temporary Hold
        "approved",   // Allocated
        "rejected",
        "cancelled",
        "expired",    // Hold timed out before manager acted
      ],
      default: "pending",
    },

    holdExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 10 minutes
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
      validate: {
        validator: function (v) {
          return this.status !== "rejected" || (v && v.trim().length > 0);
        },
        message: "Rejection reason is required when a reservation is rejected.",
      },
    },
  },
  {
    timestamps: true,
  }
);

reservationSchema.index({ student: 1, status: 1 });

reservationSchema.index(
  { room: 1, bedNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "approved"] } },
  }
);

module.exports = mongoose.model("BedReservation", reservationSchema);