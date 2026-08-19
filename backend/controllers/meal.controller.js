const MealRecord = require("../models/MealRecord");
const MealToken = require("../models/MealToken");
const MealMenu = require("../models/MealMenu");
const BedReservation = require("../models/BedReservation");

/*
  The manager sets an explicit check-in date/time range (checkInStart /
  checkInEnd) on the MealMenu when publishing it (editable afterwards).
  A check-in recorded inside that window is "collected"; a check-in
  recorded after checkInEnd is "late". Once checkInEnd has passed,
  confirmed tokens with no check-in at all become sweep-eligible for
  "skipped" via markSkippedMeals.
*/
const isLate = (mealMenu) => {
  return new Date() > new Date(mealMenu.checkInEnd);
};

// Check-in is only allowed once the manager-set window has opened.
const hasCheckInWindowOpened = (mealMenu) => {
  return new Date() >= new Date(mealMenu.checkInStart);
};

/*
  ================================================================
  HELPER: GET STUDENT'S APPROVED OCCUPIED BED
  ================================================================

  A student is considered a resident for meal purposes only when:

  1. They have an approved BedReservation
  2. The reservation's room exists and is not archived
  3. The reserved bed exists
  4. The bed is occupied
  5. The bed is not archived
*/
const getOccupiedBedForStudent = async (studentId) => {
  const reservation = await BedReservation.findOne({
    student: studentId,
    status: "approved",
  }).populate(
    "room",
    "building roomNumber beds isArchived"
  );

  if (!reservation) {
    return null;
  }

  const room = reservation.room;

  if (!room || room.isArchived) {
    return null;
  }

  const bed = room.beds?.find(
    (item) =>
      item.bedNumber === reservation.bedNumber &&
      item.occupied === true &&
      item.isArchived !== true
  );

  if (!bed) {
    return null;
  }

  return {
    reservation,
    room,
    bed,

    building:
      room.building?.name || "—",

    roomNumber:
      room.roomNumber || "—",

    bedNumber:
      bed.bedNumber || "—",
  };
};

/*
  ================================================================
  HELPER: RESIDENT DISPLAY INFORMATION
  ================================================================
*/
const getResidentWithLocation = async (resident) => {
  if (!resident) {
    return resident;
  }

  const occupiedBed =
    await getOccupiedBedForStudent(
      resident._id
    );

  return {
    ...resident.toObject(),

    building:
      occupiedBed?.building || "—",

    room:
      occupiedBed?.roomNumber || "—",

    bed:
      occupiedBed?.bedNumber || "—",
  };
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

    const mealToken =
      await MealToken.findOne({
        tokenCode,
      }).populate("mealMenu");

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

    // Only the resident who owns this token,
    // or a manager, may check it in.
    const isOwner =
      mealToken.resident.toString() ===
      req.user._id.toString();

    const isManager =
      req.user.role === "manager";

    if (!isOwner && !isManager) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot check in this meal",
      });
    }

    /*
      ============================================================
      IMPORTANT:
      A student must currently have an occupied bed.
      ============================================================
    */
    if (req.user.role === "student") {
      const occupiedBed =
        await getOccupiedBedForStudent(
          mealToken.resident
        );

      if (!occupiedBed) {
        return res.status(403).json({
          success: false,
          message:
            "Meal confirmation and token use are only available to residents with an occupied bed.",
        });
      }
    }

    if (
      !hasCheckInWindowOpened(
        mealToken.mealMenu
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `Check-in has not started yet. It opens at ${new Date(
          mealToken.mealMenu.checkInStart
        ).toLocaleString()}.`,
      });
    }

    const status = isLate(
      mealToken.mealMenu
    )
      ? "late"
      : "collected";

    try {
      const record =
        await MealRecord.create({
          mealToken:
            mealToken._id,

          resident:
            mealToken.resident,

          mealMenu:
            mealToken.mealMenu._id,

          status,

          method: "QR",

          checkInTime:
            new Date(),
        });

      /*
        Populate resident so frontend can display
        resident name.
      */
      await record.populate(
        "resident",
        "name room bed"
      );

      return res.status(201).json({
        success: true,
        record,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "This meal has already been checked in",
        });
      }

      throw err;
    }
  } catch (error) {
    console.error(
      "QR check-in error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error during check-in",
    });
  }
};

