const express = require("express");

const router = express.Router();


const upload = require("../middleware/upload.middleware");


const {
    getProfile,
    updateProfile,
    changePassword

}=require("../controllers/profile.controller");


const {
    protect
}=require("../middleware/auth.middleware");





router.get(
    "/",
    protect,
    getProfile
);





router.put(
    "/update",
    protect,
    (req, res, next) => {
        upload.single("profilePhoto")(req, res, (err) => {
            if (err) {
                console.log("MULTER ERROR:", err.message);
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }
            next();
        });
    },
    updateProfile
);





router.put(
    "/change-password",
    protect,
    changePassword
);





module.exports = router;