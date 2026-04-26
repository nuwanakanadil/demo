const request = require("supertest");
const express = require("express");

jest.mock("../src/modules/swap/swap.service");
jest.mock("../src/modules/swap/swap.model", () => ({
  findById: jest.fn(),
}));
jest.mock("../src/socket", () => ({
  getIO: jest.fn(),
}));
jest.mock("../src/utils/mailer", () => ({
  sendSwapRequestEmail: jest.fn(),
  sendSwapStatusEmail: jest.fn(),
  sendSwapLogisticsEmail: jest.fn(),
  sendSwapCompletedEmail: jest.fn(),
}));

const swapController = require("../src/modules/swap/swap.controller");
const swapService = require("../src/modules/swap/swap.service");
const Swap = require("../src/modules/swap/swap.model");
const {
  sendSwapRequestEmail,
  sendSwapStatusEmail,
  sendSwapLogisticsEmail,
  sendSwapCompletedEmail,
} = require("../src/utils/mailer");

const USER_ID = "requester1";

function createPopulateChain(result) {
  return {
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  };
}

async function flushAsyncWork() {
  await Promise.resolve();
  await Promise.resolve();
}

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.user = { id: USER_ID, role: "user" };
  next();
});

app.post("/swaps", swapController.createSwap);
app.get("/swaps/incoming", swapController.getIncoming);
app.get("/swaps/outgoing", swapController.getOutgoing);
app.get("/swaps/:id/logistics", swapController.getLogistics);
app.put("/swaps/:id/logistics", swapController.updateLogistics);
app.put("/swaps/:id/accept", swapController.acceptSwap);
app.put("/swaps/:id/reject", swapController.rejectSwap);
app.put("/swaps/:id/complete", swapController.completeSwap);
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

describe("Swap Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FRONTEND_URL = "http://frontend.test";
    jest.spyOn(global, "setImmediate").mockImplementation((fn) => fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should create a swap and queue an owner email", async () => {
    swapService.createSwap.mockResolvedValue({ _id: "swap1", message: "Interested" });
    Swap.findById.mockReturnValue(
      createPopulateChain({
        owner: { email: "owner@test.com", name: "Owner" },
        requester: { name: "Requester" },
        requestedItem: { title: "Vintage Jacket" },
        message: "Interested",
      })
    );

    const res = await request(app).post("/swaps").send({
      requestedItemId: "item-requested",
      offeredItemId: "item-offered",
      message: "Interested",
    });
    await flushAsyncWork();

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(swapService.createSwap).toHaveBeenCalledWith({
      requesterId: USER_ID,
      requestedItemId: "item-requested",
      offeredItemId: "item-offered",
      message: "Interested",
    });
    expect(sendSwapRequestEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "owner@test.com",
        ownerName: "Owner",
        requesterName: "Requester",
        itemName: "Vintage Jacket",
        linkUrl: "http://frontend.test",
      })
    );
  });

  it("should return incoming swaps", async () => {
    swapService.getIncoming.mockResolvedValue([{ _id: "swap1" }]);

    const res = await request(app).get("/swaps/incoming");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(swapService.getIncoming).toHaveBeenCalledWith(USER_ID);
  });

  it("should return outgoing swaps", async () => {
    swapService.getOutgoing.mockResolvedValue([{ _id: "swap2" }]);

    const res = await request(app).get("/swaps/outgoing");

    expect(res.statusCode).toBe(200);
    expect(res.body.data[0]._id).toBe("swap2");
    expect(swapService.getOutgoing).toHaveBeenCalledWith(USER_ID);
  });

  it("should return logistics for the current viewer", async () => {
    swapService.getByIdForViewer.mockResolvedValue({ _id: "swap3" });

    const res = await request(app).get("/swaps/swap3/logistics");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(swapService.getByIdForViewer).toHaveBeenCalledWith({
      swapId: "swap3",
      viewerId: USER_ID,
      viewerRole: "user",
    });
  });

  it("should update logistics and notify the other participant", async () => {
    swapService.updateLogistics.mockResolvedValue({
      _id: "swap4",
      requester: { _id: USER_ID, email: "requester@test.com", name: "Requester" },
      owner: { _id: "owner1", email: "owner@test.com", name: "Owner" },
      logistics: {
        lastUpdatedBy: { name: "Requester" },
        method: "DELIVERY",
        deliveryOption: "Courier",
        trackingRef: "TRACK-123",
        deliveryAddress: "12 Main Street",
        phoneNumber: "0771234567",
      },
    });

    const res = await request(app).put("/swaps/swap4/logistics").send({
      method: "DELIVERY",
      deliveryOption: "Courier",
      trackingRef: "TRACK-123",
      deliveryAddress: "12 Main Street",
      phoneNumber: "0771234567",
    });
    await flushAsyncWork();

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(sendSwapLogisticsEmail).toHaveBeenCalledTimes(1);
    expect(sendSwapLogisticsEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "owner@test.com",
        updatedByName: "Requester",
        trackingRef: "TRACK-123",
        linkUrl: "http://frontend.test/swaps/swap4/logistics",
      })
    );
  });

  it("should accept a swap and notify the requester", async () => {
    swapService.acceptSwap.mockResolvedValue({ _id: "swap5" });
    Swap.findById.mockReturnValue(
      createPopulateChain({
        requester: { email: "requester@test.com", name: "Requester" },
        requestedItem: { title: "Denim Shirt" },
      })
    );

    const res = await request(app).put("/swaps/swap5/accept");
    await flushAsyncWork();

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(sendSwapStatusEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "requester@test.com",
        status: "accepted",
        itemName: "Denim Shirt",
      })
    );
  });

  it("should reject a swap and notify the requester", async () => {
    swapService.rejectSwap.mockResolvedValue({ _id: "swap6" });
    Swap.findById.mockReturnValue(
      createPopulateChain({
        requester: { email: "requester@test.com", name: "Requester" },
        requestedItem: { title: "Summer Dress" },
      })
    );

    const res = await request(app).put("/swaps/swap6/reject");
    await flushAsyncWork();

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(sendSwapStatusEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "requester@test.com",
        status: "rejected",
        itemName: "Summer Dress",
      })
    );
  });

  it("should complete a swap and notify both participants", async () => {
    swapService.completeSwap.mockResolvedValue({ _id: "swap7" });
    Swap.findById.mockReturnValue(
      createPopulateChain({
        _id: "swap7",
        requester: { email: "requester@test.com", name: "Requester" },
        owner: { email: "owner@test.com", name: "Owner" },
        requestedItem: { title: "Requested Item" },
        offeredItem: { title: "Offered Item" },
      })
    );

    const res = await request(app).put("/swaps/swap7/complete");
    await flushAsyncWork();

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(sendSwapCompletedEmail).toHaveBeenCalledTimes(2);
    expect(sendSwapCompletedEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        to: "requester@test.com",
        requestedItemName: "Requested Item",
        offeredItemName: "Offered Item",
      })
    );
    expect(sendSwapCompletedEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        to: "owner@test.com",
        requestedItemName: "Requested Item",
        offeredItemName: "Offered Item",
      })
    );
  });
});
