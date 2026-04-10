const request = require("supertest");
const express = require("express");

// Import controller
const chatController = require("../src/modules/chat/chat.controller");

// MOCK models
jest.mock("../src/modules/chat/chat.models", () => ({
  Message: {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
  Conversation: {
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

const { Message, Conversation } = require("../src/modules/chat/chat.models");

// Fake Express app
const app = express();
app.use(express.json());

// Fake auth middleware
app.use((req, res, next) => {
  req.user = { id: "user123" };
  next();
});

// Routes for testing
app.post("/chat/send/:conversationId", chatController.sendMessage);
app.get("/chat/messages/:conversationId", chatController.getMessages);
app.post("/chat/conversation", chatController.getOrCreateConversation);

test("should send a message", async () => {
  Message.create.mockResolvedValue({
    _id: "msg1",
    text: "Hello",
    createdAt: new Date(),
  });

  Conversation.findByIdAndUpdate.mockResolvedValue({});

  const res = await request(app)
    .post("/chat/send/conv1")
    .send({
      text: "Hello",
      clientMessageId: "123",
    });

  expect(res.statusCode).toBe(201);
  expect(res.body.success).toBe(true);
  expect(Message.create).toHaveBeenCalled();
});

test("should get messages", async () => {
  Message.find.mockReturnValue({
    sort: jest.fn().mockResolvedValue([
      { text: "Hi" },
      { text: "Hello" },
    ]),
  });

  const res = await request(app).get("/chat/messages/conv1");

  expect(res.statusCode).toBe(200);
  expect(res.body.data.length).toBe(2);
});

test("should create or get conversation", async () => {
  Conversation.findOneAndUpdate.mockResolvedValue({
    _id: "conv1",
  });

  const res = await request(app)
    .post("/chat/conversation")
    .send({
      itemId: "item1",
      ownerId: "user999",
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
});
