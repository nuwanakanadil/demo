const mongoose = require("mongoose");

let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    retryCount = 0;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);

    if (process.env.NODE_ENV !== "test" && retryCount < MAX_RETRIES) {
      retryCount += 1;
      console.log(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000} seconds... (${retryCount}/${MAX_RETRIES})`);
      setTimeout(() => {
        void connectDB();
      }, RETRY_DELAY_MS);
    }
  }
};

module.exports = connectDB;
