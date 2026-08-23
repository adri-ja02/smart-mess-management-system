const mongoose = require("mongoose");

const Reservation = require("../models/BedReservation");
const Waitlist = require("../models/Waitlist");
const Room = require("../models/Room");

// ===========================================================
// CONSTANTS
// ===========================================================

// Matched waitlist student gets 5 hours to request the bed.
const WAITLIST_CLAIM_HOURS = 5;

const WAITLIST_CLAIM_MS =
    WAITLIST_CLAIM_HOURS *
    60 *
    60 *
    1000;

// Once a student requests a bed, the bed is held for 24 hours.
const RESERVATION_HOLD_HOURS = 24;

const RESERVATION_HOLD_MS =
    RESERVATION_HOLD_HOURS *
    60 *
    60 *
    1000;


// ===========================================================
// HELPER - VALIDATE OBJECT ID
// ===========================================================

const isValidId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};


// ===========================================================
// HELPER - VALIDATE APPLICANT DETAILS
// ===========================================================

const REQUIRED_APPLICANT_FIELDS = [
    "fullName",
    "address",
    "phone",
    "email",
    "institutionName",
    "studentId",
    "bloodGroup",
    "fatherName",
    "fatherPhone",
    "motherName",
    "motherPhone",
];

const VALID_BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
];

const validateApplicantDetails = (applicantDetails) => {
    if (
        !applicantDetails ||
        typeof applicantDetails !== "object"
    ) {
        return "Applicant details are required.";
    }

    for (const field of REQUIRED_APPLICANT_FIELDS) {
        const value = applicantDetails[field];

        if (
            typeof value !== "string" ||
            !value.trim()
        ) {
            return `Applicant details are incomplete: "${field}" is required.`;
        }
    }

    if (
        !VALID_BLOOD_GROUPS.includes(
            applicantDetails.bloodGroup
        )
    ) {
        return "Applicant details contain an invalid blood group.";
    }

    return null;
};


// ===========================================================
// HELPER - SANITIZE APPLICANT DETAILS
// ===========================================================

const sanitizeApplicantDetails = (applicantDetails) => {
    const sanitized = {};

    for (const field of REQUIRED_APPLICANT_FIELDS) {
        sanitized[field] =
            String(applicantDetails[field]).trim();
    }

    return sanitized;
};


// ===========================================================
// HELPER - CHECK ACTIVE REQUEST
// ===========================================================

const hasActiveRequest = async (studentId) => {
    const activeReservation =
        await Reservation.findOne({
            student: studentId,
            status: {
                $in: [
                    "pending",
                    "approved",
                ],
            },
        });

    if (activeReservation) {
        return true;
    }

    const activeWaitlist =
        await Waitlist.findOne({
            student: studentId,
            status: {
                $in: [
                    "waiting",
                    "matched",
                ],
            },
        });

    return !!activeWaitlist;
};


// ===========================================================
// FIND FIRST WAITING STUDENT
// ===========================================================

const getFirstWaitingEntry = async (
    roomId,
    bedNumber
) => {
    return await Waitlist.findOne({
        room: roomId,
        bedNumber,
        status: "waiting",
    }).sort({
        createdAt: 1,
        _id: 1,
    });
};


// ===========================================================
// MATCH NEXT WAITLIST STUDENT
// ===========================================================

const notifyNextWaitlistStudent = async (
    roomId,
    bedNumber
) => {
    try {
        const room =
            await Room.findById(roomId);

        if (!room) {
            return null;
        }

        const bed =
            room.beds.find(
                (b) =>
                    b.bedNumber === bedNumber &&
                    !b.isArchived
            );

        if (!bed) {
            return null;
        }

        if (
            bed.occupied ||
            bed.onHold
        ) {
            return null;
        }

        const existingMatched =
            await Waitlist.findOne({
                room: roomId,
                bedNumber,
                status: "matched",
            });

        if (existingMatched) {
            return existingMatched;
        }

        const nextEntry =
            await getFirstWaitingEntry(
                roomId,
                bedNumber
            );

        if (!nextEntry) {
            return null;
        }

        const now = new Date();

        nextEntry.status = "matched";
        nextEntry.notified = true;
        nextEntry.matchedAt = now;

        nextEntry.matchedUntil =
            new Date(
                now.getTime() +
                WAITLIST_CLAIM_MS
            );

        nextEntry.notificationMessage =
            `Bed ${bedNumber} in room ${room.roomNumber} is available. ` +
            `You have ${WAITLIST_CLAIM_HOURS} hours to request this bed.`;

        await nextEntry.save();

        console.log(
            `[Waitlist] Student ${nextEntry.student} ` +
            `is now matched for room ${room.roomNumber}, ` +
            `bed ${bedNumber}. ` +
            `Expires: ${nextEntry.matchedUntil}`
        );

        return nextEntry;

    } catch (error) {
        console.error(
            "[Waitlist] notifyNextWaitlistStudent:",
            error.message
        );

        return null;
    }
};


