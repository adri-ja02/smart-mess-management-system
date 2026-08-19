const crypto = require("crypto");
const MealMenu = require("../models/MealMenu");
const MealToken = require("../models/MealToken");
const BedReservation = require("../models/BedReservation");

// Generate a unique meal token code
const generateTokenCode = () => {
  return crypto.randomBytes(16).toString("hex");
};

// ===============================
// MANAGER: Publish a meal menu
// ===============================
const createMealMenu = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        message: "Only managers can publish meal menus",
      });
    }

    const {
      date,
      mealType,
      menu,
      price,
      dietaryNotes,
      cutoffTime,
      checkInStart,
      checkInEnd,
    } = req.body;

    if (
      !date ||
      !mealType ||
      !menu ||
      price === undefined ||
      !cutoffTime ||
      !checkInStart ||
      !checkInEnd
    ) {
      return res.status(400).json({
        message:
          "Date, meal type, menu, price, cutoff time and check-in start/end are required",
      });
    }

    const validMealTypes = ["breakfast", "lunch", "dinner"];

    if (!validMealTypes.includes(mealType)) {
      return res.status(400).json({
        message: "Meal type must be breakfast, lunch or dinner",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        message: "Price cannot be negative",
      });
    }

    if (new Date(cutoffTime) <= new Date()) {
      return res.status(400).json({
        message: "Cutoff time must be in the future",
      });
    }

    if (new Date(checkInEnd) <= new Date(checkInStart)) {
      return res.status(400).json({
        message: "Check-in end time must be after the check-in start time",
      });
    }

    const mealMenu = await MealMenu.create({
      date,
      mealType,
      menu,
      price,
      dietaryNotes: dietaryNotes || "",
      cutoffTime,
      checkInStart,
      checkInEnd,
      publishedBy: req.user._id,
    });

    res.status(201).json({
      message: "Meal menu published successfully",
      mealMenu,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "A menu for this meal type already exists on this date",
      });
    }

    console.error("Create meal menu error:", error);

    res.status(500).json({
      message: "Server error while publishing meal menu",
    });
  }
};

// ===============================
// MANAGER: Edit a meal menu
// ===============================
const updateMealMenu = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        message: "Only managers can edit meal menus",
      });
    }

    const { mealMenuId } = req.params;

    const mealMenu = await MealMenu.findById(mealMenuId);

    if (!mealMenu) {
      return res.status(404).json({
        message: "Meal menu not found",
      });
    }

    const {
      date,
      mealType,
      menu,
      price,
      dietaryNotes,
      cutoffTime,
      checkInStart,
      checkInEnd,
    } = req.body;

    const validMealTypes = ["breakfast", "lunch", "dinner"];

    if (mealType !== undefined && !validMealTypes.includes(mealType)) {
      return res.status(400).json({
        message: "Meal type must be breakfast, lunch or dinner",
      });
    }

    if (price !== undefined && Number(price) < 0) {
      return res.status(400).json({
        message: "Price cannot be negative",
      });
    }

    const nextCheckInStart = checkInStart
      ? new Date(checkInStart)
      : mealMenu.checkInStart;

    const nextCheckInEnd = checkInEnd
      ? new Date(checkInEnd)
      : mealMenu.checkInEnd;

    if (nextCheckInEnd <= nextCheckInStart) {
      return res.status(400).json({
        message: "Check-in end time must be after the check-in start time",
      });
    }

    if (date !== undefined) mealMenu.date = date;
    if (mealType !== undefined) mealMenu.mealType = mealType;
    if (menu !== undefined) mealMenu.menu = menu;
    if (price !== undefined) mealMenu.price = price;
    if (dietaryNotes !== undefined) mealMenu.dietaryNotes = dietaryNotes;
    if (cutoffTime !== undefined) mealMenu.cutoffTime = cutoffTime;
    if (checkInStart !== undefined) mealMenu.checkInStart = checkInStart;
    if (checkInEnd !== undefined) mealMenu.checkInEnd = checkInEnd;

    await mealMenu.save();

    res.status(200).json({
      message: "Meal menu updated successfully",
      mealMenu,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "A menu for this meal type already exists on this date",
      });
    }

    console.error("Update meal menu error:", error);

    res.status(500).json({
      message: "Server error while updating meal menu",
    });
  }
};

// ===============================
// STUDENT/MANAGER: View menus
// ===============================
const getMealMenus = async (req, res) => {
  try {
    const menus = await MealMenu.find({
      isPublished: true,
    })
      .populate("publishedBy", "name email")
      .sort({
        date: 1,
        mealType: 1,
      });

    res.status(200).json(menus);
  } catch (error) {
    console.error("Get meal menus error:", error);

    res.status(500).json({
      message: "Server error while loading meal menus",
    });
  }
};

