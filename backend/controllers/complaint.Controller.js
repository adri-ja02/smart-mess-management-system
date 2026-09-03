const crypto = require("crypto");
const fs = require("fs");

const Complaint = require("../models/Complaint");
const ComplaintIdentity = require("../models/ComplaintIdentity");
const ComplaintToken = require("../models/ComplaintToken");
const cloudinary = require("../utils/cloudinary");
const Room = require("../models/Room");

/* =========================================================
   INTERNAL HELPERS
========================================================= */

const generateTicketNumber = async () => {
  const year = new Date().getFullYear();

  const countThisYear = await Complaint.countDocuments({
    ticketNumber: {
      $regex: `^CMP-${year}-`,
    },
  });

  const serial = String(countThisYear + 1).padStart(5, "0");

  return `CMP-${year}-${serial}`;
};

const ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateRawToken = () => {
  const randomChars = (length) => {
    const bytes = crypto.randomBytes(length);

    let out = "";

    for (let i = 0; i < length; i++) {
      out +=
        ALPHABET[
          bytes[i] % ALPHABET.length
        ];
    }

    return out;
  };

  return `${randomChars(4)}-${randomChars(
    4
  )}-${randomChars(4)}`;
};

const hashToken = (rawToken) =>
  crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

const findComplaintByRawToken = async (
  rawToken
) => {
  if (
    !rawToken ||
    typeof rawToken !== "string"
  ) {
    return null;
  }

  const tokenDoc =
    await ComplaintToken.findOne({
      tokenHash: hashToken(
        rawToken.trim()
      ),
      active: true,
    });

  if (!tokenDoc) {
    return null;
  }

  return Complaint.findById(
    tokenDoc.complaint
  );
};

const isAdmin = (req) =>
  req.user &&
  req.user.role === "admin";

const isManager = (req) =>
  req.user &&
  req.user.role === "manager";

/*
 * =========================================================
 * WORK-ORDER OPERATOR CHECK
 * =========================================================
 *
 * Normal complaint:
 *   Manager operates the work order.
 *
 * Manager-conflict complaint:
 *   System Administrator operates the work order.
 *
 * The authorized alternative is only the person recorded
 * by the System Administrator for routing/accountability.
 * That person does NOT receive an application login and
 * does NOT perform status changes inside the system.
 */
const canOperateWorkOrder = (
  req,
  complaint
) =>
  complaint.concernsManager
    ? isAdmin(req)
    : isManager(req);

/*
 * =========================================================
 * AUTOMATIC OVERDUE ESCALATION
 * =========================================================
 */

const applyAutomaticEscalation = async (
  complaint
) => {
  if (
    !complaint.targetCompletionDate ||
    complaint.escalation?.isEscalated
  ) {
    return complaint;
  }

  const operationalStatuses = [
    "Assigned",
    "In Progress",
    "Repair Completed",
    "Reopened",
  ];

  if (
    !operationalStatuses.includes(
      complaint.status
    )
  ) {
    return complaint;
  }

  const now = new Date();

  if (
    new Date(
      complaint.targetCompletionDate
    ) < now
  ) {
    complaint.escalation = {
      isEscalated: true,
      escalatedAt: new Date(),
      reason:
        "Work order passed its target completion date.",
    };

    complaint.timeline.push({
      status: complaint.status,
      note:
        "Work order automatically escalated because the target completion date was missed.",
      confidential: false,
    });

    await complaint.save();
  }

  return complaint;
};

/*
 * =========================================================
 * MANAGER-SAFE RESPONSE
 * =========================================================
 *
 * NEVER expose:
 * - review questions
 * - resident answers
 * - resident additional notes
 * - protected verification comment
 * - confidential timeline entries
 */

const sanitizeForManager = (
  complaint
) => {
  const data =
    complaint.toObject
      ? complaint.toObject()
      : { ...complaint };

  delete data.reviewQuestions;
  delete data.additionalNotes;

  /*
   * The resident's reason for reopening is confidential,
   * same as additionalNotes/reviewQuestions. The manager
   * still needs to know a reopen happened, so we keep the
   * rest of reopenReview (requested/decision/dates/cycle).
   */
  if (data.reopenReview) {
    data.reopenReview = {
      ...data.reopenReview,
      reason: undefined,
    };
  }

  if (data.repairVerification) {
    data.repairVerification = {
      status:
        data.repairVerification.status,
      verifiedAt:
        data.repairVerification.verifiedAt,
    };
  }

  if (Array.isArray(data.timeline)) {
    data.timeline =
      data.timeline.filter(
        (item) =>
          !item.confidential
      );
  }

  return data;
};

/*
 * =========================================================
 * CREDIBILITY SCREENING
 *
 * THIS IS MALIHA'S EXISTING LOGIC.
 * DO NOT CHANGE THE LOGIC.
 * =========================================================
 */

