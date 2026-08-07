const Reservation = require("../models/BedReservation");
const Waitlist = require("../models/Waitlist");
const Room = require("../models/Room");

/* ===========================================================
   WAITLIST MATCHING
=========================================================== */

const matchWaitlist = async (roomId) => {

    const room = await Room.findById(roomId);

    if (!room) return;

    const waitingStudents = await Waitlist.find({
        room: roomId,
        status: "waiting"
    }).populate("student");

    for (const student of waitingStudents) {

        // Budget Check
        if (student.budget < room.rent) {
            continue;
        }

        // Space Preference
        if (
            student.spacePreference &&
            room.usableArea < student.spacePreference
        ) {
            continue;
        }

        // Simple roommate preference
        if (
            student.roommatePreference &&
            room.currentOccupancy > 0
        ) {
            // You can improve this later
        }

        student.status = "matched";
        student.notified = true;
        student.notificationMessage =
            "A room matching your preferences is now available.";

        await student.save();
    }
};

/* ===========================================================
   STUDENT REQUEST RESERVATION
=========================================================== */

const requestReservation = async (req, res) => {

    try {

        const { roomId, bedNumber } = req.body;

// Room is always required
if (!roomId) {
    return res.status(400).json({
        message: "Room is required."
    });


        }

        // Student already has reservation?
        const existingReservation = await Reservation.findOne({

            student: req.user._id,

            status: {
                $in: ["pending", "approved"]
            }

        });

        if (existingReservation) {

            return res.status(400).json({

                success: false,
                message: "You already have an active reservation."

            });

        }

        const room = await Room.findById(roomId);

if (!room) {
    return res.status(404).json({
        message: "Room not found."
    });
}

// If no bed number is sent,
// it means the student should join the waitlist.
if (!bedNumber) {

    const alreadyWaiting = await Waitlist.findOne({
        student: req.user._id,
        room: roomId,
        status: "waiting"
    });

    if (!alreadyWaiting) {

        await Waitlist.create({
            student: req.user._id,
            room: roomId,
            budget: req.user.budget || room.rent,
            roommatePreference:
                req.user.roommatePreference || "",
            spacePreference:
                req.user.spacePreference || "",
            status: "waiting"
        });

    }

    return res.status(200).json({
        success: true,
        waitlisted: true,
        message: "Added to waitlist successfully."
    });
}

const bed = room.beds.find(
    (b) => b.bedNumber === bedNumber
);

if (!bed) {
    return res.status(404).json({
        message: "Bed not found."
    });
}

    const existingPendingReservation = await Reservation.findOne({
room: room._id,
    bedNumber,
    status: "pending"
});

if (existingPendingReservation) {

    const alreadyWaiting = await Waitlist.findOne({
        student: req.user._id,
        room: room._id,
        status: "waiting"
    });

    if (!alreadyWaiting) {

        const newWaitlist = await Waitlist.create({
            student: req.user._id,
            room: room._id,
            budget: req.user.budget || room.rent,
            roommatePreference: req.user.roommatePreference || "",
            spacePreference: req.user.spacePreference || "",
            status: "waiting"
        });

        console.log("WAITLIST CREATED:", newWaitlist);
    }

    return res.status(200).json({
        success: true,
        waitlisted: true,
        message: "Another student has already requested this bed. You have been added to the waitlist."
    });

}
        // Bed occupied → Join Waitlist
        if (bed.occupied) {

            const alreadyWaiting = await Waitlist.findOne({

                student: req.user._id,

                status: "waiting"

            });

            if (!alreadyWaiting) {

            await Waitlist.create({

                student: req.user._id,

                room: room._id,

                budget: req.user.budget || room.rent,

                roommatePreference:
                    req.user.roommatePreference || "",

                spacePreference:
                    req.user.spacePreference || "",

                    status: "waiting"

                });

            }

            return res.status(200).json({

                success: true,

                waitlisted: true,

                message:
                    "Selected bed is occupied. Added to waitlist."

            });

        }

        // Create Pending Reservation
        const reservation = await Reservation.create({

            student: req.user._id,

            room: room._id,

            bedNumber,

            status: "pending"

        });

        return res.status(201).json({

            success: true,

            message:
                "Reservation request sent to manager.",

            reservation

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
/* ===========================================================
   STUDENT - MY RESERVATIONS
=========================================================== */

const getMyReservations = async (req, res) => {

    try {

        const reservations = await Reservation.find({

            student: req.user._id

        })

        .populate("room")
        .sort({ createdAt: -1 });

        res.json({

            success: true,

            reservations

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/* ===========================================================
   MANAGER - VIEW PENDING RESERVATIONS
=========================================================== */

const getPendingReservations = async (req, res) => {

    try {

        const reservations = await Reservation.find({

            status: "pending"

        })

        .populate("student")
        .populate("room")
        .sort({ createdAt: -1 });

        res.json({

            success: true,

            reservations

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
/* ===========================================================
   MANAGER APPROVE RESERVATION
=========================================================== */

const approveReservation = async (req, res) => {

    try {

        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {

            return res.status(404).json({
                success: false,
                message: "Reservation not found."
            });

        }

        if (reservation.status !== "pending") {

            return res.status(400).json({
                success: false,
                message: "Reservation has already been processed."
            });

        }

        const room = await Room.findById(reservation.room);

        if (!room) {

            return res.status(404).json({
                success: false,
                message: "Room not found."
            });

        }

        const bed = room.beds.find(

            b =>
                b.bedNumber === reservation.bedNumber &&
                !b.isArchived

        );

        if (!bed) {

            return res.status(404).json({
                success: false,
                message: "Bed not found."
            });

        }

        if (bed.occupied) {

            return res.status(400).json({
                success: false,
                message: "Bed is already occupied."
            });

        }

        /* Allocate Bed */

        bed.occupied = true;

        room.currentOccupancy += 1;

        await room.save();

        /* Update Reservation */

        reservation.status = "approved";

        reservation.approvedAt = new Date();

        if (req.user) {

            reservation.approvedBy = req.user._id;

        }

        await reservation.save();

        /* Remove student from waitlist */

        await Waitlist.deleteMany({

            student: reservation.student

        });

        res.json({

            success: true,

            message: "Reservation approved successfully."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/* ===========================================================
   MANAGER REJECT RESERVATION
=========================================================== */

const rejectReservation = async (req, res) => {

    try {

        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {

            return res.status(404).json({

                success: false,

                message: "Reservation not found."

            });

        }

        if (reservation.status !== "pending") {

            return res.status(400).json({

                success: false,

                message: "Reservation has already been processed."

            });

        }

        reservation.status = "rejected";

        await reservation.save();

        /* Automatically search waitlist */

        await matchWaitlist(reservation.room);

        res.json({

            success: true,

            message: "Reservation rejected."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
/* ===========================================================
   STUDENT CANCEL RESERVATION
=========================================================== */

const cancelReservation = async (req, res) => {

    try {

        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {

            return res.status(404).json({
                success: false,
                message: "Reservation not found."
            });

        }

        if (reservation.student.toString() !== req.user._id.toString()) {

            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });

        }

        if (reservation.status === "approved") {

            const room = await Room.findById(reservation.room);

            if (room) {

                const bed = room.beds.find(
                    b =>
                        b.bedNumber === reservation.bedNumber &&
                        !b.isArchived
                );

                if (bed) {

                    bed.occupied = false;

                }

                if (room.currentOccupancy > 0) {

                    room.currentOccupancy -= 1;

                }

                await room.save();

                // Notify matching students on the waitlist
                await matchWaitlist(room._id);

            }

        }

        reservation.status = "cancelled";

        await reservation.save();

        res.json({

            success: true,

            message: "Reservation cancelled successfully."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


const getReservationStatus = async (req, res) => {

    try {

        const reservation = await Reservation.findOne({
            student: req.user._id,
            room: req.params.roomId
        });

        if (!reservation) {
            return res.json({
                status: null
            });
        }

        res.json({
            status: reservation.status
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

/* ===========================================================
   EXPORTS
=========================================================== */

module.exports = {

    requestReservation,

    getMyReservations,

    getPendingReservations,

    approveReservation,

    rejectReservation,

    cancelReservation,
    
    getReservationStatus
};