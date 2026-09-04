const mongoose = require("mongoose");

// =========================================================
// We never store the raw follow-up token — only a SHA-256
// hash of it (see controllers/complaint.controller.js).
//
// A SHA-256 hash (not bcrypt) is enough here because the
// token is a high-entropy, randomly generated secret that the
// resident never chooses — not a human-picked password — so
// it isn't at risk from a dictionary/brute-force attack the
// way a password hash would be. A plain deterministic hash
// also lets us look the record up directly with
// findOne({ tokenHash }) instead of loading every token and
// bcrypt-comparing each one.
// =========================================================

const complaintTokenSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
      unique: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ComplaintToken", complaintTokenSchema);