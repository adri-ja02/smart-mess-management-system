const jwt = require("jsonwebtoken");

/* =========================
   GENERATE JWT TOKEN
========================= */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;