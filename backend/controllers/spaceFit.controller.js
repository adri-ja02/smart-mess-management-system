const Room = require("../models/Room");
const User = require("../models/User");
const calculateSpaceFitScore = require("../utils/spaceFitCalculator");
const { withFallbackLayout } = require("../utils/roomLayout");

const normalizeSpaceFitPreferences = (needs = {}) => {
  const moveInDateValue = needs.moveInDate;
  let moveInDate = null;

  if (moveInDateValue) {
    const parsedDate =
      moveInDateValue instanceof Date
        ? moveInDateValue
        : new Date(moveInDateValue);

    if (!Number.isNaN(parsedDate.getTime())) {
      moveInDate = parsedDate;
    }
  }

  return {
    studySpace: Number(needs.studySpace) || 0,
    storage: Number(needs.storage) || 0,
    privacy: Number(needs.privacy) || 0,
    budget: Number(needs.budget) || 0,
    roommateCount: Number(needs.roommateCount) || 0,
    noiseTolerance: Number(needs.noiseTolerance) || 0,
    preferredFloor: Number(needs.preferredFloor) || 0,
    moveInDate,
    maxCampusTravelTime: Number(needs.maxCampusTravelTime) || 0,
  };
};

module.exports.normalizeSpaceFitPreferences = normalizeSpaceFitPreferences;

// Student searches matching rooms
exports.getSpaceFitMatches = async (req, res) => {
  try {
    const needs = req.body || {};

    const normalizedPreferences = normalizeSpaceFitPreferences(needs);

    const userId = req.user?.id || req.user?._id;

    if (userId) {
      await User.findByIdAndUpdate(
        userId,
        { $set: { spaceFitPreferences: normalizedPreferences } },
        { new: true }
      );
    }

    const rooms = await Room.find({
      $or: [
        { isArchived: false },
        { isArchived: { $exists: false } },
        { isArchived: null },
      ],
    }).lean();

    const matches = rooms
      .map((room) => {
        const roomWithLayout = withFallbackLayout(room);
        const result = calculateSpaceFitScore(roomWithLayout, normalizedPreferences);

        return {
          room: roomWithLayout,
          score: result.score,
          reasons: result.reasons,
          breakdown: result.breakdown,
        };
      })
      .sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
