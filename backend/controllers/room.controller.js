const fs = require("fs");
const Room = require("../models/Room");
const cloudinary = require("../utils/cloudinary");
const { withFallbackLayout } = require("../utils/roomLayout");

/* ================= SAFE ROOM FIELDS ================= */

const UPDATABLE_ROOM_FIELDS = [
  "building",
  "floor",
  "roomNumber",
  "messLocation",
  "coordinates",
  "campusCoordinates",
  "rent",
  "totalArea",
  "usableArea",
  "storage",
  "noiseLevel",
  "bathroomType",
  "amenities",
  "utilityPolicy",
  "naturalLightLevel",
  "ventilationNotes",
  "layout",
  "images",
  "roomImages",
];

function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (obj[key] !== undefined) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

/* ================= CREATE ROOM ================= */

exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      room: withFallbackLayout(room.toObject()),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An active room with this number already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= GET ALL ROOMS ================= */

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      isArchived: false,
    }).sort("-createdAt").lean();

    res.json({
      success: true,
      rooms: rooms.map(withFallbackLayout),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= GET ROOM ================= */

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room || room.isArchived) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const responseRoom = withFallbackLayout({
      ...room.toObject(),
      beds: room.beds.filter((bed) => !bed.isArchived),
    });

    res.json({
      success: true,
      room: responseRoom,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= UPDATE ROOM ================= */

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const updates = pick(
      req.body,
      UPDATABLE_ROOM_FIELDS
    );

    Object.assign(room, updates);

    await room.save();

    res.json({
      success: true,
      room,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= ARCHIVE ROOM ================= */

exports.archiveRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      {
        isArchived: true,
      },
      {
        new: true,
      }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      message: "Room deleted",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= IMAGE UPLOAD ================= */

exports.uploadRoomImage = async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.json({
        success: true,
        urls: [],
      });
    }

    const uploaded = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "room-images",
      });

      uploaded.push({
        url: result.secure_url,
        publicId: result.public_id,
        public_id: result.public_id,
      });

      fs.unlink(file.path, () => {});
    }

    if (req.params.id) {
      if (!req.user || !["manager", "admin"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized",
        });
      }

      const room = await Room.findById(req.params.id);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      room.images = [...(room.images || []), ...uploaded];
      await room.save();

      return res.json({
        success: true,
        urls: uploaded,
        room,
      });
    }

    res.json({
      success: true,
      urls: uploaded,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= DELETE IMAGE ================= */

exports.deleteRoomImage = async (req, res) => {
  try {
    const { id, public_id } = req.params;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    await cloudinary.uploader.destroy(public_id);

    room.images = room.images.filter(
      (img) => img.publicId !== public_id && img.public_id !== public_id
    );

    await room.save();

    res.json({
      success: true,
      room,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= ADD BED ================= */

exports.addBed = async (req, res) => {
  try {
    const room = await Room.findById(
      req.params.id
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // ignore archived beds
    const exists = room.beds.find(
      (bed) =>
        bed.bedNumber ===
          req.body.bedNumber &&
        !bed.isArchived
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message:
          "Bed number already exists",
      });
    }

    room.beds.push({
      ...req.body,
      isArchived: false,
    });

    await room.save();

    res.status(201).json({
      success: true,
      room,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= UPDATE BED ================= */

exports.updateBed = async (req, res) => {
  try {
    const room = await Room.findById(
      req.params.id
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const bed = room.beds.id(
      req.params.bedId
    );

    if (!bed || bed.isArchived) {
      return res.status(404).json({
        success: false,
        message: "Bed not found",
      });
    }

    Object.assign(
      bed,
      req.body
    );

    await room.save();

    res.json({
      success: true,
      room,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= ARCHIVE BED ================= */

exports.archiveBed = async (req, res) => {
  try {
    const room = await Room.findById(
      req.params.id
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const bed = room.beds.id(
      req.params.bedId
    );

    if (!bed) {
      return res.status(404).json({
        success: false,
        message: "Bed not found",
      });
    }

    bed.isArchived = true;
    bed.occupied = false;

    await room.save();

    res.json({
      success: true,
      message: "Bed deleted",
      room,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
