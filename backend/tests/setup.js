const mongoose = require("mongoose");
const connectDB = require("../src/config/db");

require("dotenv").config({ path: ".env.test" });

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});