const runCredibilityCheck = async ({
  location,
  category,
  urgency,
  description,
  evidence,
}) => {
  const flags = [];

  // Missing evidence for high severity claims
  if (
    (urgency === "High" ||
      urgency === "Emergency") &&
    (!evidence ||
      evidence.length === 0)
  ) {
    flags.push(
      "Missing evidence for high severity claim"
    );
  }

  // Location verification
  const normalizedLocation =
    String(location || "").trim();

  const roomNumberCandidate =
    normalizedLocation
      .replace(/^room\s*/i, "")
      .trim();

  const roomExists =
    await Room.findOne({
      $or: [
        {
          roomNumber:
            normalizedLocation,
        },
        {
          roomNumber:
            roomNumberCandidate,
        },
        {
          messLocation:
            normalizedLocation,
        },
      ],
      isArchived: false,
    });

  if (!roomExists) {
    flags.push(
      "Reported location does not match known records"
    );
  }

  // Duplicate detection
  const duplicate =
    await Complaint.findOne({
      location,
      category,
      description: {
        $regex:
          description.substring(0, 20),
        $options: "i",
      },
    });

  if (duplicate) {
    flags.push(
      "Possible duplicate complaint detected"
    );
  }

  // Contradictory description detection
  const previousComplaints =
    await Complaint.find({
      location,
      category,
    }).limit(10);

  const negativeWords = [
    "not working",
    "broken",
    "damaged",
    "leak",
    "problem",
    "issue",
    "fault",
  ];

  const positiveWords = [
    "working",
    "fixed",
    "normal",
    "resolved",
    "no issue",
  ];

  const currentDescription =
    description.toLowerCase();

  for (const oldComplaint of previousComplaints) {
    const oldDescription =
      oldComplaint.description.toLowerCase();

    const oldHasNegative =
      negativeWords.some(
        (word) =>
          oldDescription.includes(word)
      );

    const oldHasPositive =
      positiveWords.some(
        (word) =>
          oldDescription.includes(word)
      );

    const currentHasNegative =
      negativeWords.some(
        (word) =>
          currentDescription.includes(word)
      );

    const currentHasPositive =
      positiveWords.some(
        (word) =>
          currentDescription.includes(word)
      );

    if (
      (oldHasNegative &&
        currentHasPositive) ||
      (oldHasPositive &&
        currentHasNegative)
    ) {
      flags.push(
        "Contradictory description detected"
      );

      break;
    }
  }

  return flags;
};

/* =========================================================
   FEATURE 1 - CREATE COMPLAINT
========================================================= */

