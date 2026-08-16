const MealRecord = require("../models/MealRecord");

const getWasteSummary = async (req, res) => {
  try {
    const collected =
      await MealRecord.countDocuments({
        status: "collected",
      });

    const skipped =
      await MealRecord.countDocuments({
        status: "skipped",
      });

    const late =
      await MealRecord.countDocuments({
        status: "late",
      });

    const total =
      collected +
      skipped +
      late;

    const wasteRate =
      total > 0
        ? ((skipped / total) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      totalRecords: total,
      collected,
      skipped,
      late,
      wasteRate: Number(wasteRate),
    });
  } catch (error) {
    console.error(
      "Waste summary error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while loading waste summary",
    });
  }
};

module.exports = {
  getWasteSummary,
};