/* ================= MANUAL CHECK-IN (manager only) ================= */
exports.manualCheckIn = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message:
          "Only managers can manually check in residents",
      });
    }

    const {
      mealTokenId,
      status,
    } = req.body;

    if (
      !mealTokenId ||
      ![
        "collected",
        "skipped",
        "late",
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "mealTokenId and a valid status (collected/skipped/late) are required",
      });
    }

    const mealToken =
      await MealToken.findById(
        mealTokenId
      ).populate("mealMenu");

    if (!mealToken) {
      return res.status(404).json({
        success: false,
        message:
          "Meal token not found",
      });
    }

    if (mealToken.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message:
          "This token is not an active confirmation (it may have been cancelled)",
      });
    }

    if (
      !hasCheckInWindowOpened(
        mealToken.mealMenu
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `Check-in has not started yet. It opens at ${new Date(
          mealToken.mealMenu.checkInStart
        ).toLocaleString()}.`,
      });
    }

    try {
      const record =
        await MealRecord.create({
          mealToken:
            mealToken._id,

          resident:
            mealToken.resident,

          mealMenu:
            mealToken.mealMenu._id,

          status,

          method: "Manual",

          checkInTime:
            status === "skipped"
              ? null
              : new Date(),

          checkedInBy:
            req.user._id,
        });

      await record.populate(
        "resident",
        "name room bed"
      );

      return res.status(201).json({
        success: true,
        record,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "A consumption record already exists for this meal",
        });
      }

      throw err;
    }
  } catch (error) {
    console.error(
      "Manual check-in error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error during manual check-in",
    });
  }
};

/* ================= AUTO-MARK NO-SHOWS AS SKIPPED ================= */
exports.markSkippedMeals = async (
  req,
  res
) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message:
          "Only managers can run this",
      });
    }

    const closedMenus =
      await MealMenu.find({
        checkInEnd: {
          $lte: new Date(),
        },
      }).select("_id");

    const menuIds =
      closedMenus.map(
        (m) => m._id
      );

    const confirmedTokens =
      await MealToken.find({
        mealMenu: {
          $in: menuIds,
        },

        status: "confirmed",
      });

    const existingRecords =
      await MealRecord.find({
        mealToken: {
          $in:
            confirmedTokens.map(
              (t) => t._id
            ),
        },
      }).select("mealToken");

    const alreadyRecorded =
      new Set(
        existingRecords.map(
          (r) =>
            r.mealToken.toString()
        )
      );

    const toInsert =
      confirmedTokens
        .filter(
          (t) =>
            !alreadyRecorded.has(
              t._id.toString()
            )
        )
        .map((t) => ({
          mealToken: t._id,

          resident:
            t.resident,

          mealMenu:
            t.mealMenu,

          status: "skipped",

          method: "System",

          checkInTime: null,
        }));

    let inserted = 0;

    if (toInsert.length) {
      try {
        const result =
          await MealRecord.insertMany(
            toInsert,
            {
              ordered: false,
            }
          );

        inserted =
          result.length;
      } catch (bulkErr) {
        const isDuplicateKeyOnly =
          bulkErr.code === 11000 ||
          bulkErr.writeErrors?.every(
            (e) =>
              e.code === 11000
          );

        if (!isDuplicateKeyOnly) {
          throw bulkErr;
        }

        inserted =
          bulkErr.result
            ?.nInserted ??
          bulkErr.insertedDocs
            ?.length ??
          0;
      }
    }

    res.json({
      success: true,
      marked: inserted,
    });
  } catch (error) {
    console.error(
      "Mark skipped meals error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error marking skipped meals",
    });
  }
};

/* ================= RESIDENT: MY MEAL HISTORY ================= */
exports.getMyMealHistory = async (
  req,
  res
) => {
  try {
    const records =
      await MealRecord.find({
        resident:
          req.user._id,
      })
        .populate(
          "mealMenu",
          "date mealType menu price"
        )
        .sort({
          createdAt: -1,
        });

    res.json({
      success: true,
      records,
    });
  } catch (error) {
    console.error(
      "Get meal history error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error loading meal history",
    });
  }
};

/* ================= MANAGER: VIEW ANY RESIDENT'S HISTORY ================= */
exports.getResidentMealHistory =
  async (req, res) => {
    try {
      if (req.user.role !== "manager") {
        return res.status(403).json({
          success: false,
          message:
            "Only managers can view another resident's history",
        });
      }

      const {
        residentId,
      } = req.params;

      const records =
        await MealRecord.find({
          resident:
            residentId,
        })
          .populate(
            "mealMenu",
            "date mealType menu price"
          )
          .populate(
            "resident",
            "name email room bed"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        success: true,
        records,
      });
    } catch (error) {
      console.error(
        "Get resident meal history error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error loading resident history",
      });
    }
  };

