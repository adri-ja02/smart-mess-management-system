const adminMiddleware = (req, res, next) => {
  try {
    // must be logged in first (auth.middleware must run before this)
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    // check role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
      });
    }

    // allow request
    next();

  } catch (error) {
    return res.status(500).json({
      message: "Server error in admin middleware",
    });
  }
};

module.exports = adminMiddleware;