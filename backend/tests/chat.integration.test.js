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

const app = require("./chatTestApp");
const { Conversation, Message } = require("../src/modules/chat/chat.models");
const User = require("../src/modules/auth/auth.model");
const Apparel = require("../src/modules/apparel/apparel.model");

describe("Chat Integration Tests", () => {
  let owner;
  let buyer;
  let otherUser;
  let item;
  let conversation;

  beforeEach(async () => {
    owner = await User.create({
      name: "Owner User",
      email: "owner-chat@test.com",
      password: "hashedpassword",
      isVerified: true,
    });

    buyer = await User.create({
      name: "Buyer User",
      email: "buyer-chat@test.com",
      password: "hashedpassword",
      isVerified: true,
    });

    otherUser = await User.create({
      name: "Other User",
      email: "other-chat@test.com",
      password: "hashedpassword",
      isVerified: true,
    });

    item = await Apparel.create({
      title: "Winter Coat",
      description: "Warm coat",
      category: "OUTERWEAR",
      size: "L",
      condition: "GOOD",
      owner: owner._id,
      isAvailable: true,
      images: [
        {
          url: "https://example.com/coat.jpg",
          public_id: "test-coat-1",
        },
      ],
    });

    conversation = await Conversation.create({
      itemId: item._id,
      participants: [buyer._id, owner._id],
      conversationKey: `${item._id}:${[String(buyer._id), String(owner._id)]
        .sort()
        .join("_")}`,
      lastMessageText: "",
      lastMessageAt: null,
      lastReadAt: [],
    });
  });

  it("should create or return a conversation", async () => {
    await Conversation.deleteMany({});

    const res = await request(app)
      .post("/api/chats/conversations")
      .set("x-test-user-id", buyer._id.toString())
      .send({
        itemId: item._id.toString(),
        ownerId: owner._id.toString(),
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.itemId).toBe(item._id.toString());
    expect(res.body.data.participants).toHaveLength(2);

    const convos = await Conversation.find({});
    expect(convos).toHaveLength(1);
  });

  it("should not create duplicate conversations for same item + user pair", async () => {
    const res = await request(app)
      .post("/api/chats/conversations")
      .set("x-test-user-id", buyer._id.toString())
      .send({
        itemId: item._id.toString(),
        ownerId: owner._id.toString(),
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const convos = await Conversation.find({});
    expect(convos).toHaveLength(1);
  });

  it("should return messages in ascending order", async () => {
    await Message.create([
      {
        conversationId: conversation._id,
        senderId: buyer._id,
        text: "Hi",
        clientMessageId: "seed-msg-1",
        createdAt: new Date("2026-04-08T10:00:00.000Z"),
      },
      {
        conversationId: conversation._id,
        senderId: owner._id,
        text: "Hello",
        clientMessageId: "seed-msg-2",
        createdAt: new Date("2026-04-08T10:05:00.000Z"),
      },
    ]);

    const res = await request(app)
      .get(`/api/chats/conversations/${conversation._id}/messages`)
      .set("x-test-user-id", buyer._id.toString());

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].text).toBe("Hi");
    expect(res.body.data[1].text).toBe("Hello");
  });

  it("should send a message and update conversation preview", async () => {
    const res = await request(app)
      .post(`/api/chats/conversations/${conversation._id}/messages`)
      .set("x-test-user-id", buyer._id.toString())
      .send({
        text: "Is this still available?",
        clientMessageId: "client-msg-1",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.text).toBe("Is this still available?");
    expect(res.body.data.senderId).toBe(buyer._id.toString());
    expect(res.body.data.clientMessageId).toBe("client-msg-1");

    const updatedConversation = await Conversation.findById(conversation._id);
    expect(updatedConversation.lastMessageText).toBe("Is this still available?");
    expect(updatedConversation.lastMessageAt).not.toBeNull();
  });

  it("should list my conversations with item preview and unread count", async () => {
    const secondConversation = await Conversation.create({
      itemId: item._id,
      participants: [owner._id, otherUser._id],
      conversationKey: `${item._id}:${[String(owner._id), String(otherUser._id)]
        .sort()
        .join("_")}`,
      lastMessageText: "Other chat",
      lastMessageAt: new Date("2026-04-08T11:00:00.000Z"),
      lastReadAt: [],
    });

    await Message.create([
      {
        conversationId: conversation._id,
        senderId: owner._id,
        text: "Hello buyer",
        clientMessageId: "seed-msg-3",
        createdAt: new Date("2026-04-08T10:00:00.000Z"),
      },
      {
        conversationId: conversation._id,
        senderId: buyer._id,
        text: "Hi owner",
        clientMessageId: "seed-msg-4",
        createdAt: new Date("2026-04-08T10:02:00.000Z"),
      },
      {
        conversationId: secondConversation._id,
        senderId: otherUser._id,
        text: "Ignore this",
        clientMessageId: "seed-msg-5",
        createdAt: new Date("2026-04-08T10:03:00.000Z"),
      },
    ]);

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessageText: "Hi owner",
      lastMessageAt: new Date("2026-04-08T10:02:00.000Z"),
    });

    const res = await request(app)
      .get("/api/chats/conversations")
      .set("x-test-user-id", buyer._id.toString());

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);

    const chat = res.body.data[0];
    expect(chat.itemTitle).toBe("Winter Coat");
    expect(chat.otherUser.name).toBe("Owner User");
    expect(chat.lastMessage).toBe("Hi owner");
    expect(chat.unreadCount).toBe(1);
  });

  it("should mark conversation as read", async () => {
    const res = await request(app)
      .post(`/api/chats/conversations/${conversation._id}/read`)
      .set("x-test-user-id", buyer._id.toString());

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedConversation = await Conversation.findById(conversation._id);
    const readRecord = updatedConversation.lastReadAt.find(
      (x) => String(x.userId) === String(buyer._id)
    );

    expect(readRecord).toBeTruthy();
    expect(readRecord.at).not.toBeNull();
  });

  it("should return 404 when marking nonexistent conversation as read", async () => {
    const fakeId = item._id;

    const res = await request(app)
      .post(`/api/chats/conversations/${fakeId}/read`)
      .set("x-test-user-id", buyer._id.toString());

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Conversation not found");
  });

  it("should reject unauthorized chat access when auth header is missing", async () => {
    const res = await request(app).get("/api/chats/conversations");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Unauthorized");
  });
});