// ===========================================================
// MATCH WAITLIST
// ===========================================================

const matchWaitlist = async (
    roomId,
    bedNumber = null
) => {
    try {
        const room =
            await Room.findById(roomId);

        if (!room) {
            return;
        }

        // Specific bed
        if (bedNumber) {
            await notifyNextWaitlistStudent(
                roomId,
                bedNumber
            );

            return;
        }

        // All available beds
        for (const bed of room.beds) {
            if (
                bed.isArchived ||
                bed.occupied ||
                bed.onHold
            ) {
                continue;
            }

            await notifyNextWaitlistStudent(
                roomId,
                bed.bedNumber
            );
        }

    } catch (error) {
        console.error(
            "[Waitlist] matchWaitlist:",
            error.message
        );
    }
};


// ===========================================================
// EXPIRE WAITLIST MATCHES
// ===========================================================

const expireWaitlistMatches = async () => {
    try {
        const now = new Date();

        const expiredEntries =
            await Waitlist.find({
                status: "matched",
                matchedUntil: {
                    $lte: now,
                },
            });

        let expiredCount = 0;

        for (
            const entry of expiredEntries
        ) {
            const expired =
                await Waitlist.findOneAndUpdate(
                    {
                        _id: entry._id,
                        status: "matched",
                        matchedUntil: {
                            $lte: now,
                        },
                    },
                    {
                        $set: {
                            status: "expired",
                            notified: false,
                            notificationMessage:
                                `Your ${WAITLIST_CLAIM_HOURS}-hour priority period expired. ` +
                                "The next waitlist student will now receive priority.",
                        },
                    },
                    {
                        new: true,
                    }
                );

            if (!expired) {
                continue;
            }

            expiredCount++;

            console.log(
                `[Waitlist] Student ${entry.student} ` +
                `expired for room ${entry.room}, ` +
                `bed ${entry.bedNumber}.`
            );

            await notifyNextWaitlistStudent(
                entry.room,
                entry.bedNumber
            );
        }

        return expiredCount;

    } catch (error) {
        console.error(
            "[Waitlist] expireWaitlistMatches:",
            error.message
        );

        return 0;
    }
};


// ===========================================================
// EXPIRE PENDING RESERVATION HOLDS
// ===========================================================

const expireStaleHolds = async () => {
    try {
        const now = new Date();

        const staleReservations =
            await Reservation.find({
                status: "pending",
                holdExpiresAt: {
                    $lte: now,
                },
            });

        let expiredCount = 0;

        for (
            const reservation
            of staleReservations
        ) {
            // Release bed
            const releasedRoom =
                await Room.findOneAndUpdate(
                    {
                        _id: reservation.room,
                        beds: {
                            $elemMatch: {
                                bedNumber:
                                    reservation.bedNumber,

                                onHold: true,

                                occupied: false,

                                isArchived: {
                                    $ne: true,
                                },
                            },
                        },
                    },
                    {
                        $set: {
                            "beds.$.onHold": false,
                        },
                    },
                    {
                        new: true,
                    }
                );

            // Expire reservation atomically
            const expiredReservation =
                await Reservation.findOneAndUpdate(
                    {
                        _id: reservation._id,
                        status: "pending",
                    },
                    {
                        $set: {
                            status: "expired",
                        },
                    },
                    {
                        new: true,
                    }
                );

            if (!expiredReservation) {
                continue;
            }

            expiredCount++;

            // Match next waitlist student
            if (releasedRoom) {
                await matchWaitlist(
                    reservation.room,
                    reservation.bedNumber
                );
            }
        }

        return expiredCount;

    } catch (error) {
        console.error(
            "[Reservation] expireStaleHolds:",
            error.message
        );

        return 0;
    }
};


// ===========================================================
// CLAIM BED FOR MATCHED WAITLIST STUDENT
// ===========================================================

