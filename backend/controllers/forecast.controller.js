const MealMenu = require("../models/MealMenu");
const MealToken = require("../models/MealToken");

// ===========================================================
// GET DEMAND FORECAST
// ===========================================================

const getDemandForecast = async (req, res) => {
  try {
    const menus = await MealMenu.find({
      isPublished: true,
    }).sort({
      date: 1,
    });

    const forecast = [];

    for (const menu of menus) {
      const confirmedDiners =
        await MealToken.countDocuments({
          mealMenu: menu._id,
          status: "confirmed",
        });

      forecast.push({
        mealMenuId: menu._id,
        date: menu.date,
        mealType: menu.mealType,
        menu: menu.menu,
        expectedDiners: confirmedDiners,
        estimatedMeals: confirmedDiners,
      });
    }

    return res.status(200).json({
      message: "Demand forecast loaded",
      forecast,
    });
  } catch (error) {
    console.error(
      "Demand forecast error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while generating demand forecast",
      error: error.message,
    });
  }
};

module.exports = {
  getDemandForecast,
};