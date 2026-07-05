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

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    if (role === "admin" && !ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({
        message: "This email is not authorized to register as Admin.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const approvalStatus =
      role === "manager" ? "pending" : "approved";

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

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (
      user.role === "admin" &&
      !ADMIN_EMAILS.includes(user.email)
    ) {
      return res.status(403).json({
        message: "Unauthorized admin account.",
      });
    }

    if (
      user.role === "manager" &&
      user.approvalStatus !== "approved"
    ) {
      return res.status(403).json({
        message: "Your manager account is pending admin approval.",
      });
    }

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

/* =========================
   CHANGE PASSWORD
========================= */
const changePassword = async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });

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
  changePassword,
};