const claimBedForMatchedStudent =
    async (
        matchedEntry,
        applicantDetails
    ) => {

        const studentId =
            matchedEntry.student;

        const roomId =
            matchedEntry.room;

        const bedNumber =
            matchedEntry.bedNumber;


        // ---------------------------------------------------
        // CHECK ACTIVE RESERVATION
        // ---------------------------------------------------

        const activeReservation =
            await Reservation.findOne({
                student: studentId,
                status: {
                    $in: [
                        "pending",
                        "approved",
                    ],
                },
            });

        if (activeReservation) {
            return {
                status: 400,
                body: {
                    success: false,
                    message:
                        "You already have an active reservation.",
                },
            };
        }


        // ---------------------------------------------------
        // FIND ROOM
        // ---------------------------------------------------

        const room =
            await Room.findById(roomId);

        if (!room) {
            return {
                status: 404,
                body: {
                    success: false,
                    message: "Room not found.",
                },
            };
        }


        // ---------------------------------------------------
        // FIND BED
        // ---------------------------------------------------

        const bed =
            room.beds.find(
                (b) =>
                    b.bedNumber === bedNumber &&
                    !b.isArchived
            );

        if (!bed) {
            return {
                status: 404,
                body: {
                    success: false,
                    message: "Bed not found.",
                },
            };
        }


        // ---------------------------------------------------
        // BED MUST BE AVAILABLE
        // ---------------------------------------------------

        if (
            bed.occupied ||
            bed.onHold
        ) {
            return {
                status: 409,
                body: {
                    success: false,
                    waitlistPriority: true,
                    message:
                        "This bed is currently unavailable. Please try again when it becomes available.",
                },
            };
        }


        // ---------------------------------------------------
        // ATOMIC BED HOLD
        // ---------------------------------------------------

        const claimedRoom =
            await Room.findOneAndUpdate(
                {
                    _id: roomId,

                    beds: {
                        $elemMatch: {
                            bedNumber,

                            occupied: false,

                            onHold: false,

                            isArchived: {
                                $ne: true,
                            },
                        },
                    },
                },
                {
                    $set: {
                        "beds.$.onHold": true,
                    },
                },
                {
                    new: true,
                }
            );

        if (!claimedRoom) {
            return {
                status: 409,
                body: {
                    success: false,
                    message:
                        "This bed was just requested by another student.",
                },
            };
        }


        // ---------------------------------------------------
        // CREATE PENDING RESERVATION
        // ---------------------------------------------------

        let reservation;

        try {
            reservation =
                await Reservation.create({
                    student: studentId,

                    room: roomId,

                    bedNumber,

                    applicantDetails,

                    status: "pending",

                    holdExpiresAt:
                        new Date(
                            Date.now() +
                            RESERVATION_HOLD_MS
                        ),
                });

        } catch (reservationError) {

            // Roll back bed hold
            await Room.updateOne(
                {
                    _id: roomId,

                    "beds.bedNumber":
                        bedNumber,
                },
                {
                    $set: {
                        "beds.$.onHold":
                            false,
                    },
                }
            );

            throw reservationError;
        }


        // ---------------------------------------------------
        // WAITLIST MATCH USED
        // ---------------------------------------------------

        matchedEntry.status =
            "allocated";

        matchedEntry.notified =
            true;

        matchedEntry.notificationMessage =
            "You requested the bed successfully. Your reservation request has been sent to the manager.";

        matchedEntry.matchedUntil =
            null;

        await matchedEntry.save();


        console.log(
            `[Waitlist] Student ${studentId} ` +
            `successfully requested room ${roomId}, ` +
            `bed ${bedNumber}. Reservation is pending.`
        );


        return {
            status: 201,

            body: {
                success: true,

                waitlisted: false,

                fromWaitlist: true,

                requested: true,

                message:
                    "Your waitlist priority was used successfully. Reservation request sent to manager.",

                reservation,
            },
        };
    };


// ===========================================================
// CANCEL RESERVATION WHEN BED IS MANUALLY FREED
// ===========================================================