// ===============================
// STUDENT: Confirm a meal
// ===============================
const confirmMeal = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can confirm meals",
      });
    }

    const { mealMenuId } = req.params;

    const mealMenu = await MealMenu.findById(mealMenuId);

    if (!mealMenu || !mealMenu.isPublished) {
      return res.status(404).json({
        message: "Meal menu not found",
      });
    }

    if (new Date() >= new Date(mealMenu.cutoffTime)) {
      return res.status(400).json({
        message: "Meal confirmation deadline has passed",
      });
    }

    // =====================================================
    // CHECK STUDENT'S OCCUPIED BED
    // =====================================================

    const reservation = await BedReservation.findOne({
      student: req.user._id,
      status: "approved",
    }).populate(
      "room",
      "building roomNumber beds isArchived"
    );

    const occupiedBed = reservation?.room?.beds?.find(
      (bed) =>
        bed.bedNumber === reservation.bedNumber &&
        bed.occupied === true &&
        bed.isArchived !== true
    );

    if (
      !reservation ||
      !reservation.room ||
      reservation.room.isArchived ||
      !occupiedBed
    ) {
      return res.status(403).json({
        message:
          "Meal confirmation is only available to residents with an occupied bed.",
      });
    }

    // =====================================================
    // EXISTING MEAL CONFIRMATION LOGIC
    // =====================================================

    let mealToken = await MealToken.findOne({
      mealMenu: mealMenuId,
      resident: req.user._id,
    });

    // Already confirmed
    if (mealToken && mealToken.status === "confirmed") {
      return res.status(400).json({
        message: "You have already confirmed this meal",
        mealToken,
      });
    }

    // Student cancelled earlier and wants to confirm again
    if (mealToken && mealToken.status === "cancelled") {
      mealToken.status = "confirmed";
      mealToken.confirmedAt = new Date();
      mealToken.cancelledAt = null;
      mealToken.tokenCode = generateTokenCode();

      await mealToken.save();

      return res.status(200).json({
        message: "Meal confirmed again successfully",
        mealToken,
      });
    }

    // First confirmation
    mealToken = await MealToken.create({
      mealMenu: mealMenuId,
      resident: req.user._id,
      tokenCode: generateTokenCode(),
      status: "confirmed",
    });

    res.status(201).json({
      message: "Meal confirmed successfully",
      mealToken,
    });
  } catch (error) {
    console.error("Confirm meal error:", error);

    res.status(500).json({
      message: "Server error while confirming meal",
    });
  }
};

// ===============================
// STUDENT: Cancel a meal
// ===============================
const cancelMeal = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can cancel meals",
      });
    }

    const { mealMenuId } = req.params;

    const mealMenu = await MealMenu.findById(mealMenuId);

    if (!mealMenu || !mealMenu.isPublished) {
      return res.status(404).json({
        message: "Meal menu not found",
      });
    }

    if (new Date() >= new Date(mealMenu.cutoffTime)) {
      return res.status(400).json({
        message: "Meal cancellation deadline has passed",
      });
    }

    const mealToken = await MealToken.findOne({
      mealMenu: mealMenuId,
      resident: req.user._id,
    });

    if (!mealToken || mealToken.status !== "confirmed") {
      return res.status(400).json({
        message: "You do not have a confirmed meal to cancel",
      });
    }

    mealToken.status = "cancelled";
    mealToken.cancelledAt = new Date();

    await mealToken.save();

    res.status(200).json({
      message: "Meal cancelled successfully",
      mealToken,
    });
  } catch (error) {
    console.error("Cancel meal error:", error);

    res.status(500).json({
      message: "Server error while cancelling meal",
    });
  }
};

// ===============================
// STUDENT: View own meal tokens
// ===============================
const getMyMealTokens = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can view their meal tokens",
      });
    }

    const mealTokens = await MealToken.find({
      resident: req.user._id,
    })
      .populate("mealMenu")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(mealTokens);
  } catch (error) {
    console.error("Get meal tokens error:", error);

    res.status(500).json({
      message: "Server error while loading meal tokens",
    });
  }
};

// ===============================
// MANAGER: Expected diner count
// ===============================
const getExpectedDinerCount = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        message: "Only managers can view expected diner count",
      });
    }

    const { mealMenuId } = req.params;

    const mealMenu = await MealMenu.findById(mealMenuId);

    if (!mealMenu) {
      return res.status(404).json({
        message: "Meal menu not found",
      });
    }

    const expectedDiners = await MealToken.countDocuments({
      mealMenu: mealMenuId,
      status: "confirmed",
    });

    res.status(200).json({
      mealMenuId: mealMenu._id,
      date: mealMenu.date,
      mealType: mealMenu.mealType,
      menu: mealMenu.menu,
      expectedDiners,
    });
  } catch (error) {
    console.error("Expected diner count error:", error);

    res.status(500).json({
      message: "Server error while calculating diner count",
    });
  }
};

module.exports = {
  createMealMenu,
  updateMealMenu,
  getMealMenus,
  confirmMeal,
  cancelMeal,
  getMyMealTokens,
  getExpectedDinerCount,
};