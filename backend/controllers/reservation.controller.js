const Reservation = require("../models/BedReservation");
const Waitlist = require("../models/Waitlist");
const Room = require("../models/Room");

/* =====================================
   STUDENT REQUEST BED
===================================== */

const requestReservation = async (req, res) => {
  try {
    const { roomId, bedNumber } = req.body;

    // Check if room exists
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Check if student already has a reservation
    const existingReservation = await Reservation.findOne({
      student: req.user._id,
      status: {
        $in: ["pending", "approved"],
      },
    });

    if (existingReservation) {
      return res.status(400).json({
        success: false,
        message: "You already have a reservation request.",
      });
    }

    // Check room capacity
    if (room.currentOccupancy >= room.capacity) {

      // Add student to waitlist
      await Waitlist.create({
        student: req.user._id,
        budget: req.user.budget || 0,
        roommatePreference: req.user.roommatePreference || "",
        spacePreference: req.user.spacePreference || "",
      });

      return res.status(200).json({
        success: true,
        message: "Room is full. Added to waitlist.",
      });
    }

    // Create reservation
    const reservation = await Reservation.create({
      student: req.user._id,
      room: roomId,
      bedNumber,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Reservation submitted successfully.",
      reservation,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/* =====================================
   STUDENT VIEW OWN RESERVATIONS
===================================== */

const getMyReservations = async (req, res) => {

  try {

    const reservations = await Reservation.find({
      student: req.user._id,
    })
      .populate("room")
      .populate("student");

    res.status(200).json({
      success: true,
      reservations,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

module.exports = {

  requestReservation,
  getMyReservations,

};

