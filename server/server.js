const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// Connect MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});