const request = require("supertest");
const express = require("express");

jest.mock("../src/middlewares/authMiddleware", () => (req, res, next) => {
  req.user = { id: "user123" };
  next();
});

jest.mock("../src/middlewares/uploadMiddleware", () => ({
  single: () => (req, res, next) => {
    if (req.headers["x-test-has-file"] === "true") {
      req.file = { buffer: Buffer.from("fake-image") };
    }
    next();
  },
}));

jest.mock("../src/utils/cloudinaryUpload", () => ({
  uploadBufferToCloudinary: jest.fn(),
}));

const uploadRoutes = require("../src/modules/upload/upload.routes");
const { uploadBufferToCloudinary } = require("../src/utils/cloudinaryUpload");

const app = express();
app.use("/uploads", uploadRoutes);
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

describe("Upload Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject upload requests without an image", async () => {
    const res = await request(app).post("/uploads/image");

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("No image provided");
  });

  it("should upload an image and return Cloudinary metadata", async () => {
    uploadBufferToCloudinary.mockResolvedValue({
      secure_url: "https://cdn.test/item.jpg",
      public_id: "rewear/items/item-1",
    });

    const res = await request(app)
      .post("/uploads/image")
      .set("x-test-has-file", "true");

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({
      url: "https://cdn.test/item.jpg",
      public_id: "rewear/items/item-1",
    });
    expect(uploadBufferToCloudinary).toHaveBeenCalledWith(
      expect.any(Buffer),
      "rewear/items"
    );
  });
});
