const Waitlist = require("../models/Waitlist");
const Room = require("../models/Room");

/* ===========================================================
   STUDENT - VIEW MY WAITLIST
=========================================================== */

const getWaitlist = async (req, res) => {


    try {


        const waitlist = await Waitlist.find({


            student: req.user._id


        })


        .populate("room")
        .sort({ createdAt: -1 });


        res.json({


            success: true,


            waitlist


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
   STUDENT - VIEW NOTIFICATIONS
=========================================================== */

const getNotifications = async (req, res) => {

    try {

        const notifications = await Waitlist.find({

            student: req.user._id,

            notified: true

        })

        .populate("room")

        .sort({ updatedAt: -1 });

        res.json({

            success: true,

            notifications

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
   MANAGER - FIND MATCHING STUDENTS
=========================================================== */

const findMatchingStudents = async (req, res) => {

    try {

        const room = await Room.findById(req.params.roomId);

        if (!room) {

            return res.status(404).json({

                success: false,

                message: "Room not found."

            });

        }

        const students = await Waitlist.find({

            status: "waiting",

            budget: {

                $gte: room.rent

            }

        }).populate("student");

        res.json({

            success: true,

            students

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {

    getWaitlist,

    getNotifications,

    findMatchingStudents

};