const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* =========================
   PROTECT ROUTE MIDDLEWARE
========================= */

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        console.log("===============");
        console.log("Authorization:", authHeader);

        // Check Authorization header
        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token",
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token",
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Get user from database
        const user = await User.findById(
            decoded.id
        ).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // Attach user to request
        req.user = user;

        next();

    } catch (error) {
        console.error(
            "[Auth Middleware]",
            error.message
        );

        return res.status(401).json({
            success: false,
            message: "Not authorized, token failed",
        });
    }
};

module.exports = {
    protect,
};