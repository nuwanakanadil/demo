const request = require("supertest");
const express = require("express");

const reviewController = require("../src/modules/review/ownerReview.controller");

// ✅ MOCK MODEL
jest.mock("../src/modules/review/ownerReview.model", () => ({
  find: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));

const OwnerReview = require("../src/modules/review/ownerReview.model");

// ✅ EXPRESS APP
const app = express();
app.use(express.json());

// Fake auth
app.use((req, res, next) => {
  req.user = { id: "user123" };
  next();
});

// Routes
app.get("/reviews/:userId", reviewController.listForOwner);
app.post("/reviews/:userId", reviewController.addForOwner);

// Error handler middleware (must be last)
app.use((err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "You already reviewed this owner for this item (try updating).",
    });
  }
  // fallback
  res.status(500).json({ success: false, message: "Server error" });
});

test("should return reviews with avg rating", async () => {
  OwnerReview.find.mockReturnValue({
    populate: function () { return this; },
    sort: function () {
      return Promise.resolve([
        {
          _id: "1",
          rating: 4,
          comment: "Good",
          createdAt: new Date(),
          reviewerId: { _id: "u1", name: "John" },
          itemId: { _id: "i1", title: "Item1" },
        },
        {
          _id: "2",
          rating: 5,
          comment: "Excellent",
          createdAt: new Date(),
          reviewerId: { _id: "u2", name: "Jane" },
          itemId: { _id: "i2", title: "Item2" },
        },
      ]);
    },
  });

  const res = await request(app).get("/reviews/owner1");

  expect(res.statusCode).toBe(200);
  expect(res.body.data.avgRating).toBe(4.5);
  expect(res.body.data.count).toBe(2);
});

test("should return 0 avg if no reviews", async () => {
  OwnerReview.find.mockReturnValue({
    populate: function () { return this; },
    sort: function () {
      return Promise.resolve([]);
    },
  });

  const res = await request(app).get("/reviews/owner1");

  expect(res.body.data.avgRating).toBe(0);
  expect(res.body.data.count).toBe(0);
});

test("should fail if itemId is missing", async () => {
  const res = await request(app)
    .post("/reviews/owner1")
    .send({ rating: 5, comment: "Nice" });

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe("itemId is required");
});

test("should fail if rating invalid", async () => {
  const res = await request(app)
    .post("/reviews/owner1")
    .send({ rating: 6, comment: "Nice", itemId: "i1" });

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe("Rating must be 1-5");
});

test("should fail if comment empty", async () => {
  const res = await request(app)
    .post("/reviews/owner1")
    .send({ rating: 4, comment: "   ", itemId: "i1" });

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe("Comment is required");
});

test("should prevent self review", async () => {
  const res = await request(app)
    .post("/reviews/user123") // same as logged-in user
    .send({ rating: 4, comment: "Nice", itemId: "i1" });

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe("You cannot review yourself");
});

test("should handle duplicate review error", async () => {
  // Mock to reject with code 11000
  OwnerReview.findOneAndUpdate.mockImplementation(() =>
    Promise.reject({ code: 11000 })
  );

  const res = await request(app)
    .post("/reviews/owner1")
    .send({
      rating: 5,
      comment: "Nice",
      itemId: "i1",
    });

  // Now the controller catches it and returns 409
  expect(res.statusCode).toBe(409);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toMatch(/already reviewed/i);
});