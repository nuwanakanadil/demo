jest.mock("../src/modules/auth/auth.model", () => {
  const User = jest.fn();
  User.findOne = jest.fn();
  User.countDocuments = jest.fn();
  User.find = jest.fn();
  User.findOneAndUpdate = jest.fn();
  User.updateMany = jest.fn();
  return User;
});

jest.mock("../src/modules/apparel/apparel.model", () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
  updateMany: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findById: jest.fn(),
}));

jest.mock("../src/modules/review/ownerReview.model", () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock("../src/modules/swap/swap.model", () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
}));

jest.mock("../src/modules/notification/notification.model", () => ({
  create: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
}));

jest.mock("../src/modules/admin/adminAudit.model", () => ({
  create: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
}));

jest.mock("../src/utils/cloudinaryDelete", () => ({
  deleteFromCloudinary: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

const adminController = require("../src/modules/admin/admin.controller");
const User = require("../src/modules/auth/auth.model");
const Apparel = require("../src/modules/apparel/apparel.model");
const OwnerReview = require("../src/modules/review/ownerReview.model");
const Swap = require("../src/modules/swap/swap.model");
const Notification = require("../src/modules/notification/notification.model");
const AdminAudit = require("../src/modules/admin/adminAudit.model");
const { deleteFromCloudinary } = require("../src/utils/cloudinaryDelete");
const bcrypt = require("bcryptjs");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function makePagedSortChain(result) {
  return {
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue(result),
  };
}

function makePopulatePagedChain(result) {
  return {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(result),
  };
}

function makeAuditChain(result) {
  return {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  };
}

describe("Admin Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    User.mockImplementation(function mockUser(data) {
      Object.assign(this, data);
      this._id = data._id || "new-user-id";
      this.save = jest.fn().mockResolvedValue(this);
    });

    AdminAudit.create.mockResolvedValue(true);
    Notification.create.mockResolvedValue(true);
  });

  it("should return a paginated list of users", async () => {
    const req = { query: { page: "2", limit: "1", status: "active" } };
    const res = mockRes();
    const next = jest.fn();

    User.countDocuments.mockResolvedValue(2);
    User.find.mockReturnValue(makePagedSortChain([{ email: "user@test.com" }]));

    await adminController.getAllUsers(req, res, next);

    expect(User.countDocuments).toHaveBeenCalledWith({
      role: "user",
      accountStatus: "active",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        page: 2,
        totalPages: 2,
        totalUsers: 2,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should create a user as an admin", async () => {
    const req = {
      body: {
        name: "Admin Created",
        email: "created@test.com",
        password: "secret123",
        role: "user",
      },
      user: { id: "admin-1" },
    };
    const res = mockRes();
    const next = jest.fn();

    User.findOne.mockResolvedValue(null);
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashed-password");

    await adminController.createUserByAdmin(req, res, next);

    expect(User).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "created@test.com",
        password: "hashed-password",
        role: "user",
      })
    );
    expect(User.mock.instances[0].save).toHaveBeenCalled();
    expect(AdminAudit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: "admin-1",
        action: "CREATE_USER",
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject invalid suspension durations", async () => {
    const req = {
      body: { duration: 5 },
      params: { email: "user@test.com" },
      user: { id: "admin-1" },
    };
    const res = mockRes();
    const next = jest.fn();

    await adminController.suspendUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid duration. Allowed values are 7, 30, or "permanent".',
      })
    );
  });

  it("should suspend a user and block their items", async () => {
    const req = {
      body: { duration: "permanent" },
      params: { email: "user@test.com" },
      user: { id: "admin-1" },
    };
    const res = mockRes();
    const next = jest.fn();

    User.findOneAndUpdate.mockResolvedValue({
      _id: "user-1",
      email: "user@test.com",
    });
    Apparel.updateMany.mockResolvedValue({ acknowledged: true });

    await adminController.suspendUser(req, res, next);

    expect(Apparel.updateMany).toHaveBeenCalledWith(
      { owner: "user-1" },
      { $set: { isBlocked: true } }
    );
    expect(AdminAudit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "BAN_USER",
        targetLabel: "user@test.com",
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should activate a user and unblock their items", async () => {
    const req = {
      params: { email: "user@test.com" },
      user: { id: "admin-1" },
    };
    const res = mockRes();
    const next = jest.fn();

    User.findOneAndUpdate.mockResolvedValue({
      _id: "user-1",
      email: "user@test.com",
    });
    Apparel.updateMany.mockResolvedValue({ acknowledged: true });

    await adminController.activeUser(req, res, next);

    expect(Apparel.updateMany).toHaveBeenCalledWith(
      { owner: "user-1" },
      { $set: { isBlocked: false } }
    );
    expect(AdminAudit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ACTIVATE_USER",
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return paginated items with owner details", async () => {
    const req = { query: { page: "1", limit: "2", blocked: "true" } };
    const res = mockRes();
    const next = jest.fn();

    Apparel.countDocuments.mockResolvedValue(1);
    Apparel.find.mockReturnValue({
      populate: jest.fn().mockReturnValue(
        makePagedSortChain([{ _id: "item-1", title: "Blocked Tee" }])
      ),
    });

    await adminController.getAllItems(req, res, next);

    expect(Apparel.countDocuments).toHaveBeenCalledWith({ isBlocked: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        totalItems: 1,
      })
    );
  });

  it("should update an item block status and notify the owner", async () => {
    const req = {
      params: { id: "item-1" },
      body: { block: true },
      user: { id: "admin-1" },
    };
    const res = mockRes();
    const next = jest.fn();

    Apparel.findByIdAndUpdate.mockResolvedValue({
      _id: "item-1",
      owner: "user-1",
      title: "Grey Hoodie",
    });

    await adminController.updateItemStatus(req, res, next);

    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: "user-1",
        type: "ITEM_BLOCKED",
      })
    );
    expect(AdminAudit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "BLOCK_ITEM",
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should delete an item and remove its images from Cloudinary", async () => {
    const item = {
      _id: "item-1",
      owner: "user-1",
      title: "Removed Tee",
      images: [{ public_id: "img-1" }, { public_id: "img-2" }],
      deleteOne: jest.fn().mockResolvedValue(true),
    };
    const req = {
      params: { id: "item-1" },
      user: { id: "admin-1" },
    };
    const res = mockRes();
    const next = jest.fn();

    Apparel.findById.mockResolvedValue(item);

    await adminController.deleteItem(req, res, next);

    expect(deleteFromCloudinary).toHaveBeenCalledTimes(2);
    expect(item.deleteOne).toHaveBeenCalled();
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: "user-1",
        type: "ITEM_REMOVED",
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return paginated swaps", async () => {
    const req = { query: { page: "1", limit: "10", status: "PENDING" } };
    const res = mockRes();
    const next = jest.fn();

    Swap.countDocuments.mockResolvedValue(1);
    Swap.find.mockReturnValue(makePopulatePagedChain([{ _id: "swap-1" }]));

    await adminController.getAllSwaps(req, res, next);

    expect(Swap.countDocuments).toHaveBeenCalledWith({ status: "PENDING" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        totalSwaps: 1,
      })
    );
  });

  it("should return paginated reviews", async () => {
    const req = { query: { page: "1", limit: "10" } };
    const res = mockRes();
    const next = jest.fn();

    OwnerReview.countDocuments.mockResolvedValue(1);
    OwnerReview.find.mockReturnValue(makePopulatePagedChain([{ _id: "review-1" }]));

    await adminController.getAllReviews(req, res, next);

    expect(OwnerReview.countDocuments).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        totalReviews: 1,
      })
    );
  });

  it("should delete a review", async () => {
    const req = {
      params: { id: "review-1" },
      user: { id: "admin-1" },
    };
    const res = mockRes();
    const next = jest.fn();

    OwnerReview.findByIdAndDelete.mockResolvedValue({
      _id: "review-1",
      comment: "Bad experience",
    });

    await adminController.deleteReview(req, res, next);

    expect(AdminAudit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DELETE_REVIEW",
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should bulk update user status and their item visibility", async () => {
    const req = {
      body: {
        emails: ["one@test.com", "two@test.com"],
        action: "activate",
      },
      user: { id: "admin-1" },
    };
    const res = mockRes();
    const next = jest.fn();

    User.updateMany.mockResolvedValue({ modifiedCount: 2 });
    User.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([
        { _id: "user-1", email: "one@test.com" },
        { _id: "user-2", email: "two@test.com" },
      ]),
    });
    Apparel.updateMany.mockResolvedValue({ modifiedCount: 2 });

    await adminController.bulkUserStatus(req, res, next);

    expect(User.updateMany).toHaveBeenCalled();
    expect(Apparel.updateMany).toHaveBeenCalledWith(
      { owner: { $in: ["user-1", "user-2"] } },
      { $set: { isBlocked: false } }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      modifiedCount: 2,
    });
  });

  it("should bulk block items", async () => {
    const req = {
      body: {
        itemIds: ["item-1", "item-2"],
        block: true,
      },
      user: { id: "admin-1" },
    };
    const res = mockRes();
    const next = jest.fn();

    Apparel.updateMany.mockResolvedValue({ modifiedCount: 2 });

    await adminController.bulkItemBlock(req, res, next);

    expect(Apparel.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ["item-1", "item-2"] } },
      { $set: { isBlocked: true } }
    );
    expect(AdminAudit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "BULK_BLOCK_ITEMS",
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return audit logs", async () => {
    const req = { query: { page: "1", limit: "5", q: "block", action: "BLOCK_ITEM" } };
    const res = mockRes();
    const next = jest.fn();

    AdminAudit.countDocuments.mockResolvedValue(1);
    AdminAudit.find.mockReturnValue(makeAuditChain([{ _id: "log-1" }]));

    await adminController.getAuditLogs(req, res, next);

    expect(AdminAudit.countDocuments).toHaveBeenCalledWith({
      $or: [
        { targetLabel: { $regex: "block", $options: "i" } },
        { action: { $regex: "block", $options: "i" } },
      ],
      action: "BLOCK_ITEM",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        total: 1,
      })
    );
  });

  it("should build the admin dashboard summary", async () => {
    const req = { query: { rangeDays: "7" } };
    const res = mockRes();
    const next = jest.fn();

    User.countDocuments
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4);
    Apparel.countDocuments
      .mockResolvedValueOnce(50)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(6);
    Swap.countDocuments
      .mockResolvedValueOnce(30)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(6)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(4);
    OwnerReview.countDocuments
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    Notification.countDocuments.mockResolvedValueOnce(7);

    Swap.find.mockReturnValue(
      makeAuditChain([
        {
          _id: "swap-1",
          status: "ACCEPTED",
          requester: { name: "Requester" },
          owner: { name: "Owner" },
          updatedAt: new Date("2026-04-10T10:00:00.000Z"),
        },
      ])
    );
    Notification.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        {
          _id: "note-1",
          title: "Apparel Blocked",
          message: "Blocked by admin",
          createdAt: new Date("2026-04-10T09:00:00.000Z"),
        },
      ]),
    });

    await adminController.getAdminDashboard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          totalUsers: 100,
          totalItems: 50,
          totalSwaps: 30,
          totalReviews: 20,
          rangeDays: 7,
        }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
