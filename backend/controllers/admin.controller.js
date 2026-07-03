const User = require("../models/User");

/* =========================
   GET ALL USERS
========================= */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================
   GET PENDING MANAGERS
========================= */
const getPendingManagers = async (req, res) => {
  try {
    const managers = await User.find({
      role: "manager",
      approvalStatus: "pending",
    }).select("-password");

    return res.status(200).json(managers);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================
   APPROVE MANAGER
========================= */
const approveManager = async (req, res) => {
  try {
    const manager = await User.findById(req.params.id);

    if (!manager) {
      return res.status(404).json({
        message: "Manager not found",
      });
    }

    if (manager.role !== "manager") {
      return res.status(400).json({
        message: "User is not a manager",
      });
    }

    manager.approvalStatus = "approved";
    await manager.save();

    return res.status(200).json({
      message: "Manager approved successfully",
      manager,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================
   REJECT MANAGER
========================= */
const rejectManager = async (req, res) => {
  try {
    const manager = await User.findById(req.params.id);

    if (!manager) {
      return res.status(404).json({
        message: "Manager not found",
      });
    }

    if (manager.role !== "manager") {
      return res.status(400).json({
        message: "User is not a manager",
      });
    }

    manager.approvalStatus = "rejected";
    await manager.save();

    return res.status(200).json({
      message: "Manager rejected successfully",
      manager,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================
   BLOCK USER
========================= */
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.accountStatus = "blocked";
    await user.save();

    return res.status(200).json({
      message: "User blocked successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================
   UNBLOCK USER
========================= */
const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.accountStatus = "active";
    await user.save();

    return res.status(200).json({
      message: "User unblocked successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getPendingManagers,
  approveManager,
  rejectManager,
  blockUser,
  unblockUser,
};