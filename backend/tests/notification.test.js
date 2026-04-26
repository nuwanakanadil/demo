const request = require("supertest");
const express = require("express");

const notificationController = require("../src/modules/notification/notification.controller");
const notificationService = require("../src/modules/notification/notification.service");

jest.mock("../src/modules/notification/notification.service");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.user = { id: "user123" };
  next();
});

app.get("/notifications", notificationController.getMyNotifications);
app.get("/notifications/unread-count", notificationController.getUnreadCount);
app.put("/notifications/:id/read", notificationController.markOneRead);
app.put("/notifications/read-all", notificationController.markAllRead);
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

describe("Notification Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should list notifications with parsed query options", async () => {
    notificationService.listMyNotifications.mockResolvedValue([
      { _id: "n1", title: "Swap accepted" },
    ]);

    const res = await request(app).get("/notifications?unread=true&limit=5");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(notificationService.listMyNotifications).toHaveBeenCalledWith(
      "user123",
      { unreadOnly: true, limit: 5 }
    );
  });

  it("should return the unread notification count", async () => {
    notificationService.unreadCount.mockResolvedValue(4);

    const res = await request(app).get("/notifications/unread-count");

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(4);
  });

  it("should mark one notification as read", async () => {
    notificationService.markRead.mockResolvedValue({
      _id: "n1",
      isRead: true,
    });

    const res = await request(app).put("/notifications/n1/read");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(notificationService.markRead).toHaveBeenCalledWith("user123", "n1");
  });

  it("should mark all notifications as read", async () => {
    notificationService.markAllRead.mockResolvedValue({ success: true });

    const res = await request(app).put("/notifications/read-all");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(notificationService.markAllRead).toHaveBeenCalledWith("user123");
  });

  it("should forward service errors to the error handler", async () => {
    notificationService.unreadCount.mockRejectedValue(
      Object.assign(new Error("Count failed"), { statusCode: 503 })
    );

    const res = await request(app).get("/notifications/unread-count");

    expect(res.statusCode).toBe(503);
    expect(res.body.message).toBe("Count failed");
  });
});
