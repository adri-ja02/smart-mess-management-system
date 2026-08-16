const MealRecord = require("../models/MealRecord");
const MealToken = require("../models/MealToken");
const MealMenu = require("../models/MealMenu");

/*
  How long after a menu's cutoffTime the normal service window stays open.
  A check-in inside this window is "collected"; after it, "late".
  ASSUMPTION: there's no explicit serving-start/end field on MealMenu yet —
  confirm this window with the team, or add real serving-time fields later.
*/
const SERVICE_WINDOW_MINUTES = 60;

const isLate = (mealMenu) => {
  const serviceEnd = new Date(
    new Date(mealMenu.cutoffTime).getTime() + SERVICE_WINDOW_MINUTES * 60000
  );
  return new Date() > serviceEnd;
};

/* ================= QR SCAN CHECK-IN (resident or manager) ================= */
exports.scanQrCheckIn = async (req, res) => {
  try {
    const { tokenCode } = req.body;

    if (!tokenCode) {
      return res.status(400).json({
        success: false,
        message: "tokenCode is required",
      });
    }

    const mealToken = await MealToken.findOne({ tokenCode }).populate(
      "mealMenu"
    );

    if (!mealToken) {
      return res.status(404).json({
        success: false,
        message: "Invalid QR token",
      });
    }

    if (mealToken.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message:
          "This token is not an active confirmation (it may have been cancelled)",
      });
    }

    // Only the resident who owns this token, or a manager, may check it in.
    const isOwner =
      mealToken.resident.toString() === req.user._id.toString();
    const isManager = req.user.role === "manager";

    if (!isOwner && !isManager) {
      return res.status(403).json({
        success: false,
        message: "You cannot check in this meal",
      });
    }

    const status = isLate(mealToken.mealMenu) ? "late" : "collected";

    try {
      // Atomic create — the unique index on mealToken in the schema is the
      // real duplicate-check-in guard (race-condition safe under concurrent
      // scans), this try/catch just turns the DB error into a clean response.
      const record = await MealRecord.create({
        mealToken: mealToken._id,
        resident: mealToken.resident,
        mealMenu: mealToken.mealMenu._id,
        status,
        method: "QR",
        checkInTime: new Date(),
      });

      // FIX: populate resident before responding — the frontend (QrScanner)
      // displays record.resident.name, which was always undefined before
      // this populate was added.
      await record.populate("resident", "name room bed");

      return res.status(201).json({ success: true, record });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "This meal has already been checked in",
        });
      }
      throw err;
    }
  } catch (error) {
    console.error("QR check-in error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during check-in",
    });
  }
};

/* ================= MANUAL CHECK-IN (manager only) ================= */
exports.manualCheckIn = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only managers can manually check in residents",
      });
    }

    const { mealTokenId, status } = req.body;

    if (!mealTokenId || !["collected", "skipped", "late"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "mealTokenId and a valid status (collected/skipped/late) are required",
      });
    }

    const mealToken = await MealToken.findById(mealTokenId).populate(
      "mealMenu"
    );

    if (!mealToken) {
      return res.status(404).json({
        success: false,
        message: "Meal token not found",
      });
    }

    // FIX: previously scanQrCheckIn refused a cancelled token but this
    // endpoint didn't — a manager could check in a token the resident had
    // already cancelled. Same guard as the QR path, for consistency.
    if (mealToken.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message:
          "This token is not an active confirmation (it may have been cancelled)",
      });
    }

    try {
      // checkInTime is always set to "now" for a manual override that isn't
      // "skipped" — even if the manager marks it "collected" or "late" well
      // after the fact, we record when the record itself was made, since we
      // have no other reliable timestamp for a manual entry.
      const record = await MealRecord.create({
        mealToken: mealToken._id,
        resident: mealToken.resident,
        mealMenu: mealToken.mealMenu._id,
        status,
        method: "Manual",
        checkInTime: status === "skipped" ? null : new Date(),
        checkedInBy: req.user._id,
      });

      // FIX: same populate gap as scanQrCheckIn — needed for any UI that
      // displays the resident's name straight off this response.
      await record.populate("resident", "name room bed");

      return res.status(201).json({ success: true, record });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "A consumption record already exists for this meal",
        });
      }
      throw err;
    }
  } catch (error) {
    console.error("Manual check-in error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during manual check-in",
    });
  }
};

