const mongoose = require("mongoose");

/*
 * =========================================================
 * COMPLAINT MODEL
 * =========================================================
 *
 * IMPORTANT PRIVACY RULE:
 *
 * Complaint does NOT contain resident identity.
 *
 * Resident identity is stored separately in:
 *     ComplaintIdentity.js
 *
 * The private token is stored separately in:
 *     ComplaintToken.js
 *
 * Therefore:
 *
 * Resident <-> Admin confidential communication
 * is based on the private token.
 *
 * Manager/worker never receives ComplaintIdentity.
 * =========================================================
 */

const evidenceSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },

    public_id: {
      type: String,
      default: null,
    },

    type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const reviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      default: null,
      trim: true,
    },

    askedAt: {
      type: Date,
      default: Date.now,
    },

    answeredAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const additionalNoteSchema = new mongoose.Schema(
  {
    note: {
      type: String,
      required: true,
      trim: true,
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },

    note: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    /*
     * Confidential timeline entries are visible to:
     * - Admin
     * - resident using private token
     *
     * They are removed from manager-facing responses.
     */
    confidential: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    /*
     * =====================================================
     * BASIC COMPLAINT INFORMATION
     * =====================================================
     */

    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Plumbing",
        "Electrical",
        "Furniture",
        "Cleaning",
        "Other",
      ],
      required: true,
    },

    urgency: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Emergency",
      ],
      default: "Low",
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    /*
     * =====================================================
     * MANAGER CONFLICT
     * =====================================================
     *
     * If true:
     *
     * Resident -> Admin
     * Admin -> authorized alternative
     *
     * The complaint is NOT shown in the normal
     * Mess Manager operational queue.
     */

    concernsManager: {
      type: Boolean,
      default: false,
    },

    /*
     * =====================================================
     * MANAGER CONFLICT - AUTHORIZED ALTERNATIVE
     * =====================================================
     *
     * When concernsManager is true, the System
     * Administrator names a specific authorized alternative
     * (a real person, e.g. an Assistant Mess Manager or
     * another designated staff member) who this complaint is
     * being routed to.
     *
     * The system has no separate login for this person, so
     * the System Administrator performs the actual
     * assign/status/evidence actions on the record, but the
     * name below is who is authorized and accountable in
     * real life. This is intentionally separate from
     * assignedTo, which records the maintenance worker doing
     * the physical repair.
     */

    alternativeHandler: {
      name: {
        type: String,
        default: null,
        trim: true,
      },

      authority: {
        type: String,
        default: null,
        trim: true,
      },

      contact: {
        type: String,
        default: null,
        trim: true,
      },

      assignedAt: {
        type: Date,
        default: null,
      },
    },

    /*
     * =====================================================
     * RESIDENT EVIDENCE
     * =====================================================
     */

    evidence: [evidenceSchema],

    /*
     * =====================================================
     * CONFIDENTIAL RESIDENT FOLLOW-UP
     * =====================================================
     *
     * These are NEVER returned by manager-facing APIs.
     */

    additionalNotes: [additionalNoteSchema],

    reviewQuestions: [reviewQuestionSchema],

    /*
     * =====================================================
     * MALIHA - CREDIBILITY SCREENING
     * =====================================================
     */

    credibilityFlags: [
      {
        type: String,
      },
    ],

    /*
     * =====================================================
     * MALIHA - FINAL DECISION
     * =====================================================
     *
     * DO NOT CHANGE THIS LOGIC.
     */

    reviewDecision: {
      type: String,
      enum: [
        "Valid",
        "Insufficient Evidence",
        "Duplicate",
        "Confirmed False",
      ],
      default: null,
    },

    /*
     * =====================================================
     * COMPLAINT STATUS
     * =====================================================
     */

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
        "Reopened",
        "Closed",
      ],
      default: "Submitted",
    },

    /*
     * =====================================================
     * WITHDRAWAL HISTORY
     * =====================================================
     *
     * Used by Maliha's credibility screening.
     */

    withdrawalHistory: [
      {
        withdrawnAt: {
          type: Date,
          default: Date.now,
        },

        reason: {
          type: String,
          default: "",
        },
      },
    ],

    /*
     * =====================================================
     * ADMIN SITE INSPECTION
     * =====================================================
     */

    inspectionRequest: {
      requested: {
        type: Boolean,
        default: false,
      },

      requestedAt: {
        type: Date,
        default: null,
      },

      note: {
        type: String,
        default: "",
      },

      /*
       * Resident acceptance of the requested site inspection,
       * given confidentially through the private token.
       */
      accepted: {
        type: Boolean,
        default: false,
      },

      acceptedAt: {
        type: Date,
        default: null,
      },
    },

    /*
     * =====================================================
     * SADIA - WORK ORDER
     * =====================================================
     */

    priority: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Emergency",
      ],
      default: "Low",
    },

    targetCompletionDate: {
      type: Date,
      default: null,
    },

    assignedTo: {
      type: {
        type: String,
        enum: [
          "Plumber",
          "Technician",
          "Mechanic",
          "Other",
        ],
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

    /*
     * =====================================================
     * SADIA - COMPLETION EVIDENCE
     * =====================================================
     */

    completionEvidence: [evidenceSchema],

    /*
     * =====================================================
     * SADIA - RESIDENT VERIFICATION
     * =====================================================
     *
     * Protected information.
     *
     * Manager does NOT receive the comment.
     */

    repairVerification: {
      status: {
        type: String,
        enum: [
          "Pending",
          "Confirmed",
          "Reopened",
        ],
        default: "Pending",
      },

      comment: {
        type: String,
        default: "",
      },

      verifiedAt: {
        type: Date,
        default: null,
      },
    },

    /*
     * =====================================================
     * SADIA - ESCALATION
     * =====================================================
     */

    escalation: {
      isEscalated: {
        type: Boolean,
        default: false,
      },

      escalatedAt: {
        type: Date,
        default: null,
      },

      reason: {
        type: String,
        default: "",
      },
    },

    /*
     * =====================================================
     * TIMELINE
     * =====================================================
     */

    timeline: [timelineSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Complaint",
  complaintSchema
);