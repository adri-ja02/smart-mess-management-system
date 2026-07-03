const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const { ADMIN_EMAILS } = require("../config/adminAccounts");

/* =========================
   REGISTER USER
========================= */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check existing user
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Only fixed emails can register as admin
    if (role === "admin" && !ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({
        message: "This email is not authorized to register as Admin.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Manager approval status
    const approvalStatus =
      role === "manager" ? "pending" : "approved";

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      approvalStatus,
      accountStatus: "active",
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approvalStatus: user.approvalStatus,
      accountStatus: user.accountStatus,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================
   LOGIN USER
========================= */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // Password check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Fixed admin email validation
    if (
      user.role === "admin" &&
      !ADMIN_EMAILS.includes(user.email)
    ) {
      return res.status(403).json({
        message: "Unauthorized admin account.",
      });
    }

    // Manager approval
    if (
      user.role === "manager" &&
      user.approvalStatus !== "approved"
    ) {
      return res.status(403).json({
        message: "Your manager account is pending admin approval.",
      });
    }

    // Account blocked
    if (user.accountStatus === "blocked") {
      return res.status(403).json({
        message: "Your account has been blocked.",
      });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approvalStatus: user.approvalStatus,
      accountStatus: user.accountStatus,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================
   GET PROFILE
========================= */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};