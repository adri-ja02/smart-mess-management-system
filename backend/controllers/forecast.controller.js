const MealMenu = require("../models/MealMenu");
const MealToken = require("../models/MealToken");
const MealRecord = require("../models/MealRecord");

// How many previous occurrences of the same meal type to look at
// when building an attendance/waste history for a menu.
const HISTORY_WINDOW = 5;

// ===========================================================
// Build a short attendance/waste history for a given meal type,
// looking only at menus that happened before `beforeDate`.
// This is what lets the forecast use "recent attendance" instead
// of just the raw confirmed-token count.
// ===========================================================
const getRecentHistory = async (mealType, beforeDate) => {
  const recentMenus = await MealMenu.find({
    mealType,
    date: { $lt: beforeDate },
  })
    .sort({ date: -1 })
    .limit(HISTORY_WINDOW);

  let confirmedTotal = 0;
  let attendedTotal = 0;
  let skippedTotal = 0;
  let recordedTotal = 0;

  for (const pastMenu of recentMenus) {
    const confirmed = await MealToken.countDocuments({
      mealMenu: pastMenu._id,
      status: "confirmed",
    });

    const attended = await MealRecord.countDocuments({
      mealMenu: pastMenu._id,
      status: { $in: ["collected", "late"] },
    });

    const skipped = await MealRecord.countDocuments({
      mealMenu: pastMenu._id,
      status: "skipped",
    });

    confirmedTotal += confirmed;
    attendedTotal += attended;
    skippedTotal += skipped;
    recordedTotal += attended + skipped;
  }

  return {
    menusConsidered: recentMenus.length,
    avgConfirmed:
      recentMenus.length > 0
        ? confirmedTotal / recentMenus.length
        : null,
    // show-up rate = how many of the confirmed tokens actually got
    // collected/late (as opposed to being confirmed and then skipped)
    attendanceRate:
      confirmedTotal > 0 ? attendedTotal / confirmedTotal : null,
    // skip rate = how many *recorded* meals ended up wasted
    skipRate: recordedTotal > 0 ? skippedTotal / recordedTotal : null,
  };
};

// ===========================================================
// GET DEMAND FORECAST
// Compares confirmed tokens, actual check-ins, and recent
// attendance history to estimate the next meal quantity,
// flag low-demand menu items, and surface a waste-risk
// indicator before purchasing/cooking.
// ===========================================================

const getDemandForecast = async (req, res) => {
  try {
    const menus = await MealMenu.find({
      isPublished: true,
    }).sort({ date: 1, mealType: 1 });

    const now = new Date();

    const forecast = [];

    for (const menu of menus) {
      const confirmedDiners = await MealToken.countDocuments({
        mealMenu: menu._id,
        status: "confirmed",
      });

      const collectedOrLate = await MealRecord.countDocuments({
        mealMenu: menu._id,
        status: { $in: ["collected", "late"] },
      });

      const skipped = await MealRecord.countDocuments({
        mealMenu: menu._id,
        status: "skipped",
      });

      const recordedCount = collectedOrLate + skipped;
      const hasActuals = recordedCount > 0;

      const history = await getRecentHistory(menu.mealType, menu.date);

      // -----------------------------------------------------
      // ESTIMATED MEALS TO PREPARE
      // - If the meal already happened (has recorded check-ins),
      //   the actual number collected is the ground truth.
      // - Otherwise, blend the confirmed-token count with the
      //   recent attendance (show-up) rate for that meal type,
      //   since not every confirmed diner actually shows up.
      // - With no history at all, fall back to the raw
      //   confirmed count.
      // -----------------------------------------------------
      let estimatedMeals;

      if (hasActuals) {
        estimatedMeals = collectedOrLate;
      } else if (history.attendanceRate !== null) {
        estimatedMeals = Math.round(
          confirmedDiners * history.attendanceRate
        );
      } else {
        estimatedMeals = confirmedDiners;
      }

      // -----------------------------------------------------
      // LOW-DEMAND FLAG
      // Confirmed diners noticeably below the recent average
      // for this meal type suggests low demand for this item.
      // -----------------------------------------------------
      const lowDemand =
        history.avgConfirmed !== null &&
        history.avgConfirmed > 0 &&
        confirmedDiners < history.avgConfirmed * 0.6;

      // -----------------------------------------------------
      // WASTE-RISK INDICATOR
      // Based on how often recent meals of this type were
      // confirmed-but-skipped (i.e. cooked/collected for
      // nothing).
      // -----------------------------------------------------
      let wasteRiskLevel = "unknown";

      if (history.skipRate !== null) {
        if (history.skipRate >= 0.25) {
          wasteRiskLevel = "high";
        } else if (history.skipRate >= 0.1) {
          wasteRiskLevel = "medium";
        } else {
          wasteRiskLevel = "low";
        }
      }

      forecast.push({
        mealMenuId: menu._id,
        date: menu.date,
        mealType: menu.mealType,
        menu: menu.menu,
        price: menu.price,
        cutoffTime: menu.cutoffTime,

        confirmedDiners,
        actualCheckIns: hasActuals ? collectedOrLate : null,
        skippedMeals: hasActuals ? skipped : null,

        // kept for backwards compatibility with older clients
        expectedDiners: confirmedDiners,

        estimatedMeals,

        recentAttendanceRate:
          history.attendanceRate !== null
            ? Number((history.attendanceRate * 100).toFixed(1))
            : null,

        historicalSkipRate:
          history.skipRate !== null
            ? Number((history.skipRate * 100).toFixed(1))
            : null,

        historyMenusConsidered: history.menusConsidered,

        lowDemand,
        wasteRiskLevel,

        isUpcoming: new Date(menu.cutoffTime) > now,
      });
    }

    return res.status(200).json({
      message: "Demand forecast loaded",
      forecast,
    });
  } catch (error) {
    console.error("Demand forecast error:", error);

    return res.status(500).json({
      message: "Server error while generating demand forecast",
      error: error.message,
    });
  }
};

module.exports = {
  getDemandForecast,
};