const cancelReservationForFreedBed =
    async (
        roomId,
        bedNumber
    ) => {

        try {
            const reservation =
                await Reservation.findOne({
                    room: roomId,
                    bedNumber,
                    status: "approved",
                });

            if (!reservation) {
                return null;
            }

            reservation.status =
                "cancelled";

            reservation.rejectionReason =
                "Cancelled automatically: bed was marked available by the manager.";

            await reservation.save();

            console.log(
                `[Reservation] Auto-cancelled reservation ${reservation._id} ` +
                `for room ${roomId}, bed ${bedNumber} ` +
                `(manager freed the bed).`
            );

            return reservation;

        } catch (error) {

            console.error(
                "[Reservation] cancelReservationForFreedBed:",
                error.message
            );

            return null;
        }
    };


// ===========================================================
// STUDENT - REQUEST BED
// ===========================================================
// IMPORTANT:
// Function declaration is used intentionally here.
// This prevents the "requestReservation is not defined"
// error when exporting the controller.
// ===========================================================

async function requestReservation(req, res) {

    try {

        // ---------------------------------------------------
        // ROLE CHECK
        // ---------------------------------------------------

        if (
            req.user.role !== "student"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only students can request a bed.",
            });
        }


        // ---------------------------------------------------
        // REQUEST DATA
        // ---------------------------------------------------

        const {
            roomId,
            bedNumber,
        } = req.body;


        // ---------------------------------------------------
        // VALIDATE ROOM
        // ---------------------------------------------------

        if (
            !roomId ||
            !isValidId(roomId)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "A valid room is required.",
            });
        }


        // ---------------------------------------------------
        // VALIDATE BED
        // ---------------------------------------------------

        if (!bedNumber) {
            return res.status(400).json({
                success: false,
                message:
                    "A specific bed must be selected.",
            });
        }


        // ---------------------------------------------------
        // VALIDATE APPLICANT DETAILS
        // ---------------------------------------------------

        const applicantDetailsError =
            validateApplicantDetails(
                req.body.applicantDetails
            );

        if (applicantDetailsError) {
            return res.status(400).json({
                success: false,
                message:
                    applicantDetailsError,
            });
        }


        const applicantDetails =
            sanitizeApplicantDetails(
                req.body.applicantDetails
            );


        // ---------------------------------------------------
        // PROCESS EXPIRED STATES
        // ---------------------------------------------------

        await expireStaleHolds();

        await expireWaitlistMatches();


        // ---------------------------------------------------
        // FIND ROOM
        // ---------------------------------------------------

        const room =
            await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message:
                    "Room not found.",
            });
        }


        // ---------------------------------------------------
        // FIND BED
        // ---------------------------------------------------

        const bed =
            room.beds.find(
                (b) =>
                    b.bedNumber === bedNumber &&
                    !b.isArchived
            );

        if (!bed) {
            return res.status(404).json({
                success: false,
                message:
                    "Bed not found.",
            });
        }


        // ---------------------------------------------------
        // PRIORITY CHECK
        // ---------------------------------------------------

        const priorityEntry =
            await Waitlist.findOne({
                room: room._id,

                bedNumber,

                status: "matched",

                matchedUntil: {
                    $gt: new Date(),
                },
            });


        // Another student has priority
        if (
            priorityEntry &&
            priorityEntry.student.toString() !==
            req.user._id.toString()
        ) {
            return res.status(400).json({
                success: false,

                waitlistPriority: true,

                message:
                    "This bed is currently reserved for the matched waitlist student.",
            });
        }


        // Current student is matched
        const isCurrentMatchedStudent =
            !!priorityEntry;


        // ---------------------------------------------------
        // ACTIVE RESERVATION
        // ---------------------------------------------------

        const activeReservation =
            await Reservation.findOne({
                student:
                    req.user._id,

                status: {
                    $in: [
                        "pending",
                        "approved",
                    ],
                },
            });

        if (activeReservation) {
            return res.status(400).json({
                success: false,
                message:
                    "You already have an active reservation.",
            });
        }


        // ---------------------------------------------------
        // ACTIVE WAITLIST
        // ---------------------------------------------------

        if (
            !isCurrentMatchedStudent
        ) {

            const activeWaitlist =
                await Waitlist.findOne({
                    student:
                        req.user._id,

                    status: {
                        $in: [
                            "waiting",
                            "matched",
                        ],
                    },
                });

            if (activeWaitlist) {
                return res.status(400).json({
                    success: false,
                    message:
                        "You already have an active waitlist request.",
                });
            }
        }


        // ---------------------------------------------------
        // BED OCCUPIED / ON HOLD
        // ---------------------------------------------------

        if (
            bed.occupied ||
            bed.onHold
        ) {

            // Matched student cannot claim unavailable bed
            if (
                isCurrentMatchedStudent
            ) {
                return res.status(409).json({
                    success: false,

                    waitlistPriority: true,

                    message:
                        "This bed is currently unavailable. Please try again when it becomes available.",
                });
            }


            // ------------------------------------------------
            // NORMAL STUDENT JOINS WAITLIST
            // ------------------------------------------------

            const existing =
                await Waitlist.findOne({
                    student:
                        req.user._id,

                    room:
                        room._id,

                    bedNumber,

                    status: {
                        $in: [
                            "waiting",
                            "matched",
                        ],
                    },
                });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message:
                        "You are already on the waitlist for this bed.",
                });
            }


            const waitlistEntry =
                await Waitlist.create({
                    student:
                        req.user._id,

                    room:
                        room._id,

                    bedNumber,

                    budget:
                        req.user.budget ||
                        room.rent,

                    roommatePreference:
                        req.user.roommatePreference ||
                        "",

                    spacePreference:
                        req.user.spacePreference ||
                        null,

                    status:
                        "waiting",

                    notified:
                        false,

                    notificationMessage:
                        "",
                });


            // Calculate position
            const position =
                await Waitlist.countDocuments({
                    room:
                        room._id,

                    bedNumber,

                    status: {
                        $in: [
                            "waiting",
                            "matched",
                        ],
                    },

                    createdAt: {
                        $lte:
                            waitlistEntry.createdAt,
                    },
                });


            return res.status(201).json({
                success: true,

                waitlisted: true,

                message:
                    bed.occupied
                        ? "This bed is occupied. You have been added to the waitlist."
                        : "This bed is currently on hold. You have been added to the waitlist.",

                waitlist: {
                    ...waitlistEntry.toObject(),

                    position,
                },
            });
        }


        // ---------------------------------------------------
        // BED AVAILABLE - MATCHED STUDENT
        // ---------------------------------------------------

        if (
            isCurrentMatchedStudent
        ) {

            const result =
                await claimBedForMatchedStudent(
                    priorityEntry,
                    applicantDetails
                );

            return res
                .status(result.status)
                .json(result.body);
        }


        // ---------------------------------------------------
        // NORMAL STUDENT - CLAIM AVAILABLE BED
        // ---------------------------------------------------

        const claimedRoom =
            await Room.findOneAndUpdate(
                {
                    _id: room._id,

                    beds: {
                        $elemMatch: {
                            bedNumber,

                            occupied: false,

                            onHold: false,

                            isArchived: {
                                $ne: true,
                            },
                        },
                    },
                },
                {
                    $set: {
                        "beds.$.onHold":
                            true,
                    },
                },
                {
                    new: true,
                }
            );


        if (!claimedRoom) {
            return res.status(409).json({
                success: false,

                message:
                    "Another student just requested this bed. Please try again.",
            });
        }


        // ---------------------------------------------------
        // CREATE RESERVATION
        // ---------------------------------------------------

        let reservation;

        try {

            reservation =
                await Reservation.create({
                    student:
                        req.user._id,

                    room:
                        room._id,

                    bedNumber,

                    applicantDetails,

                    status:
                        "pending",

                    holdExpiresAt:
                        new Date(
                            Date.now() +
                            RESERVATION_HOLD_MS
                        ),
                });

        } catch (reservationError) {

            // Roll back bed hold
            await Room.updateOne(
                {
                    _id:
                        room._id,

                    "beds.bedNumber":
                        bedNumber,
                },
                {
                    $set: {
                        "beds.$.onHold":
                            false,
                    },
                }
            );

            throw reservationError;
        }


        // ---------------------------------------------------
        // SUCCESS
        // ---------------------------------------------------

        return res.status(201).json({
            success: true,

            waitlisted: false,

            fromWaitlist: false,

            message:
                "Reservation request sent to manager.",

            reservation,
        });

    } catch (error) {

        console.error(
            "[Reservation] requestReservation:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                error.message,
        });
    }
}