/* ================= AUTO-MARK NO-SHOWS AS SKIPPED (manager/cron) ================= */
exports.markSkippedMeals = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only managers can run this",
      });
    }

    // Menus whose service window has already closed.
    const closedMenus = await MealMenu.find({
      cutoffTime: {
        $lte: new Date(Date.now() - SERVICE_WINDOW_MINUTES * 60000),
      },
    }).select("_id");

    const menuIds = closedMenus.map((m) => m._id);

    const confirmedTokens = await MealToken.find({
      mealMenu: { $in: menuIds },
      status: "confirmed",
    });

    const existingRecords = await MealRecord.find({
      mealToken: { $in: confirmedTokens.map((t) => t._id) },
    }).select("mealToken");

    const alreadyRecorded = new Set(
      existingRecords.map((r) => r.mealToken.toString())
    );

    const toInsert = confirmedTokens
      .filter((t) => !alreadyRecorded.has(t._id.toString()))
      .map((t) => ({
        mealToken: t._id,
        resident: t.resident,
        mealMenu: t.mealMenu,
        status: "skipped",
        method: "System",
        checkInTime: null,
      }));

    let inserted = 0;

    if (toInsert.length) {
      try {
        // unordered: one duplicate-key clash (rare race with a live
        // check-in that happened between our pre-check above and this
        // insert) shouldn't block the rest of the batch from inserting.
        const result = await MealRecord.insertMany(toInsert, {
          ordered: false,
        });
        inserted = result.length;
      } catch (bulkErr) {
        // FIX: insertMany with ordered:false still throws a
        // BulkWriteError after a partial success — previously this was
        // uncaught here, fell through to the outer catch, and returned a
        // 500 even though most/all records had actually been inserted.
        // We now treat pure duplicate-key failures as a partial success
        // and only rethrow anything that isn't a duplicate-key issue.
        const isDuplicateKeyOnly =
          bulkErr.code === 11000 ||
          bulkErr.writeErrors?.every((e) => e.code === 11000);

        if (!isDuplicateKeyOnly) {
          throw bulkErr;
        }

        inserted =
          bulkErr.result?.nInserted ?? bulkErr.insertedDocs?.length ?? 0;
      }
    }

    res.json({ success: true, marked: inserted });
  } catch (error) {
    console.error("Mark skipped meals error:", error);
    res.status(500).json({
      success: false,
      message: "Server error marking skipped meals",
    });
  }
};

/* ================= RESIDENT: MY MEAL HISTORY ================= */
exports.getMyMealHistory = async (req, res) => {
  try {
    const records = await MealRecord.find({ resident: req.user._id })
      .populate("mealMenu", "date mealType menu price")
      .sort({ createdAt: -1 });

    res.json({ success: true, records });
  } catch (error) {
    console.error("Get meal history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error loading meal history",
    });
  }
};

/* ================= MANAGER: VIEW ANY RESIDENT'S HISTORY ================= */
exports.getResidentMealHistory = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only managers can view another resident's history",
      });
    }

    const { residentId } = req.params;

    const records = await MealRecord.find({ resident: residentId })
      .populate("mealMenu", "date mealType menu price")
      .populate("resident", "name email room bed")
      .sort({ createdAt: -1 });

    res.json({ success: true, records });
  } catch (error) {
    console.error("Get resident meal history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error loading resident history",
    });
  }
};

/* ================= MANAGER: STATUS GRID FOR ONE MEAL ================= */
exports.getMealStatusGrid = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only managers can view the status grid",
      });
    }

    const { mealMenuId } = req.params;

    // ASSUMPTION: the User model has `room`/`bed` fields from the room
    // allocation feature elsewhere in the app. Adjust the populate string
    // if those fields live somewhere else (e.g. a separate RoomAssignment).
    const [confirmedTokens, records] = await Promise.all([
      MealToken.find({ mealMenu: mealMenuId, status: "confirmed" }).populate(
        "resident",
        "name email room bed"
      ),
      MealRecord.find({ mealMenu: mealMenuId }).populate(
        "resident",
        "name email room bed"
      ),
    ]);

    const recordedTokenIds = new Set(
      records.map((r) => r.mealToken.toString())
    );

    const pending = confirmedTokens
      .filter((t) => !recordedTokenIds.has(t._id.toString()))
      .map((t) => ({
        mealToken: t._id,
        resident: t.resident,
        status: "not_checked_in",
      }));

    res.json({ success: true, records, pending });
  } catch (error) {
    console.error("Get status grid error:", error);
    res.status(500).json({
      success: false,
      message: "Server error loading status grid",
    });
  }
};

/* ================= MANAGER: OVERRIDE A RECORD'S STATUS ================= */
exports.updateMealStatus = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only managers can update meal status",
      });
    }

    const { status } = req.body;

    if (!["collected", "skipped", "late"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // FIX: keep checkInTime consistent with the new status — previously an
    // override left a stale checkInTime (e.g. skip -> collected kept
    // checkInTime null; collected -> skipped kept the old timestamp).
    const update = {
      status,
      method: "Manual",
      checkedInBy: req.user._id,
      checkInTime: status === "skipped" ? null : new Date(),
    };

    const record = await MealRecord.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).populate("resident", "name room bed");

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Meal record not found",
      });
    }

    res.json({ success: true, record });
  } catch (error) {
    console.error("Update meal status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating status",
    });
  }
};

/* ================= MANAGER: MONTHLY CONSUMPTION SUMMARY (billing input) ================= */
exports.getMonthlySummary = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only managers can view billing summaries",
      });
    }

    const { year, month } = req.query; // e.g. year=2026, month=07

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "year and month are required",
      });
    }

    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);

    // Joins through to MealMenu so Feature 3 gets per-meal price alongside
    // consumption counts, without a separate round trip.
    const summary = await MealRecord.aggregate([
      {
        $lookup: {
          from: "mealmenus",
          localField: "mealMenu",
          foreignField: "_id",
          as: "menu",
        },
      },
      { $unwind: "$menu" },
      { $match: { "menu.date": { $gte: start, $lt: end } } },
      {
        $group: {
          _id: {
            resident: "$resident",
            status: "$status",
            mealType: "$menu.mealType",
          },
          count: { $sum: 1 },
          totalValue: {
            $sum: {
              $cond: [
                { $in: ["$status", ["collected", "late"]] },
                "$menu.price",
                0,
              ],
            },
          },
        },
      },
    ]);

    res.json({ success: true, summary });
  } catch (error) {
    console.error("Monthly summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server error building monthly summary",
    });
  }
};