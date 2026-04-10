// tests/apparel.test.js
const request = require("supertest");
const express = require("express");

const apparelController = require("../src/modules/apparel/apparel.controller");
const apparelService = require("../src/modules/apparel/apparel.service");
const cloudinaryUtils = require("../src/utils/cloudinaryUpload");

// ===================== MOCKS =====================
jest.mock("../src/modules/apparel/apparel.service");
jest.mock("../src/utils/cloudinaryUpload", () => ({
  uploadBufferToCloudinary: jest.fn(),
}));

// ===================== EXPRESS APP =====================
const app = express();
app.use(express.json());

// Fake auth middleware
app.use((req, res, next) => {
  req.user = { id: "user123" };
  next();
});

// Routes
app.post("/apparel", apparelController.create);
app.get("/apparel", apparelController.list);
app.get("/apparel/:id", apparelController.getOne);
app.put("/apparel/:id", apparelController.update);
app.delete("/apparel/:id", apparelController.remove);
app.get("/my-items", apparelController.myItems);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

// ===================== TESTS =====================
describe("Apparel Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("CREATE apparel", () => {
    it("should create an item with uploaded images", async () => {
      // Mock cloudinary
      cloudinaryUtils.uploadBufferToCloudinary.mockResolvedValue({
        secure_url: "http://img.com/1.jpg",
        public_id: "123",
      });

      // Mock service
      apparelService.create.mockResolvedValue({
        _id: "a1",
        title: "Shirt",
        size: "M",
        images: [{ url: "http://img.com/1.jpg", public_id: "123" }],
      });

      const res = await request(app)
        .post("/apparel")
        .send({ title: "Shirt", size: "M", isAvailable: "true" });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Shirt");
    });

    it("should fail if title or size missing", async () => {
      apparelService.create.mockImplementation(() => {
        throw new Error("title and size are required.");
      });

      const res = await request(app).post("/apparel").send({ title: "Shirt" });

      expect(res.statusCode).toBe(500); // service throws generic Error
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/title and size/i);
    });
  });

  describe("LIST apparel", () => {
    it("should return paginated list", async () => {
      apparelService.list.mockResolvedValue({
        items: [{ _id: "a1", title: "Shirt" }],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      });

      const res = await request(app).get("/apparel");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.items.length).toBe(1);
      expect(res.body.pagination.total).toBe(1);
    });
  });

  describe("GET ONE apparel", () => {
    it("should return single item", async () => {
      apparelService.getOne.mockResolvedValue({ _id: "a1", title: "Shirt" });

      const res = await request(app).get("/apparel/a1");

      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe("Shirt");
    });

    it("should fail if not found", async () => {
      apparelService.getOne.mockImplementation(() => {
        throw { statusCode: 404, message: "Item not found." };
      });

      const res = await request(app).get("/apparel/a2");

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("UPDATE apparel", () => {
    it("should update item keeping old images", async () => {
      cloudinaryUtils.uploadBufferToCloudinary.mockResolvedValue({
        secure_url: "http://img.com/2.jpg",
        public_id: "456",
      });

      apparelService.update.mockResolvedValue({
        _id: "a1",
        title: "Updated Shirt",
        images: [{ url: "http://img.com/1.jpg", public_id: "123" }, { url: "http://img.com/2.jpg", public_id: "456" }],
      });

      const res = await request(app)
        .put("/apparel/a1")
        .send({
          title: "Updated Shirt",
          keepImages: JSON.stringify([{ url: "http://img.com/1.jpg", public_id: "123" }]),
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.images.length).toBe(2);
    });

    it("should fail if not owner", async () => {
      apparelService.update.mockImplementation(() => {
        throw { statusCode: 403, message: "You can only update your own item." };
      });

      const res = await request(app)
        .put("/apparel/a1")
        .send({ title: "Updated Shirt" });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE apparel", () => {
    it("should delete item successfully", async () => {
      apparelService.remove.mockResolvedValue(true);

      const res = await request(app).delete("/apparel/a1");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/deleted/i);
    });

    it("should fail if not owner", async () => {
      apparelService.remove.mockImplementation(() => {
        throw { statusCode: 403, message: "You can only delete your own item." };
      });

      const res = await request(app).delete("/apparel/a1");

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("MY ITEMS", () => {
    it("should return items of logged-in user", async () => {
      apparelService.myItems.mockResolvedValue([{ _id: "a1", title: "Shirt" }]);

      const res = await request(app).get("/my-items");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });
});