// ===========================================================
// STUDENT - MY RESERVATIONS
// ===========================================================

const getMyReservations =
    async (req, res) => {

        try {

            await expireStaleHolds();

            await expireWaitlistMatches();

            const reservations =
                await Reservation.find({
                    student:
                        req.user._id,
                })
                    .populate("room")
                    .sort({
                        createdAt: -1,
                    });

            return res.json({
                success: true,
                reservations,
            });

        } catch (error) {

            console.error(
                "[Reservation] getMyReservations:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };


// ===========================================================
// MANAGER - ALL RESERVATIONS / RESERVATION HISTORY
// ===========================================================

const getPendingReservations =
    async (req, res) => {

        try {

            if (
                req.user.role !== "manager"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Managers only.",
                });
            }


            await expireStaleHolds();

            await expireWaitlistMatches();


            const reservations =
                await Reservation.find({})
                    .populate("student")
                    .populate("room")
                    .sort({
                        createdAt: -1,
                    });


            return res.json({
                success: true,
                reservations,
            });

        } catch (error) {

            console.error(
                "[Reservation] getPendingReservations:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };


// ===========================================================
// MANAGER - APPROVE RESERVATION
// ===========================================================

const approveReservation =
    async (req, res) => {

        try {

            if (
                req.user.role !== "manager"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Managers only.",
                });
            }


            if (
                !isValidId(
                    req.params.id
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid reservation id.",
                });
            }


            await expireStaleHolds();

            await expireWaitlistMatches();


            const reservation =
                await Reservation.findById(
                    req.params.id
                );


            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Reservation not found.",
                });
            }


            if (
                reservation.status !== "pending"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Reservation has already been processed.",
                });
            }


            if (
                reservation.holdExpiresAt &&
                reservation.holdExpiresAt <=
                new Date()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "This reservation hold has expired.",
                });
            }


            // ------------------------------------------------
            // OCCUPY BED
            // ------------------------------------------------

            const updatedRoom =
                await Room.findOneAndUpdate(
                    {
                        _id:
                            reservation.room,

                        beds: {
                            $elemMatch: {
                                bedNumber:
                                    reservation.bedNumber,

                                onHold: true,

                                occupied: false,

                                isArchived: {
                                    $ne: true,
                                },
                            },
                        },
                    },
                    {
                        $set: {
                            "beds.$.occupied":
                                true,

                            "beds.$.onHold":
                                false,
                        },

                        $inc: {
                            currentOccupancy:
                                1,
                        },
                    },
                    {
                        new: true,
                    }
                );


            if (!updatedRoom) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Bed is no longer available to approve.",
                });
            }


            reservation.status =
                "approved";

            reservation.approvedAt =
                new Date();

            reservation.approvedBy =
                req.user._id;

            await reservation.save();


            // Remove active waitlist
            await Waitlist.deleteMany({
                student:
                    reservation.student,

                status: {
                    $in: [
                        "waiting",
                        "matched",
                    ],
                },
            });


            return res.json({
                success: true,
                message:
                    "Reservation approved successfully.",
            });

        } catch (error) {

            console.error(
                "[Reservation] approveReservation:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };


// ===========================================================
// MANAGER - REJECT RESERVATION
// ===========================================================

const rejectReservation =
    async (req, res) => {

        try {

            if (
                req.user.role !== "manager"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Managers only.",
                });
            }


            if (
                !isValidId(
                    req.params.id
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid reservation id.",
                });
            }


            const { reason } =
                req.body;


            if (
                !reason ||
                !reason.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "A rejection reason is required.",
                });
            }


            await expireStaleHolds();

            await expireWaitlistMatches();


            const reservation =
                await Reservation.findById(
                    req.params.id
                );


            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Reservation not found.",
                });
            }


            if (
                reservation.status !== "pending"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Reservation has already been processed.",
                });
            }


            // ------------------------------------------------
            // RELEASE BED
            // ------------------------------------------------

            await Room.updateOne(
                {
                    _id:
                        reservation.room,

                    "beds.bedNumber":
                        reservation.bedNumber,
                },
                {
                    $set: {
                        "beds.$.onHold":
                            false,
                    },
                }
            );


            reservation.status =
                "rejected";

            reservation.rejectionReason =
                reason.trim();

            await reservation.save();


            // Next waitlist student
            await matchWaitlist(
                reservation.room,
                reservation.bedNumber
            );


            return res.json({
                success: true,
                message:
                    "Reservation rejected. The next waitlist student will receive priority.",
            });

        } catch (error) {

            console.error(
                "[Reservation] rejectReservation:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };


// ===========================================================
// STUDENT - CANCEL RESERVATION
// ===========================================================

const cancelReservation =
    async (req, res) => {

        try {

            if (
                !isValidId(
                    req.params.id
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid reservation id.",
                });
            }


            await expireStaleHolds();

            await expireWaitlistMatches();


            const reservation =
                await Reservation.findById(
                    req.params.id
                );


            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Reservation not found.",
                });
            }


            if (
                reservation.student.toString() !==
                req.user._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Unauthorized.",
                });
            }


            if (
                [
                    "rejected",
                    "cancelled",
                    "expired",
                ].includes(
                    reservation.status
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "This reservation can no longer be cancelled.",
                });
            }


            // ------------------------------------------------
            // APPROVED
            // ------------------------------------------------

            if (
                reservation.status ===
                "approved"
            ) {

                const releasedRoom =
                    await Room.findOneAndUpdate(
                        {
                            _id:
                                reservation.room,

                            beds: {
                                $elemMatch: {
                                    bedNumber:
                                        reservation.bedNumber,

                                    occupied: true,

                                    isArchived: {
                                        $ne: true,
                                    },
                                },
                            },
                        },
                        {
                            $set: {
                                "beds.$.occupied":
                                    false,

                                "beds.$.onHold":
                                    false,
                            },

                            $inc: {
                                currentOccupancy:
                                    -1,
                            },
                        },
                        {
                            new: true,
                        }
                    );


                reservation.status =
                    "cancelled";

                await reservation.save();


                if (releasedRoom) {
                    await matchWaitlist(
                        reservation.room,
                        reservation.bedNumber
                    );
                }


                return res.json({
                    success: true,
                    message:
                        "Reservation cancelled successfully. The next waitlist student will receive priority.",
                });
            }


            // ------------------------------------------------
            // PENDING
            // ------------------------------------------------

            if (
                reservation.status ===
                "pending"
            ) {

                const releasedRoom =
                    await Room.findOneAndUpdate(
                        {
                            _id:
                                reservation.room,

                            beds: {
                                $elemMatch: {
                                    bedNumber:
                                        reservation.bedNumber,

                                    onHold: true,

                                    occupied: false,

                                    isArchived: {
                                        $ne: true,
                                    },
                                },
                            },
                        },
                        {
                            $set: {
                                "beds.$.onHold":
                                    false,
                            },
                        },
                        {
                            new: true,
                        }
                    );


                reservation.status =
                    "cancelled";

                await reservation.save();


                if (releasedRoom) {
                    await matchWaitlist(
                        reservation.room,
                        reservation.bedNumber
                    );
                }


                return res.json({
                    success: true,
                    message:
                        "Reservation cancelled successfully. The next waitlist student will receive priority.",
                });
            }


            return res.status(400).json({
                success: false,
                message:
                    "This reservation cannot be cancelled.",
            });

        } catch (error) {

            console.error(
                "[Reservation] cancelReservation:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };


// ===========================================================
// STUDENT - RESERVATION STATUS
// ===========================================================

const getReservationStatus =
    async (req, res) => {

        try {

            if (
                !isValidId(
                    req.params.roomId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid room id.",
                });
            }


            await expireStaleHolds();

            await expireWaitlistMatches();


            const reservation =
                await Reservation.findOne({
                    student:
                        req.user._id,

                    room:
                        req.params.roomId,

                    status: {
                        $in: [
                            "pending",
                            "approved",
                        ],
                    },
                }).sort({
                    createdAt: -1,
                });


            if (!reservation) {
                return res.json({
                    success: true,
                    status: null,
                });
            }


            return res.json({
                success: true,

                status:
                    reservation.status,

                reservationId:
                    reservation._id,

                bedNumber:
                    reservation.bedNumber,

                holdExpiresAt:
                    reservation.holdExpiresAt ||
                    null,
            });

        } catch (error) {

            console.error(
                "[Reservation] getReservationStatus:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };


// ===========================================================
// EXPORTS
// ===========================================================

module.exports = {

    // Student
    requestReservation,
    getMyReservations,
    getReservationStatus,
    cancelReservation,

    // Manager
    getPendingReservations,
    approveReservation,
    rejectReservation,

    // Waitlist / Jobs
    expireStaleHolds,
    expireWaitlistMatches,
    matchWaitlist,
    hasActiveRequest,
    claimBedForMatchedStudent,

    // Room controller helper
    cancelReservationForFreedBed,

    // Shared helpers
    isValidId,
    WAITLIST_CLAIM_HOURS,
    validateApplicantDetails,
    sanitizeApplicantDetails,
};