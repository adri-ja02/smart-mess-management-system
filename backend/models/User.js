const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "manager", "admin"],
      default: "student",
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },

    accountStatus: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    // =========================
    // Sadia - Room Management
    // =========================

    currentRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },

    currentBed: {
      type: String,
      default: null,
    },

    // =========================
    // Adrija - Profile Management
    // =========================

    profilePhoto: {
      type: String,
      default: "",
    },

    notificationPreference: {
      type: Boolean,
      default: true,
    },
    // =========================
    // Maliha - Resident Onboarding
    // =========================

    universityId: {
      type: String,
      default: "",
    },

    emergencyContact: {
      type: String,
      default: "",
    },

    moveInDate: {
      type: Date,
      default: null,
    },

    onboardingStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);