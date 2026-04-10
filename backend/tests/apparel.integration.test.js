const request = require("supertest");

// Mock auth middleware
jest.mock("../src/middlewares/authMiddleware", () => {
  return (req, res, next) => {
    const testUserId = req.header("x-test-user-id");
    if (!testUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    req.user = { id: testUserId };
    next();
  };
});

// Mock verified-email middleware
jest.mock("../src/middlewares/requireVerifiedEmail", () => {
  return (req, res, next) => next();
});

// Mock upload middleware
jest.mock("../src/middlewares/uploadMiddleware", () => ({
  array: () => (req, res, next) => {
    req.files = [];
    next();
  },
}));

// Mock cloudinary uploader
jest.mock("../src/utils/cloudinaryUpload", () => ({
  uploadBufferToCloudinary: jest.fn(async () => ({
    secure_url: "https://example.com/mock-image.jpg",
    public_id: "mock-public-id",
  })),
}));

const app = require("./apparelTestApp");
const Apparel = require("../src/modules/apparel/apparel.model");
const User = require("../src/modules/auth/auth.model");

describe("Apparel Integration Tests", () => {
  let owner;
  let otherUser;
  let item;

  beforeEach(async () => {
    owner = await User.create({
      name: "Owner User",
      email: "owner-apparel@test.com",
      password: "hashedpassword",
      isVerified: true,
    });

    otherUser = await User.create({
      name: "Other User",
      email: "other-apparel@test.com",
      password: "hashedpassword",
      isVerified: true,
    });

    item = await Apparel.create({
      title: "Blue Hoodie",
      description: "Warm hoodie",
      category: "TOP",
      size: "M",
      condition: "GOOD",
      owner: owner._id,
      isAvailable: true,
      images: [
        {
          url: "https://example.com/hoodie.jpg",
          public_id: "hoodie-1",
        },
      ],
    });
  });

  it("should create a new apparel item", async () => {
    const res = await request(app)
      .post("/api/items")
      .set("x-test-user-id", owner._id.toString())
      .send({
        title: "Black Jacket",
        description: "Stylish jacket",
        category: "OUTERWEAR",
        size: "L",
        condition: "LIKE_NEW",
        isAvailable: "true",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Black Jacket");
    expect(res.body.data.category).toBe("OUTERWEAR");
    expect(res.body.data.size).toBe("L");
    expect(res.body.data.condition).toBe("LIKE_NEW");
    expect(res.body.data.owner).toBe(owner._id.toString());

    const saved = await Apparel.findById(res.body.data._id);
    expect(saved).not.toBeNull();
    expect(saved.title).toBe("Black Jacket");
    expect(saved.isAvailable).toBe(true);
  });

  it("should reject create when title is missing", async () => {
    const res = await request(app)
      .post("/api/items")
      .set("x-test-user-id", owner._id.toString())
      .send({
        description: "Missing title",
        size: "M",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("title and size are required.");
  });

  it("should reject create when size is missing", async () => {
    const res = await request(app)
      .post("/api/items")
      .set("x-test-user-id", owner._id.toString())
      .send({
        title: "Missing Size Item",
        description: "No size",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("title and size are required.");
  });

  it("should list apparel items", async () => {
    const res = await request(app).get("/api/items");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBeGreaterThan(0);
  });

  it("should filter apparel items by category", async () => {
    await Apparel.create({
      title: "Sneakers",
      description: "Comfortable shoes",
      category: "SHOES",
      size: "42",
      condition: "GOOD",
      owner: owner._id,
      isAvailable: true,
      images: [
        {
          url: "https://example.com/shoes.jpg",
          public_id: "shoes-1",
        },
      ],
    });

    const res = await request(app).get("/api/items?category=TOP");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].title).toBe("Blue Hoodie");
  });

  it("should filter apparel items by availability", async () => {
    await Apparel.create({
      title: "Unavailable Coat",
      description: "Not available",
      category: "OUTERWEAR",
      size: "L",
      condition: "GOOD",
      owner: owner._id,
      isAvailable: false,
      images: [
        {
          url: "https://example.com/coat.jpg",
          public_id: "coat-1",
        },
      ],
    });

    const res = await request(app).get("/api/items?available=true");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.items.every((x) => x.isAvailable === true)).toBe(true);
  });

  it("should get one apparel item by id", async () => {
    const res = await request(app).get(`/api/items/${item._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(item._id.toString());
    expect(res.body.data.title).toBe("Blue Hoodie");
  });

  it("should return 404 when apparel item does not exist", async () => {
    const fakeId = "507f1f77bcf86cd799439011";

    const res = await request(app).get(`/api/items/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Item not found.");
  });

  it("should update own apparel item", async () => {
    const res = await request(app)
      .put(`/api/items/${item._id}`)
      .set("x-test-user-id", owner._id.toString())
      .send({
        title: "Updated Blue Hoodie",
        description: "Updated description",
        category: "TOP",
        size: "L",
        condition: "LIKE_NEW",
        isAvailable: "false",
        keepImages: JSON.stringify(item.images),
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Updated Blue Hoodie");
    expect(res.body.data.description).toBe("Updated description");
    expect(res.body.data.size).toBe("L");
    expect(res.body.data.condition).toBe("LIKE_NEW");
    expect(res.body.data.isAvailable).toBe(false);

    const updated = await Apparel.findById(item._id);
    expect(updated.title).toBe("Updated Blue Hoodie");
    expect(updated.isAvailable).toBe(false);
  });

  it("should reject update for another user's apparel item", async () => {
    const res = await request(app)
      .put(`/api/items/${item._id}`)
      .set("x-test-user-id", otherUser._id.toString())
      .send({
        title: "Hacked Item",
        keepImages: JSON.stringify(item.images),
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("You can only update your own item.");
  });

  it("should return 404 when updating nonexistent apparel item", async () => {
    const fakeId = "507f1f77bcf86cd799439011";

    const res = await request(app)
      .put(`/api/items/${fakeId}`)
      .set("x-test-user-id", owner._id.toString())
      .send({
        title: "Updated Missing Item",
        keepImages: JSON.stringify([]),
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Item not found.");
  });

  it("should delete own apparel item", async () => {
    const res = await request(app)
      .delete(`/api/items/${item._id}`)
      .set("x-test-user-id", owner._id.toString());

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Item deleted");

    const deleted = await Apparel.findById(item._id);
    expect(deleted).toBeNull();
  });

  it("should reject delete for another user's apparel item", async () => {
    const res = await request(app)
      .delete(`/api/items/${item._id}`)
      .set("x-test-user-id", otherUser._id.toString());

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("You can only delete your own item.");
  });

  it("should return 404 when deleting nonexistent apparel item", async () => {
    const fakeId = "507f1f77bcf86cd799439011";

    const res = await request(app)
      .delete(`/api/items/${fakeId}`)
      .set("x-test-user-id", owner._id.toString());

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Item not found.");
  });

  it("should return only my items", async () => {
    await Apparel.create({
      title: "Owner Shirt",
      description: "Another owner item",
      category: "TOP",
      size: "S",
      condition: "GOOD",
      owner: owner._id,
      isAvailable: true,
      images: [
        {
          url: "https://example.com/shirt.jpg",
          public_id: "shirt-1",
        },
      ],
    });

    await Apparel.create({
      title: "Other User Item",
      description: "Not mine",
      category: "BOTTOM",
      size: "M",
      condition: "GOOD",
      owner: otherUser._id,
      isAvailable: true,
      images: [
        {
          url: "https://example.com/pants.jpg",
          public_id: "pants-1",
        },
      ],
    });

    const res = await request(app)
      .get("/api/items/me/mine")
      .set("x-test-user-id", owner._id.toString());

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(
      res.body.data.every((x) => String(x.owner) === String(owner._id))
    ).toBe(true);
  });

  it("should reject unauthorized create request", async () => {
    const res = await request(app).post("/api/items").send({
      title: "Unauthorized Item",
      size: "M",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Unauthorized");
  });
});