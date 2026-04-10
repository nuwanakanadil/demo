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

// Mock verified email middleware
jest.mock("../src/middlewares/requireVerifiedEmail", () => {
  return (req, res, next) => next();
});

const app = require("./testApp");
const OwnerReview = require("../src/modules/review/ownerReview.model");
const User = require("../src/modules/auth/auth.model");
const Apparel = require("../src/modules/apparel/apparel.model");

describe("Owner Review Integration Tests", () => {
  let owner;
  let reviewer;
  let secondReviewer;
  let item;
  let secondItem;

  beforeEach(async () => {
    owner = await User.create({
      name: "Owner User",
      email: "owner@test.com",
      password: "hashedpassword",
      isVerified: true,
    });

    reviewer = await User.create({
      name: "Reviewer User",
      email: "reviewer@test.com",
      password: "hashedpassword",
      isVerified: true,
    });

    secondReviewer = await User.create({
      name: "Second Reviewer",
      email: "reviewer2@test.com",
      password: "hashedpassword",
      isVerified: true,
    });

    item = await Apparel.create({
      title: "Vintage Jacket",
      description: "A nice jacket",
      category: "OUTERWEAR",
      size: "M",
      condition: "GOOD",
      owner: owner._id,
      isAvailable: true,
      images: [
        {
          url: "https://example.com/jacket.jpg",
          public_id: "test-jacket-1",
        },
      ],
    });

    secondItem = await Apparel.create({
      title: "Denim Shirt",
      description: "A nice shirt",
      category: "TOP",
      size: "L",
      condition: "GOOD",
      owner: owner._id,
      isAvailable: true,
      images: [
        {
          url: "https://example.com/shirt.jpg",
          public_id: "test-shirt-1",
        },
      ],
    });
  });

  it("should create a new owner review", async () => {
    const res = await request(app)
      .post(`/api/users/${owner._id}/reviews`)
      .set("x-test-user-id", reviewer._id.toString())
      .send({
        itemId: item._id.toString(),
        rating: 5,
        comment: "Very trustworthy owner",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);
    expect(res.body.data.comment).toBe("Very trustworthy owner");
    expect(res.body.data.reviewer.name).toBe("Reviewer User");
    expect(res.body.data.item.title).toBe("Vintage Jacket");

    const saved = await OwnerReview.findOne({
      revieweeId: owner._id,
      reviewerId: reviewer._id,
      itemId: item._id,
    });

    expect(saved).not.toBeNull();
  });

  it("should update existing review for same owner + reviewer + item", async () => {
    await OwnerReview.create({
      revieweeId: owner._id,
      reviewerId: reviewer._id,
      itemId: item._id,
      rating: 3,
      comment: "Initial review",
    });

    const res = await request(app)
      .post(`/api/users/${owner._id}/reviews`)
      .set("x-test-user-id", reviewer._id.toString())
      .send({
        itemId: item._id.toString(),
        rating: 4,
        comment: "Updated review",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(4);
    expect(res.body.data.comment).toBe("Updated review");

    const reviews = await OwnerReview.find({
      revieweeId: owner._id,
      reviewerId: reviewer._id,
      itemId: item._id,
    });

    expect(reviews).toHaveLength(1);
    expect(reviews[0].rating).toBe(4);
    expect(reviews[0].comment).toBe("Updated review");
  });

  it("should return owner review summary", async () => {
    await OwnerReview.create([
      {
        revieweeId: owner._id,
        reviewerId: reviewer._id,
        itemId: item._id,
        rating: 4,
        comment: "Good owner",
      },
      {
        revieweeId: owner._id,
        reviewerId: secondReviewer._id,
        itemId: secondItem._id,
        rating: 5,
        comment: "Excellent owner",
      },
    ]);

    const res = await request(app).get(`/api/users/${owner._id}/reviews`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBe(2);
    expect(res.body.data.avgRating).toBe(4.5);
    expect(res.body.data.reviews).toHaveLength(2);
  });

  it("should return empty summary when owner has no reviews", async () => {
    const res = await request(app).get(`/api/users/${owner._id}/reviews`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.avgRating).toBe(0);
    expect(res.body.data.count).toBe(0);
    expect(res.body.data.reviews).toEqual([]);
  });

  it("should block self review", async () => {
    const res = await request(app)
      .post(`/api/users/${owner._id}/reviews`)
      .set("x-test-user-id", owner._id.toString())
      .send({
        itemId: item._id.toString(),
        rating: 5,
        comment: "Self review",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("You cannot review yourself");
  });

  it("should reject invalid rating", async () => {
    const res = await request(app)
      .post(`/api/users/${owner._id}/reviews`)
      .set("x-test-user-id", reviewer._id.toString())
      .send({
        itemId: item._id.toString(),
        rating: 10,
        comment: "Invalid rating",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Rating must be 1-5");
  });

  it("should reject empty comment", async () => {
    const res = await request(app)
      .post(`/api/users/${owner._id}/reviews`)
      .set("x-test-user-id", reviewer._id.toString())
      .send({
        itemId: item._id.toString(),
        rating: 4,
        comment: "   ",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Comment is required");
  });

  it("should reject missing itemId", async () => {
    const res = await request(app)
      .post(`/api/users/${owner._id}/reviews`)
      .set("x-test-user-id", reviewer._id.toString())
      .send({
        rating: 4,
        comment: "Missing item id",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("itemId is required");
  });

  it("should reject when auth header is missing", async () => {
    const res = await request(app)
      .post(`/api/users/${owner._id}/reviews`)
      .send({
        itemId: item._id.toString(),
        rating: 5,
        comment: "No auth",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Unauthorized");
  });
});