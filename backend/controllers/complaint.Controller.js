
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
    ticketNumber: { $regex: `^CMP-${year}-` },
  });

  const serial = String(countThisYear + 1).padStart(5, "0");

  return `CMP-${year}-${serial}`;
};

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateRawToken = () => {
  const randomChars = (length) => {
    const bytes = crypto.randomBytes(length);
    let out = "";

    for (let i = 0; i < length; i++) {
      out += ALPHABET[bytes[i] % ALPHABET.length];
    }

    return out;
  };

  return `${randomChars(4)}-${randomChars(4)}-${randomChars(4)}`;
};

const hashToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

const findComplaintByRawToken = async (rawToken) => {
  if (!rawToken || typeof rawToken !== "string") {
    return null;
  }

  const tokenDoc = await ComplaintToken.findOne({
    tokenHash: hashToken(rawToken.trim()),
    active: true,
  });

  if (!tokenDoc) {
    return null;
  }

  return await Complaint.findById(tokenDoc.complaint);
};
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
    (urgency === "High" || urgency === "Emergency") &&
    (!evidence || evidence.length === 0)
  ) {
    flags.push(
      "Missing evidence for high severity claim"
    );
  }


  // Location verification
  const normalizedLocation = String(location || "").trim();

  const roomNumberCandidate = normalizedLocation
    .replace(/^room\s*/i, "")
    .trim();

  const roomExists = await Room.findOne({
    $or: [
      { roomNumber: normalizedLocation },
      { roomNumber: roomNumberCandidate },
      { messLocation: normalizedLocation },
    ],
    isArchived: false,
  });

  if (!roomExists) {
    flags.push(
      "Reported location does not match known records"
    );
  }


  // Duplicate detection
  const duplicate = await Complaint.findOne({
    location,
    category,
    description: {
      $regex: description.substring(0, 20),
      $options: "i",
    },
  });


  if (duplicate) {
    flags.push(
      "Possible duplicate complaint detected"
    );
  }
  // Contradictory description detection

  const previousComplaints = await Complaint.find({
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
      negativeWords.some((word) =>
        oldDescription.includes(word)
      );


    const oldHasPositive =
      positiveWords.some((word) =>
        oldDescription.includes(word)
      );


    const currentHasNegative =
      negativeWords.some((word) =>
        currentDescription.includes(word)
      );


    const currentHasPositive =
      positiveWords.some((word) =>
        currentDescription.includes(word)
      );


    if (
      (oldHasNegative && currentHasPositive) ||
      (oldHasPositive && currentHasNegative)
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
   FEATURE 1: CREATE COMPLAINT
========================================================= */

exports.createComplaint = async (req, res) => {
  try {
    const {
      location,
      category,
      urgency,
      description,
      evidence,
    } = req.body;

    if (!location || !category || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Location, category, and description are required.",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const ticketNumber = await generateTicketNumber();
    const rawToken = generateRawToken();
    const credibilityFlags = await runCredibilityCheck({
      location,
      category,
      urgency: urgency || "Low",
      description,
      evidence: Array.isArray(evidence) ? evidence : [],
    });

    const complaint = await Complaint.create({
      ticketNumber,
      location,
      category,
      urgency: urgency || "Low",
      description,
      evidence: Array.isArray(evidence) ? evidence : [],
      credibilityFlags,
      status: "Submitted",

      timeline: [
        {
          status: "Submitted",
          note: "Complaint submitted by resident.",
        },
      ],
    });

    await ComplaintToken.create({
      complaint: complaint._id,
      tokenHash: hashToken(rawToken),
      active: true,
    });

    await ComplaintIdentity.create({
      complaint: complaint._id,
      resident: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully.",
      ticketNumber: complaint.ticketNumber,
      token: rawToken,
    });
  } catch (error) {
    console.log("CREATE COMPLAINT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   FEATURE 1: UPLOAD COMPLAINT EVIDENCE
========================================================= */

exports.uploadComplaintEvidence = async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.json({
        success: true,
        evidence: [],
      });
    }

    const uploaded = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(
        file.path,
        {
          resource_type: "auto",
        }
      );

      uploaded.push({
        url: result.secure_url,
        public_id: result.public_id,
        type:
          result.resource_type === "video"
            ? "video"
            : "image",
      });

      fs.unlink(file.path, () => { });
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
   FEATURE 2: TRACK COMPLAINT
========================================================= */

exports.trackComplaint = async (req, res) => {
  try {
    const { token } = req.body;

    const complaint =
      await findComplaintByRawToken(token);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    return res.json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.log("TRACK COMPLAINT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   FEATURE 2: ADD FOLLOW-UP
========================================================= */

exports.addFollowUp = async (req, res) => {
  try {
    const {
      token,
      note,
      evidence,
    } = req.body;

    const complaint =
      await findComplaintByRawToken(token);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    if (
      !note &&
      !(Array.isArray(evidence) && evidence.length)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Add a note or upload evidence before submitting.",
      });
    }

    if (note) {
      complaint.additionalNotes.push({
        note: note.trim(),
      });

      complaint.timeline.push({
        status: complaint.status,
        note:
          "Resident added additional information.",
      });
    }

    if (
      Array.isArray(evidence) &&
      evidence.length
    ) {
      complaint.evidence.push(...evidence);

      complaint.timeline.push({
        status: complaint.status,
        note:
          "Resident uploaded additional evidence.",
      });
    }

    await complaint.save();

    return res.json({
      success: true,
      message: "Update added to your complaint.",
      complaint,
    });
  } catch (error) {
    console.log("ADD FOLLOW-UP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   FEATURE 2: ANSWER REVIEW QUESTION
========================================================= */

exports.answerReviewQuestion = async (req, res) => {
  try {
    const {
      token,
      questionId,
      answer,
    } = req.body;

    if (!token || !questionId || !answer) {
      return res.status(400).json({
        success: false,
        message:
          "Token, question ID and answer are required.",
      });
    }

    const complaint =
      await findComplaintByRawToken(token);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    const question =
      complaint.reviewQuestions.id(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    question.answer = answer.trim();
    question.answeredAt = new Date();

    complaint.timeline.push({
      status: complaint.status,
      note:
        "Resident answered a review question.",
    });

    await complaint.save();

    return res.json({
      success: true,
      message: "Answer submitted successfully.",
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
   MANAGER / ADMIN
========================================================= */

const isManagerOrAdmin = (req) => {
  return (
    req.user &&
    (req.user.role === "manager" ||
      req.user.role === "admin")
  );
};
/* =========================================================
   ADMIN INTEGRITY REVIEW
========================================================= */



/* =========================================================
   GET ALL COMPLAINTS FOR MANAGER
========================================================= */

exports.getComplaintsForManager = async (
  req,
  res
) => {
  try {
    if (!isManagerOrAdmin(req)) {
      return res.status(403).json({
        success: false,
        message:
          "Only managers or admins can view complaints.",
      });
    }

    const {
      status,
      category,
      urgency,
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

    const complaints =
      await Complaint.find(filter)
        .sort({ createdAt: -1 });

    return res.json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.log("GET COMPLAINTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   GET SINGLE COMPLAINT FOR MANAGER
========================================================= */

exports.getComplaintByIdForManager = async (
  req,
  res
) => {
  try {
    if (!isManagerOrAdmin(req)) {
      return res.status(403).json({
        success: false,
        message:
          "Only managers or admins can view complaints.",
      });
    }

    const complaint =
      await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    // DO NOT query ComplaintIdentity here.
    // Resident identity remains separated.

    return res.json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.log(
      "GET COMPLAINT BY ID ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   ASK REVIEW QUESTION
========================================================= */

exports.askReviewQuestion = async (
  req,
  res
) => {
  try {
    if (!isManagerOrAdmin(req)) {
      return res.status(403).json({
        success: false,
        message:
          "Only managers or admins can ask review questions.",
      });
    }

    const { question } = req.body;

    if (
      !question ||
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Question is required.",
      });
    }

    const complaint =
      await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    complaint.reviewQuestions.push({
      question: question.trim(),
      answer: null,
      askedAt: new Date(),
    });

    complaint.timeline.push({
      status: complaint.status,
      note:
        "Manager asked the resident a review question.",
    });

    await complaint.save();

    return res.json({
      success: true,
      message:
        "Review question added successfully.",
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
   UPDATE COMPLAINT STATUS
========================================================= */

exports.updateComplaintStatus = async (req, res) => {
  try {
    // Only manager or admin can update complaint status
    if (!isManagerOrAdmin(req)) {
      return res.status(403).json({
        success: false,
        message:
          "Only managers or admins can update complaint status.",
      });
    }

    const { status, note } = req.body;

    // Validate status
    if (!status || typeof status !== "string") {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    // Statuses allowed in the complaint workflow
    const allowedStatuses = [
      "Submitted",
      "Under Review",
      "Assigned",
      "In Progress",
      "Repair Completed",
      "Closed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid complaint status.",
      });
    }

    // Find complaint
    const complaint = await Complaint.findById(
      req.params.id
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }
    // A complaint cannot enter maintenance operations
    // until the System Administrator marks it Valid.
    const maintenanceStatuses = [
      "Assigned",
      "In Progress",
      "Repair Completed",
      "Closed",
    ];

    if (
      maintenanceStatuses.includes(status) &&
      complaint.reviewDecision !== "Valid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Complaint must be marked Valid by the System Administrator before maintenance operations.",
      });
    }

    // Prevent updating to the same status
    if (complaint.status === status) {
      return res.status(400).json({
        success: false,
        message:
          `Complaint is already "${status}".`,
      });
    }

    // Update status
    complaint.status = status;

    // Add status change to timeline
    complaint.timeline.push({
      status,
      note:
        note ||
        `Complaint status changed to ${status}.`,
    });

    await complaint.save();

    return res.status(200).json({
      success: true,
      message:
        "Complaint status updated successfully.",
      complaint,
    });
  } catch (error) {
    console.log(
      "UPDATE COMPLAINT STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Could not update complaint status.",
    });
  }
};

/* =========================================================
   ASSIGN TECHNICIAN
========================================================= */

exports.assignComplaint = async (req, res) => {
  try {
    if (!isManagerOrAdmin(req)) {
      return res.status(403).json({
        success: false,
        message:
          "Only managers or admins can assign complaints.",
      });
    }

    const { workerType, workerName } = req.body;

    const allowedWorkerTypes = [
      "Plumber",
      "Technician",
      "Mechanic",
      "Other",
    ];

    // Check worker type
    if (!workerType) {
      return res.status(400).json({
        success: false,
        message: "Worker type is required.",
      });
    }

    if (!allowedWorkerTypes.includes(workerType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker type.",
      });
    }

    // Check worker name
    if (
      !workerName ||
      typeof workerName !== "string" ||
      !workerName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Worker name is required.",
      });
    }

    // Find complaint
    const complaint = await Complaint.findById(
      req.params.id
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }
    if (complaint.status !== "Valid") {
      return res.status(400).json({
        success: false,
        message:
          "Complaint must be marked Valid before maintenance assignment.",
      });
    }

    if (complaint.reviewDecision !== "Valid") {
      return res.status(400).json({
        success: false,
        message:
          "Complaint must be marked Valid before assigning a work order.",
      });
    }

    // Save assigned worker
    complaint.assignedTo = {
      type: workerType,
      name: workerName.trim(),
      assignedAt: new Date(),
    };

    // Assignment automatically changes status
    complaint.status = "Assigned";

    // Add assignment to timeline
    complaint.timeline.push({
      status: "Assigned",
      note: `Complaint assigned to ${workerType}: ${workerName.trim()}.`,
    });

    await complaint.save();

    return res.status(200).json({
      success: true,
      message:
        `Complaint assigned to ${workerType} successfully.`,
      complaint,
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
exports.reviewComplaintDecision = async (req, res) => {
  try {

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Only System Administrator can review complaints."
      });
    }


    const { decision, note } = req.body;


    const allowedDecisions = [
      "Valid",
      "Insufficient Evidence",
      "Duplicate",
      "Confirmed False",
    ];


    if (!allowedDecisions.includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review decision."
      });
    }


    const complaint =
      await Complaint.findById(req.params.id);


    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found."
      });
    }


    complaint.reviewDecision = decision;


    complaint.status = decision;


    complaint.timeline.push({
      status: decision,
      note:
        note ||
        `Complaint reviewed as ${decision}.`
    });


    await complaint.save();


    return res.json({
      success: true,
      message:
        "Complaint decision saved successfully.",
      complaint
    });


  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

/* =========================================================
   REQUEST DISCREET SITE INSPECTION
========================================================= */

exports.requestSiteInspection = async (req, res) => {
  try {

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Only System Administrator can request site inspection.",
      });
    }


    const { note } = req.body;


    const complaint =
      await Complaint.findById(req.params.id);


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
      status: complaint.status,
      note:
        "System Administrator requested a discreet site inspection.",
    });


    await complaint.save();


    return res.status(200).json({
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
   WITHDRAW COMPLAINT
   Records withdrawal history for credibility checking
========================================================= */

exports.withdrawComplaint = async (req, res) => {
  try {

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }


    const { reason } = req.body;


    const complaint =
      await Complaint.findById(req.params.id);


    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }


    complaint.withdrawalHistory.push({
      reason: reason || "",
      withdrawnAt: new Date(),
    });


    // Add credibility flag for repeated withdrawals

    if (complaint.withdrawalHistory.length > 1) {

      complaint.credibilityFlags.push(
        "Repeated complaint withdrawal detected"
      );

    }


    complaint.timeline.push({
      status: complaint.status,
      note:
        "Complaint withdrawn by resident.",
    });


    await complaint.save();


    return res.status(200).json({
      success: true,
      message:
        "Complaint withdrawal recorded successfully.",
      complaint,
    });


  } catch (error) {

    console.log(
      "WITHDRAW COMPLAINT ERROR:",
      error
    );


    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};