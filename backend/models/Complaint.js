const mongoose = require("mongoose");

// =========================================================
// COMPLAINT
// This is the record the Mess Manager, technician, and (later)
// the System Administrator work with. It intentionally has NO
// field that points back to the resident who filed it — that
// link lives only in ComplaintIdentity.js. As long as no other
// controller ever imports ComplaintIdentity and populates it
// onto a Complaint, the manager-facing side of the app has no
// way to see who reported anything.
// =========================================================

const complaintSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },

    location: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["Plumbing", "Electrical", "Furniture", "Cleaning", "Other"],
      required: true,
    },

    urgency: {
      type: String,
      enum: ["Low", "Medium", "High", "Emergency"],
      default: "Low",
    },

    description: {
      type: String,
      required: true,
    },

    // Cloudinary URLs only — never a local file path, so nothing
    // on disk can be traced back to a device/session.
    evidence: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
        type: {
          type: String,
          enum: ["image", "video"],
          default: "image",
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Extra written explanations the resident adds later
    // through the token-based follow-up flow (Feature 2).
    additionalNotes: [
      {
        note: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    // Manager/admin asks a question, resident answers it later
    // using only their token — still no login, still anonymous.
    reviewQuestions: [
      {
        question: { type: String, required: true },
        answer: { type: String, default: null },
        askedAt: { type: Date, default: Date.now },
        answeredAt: { type: Date, default: null },
      },
    ],

    // NOTE: "Valid" / "Insufficient Evidence" / "Duplicate" /
    // "Confirmed False" are written onto this same status field
    // by Maliha's Independent Review feature, and "Assigned" /
    // "In Progress" by Sadia's Work Order feature. Adrija's
    // endpoints (this file) only ever move a complaint between
    // Submitted -> Under Review.
    status: {
      type: String,
      enum: [
        "Submitted",
        "Under Review",
        "Insufficient Evidence",
        "Duplicate",
        "Confirmed False",
        "Valid",
        "Assigned",
        "In Progress",
        "Repair Completed",
        "Closed",
      ],
      default: "Submitted",
    },



        // Added for the Manager Dashboard. A simple name string is
    // enough for this demo — if Sadia's Work Order feature later
    // adds a real Technician/Staff model, this can be upgraded to
    // an ObjectId ref without touching the identity-vault design.
    assignedTo: {
  type: {
    type: String,
    enum: ["Plumber", "Technician", "Mechanic", "Other"],
    default: null,
  },
  name: {
    type: String,
    default: null,
  },
  assignedAt: {
    type: Date,
    default: null,
  },
},
    timeline: [
      {
        status: { type: String, required: true },
        note: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);