const mongoose = require("mongoose");
const Logistics = require("../src/modules/logistics/logistics.model");

describe("Logistics Model", () => {
  it("should default logistics status to PENDING", () => {
    const doc = new Logistics({
      swap: new mongoose.Types.ObjectId(),
      requester: new mongoose.Types.ObjectId(),
      owner: new mongoose.Types.ObjectId(),
      method: "MEETUP",
      lastUpdatedBy: new mongoose.Types.ObjectId(),
      lastUpdatedAt: new Date("2026-04-01T00:00:00.000Z"),
    });

    expect(doc.status).toBe("PENDING");
  });

  it("should require swap, participants, method, and audit fields", () => {
    const doc = new Logistics({});
    const error = doc.validateSync();

    expect(error.errors.swap).toBeDefined();
    expect(error.errors.requester).toBeDefined();
    expect(error.errors.owner).toBeDefined();
    expect(error.errors.method).toBeDefined();
    expect(error.errors.lastUpdatedBy).toBeDefined();
    expect(error.errors.lastUpdatedAt).toBeDefined();
  });
});
