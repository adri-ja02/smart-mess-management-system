const mongoose = require("mongoose");

// =========================================================
// PROTECTED IDENTITY VAULT
//
// The ONLY place in the entire database where a complaint is
// linked back to the resident who filed it.
//
// Rule for the whole team: nothing outside
// complaint.controller.js's createComplaint() should ever
// `require` this model. In particular, the manager-facing
// endpoints (getComplaintsForManager, getComplaintByIdForManager)
// must never populate or query it.
// =========================================================

const complaintIdentitySchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
      unique: true,
    },

    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ComplaintIdentity", complaintIdentitySchema);