/* ================= MANAGER: STATUS GRID FOR ONE MEAL ================= */
exports.getMealStatusGrid =
  async (req, res) => {
    try {
      if (req.user.role !== "manager") {
        return res.status(403).json({
          success: false,
          message:
            "Only managers can view the status grid",
        });
      }

      const {
        mealMenuId,
      } = req.params;

      const [
        confirmedTokens,
        records,
      ] = await Promise.all([
        MealToken.find({
          mealMenu:
            mealMenuId,

          status:
            "confirmed",
        }).populate(
          "resident",
          "name email"
        ),

        MealRecord.find({
          mealMenu:
            mealMenuId,
        }).populate(
          "resident",
          "name email"
        ),
      ]);

      /*
        ============================================================
        GET OCCUPIED BUILDING / ROOM / BED FOR ALL RESIDENTS
        ============================================================
      */

      const residentIds =
        [
          ...confirmedTokens.map(
            (token) =>
              token.resident?._id
          ),

          ...records.map(
            (record) =>
              record.resident?._id
          ),
        ].filter(Boolean);

      const reservations =
        await BedReservation.find({
          student: {
            $in: residentIds,
          },

          status:
            "approved",
        }).populate(
          "room",
          "building roomNumber beds isArchived"
        );

      const reservationMap =
        new Map();

      reservations.forEach(
        (reservation) => {
          const room =
            reservation.room;

          if (
            !room ||
            room.isArchived
          ) {
            return;
          }

          const bed =
            room.beds?.find(
              (item) =>
                item.bedNumber ===
                  reservation.bedNumber &&
                item.occupied ===
                  true &&
                item.isArchived !==
                  true
            );

          if (!bed) {
            return;
          }

          reservationMap.set(
            reservation.student.toString(),
            {
              building:
                room.building
                  ?.name || "—",

              room:
                room.roomNumber ||
                "—",

              bed:
                bed.bedNumber ||
                "—",
            }
          );
        }
      );

      /*
        ============================================================
        ADD BUILDING / ROOM / BED TO RESIDENT
        ============================================================
      */

      const addLocation =
        (resident) => {
          if (!resident) {
            return resident;
          }

          const location =
            reservationMap.get(
              resident._id.toString()
            ) || {
              building: "—",
              room: "—",
              bed: "—",
            };

          return {
            ...resident.toObject(),

            building:
              location.building,

            room:
              location.room,

            bed:
              location.bed,
          };
        };

      const recordsWithLocation =
        records.map(
          (record) => ({
            ...record.toObject(),

            resident:
              addLocation(
                record.resident
              ),
          })
        );

      const recordedTokenIds =
        new Set(
          records.map((r) =>
            r.mealToken.toString()
          )
        );

      const pending =
        confirmedTokens
          .filter(
            (t) =>
              !recordedTokenIds.has(
                t._id.toString()
              )
          )
          .map((t) => ({
            mealToken:
              t._id,

            resident:
              addLocation(
                t.resident
              ),

            status:
              "not_checked_in",
          }));

      res.json({
        success: true,

        records:
          recordsWithLocation,

        pending,
      });
    } catch (error) {
      console.error(
        "Get status grid error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error loading status grid",
      });
    }
  };

/* ================= MANAGER: OVERRIDE A RECORD'S STATUS ================= */
exports.updateMealStatus =
  async (req, res) => {
    try {
      if (req.user.role !== "manager") {
        return res.status(403).json({
          success: false,
          message:
            "Only managers can update meal status",
        });
      }

      const {
        status,
      } = req.body;

      if (
        ![
          "collected",
          "skipped",
          "late",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status",
        });
      }

      const update = {
        status,

        method: "Manual",

        checkedInBy:
          req.user._id,

        checkInTime:
          status === "skipped"
            ? null
            : new Date(),
      };

      const record =
        await MealRecord.findByIdAndUpdate(
          req.params.id,
          update,
          {
            new: true,
          }
        ).populate(
          "resident",
          "name room bed"
        );

      if (!record) {
        return res.status(404).json({
          success: false,
          message:
            "Meal record not found",
        });
      }

      res.json({
        success: true,
        record,
      });
    } catch (error) {
      console.error(
        "Update meal status error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error updating status",
      });
    }
  };

/* ================= MANAGER: MONTHLY CONSUMPTION SUMMARY ================= */
exports.getMonthlySummary =
  async (req, res) => {
    try {
      if (req.user.role !== "manager") {
        return res.status(403).json({
          success: false,
          message:
            "Only managers can view billing summaries",
        });
      }

      const {
        year,
        month,
      } = req.query;

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          message:
            "year and month are required",
        });
      }

      const start =
        new Date(
          Number(year),
          Number(month) - 1,
          1
        );

      const end =
        new Date(
          Number(year),
          Number(month),
          1
        );

      const summary =
        await MealRecord.aggregate([
          {
            $lookup: {
              from: "mealmenus",

              localField:
                "mealMenu",

              foreignField:
                "_id",

              as: "menu",
            },
          },

          {
            $unwind:
              "$menu",
          },

          {
            $match: {
              "menu.date": {
                $gte: start,
                $lt: end,
              },
            },
          },

          {
            $group: {
              _id: {
                resident:
                  "$resident",

                status:
                  "$status",

                mealType:
                  "$menu.mealType",
              },

              count: {
                $sum: 1,
              },

              totalValue: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        "$status",
                        [
                          "collected",
                          "late",
                        ],
                      ],
                    },

                    "$menu.price",

                    0,
                  ],
                },
              },
            },
          },
        ]);

      res.json({
        success: true,
        summary,
      });
    } catch (error) {
      console.error(
        "Monthly summary error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error building monthly summary",
      });
    }
  };