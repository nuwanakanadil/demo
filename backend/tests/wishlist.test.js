const request = require("supertest");
const express = require("express");

const wishlistController = require("../src/modules/wishlist/wishlist.controller");
const Apparel = require("../src/modules/apparel/apparel.model");
const Wishlist = require("../src/modules/wishlist/wishlist.model");

jest.mock("../src/modules/apparel/apparel.model");
jest.mock("../src/modules/wishlist/wishlist.model");

const USER_ID = "507f1f77bcf86cd799439011";
const OTHER_USER_ID = "507f1f77bcf86cd799439012";
const ITEM_ID = "507f1f77bcf86cd799439013";

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.user = { id: USER_ID };
  next();
});

app.get("/wishlist", wishlistController.getWishlist);
app.post("/wishlist/items/:itemId", wishlistController.addWishlistItem);
app.delete("/wishlist/items/:itemId", wishlistController.removeWishlistItem);
app.get("/wishlist/searches", wishlistController.getSavedSearches);
app.post("/wishlist/searches", wishlistController.addSavedSearch);
app.delete("/wishlist/searches/:id", wishlistController.deleteSavedSearch);
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

describe("Wishlist Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return wishlist items without null entries", async () => {
    Wishlist.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue({
        itemIds: [null, { _id: ITEM_ID, title: "Blue Shirt" }],
      }),
    });

    const res = await request(app).get("/wishlist");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Blue Shirt");
  });

  it("should add an item to the wishlist", async () => {
    Apparel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: ITEM_ID,
        owner: OTHER_USER_ID,
      }),
    });
    Wishlist.findOneAndUpdate.mockResolvedValue({
      itemIds: [ITEM_ID],
    });

    const res = await request(app).post(`/wishlist/items/${ITEM_ID}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Item saved to wishlist.");
    expect(Wishlist.findOneAndUpdate).toHaveBeenCalledWith(
      { user: USER_ID },
      expect.objectContaining({
        $setOnInsert: { user: USER_ID },
      }),
      { upsert: true, new: true }
    );
  });

  it("should reject invalid wishlist item ids", async () => {
    const res = await request(app).post("/wishlist/items/not-a-valid-id");

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid item id.");
  });

  it("should prevent users from saving their own items", async () => {
    Apparel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: ITEM_ID,
        owner: USER_ID,
      }),
    });

    const res = await request(app).post(`/wishlist/items/${ITEM_ID}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("You cannot save your own item.");
  });

  it("should remove an item from the wishlist", async () => {
    Wishlist.findOneAndUpdate.mockResolvedValue({
      itemIds: [],
    });

    const res = await request(app).delete(`/wishlist/items/${ITEM_ID}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Item removed from wishlist.");
    expect(Wishlist.findOneAndUpdate).toHaveBeenCalledWith(
      { user: USER_ID },
      expect.objectContaining({
        $pull: expect.any(Object),
      }),
      { new: true }
    );
  });

  it("should sort saved searches by newest first", async () => {
    Wishlist.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        savedSearches: [
          { _id: "old", name: "Old", createdAt: "2026-04-01T00:00:00.000Z" },
          { _id: "new", name: "New", createdAt: "2026-04-10T00:00:00.000Z" },
        ],
      }),
    });

    const res = await request(app).get("/wishlist/searches");

    expect(res.statusCode).toBe(200);
    expect(res.body.data.map((x) => x.name)).toEqual(["New", "Old"]);
  });

  it("should create a saved search and normalize missing filters", async () => {
    const wishlist = {
      savedSearches: [],
      save: jest.fn().mockResolvedValue(true),
    };

    Wishlist.findOne.mockResolvedValue(null);
    Wishlist.create.mockResolvedValue(wishlist);

    const res = await request(app).post("/wishlist/searches").send({
      name: "My search",
      filters: { category: "TOP" },
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(wishlist.savedSearches[0]).toEqual(
      expect.objectContaining({
        name: "My search",
        filters: {
          category: "TOP",
          size: "all",
          condition: "all",
          dateFrom: "",
          dateTo: "",
        },
      })
    );
    expect(wishlist.save).toHaveBeenCalled();
  });

  it("should reject saved searches without a name", async () => {
    const res = await request(app).post("/wishlist/searches").send({
      name: "   ",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Search name is required.");
  });

  it("should delete a saved search", async () => {
    const wishlist = {
      savedSearches: [
        { _id: "search-1", name: "Keep" },
        { _id: "search-2", name: "Delete" },
      ],
      save: jest.fn().mockResolvedValue(true),
    };

    Wishlist.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(wishlist),
    });

    const res = await request(app).delete("/wishlist/searches/search-2");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(wishlist.savedSearches).toHaveLength(1);
    expect(wishlist.savedSearches[0].name).toBe("Keep");
  });

  it("should return 404 when deleting a missing saved search", async () => {
    const wishlist = {
      savedSearches: [{ _id: "search-1", name: "Only one" }],
      save: jest.fn().mockResolvedValue(true),
    };

    Wishlist.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(wishlist),
    });

    const res = await request(app).delete("/wishlist/searches/search-2");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Saved search not found.");
  });
});