exports.createComplaint = async (
  req,
  res
) => {
  try {
    const {
      location,
      category,
      urgency,
      description,
      evidence,
      concernsManager,
    } = req.body;

    if (
      !location ||
      !category ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Location, category, and description are required.",
      });
    }

    if (
      !req.user ||
      !req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required.",
      });
    }

    const ticketNumber =
      await generateTicketNumber();

    const rawToken =
      generateRawToken();

    const credibilityFlags =
      await runCredibilityCheck({
        location,
        category,
        urgency:
          urgency || "Low",
        description,
        evidence:
          Array.isArray(evidence)
            ? evidence
            : [],
      });

    const complaint =
      await Complaint.create({
        ticketNumber,
        location,
        category,
        urgency:
          urgency || "Low",
        priority:
          urgency || "Low",
        description,

        evidence:
          Array.isArray(evidence)
            ? evidence
            : [],

        concernsManager:
          Boolean(concernsManager),

        credibilityFlags,

        status: "Submitted",

        timeline: [
          {
            status: "Submitted",
            note:
              "Complaint submitted by resident to the System Administrator.",
            confidential: false,
          },
        ],
      });

    await ComplaintToken.create({
      complaint:
        complaint._id,
      tokenHash:
        hashToken(rawToken),
      active: true,
    });

    await ComplaintIdentity.create({
      complaint:
        complaint._id,
      resident:
        req.user.id,
    });

    return res.status(201).json({
      success: true,
      message:
        "Complaint submitted successfully to the System Administrator.",
      ticketNumber:
        complaint.ticketNumber,
      token: rawToken,
    });
  } catch (error) {
    console.log(
      "CREATE COMPLAINT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   FEATURE 1 - UPLOAD COMPLAINT EVIDENCE
========================================================= */

exports.uploadComplaintEvidence =
  async (req, res) => {
    try {
      if (
        !req.files ||
        !req.files.length
      ) {
        return res.json({
          success: true,
          evidence: [],
        });
      }

      const uploaded = [];

      for (const file of req.files) {
        const result =
          await cloudinary.uploader.upload(
            file.path,
            {
              resource_type: "auto",
            }
          );

        uploaded.push({
          url: result.secure_url,
          public_id:
            result.public_id,
          type:
            result.resource_type ===
            "video"
              ? "video"
              : "image",
        });

        fs.unlink(
          file.path,
          () => {}
        );
      }

      return res.json({
        success: true,
        evidence: uploaded,
      });
    } catch (error) {
      console.log(
        "UPLOAD COMPLAINT EVIDENCE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* =========================================================
   FEATURE 2 - TOKEN TRACKING
========================================================= */

exports.trackComplaint = async (
  req,
  res
) => {
  try {
    const { token } = req.body;

    const complaint =
      await findComplaintByRawToken(
        token
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Invalid or expired token.",
      });
    }

    return res.json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.log(
      "TRACK COMPLAINT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   FEATURE 2 - RESIDENT FOLLOW-UP
========================================================= */

exports.addFollowUp = async (
  req,
  res
) => {
  try {
    const {
      token,
      note,
      evidence,
    } = req.body;

    const complaint =
      await findComplaintByRawToken(
        token
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Invalid or expired token.",
      });
    }

    if (
      !note &&
      !(
        Array.isArray(evidence) &&
        evidence.length
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Add a note or upload evidence before submitting.",
      });
    }

    if (note?.trim()) {
      complaint.additionalNotes.push(
        {
          note: note.trim(),
        }
      );

      complaint.timeline.push({
        status:
          complaint.status,
        note:
          "Resident added additional information through the private token.",
        confidential: true,
      });
    }

    if (
      Array.isArray(evidence) &&
      evidence.length
    ) {
      complaint.evidence.push(
        ...evidence
      );

      complaint.timeline.push({
        status:
          complaint.status,
        note:
          "Resident uploaded additional evidence through the private token.",
        confidential: true,
      });
    }

    await complaint.save();

    return res.json({
      success: true,
      message:
        "Your confidential update was added successfully.",
      complaint,
    });
  } catch (error) {
    console.log(
      "ADD FOLLOW-UP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   FEATURE 2 - ANSWER REVIEW QUESTION
========================================================= */

exports.answerReviewQuestion =
  async (req, res) => {
    try {
      const {
        token,
        questionId,
        answer,
      } = req.body;

      if (
        !token ||
        !questionId ||
        !answer
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Token, question ID and answer are required.",
        });
      }

      const complaint =
        await findComplaintByRawToken(
          token
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Invalid or expired token.",
        });
      }

      const question =
        complaint.reviewQuestions.id(
          questionId
        );

      if (!question) {
        return res.status(404).json({
          success: false,
          message:
            "Question not found.",
        });
      }

      question.answer =
        answer.trim();

      question.answeredAt =
        new Date();

      complaint.timeline.push({
        status:
          complaint.status,
        note:
          "Resident answered an administrator review question.",
        confidential: true,
      });

      await complaint.save();

      return res.json({
        success: true,
        message:
          "Answer submitted successfully.",
        complaint,
      });
    } catch (error) {
      console.log(
        "ANSWER REVIEW QUESTION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* =========================================================
   ADMIN - GET ALL COMPLAINTS
========================================================= */

exports.getComplaintsForAdmin =
  async (req, res) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Only System Administrator can view complaint integrity records.",
        });
      }

      const {
        status,
        category,
        urgency,
        decision,
      } = req.query;

      const filter = {};

      if (status) {
        filter.status = status;
      }

      if (category) {
        filter.category = category;
      }

      if (urgency) {
        filter.urgency = urgency;
      }

      if (decision) {
        filter.reviewDecision =
          decision;
      }

      /*
       * Complaints that a resident just reopened (waiting
       * on the admin's Approve/Reject decision) need
       * urgent attention, so they float to the very top of
       * the list.
       *
       * IMPORTANT: only "requested" is used to decide that
       * top-priority group — NOT "requestedAt". A complaint
       * that was reopened in the past but has since been
       * approved and moved on to Assigned / In Progress /
       * Repair Completed / Closed still has a real
       * `requestedAt` timestamp forever, while a brand-new
       * complaint has `requestedAt: null`. Including
       * requestedAt in the sort would rank real dates above
       * nulls and keep old, already-resolved reopened
       * complaints pinned above brand-new complaints, which
       * is exactly what we don't want.
       *
       * So: pending reopen requests first (requested: true),
       * then everything else — new complaints and
       * resolved/progressed reopened complaints alike —
       * purely by newest-created-first.
       *
       * MongoDB sorts booleans false < true, so sorting
       * "reopenReview.requested" descending puts
       * requested: true documents first.
       */
      const complaints =
        await Complaint.find(
          filter
        ).sort({
          "reopenReview.requested": -1,
          createdAt: -1,
        });

      return res.json({
        success: true,
        complaints,
      });
    } catch (error) {
      console.log(
        "GET ADMIN COMPLAINTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* =========================================================
   ADMIN - GET SINGLE COMPLAINT
========================================================= */

exports.getComplaintByIdForAdmin =
  async (req, res) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Only System Administrator can view this complaint.",
        });
      }

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found.",
        });
      }

      return res.json({
        success: true,
        complaint,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* =========================================================
   ADMIN - ASK REVIEW QUESTION
========================================================= */

exports.askReviewQuestion =
  async (req, res) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Only the System Administrator can communicate with the resident.",
        });
      }

      const { question } =
        req.body;

      if (
        !question ||
        typeof question !==
          "string" ||
        !question.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Question is required.",
        });
      }

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found.",
        });
      }

      complaint.reviewQuestions.push(
        {
          question:
            question.trim(),
          answer: null,
          askedAt: new Date(),
        }
      );

      complaint.timeline.push({
        status:
          complaint.status,
        note:
          "System Administrator sent a confidential review question to the resident.",
        confidential: true,
      });

      await complaint.save();

      return res.json({
        success: true,
        message:
          "Confidential review question sent to the resident.",
        complaint,
      });
    } catch (error) {
      console.log(
        "ASK REVIEW QUESTION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* =========================================================
   ADMIN - MANAGER CONFLICT FLAG
========================================================= */

exports.updateManagerConflict =
  async (req, res) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Only System Administrator can update complaint routing.",
        });
      }

      const {
        concernsManager,
      } = req.body;

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found.",
        });
      }

      complaint.concernsManager =
        Boolean(
          concernsManager
        );

      if (!complaint.concernsManager) {
        complaint.alternativeHandler = {
          name: null,
          authority: null,
          contact: null,
          assignedAt: null,
        };
      }

      complaint.timeline.push({
        status:
          complaint.status,
        note: complaint.concernsManager
          ? "System Administrator routed this complaint away from the Mess Manager because it concerns the manager."
          : "System Administrator removed the manager-conflict routing flag.",
        confidential: false,
      });

      await complaint.save();

      return res.json({
        success: true,
        complaint,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* =========================================================
   ADMIN - NAME THE AUTHORIZED ALTERNATIVE
 *
 * IMPORTANT WORKFLOW:
 *
 * 1. Admin enters authorized alternative information.
 * 2. Complaint immediately becomes Assigned.
 * 3. Timeline marks Assigned as reached.
 * 4. Resident can see the authorized person's
 *    name/authority/contact through the private token.
 * 5. The authorized alternative does NOT operate
 *    the complaint in the system.
 * 6. System Administrator manually changes the
 *    complaint to In Progress and Repair Completed.
========================================================= */

exports.assignAuthorizedAlternative =
  async (req, res) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Only System Administrator can name the authorized alternative.",
        });
      }

      const {
        name,
        authority,
        contact,
      } = req.body;

      if (
        !name ||
        !name.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "The authorized alternative's name is required.",
        });
      }

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found.",
        });
      }

      if (
        !complaint.concernsManager
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This complaint has not been flagged as concerning the Mess Manager, so no authorized alternative is needed.",
        });
      }

      complaint.alternativeHandler = {
        name: name.trim(),
        authority: authority
          ? authority.trim()
          : null,
        contact: contact
          ? contact.trim()
          : null,
        assignedAt: new Date(),
      };

      /*
       * IMPORTANT:
       *
       * Clicking the Authorized Alternative button
       * means the complaint has now been routed/assigned.
       *
       * Therefore the actual complaint status becomes
       * "Assigned" immediately.
       */
      complaint.status =
        "Assigned";

      complaint.timeline.push({
        status: "Assigned",
        note: `System Administrator assigned this manager-conflict complaint to the authorized alternative: ${name.trim()}${
          authority
            ? ` (${authority.trim()})`
            : ""
        }.${
          contact
            ? ` Contact: ${contact.trim()}.`
            : ""
        } The System Administrator will handle the maintenance status updates.`,
        confidential: false,
      });

      await complaint.save();

      return res.json({
        success: true,
        message:
          "Authorized alternative assigned successfully. The complaint is now Assigned.",
        complaint,
      });
    } catch (error) {
      console.log(
        "ASSIGN AUTHORIZED ALTERNATIVE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* =========================================================
   MANAGER - GET VALID WORK ORDERS ONLY
========================================================= */

exports.getComplaintsForManager =
  async (req, res) => {
    try {
      if (!isManager(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Only the Mess Manager can view maintenance work orders.",
        });
      }

      const {
        category,
        urgency,
        status,
      } = req.query;

      const filter = {
        reviewDecision: "Valid",
        concernsManager: false,
        /*
         * Block complaints with a pending reopen request.
         * Once the admin decides (approved or rejected),
         * reopenReview.requested is cleared to false, so
         * this condition no longer excludes them.
         */
        "reopenReview.requested": {
          $ne: true,
        },
      };

      if (category) {
        filter.category =
          category;
      }

      if (urgency) {
        filter.urgency =
          urgency;
      }

      const operationalStatuses = [
        "Valid",
        "Assigned",
        "In Progress",
        "Repair Completed",
        "Reopened",
      ];

      if (
        status &&
        operationalStatuses.includes(
          status
        )
      ) {
        filter.status = status;
      }

      let complaints =
        await Complaint.find(
          filter
        ).sort({
          createdAt: -1,
        });

      for (const complaint of complaints) {
        await applyAutomaticEscalation(
          complaint
        );
      }

      complaints =
        complaints.map(
          sanitizeForManager
        );

      return res.json({
        success: true,
        complaints,
      });
    } catch (error) {
      console.log(
        "GET MANAGER WORK ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* =========================================================
   MANAGER - GET VALID COMPLAINT
========================================================= */

exports.getComplaintByIdForManager =
  async (req, res) => {
    try {
      if (!isManager(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Only the Mess Manager can view work orders.",
        });
      }

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found.",
        });
      }

      if (
        complaint.reviewDecision !==
          "Valid" ||
        complaint.concernsManager
      ) {
        return res.status(403).json({
          success: false,
          message:
            "This complaint is not available to the Mess Manager.",
        });
      }

      if (
        complaint.reopenReview
          ?.requested
      ) {
        return res.status(403).json({
          success: false,
          message:
            "The resident reopened this complaint. It is pending System Administrator review and is not yet available to the Mess Manager.",
        });
      }

      await applyAutomaticEscalation(
        complaint
      );

      return res.json({
        success: true,
        complaint:
          sanitizeForManager(
            complaint
          ),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* =========================================================
   SADIA - MANAGER OPERATIONAL STATISTICS
========================================================= */

exports.getComplaintStatsForManager =
  async (req, res) => {
    try {
      if (!isManager(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Only the Mess Manager can view operational maintenance statistics.",
        });
      }

      const filter = {
        reviewDecision: "Valid",
        concernsManager: false,
      };

      const complaints =
        await Complaint.find(
          filter
        );

      for (const complaint of complaints) {
        await applyAutomaticEscalation(
          complaint
        );
      }

      const OPERATIONAL_STATUSES = [
        "Valid",
        "Assigned",
        "In Progress",
        "Repair Completed",
        "Reopened",
        "Closed",
      ];

      const byStatus = {};

      OPERATIONAL_STATUSES.forEach(
        (status) => {
          byStatus[status] = 0;
        }
      );

      const byCategory = {};
      const byPriority = {};
      const locationMap = {};

      let unassigned = 0;

      for (const complaint of complaints) {
        byStatus[
          complaint.status
        ] =
          (byStatus[
            complaint.status
          ] || 0) + 1;

        byCategory[
          complaint.category
        ] =
          (byCategory[
            complaint.category
          ] || 0) + 1;

        const priorityKey =
          complaint.priority ||
          complaint.urgency ||
          "Low";

        byPriority[
          priorityKey
        ] =
          (byPriority[
            priorityKey
          ] || 0) + 1;

        const locationKey =
          complaint.location ||
          "Unknown";

        locationMap[
          locationKey
        ] =
          (locationMap[
            locationKey
          ] || 0) + 1;

        if (
          !complaint.assignedTo ||
          !complaint.assignedTo.type
        ) {
          unassigned += 1;
        }
      }

      const overdue =
        complaints.filter(
          (c) =>
            c.targetCompletionDate &&
            new Date(
              c.targetCompletionDate
            ) < new Date() &&
            c.status !== "Closed"
        ).length;

      const escalated =
        complaints.filter(
          (c) =>
            c.escalation
              ?.isEscalated
        ).length;

      const reopened =
        byStatus["Reopened"] || 0;

      const closed =
        byStatus["Closed"] || 0;

      const completionTimes = [];

      for (const complaint of complaints) {
        if (
          complaint.status ===
            "Closed" &&
          complaint.assignedTo
            ?.assignedAt
        ) {
          const closedEvent =
            complaint.timeline.find(
              (item) =>
                item.status ===
                "Closed"
            );

          if (closedEvent) {
            completionTimes.push(
              new Date(
                closedEvent.createdAt
              ) -
                new Date(
                  complaint.assignedTo
                    .assignedAt
                )
            );
          }
        }
      }

      const averageCompletionTimeHours =
        completionTimes.length
          ? Math.round(
              completionTimes.reduce(
                (a, b) => a + b,
                0
              ) /
                completionTimes.length /
                (1000 * 60 * 60)
            )
          : 0;

      const recurringLocations =
        Object.entries(
          locationMap
        )
          .map(
            ([
              location,
              count,
            ]) => ({
              location,
              count,
            })
          )
          .filter(
            (item) =>
              item.count > 1
          )
          .sort(
            (a, b) =>
              b.count - a.count
          );

      return res.json({
        success: true,

        totals: {
          totalWorkOrders:
            complaints.length,
          unassigned,
          overdue,
          escalated,
          reopened,
          closed,
        },

        byStatus,
        byCategory,
        byPriority,

        averageCompletionTimeHours,

        recurringLocations,
      });
    } catch (error) {
      console.log(
        "MANAGER COMPLAINT STATS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* =========================================================
   MANAGER - ASSIGN WORKER
========================================================= */

exports.assignComplaint = async (
  req,
  res
) => {
  try {
    const existingForAuth =
      await Complaint.findById(
        req.params.id
      );

    if (!existingForAuth) {
      return res.status(404).json({
        success: false,
        message:
          "Complaint not found.",
      });
    }

    if (
      !canOperateWorkOrder(
        req,
        existingForAuth
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          existingForAuth.concernsManager
            ? "This complaint concerns the Mess Manager. Only the System Administrator, as the authorized alternative, can assign it."
            : "Only the Mess Manager can assign maintenance work.",
      });
    }

    const {
      workerType,
      workerName,
      targetCompletionDate,
      priority,
    } = req.body;

    const allowedWorkerTypes = [
      "Plumber",
      "Technician",
      "Mechanic",
      "Other",
    ];

    if (
      !workerType ||
      !allowedWorkerTypes.includes(
        workerType
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid worker type is required.",
      });
    }

    if (
      !workerName ||
      !workerName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Worker name is required.",
      });
    }

    if (
      !targetCompletionDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Target completion date is required.",
      });
    }

    const targetDate =
      new Date(
        targetCompletionDate
      );

    if (
      Number.isNaN(
        targetDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid target completion date.",
      });
    }

    const complaint =
      await Complaint.findById(
        req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Complaint not found.",
      });
    }

    if (
      complaint.reviewDecision !==
      "Valid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Complaint must be marked Valid by the System Administrator before assigning a work order.",
      });
    }

    complaint.priority =
      priority ||
      complaint.urgency ||
      "Medium";

    complaint.targetCompletionDate =
      targetDate;

    complaint.assignedTo = {
      type: workerType,
      name: workerName.trim(),
      assignedAt: new Date(),
    };

    complaint.status =
      "Assigned";

    complaint.repairVerification = {
      status: "Pending",
      comment: "",
      verifiedAt: null,
    };

    complaint.timeline.push({
      status: "Assigned",
      note: complaint.concernsManager
        ? `Valid complaint assigned to ${workerType}: ${workerName.trim()} on behalf of the authorized alternative${
            complaint.alternativeHandler?.name
              ? ` (${complaint.alternativeHandler.name})`
              : ""
          }, since this complaint concerns the Mess Manager. Target completion: ${targetDate.toLocaleDateString()}.`
        : `Valid complaint assigned to ${workerType}: ${workerName.trim()}. Target completion: ${targetDate.toLocaleDateString()}.`,
      confidential: false,
    });

    await complaint.save();

    return res.json({
      success: true,
      message:
        "Confidential work order assigned successfully.",
      complaint:
        sanitizeForManager(
          complaint
        ),
    });
  } catch (error) {
    console.log(
      "ASSIGN COMPLAINT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   ADMIN / MANAGER - UPDATE OPERATIONAL STATUS
 *
 * Normal complaint:
 *   Manager changes:
 *     Assigned -> In Progress
 *     In Progress -> Repair Completed
 *
 * Manager-conflict complaint:
 *   System Administrator changes:
 *     Assigned -> In Progress
 *     In Progress -> Repair Completed
 *
 * The authorized alternative does NOT change status.
========================================================= */

exports.updateComplaintStatus =
  async (req, res) => {
    try {
      const existingForAuth =
        await Complaint.findById(
          req.params.id
        );

      if (!existingForAuth) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found.",
        });
      }

      if (
        !canOperateWorkOrder(
          req,
          existingForAuth
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            existingForAuth.concernsManager
              ? "This complaint concerns the Mess Manager. Only the System Administrator, as the authorized alternative, can update it."
              : "Only the Mess Manager can update work-order status.",
        });
      }

      const {
        status,
        note,
      } = req.body;

      const allowedStatuses = [
        "In Progress",
        "Repair Completed",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Operational status can only be changed to In Progress or Repair Completed.",
        });
      }

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found.",
        });
      }

      /*
       * REMOVED:
       *
       * complaint.reviewDecision !== "Valid"
       *
       * Manager-conflict complaints can now be
       * operationally updated by the System Administrator
       * after the authorized alternative has been assigned.
       */

      /*
       * For normal complaints, a worker must exist.
       *
       * For manager-conflict complaints, the authorized
       * alternative is the routed authority and the
       * System Administrator performs the operational
       * actions. Therefore assignedTo is not required.
       */
      if (
        !complaint.assignedTo &&
        !(
          complaint.concernsManager &&
          complaint.alternativeHandler?.name
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A worker or authorized alternative must be assigned before changing work-order status.",
        });
      }

      if (
        complaint.status ===
        "Closed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Closed complaints cannot be changed.",
        });
      }

      if (
        status ===
          "Repair Completed" &&
        complaint.status !==
          "In Progress"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Repair must first be marked In Progress.",
        });
      }

      /*
       * Manager-conflict complaint:
       *
       * Admin manually changes the status.
       */
      if (
        complaint.concernsManager &&
        !complaint.alternativeHandler?.name
      ) {
        return res.status(400).json({
          success: false,
          message:
            "An authorized alternative must be assigned before operational status changes.",
        });
      }

      complaint.status =
        status;

      complaint.timeline.push({
        status,
        note:
          note ||
          (
            complaint.concernsManager
              ? `System Administrator manually changed the authorized alternative's work order status to ${status}.`
              : `Work order status changed to ${status}.`
          ),
        confidential: false,
      });

      if (
        status ===
        "Repair Completed"
      ) {
        complaint.repairVerification = {
          status: "Pending",
          comment: "",
          verifiedAt: null,
        };

        complaint.timeline.push({
          status,
          note:
            "Repair completion is waiting for anonymous resident verification.",
          confidential: false,
        });
      }

      await complaint.save();

      return res.json({
        success: true,
        message:
          "Work-order status updated successfully.",
        complaint:
          complaint.concernsManager
            ? complaint
            : sanitizeForManager(
                complaint
              ),
      });
    } catch (error) {
      console.log(
        "UPDATE COMPLAINT STATUS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* =========================================================
   SADIA - COMPLETION EVIDENCE
 *
 * Normal complaint:
 *   Manager uploads evidence.
 *
 * Manager-conflict complaint:
 *   System Administrator uploads evidence.
 *
 * The authorized alternative does not need an account.
========================================================= */

exports.uploadCompletionEvidence =
  async (req, res) => {
    try {
      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found.",
        });
      }

      if (
        !canOperateWorkOrder(
          req,
          complaint
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            complaint.concernsManager
              ? "This complaint concerns the Mess Manager. Only the System Administrator, as the authorized alternative, can upload completion evidence."
              : "Only authorized maintenance operations can upload completion evidence.",
        });
      }

      if (
        !req.files ||
        !req.files.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one completion-evidence file is required.",
        });
      }

      /*
       * REMOVED:
       *
       * complaint.reviewDecision !== "Valid"
       *
       * Completion evidence can now be uploaded for
       * a manager-conflict complaint operated by the
       * System Administrator after an authorized
       * alternative has been assigned.
       */

      /*
       * Normal complaint requires a worker.
       *
       * Manager-conflict complaint requires an
       * authorized alternative instead.
       */
      if (
        !complaint.assignedTo &&
        !(
          complaint.concernsManager &&
          complaint.alternativeHandler?.name
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No worker or authorized alternative is assigned to this complaint.",
        });
      }

      const uploaded = [];

      for (const file of req.files) {
        const result =
          await cloudinary.uploader.upload(
            file.path,
            {
              resource_type:
                "auto",
            }
          );

        uploaded.push({
          url: result.secure_url,
          public_id:
            result.public_id,
          type:
            result.resource_type ===
            "video"
              ? "video"
              : "image",
        });

        fs.unlink(
          file.path,
          () => {}
        );
      }

      complaint.completionEvidence.push(
        ...uploaded
      );

      complaint.timeline.push({
        status:
          complaint.status,
        note:
          complaint.concernsManager
            ? "System Administrator uploaded maintenance completion evidence for the manager-conflict complaint."
            : "Maintenance completion evidence was uploaded.",
        confidential: false,
      });

      await complaint.save();

      return res.json({
        success: true,
        message:
          "Completion evidence uploaded successfully.",
        completionEvidence:
          uploaded,
        complaint:
          complaint.concernsManager
            ? complaint
            : sanitizeForManager(
                complaint
              ),
      });
    } catch (error) {
      console.log(
        "UPLOAD COMPLETION EVIDENCE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* =========================================================
   SADIA - RESIDENT REPAIR VERIFICATION
 *
 * TOKEN ONLY.
 *
 * No JWT.
 * No resident ID.
 * No manager.
 *
 * Resident can:
 *   Repair Completed -> Closed
 *   Repair Completed -> Reopened
========================================================= */

exports.verifyRepair = async (
  req,
  res
) => {
  try {
    const {
      token,
      action,
      comment,
    } = req.body;

    if (
      !token ||
      !action
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Token and verification action are required.",
      });
    }

    const complaint =
      await findComplaintByRawToken(
        token
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Invalid or expired token.",
      });
    }

    if (
      complaint.status !==
      "Repair Completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Repair verification is available only after the repair is marked completed.",
      });
    }

    if (
      action !== "confirm" &&
      action !== "reopen"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid verification action.",
      });
    }

    if (
      action === "confirm"
    ) {
      complaint.repairVerification = {
        status: "Confirmed",
        comment:
          comment?.trim() || "",
        verifiedAt: new Date(),
      };

      complaint.status =
        "Closed";

      complaint.timeline.push({
        status: "Closed",
        note:
          "Resident confirmed the repair resolution using the private token.",
        confidential: true,
      });
    }

    if (
      action === "reopen"
    ) {
      complaint.repairVerification = {
        status: "Reopened",
        comment:
          comment?.trim() || "",
        verifiedAt: new Date(),
      };

      complaint.status =
        "Reopened";

      /*
       * A reopen always starts a fresh admin review cycle.
       * The Mess Manager is blocked from this complaint
       * until the System Administrator approves the
       * reopening again (see getComplaintsForManager /
       * getComplaintByIdForManager).
       */
      complaint.reopenReview = {
        requested: true,
        requestedAt: new Date(),
        reason:
          comment?.trim() || "",
        decision: null,
        reviewedAt: null,
        reviewNote: "",
        cycle:
          (complaint.reopenReview
            ?.cycle || 0) + 1,
      };

      complaint.timeline.push({
        status: "Reopened",
        note:
          "Resident reopened the complaint using the private token because the issue was not fully resolved.",
        confidential: true,
      });

      complaint.timeline.push({
        status: "Reopened",
        note:
          "Reopening is pending System Administrator review before the Mess Manager can access it again.",
        confidential: false,
      });
    }

    await complaint.save();

    return res.json({
      success: true,
      message:
        action === "confirm"
          ? "Repair confirmed successfully."
          : "Complaint reopened successfully.",
      complaint,
    });
  } catch (error) {
    console.log(
      "VERIFY REPAIR ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   RESIDENT - ACCEPT SITE INSPECTION
========================================================= */

exports.acceptSiteInspection = async (
  req,
  res
) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message:
          "Token is required.",
      });
    }

    const complaint =
      await findComplaintByRawToken(
        token
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Invalid or expired token.",
      });
    }

    if (
      !complaint.inspectionRequest
        ?.requested
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No site inspection has been requested for this complaint.",
      });
    }

    if (!complaint.reviewDecision) {
      return res.status(400).json({
        success: false,
        message:
          "Site inspection can be accepted only after the System Administrator has made a final decision.",
      });
    }

    if (
      complaint.inspectionRequest
        .accepted
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You have already accepted this site inspection.",
      });
    }

    complaint.inspectionRequest.accepted = true;
    complaint.inspectionRequest.acceptedAt = new Date();

    complaint.timeline.push({
      status:
        complaint.status,
      note:
        "Resident accepted the requested site inspection using the private token.",
      confidential: true,
    });

    await complaint.save();

    return res.json({
      success: true,
      message:
        "Site inspection accepted successfully.",
      complaint,
    });
  } catch (error) {
    console.log(
      "ACCEPT SITE INSPECTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   MALIHA - FINAL COMPLAINT DECISION
 *
 * DO NOT CHANGE THE DECISION LOGIC.
========================================================= */

exports.reviewComplaintDecision =
  async (req, res) => {
    try {
      if (
        !req.user ||
        req.user.role !==
          "admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only System Administrator can review complaints.",
        });
      }

      const {
        decision,
        note,
      } = req.body;

      const allowedDecisions = [
        "Valid",
        "Insufficient Evidence",
        "Duplicate",
        "Confirmed False",
      ];

      if (
        !allowedDecisions.includes(
          decision
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid review decision.",
        });
      }

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found.",
        });
      }

      /*
       * Once a reopening has been approved for this
       * complaint, approving it already counts as the
       * Valid decision (see reviewReopenRequest, which
       * also re-affirms reviewDecision = "Valid"). The
       * admin cannot select Valid again for the same
       * complaint. Every other final decision (Insufficient
       * Evidence / Duplicate / Confirmed False) still works
       * normally, for both normal complaints and
       * manager-concern complaints.
       */
      if (
        decision === "Valid" &&
        complaint.status ===
          "Reopened" &&
        !complaint.reopenReview
          ?.requested &&
        complaint.reopenReview
          ?.decision === "approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This complaint's reopening was already approved, which counts as Valid. The Valid decision cannot be set again.",
        });
      }

      complaint.reviewDecision =
        decision;

      complaint.status =
        decision;

      complaint.timeline.push({
        status: decision,
        note:
          note ||
          `Complaint reviewed as ${decision}.`,
        confidential: false,
      });

      await complaint.save();

      return res.json({
        success: true,
        message:
          "Complaint decision saved successfully.",
        complaint,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* =========================================================
   ADMIN - REVIEW REOPEN REQUEST
 *
 * Separate from reviewComplaintDecision/reviewDecision,
 * which belongs to the ORIGINAL complaint integrity review.
 *
 * Resident reopened -> reopenReview.requested = true
 * Admin approves     -> Mess Manager can access it again
 * Admin rejects       -> complaint goes back to Closed
========================================================= */

exports.reviewReopenRequest =
  async (req, res) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Only System Administrator can review a reopened complaint.",
        });
      }

      const {
        decision,
        note,
      } = req.body;

      if (
        decision !== "approved" &&
        decision !== "rejected"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid reopen review decision.",
        });
      }

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found.",
        });
      }

      if (
        !complaint.reopenReview
          ?.requested
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This complaint has no pending reopen request.",
        });
      }

      complaint.reopenReview.decision =
        decision;

      complaint.reopenReview.reviewedAt =
        new Date();

      complaint.reopenReview.reviewNote =
        note?.trim() || "";

      /*
       * Resolved either way — this stops the pending
       * reopen request from blocking the Mess Manager
       * or the general complaint lists.
       */
      complaint.reopenReview.requested =
        false;

      if (decision === "approved") {
        /*
         * Approving the reopening carries the same weight
         * as the original Valid decision — it re-affirms
         * reviewDecision = "Valid" so downstream logic
         * (Mess Manager visibility for normal complaints,
         * Authorized Alternative assignment for
         * manager-concern complaints) works exactly the
         * same way it did the first time Valid was
         * selected. The admin does not need to, and
         * cannot, press Valid again (see
         * reviewComplaintDecision).
         */
        complaint.reviewDecision =
          "Valid";

        complaint.timeline.push({
          status: "Reopened",
          note:
            note?.trim() ||
            "System Administrator approved the reopening. The Mess Manager can access and progress this complaint again.",
          confidential: false,
        });
      } else {
        complaint.status = "Closed";

        complaint.timeline.push({
          status: "Closed",
          note:
            note?.trim() ||
            "System Administrator rejected the reopening. The complaint remains closed.",
          confidential: false,
        });
      }

      await complaint.save();

      return res.json({
        success: true,
        message:
          decision === "approved"
            ? "Reopening approved. The Mess Manager can access this complaint again."
            : "Reopening rejected. The complaint remains closed.",
        complaint,
      });
    } catch (error) {
      console.log(
        "REVIEW REOPEN REQUEST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* =========================================================
   MALIHA - DISCREET SITE INSPECTION
========================================================= */

exports.requestSiteInspection =
  async (req, res) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Only System Administrator can request site inspection.",
        });
      }

      const { note } =
        req.body;

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found.",
        });
      }

      complaint.inspectionRequest = {
        requested: true,
        requestedAt: new Date(),
        note: note || "",
      };

      complaint.timeline.push({
        status:
          complaint.status,
        note:
          "System Administrator requested a discreet site inspection.",
        confidential: true,
      });

      await complaint.save();

      return res.json({
        success: true,
        message:
          "Site inspection request created successfully.",
        complaint,
      });
    } catch (error) {
      console.log(
        "REQUEST SITE INSPECTION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* =========================================================
   SADIA - SERVICE ANALYTICS
========================================================= */

exports.getComplaintAnalytics =
  async (req, res) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Only System Administrator can view complaint analytics.",
        });
      }

      const complaints =
        await Complaint.find({});

      const countByDecision = (
        decision
      ) =>
        complaints.filter(
          (c) =>
            c.reviewDecision ===
            decision
        ).length;

      const validated =
        countByDecision(
          "Valid"
        );

      const duplicate =
        countByDecision(
          "Duplicate"
        );

      const insufficientEvidence =
        countByDecision(
          "Insufficient Evidence"
        );

      const confirmedFalse =
        countByDecision(
          "Confirmed False"
        );

      const responseTimes = [];
      const resolutionTimes = [];

      for (const complaint of complaints) {
        if (
          complaint.reviewDecision &&
          complaint.createdAt
        ) {
          const reviewEvent =
            complaint.timeline.find(
              (item) =>
                [
                  "Valid",
                  "Duplicate",
                  "Insufficient Evidence",
                  "Confirmed False",
                ].includes(
                  item.status
                )
            );

          if (reviewEvent) {
            responseTimes.push(
              new Date(
                reviewEvent.createdAt
              ) -
                new Date(
                  complaint.createdAt
                )
            );
          }
        }

        const closedEvent =
          complaint.timeline.find(
            (item) =>
              item.status ===
              "Closed"
          );

        if (
          closedEvent &&
          complaint.createdAt
        ) {
          resolutionTimes.push(
            new Date(
              closedEvent.createdAt
            ) -
              new Date(
                complaint.createdAt
              )
          );
        }
      }

      const average = (
        values
      ) => {
        if (!values.length)
          return 0;

        return Math.round(
          values.reduce(
            (a, b) => a + b,
            0
          ) /
            values.length /
            (1000 * 60 * 60)
        );
      };

      const locationMap = {};

      for (const complaint of complaints) {
        const key =
          complaint.location ||
          "Unknown";

        locationMap[key] =
          (locationMap[key] || 0) +
          1;
      }

      const recurringLocations =
        Object.entries(
          locationMap
        )
          .map(
            ([
              location,
              count,
            ]) => ({
              location,
              count,
            })
          )
          .filter(
            (item) =>
              item.count > 1
          )
          .sort(
            (a, b) =>
              b.count - a.count
          );

      const overdue =
        complaints.filter(
          (c) =>
            c.targetCompletionDate &&
            new Date(
              c.targetCompletionDate
            ) < new Date() &&
            ![
              "Closed",
              "Confirmed False",
              "Duplicate",
              "Insufficient Evidence",
            ].includes(
              c.status
            )
        ).length;

      const escalated =
        complaints.filter(
          (c) =>
            c.escalation
              ?.isEscalated
        ).length;

      const reopened =
        complaints.filter(
          (c) =>
            c.status ===
            "Reopened"
        ).length;

      return res.json({
        success: true,

        totals: {
          total:
            complaints.length,
          validated,
          duplicate,
          insufficientEvidence,
          confirmedFalse,
          overdue,
          escalated,
          reopened,
        },

        averageResponseTimeHours:
          average(
            responseTimes
          ),

        averageResolutionTimeHours:
          average(
            resolutionTimes
          ),

        recurringLocations,
      });
    } catch (error) {
      console.log(
        "COMPLAINT ANALYTICS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
