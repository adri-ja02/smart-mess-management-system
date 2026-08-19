const MealRecord = require("../models/MealRecord");
const MealMenu = require("../models/MealMenu");
const MealToken = require("../models/MealToken");

const classifyRisk = (wasteRate) => {
  if (wasteRate >= 25) return "high";
  if (wasteRate >= 10) return "medium";
  return "low";
};

// ===========================================================
// GET OVERALL WASTE SUMMARY
// (all-time collected/skipped/late counts + overall waste rate)
// ===========================================================

const getWasteSummary = async (req, res) => {
  try {
    const collected = await MealRecord.countDocuments({
      status: "collected",
    });

    const skipped = await MealRecord.countDocuments({
      status: "skipped",
    });

    const late = await MealRecord.countDocuments({
      status: "late",
    });

    const total = collected + skipped + late;

    const wasteRate =
      total > 0 ? Number(((skipped / total) * 100).toFixed(2)) : 0;

    // -------------------------------------------------------
    // Breakdown by meal type so the manager can see whether
    // waste is concentrated in, say, dinner vs breakfast.
    // -------------------------------------------------------
    const byMealType = {};

    for (const mealType of ["breakfast", "lunch", "dinner"]) {
      const menusOfType = await MealMenu.find({ mealType }).select("_id");
      const menuIds = menusOfType.map((menu) => menu._id);

      const typeCollected = await MealRecord.countDocuments({
        mealMenu: { $in: menuIds },
        status: "collected",
      });

      const typeLate = await MealRecord.countDocuments({
        mealMenu: { $in: menuIds },
        status: "late",
      });

      const typeSkipped = await MealRecord.countDocuments({
        mealMenu: { $in: menuIds },
        status: "skipped",
      });

      const typeTotal = typeCollected + typeLate + typeSkipped;

      const typeWasteRate =
        typeTotal > 0
          ? Number(((typeSkipped / typeTotal) * 100).toFixed(2))
          : 0;

      byMealType[mealType] = {
        collected: typeCollected,
        late: typeLate,
        skipped: typeSkipped,
        totalRecords: typeTotal,
        wasteRate: typeWasteRate,
        riskLevel: classifyRisk(typeWasteRate),
      };
    }

    res.status(200).json({
      totalRecords: total,
      collected,
      skipped,
      late,
      wasteRate: Number(wasteRate),
      riskLevel: classifyRisk(wasteRate),
      byMealType,
    });
  } catch (error) {
    console.error("Waste summary error:", error);

    res.status(500).json({
      message: "Server error while loading waste summary",
    });
  }
};

// ===========================================================
// GET WASTE BREAKDOWN PER MENU / MEAL ITEM
// Lets the manager see, before the next similar purchase or
// cook, which specific menu items historically run high waste
// (lots of confirmed-but-skipped meals) or low demand (few
// confirmations at all).
// ===========================================================

const getWasteByMenu = async (req, res) => {
  try {
    const limit = Math.min(
      Number(req.query.limit) || 30,
      100
    );

    const menus = await MealMenu.find({ isPublished: true })
      .sort({ date: -1 })
      .limit(limit);

    const items = [];

    for (const menu of menus) {
      const confirmedDiners = await MealToken.countDocuments({
        mealMenu: menu._id,
        status: "confirmed",
      });

      const collected = await MealRecord.countDocuments({
        mealMenu: menu._id,
        status: "collected",
      });

      const late = await MealRecord.countDocuments({
        mealMenu: menu._id,
        status: "late",
      });

      const skipped = await MealRecord.countDocuments({
        mealMenu: menu._id,
        status: "skipped",
      });

      const totalRecorded = collected + late + skipped;

      const wasteRate =
        totalRecorded > 0
          ? Number(((skipped / totalRecorded) * 100).toFixed(2))
          : 0;

      items.push({
        mealMenuId: menu._id,
        date: menu.date,
        mealType: menu.mealType,
        menu: menu.menu,
        price: menu.price,

        confirmedDiners,
        collected,
        late,
        skipped,
        totalRecorded,

        wasteRate,
        riskLevel: totalRecorded > 0 ? classifyRisk(wasteRate) : "unknown",

        // Nobody confirmed the meal at all -- a different
        // signal from "confirmed but then skipped".
        lowDemand: confirmedDiners === 0,
      });
    }

    // Highest waste risk first so it's the first thing the
    // manager sees before the next purchase/cook decision.
    items.sort((a, b) => b.wasteRate - a.wasteRate);

    res.status(200).json({
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Waste-by-menu error:", error);

    res.status(500).json({
      message: "Server error while loading waste breakdown",
    });
  }
};

module.exports = {
  getWasteSummary,
  getWasteByMenu,
};
