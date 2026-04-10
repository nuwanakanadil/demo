const request = require("supertest");
const express = require("express");
const crypto = require("crypto");

const authController = require("../src/modules/auth/auth.controller");
const User = require("../src/modules/auth/auth.model");
const mailer = require("../src/utils/mailer");

jest.mock("../src/modules/auth/auth.model");
jest.mock("../src/utils/mailer");

const app = express();
app.use(express.json());

app.post("/register", authController.register);
app.post("/login", authController.login);
app.post("/forgot-password", authController.forgotPassword);
app.post("/reset-password", authController.resetPassword);
app.get("/me", (req, res) => {
  req.user = { _id: "user123", name: "Test", email: "test@test.com", role: "user", isEmailVerified: true };
  authController.me(req, res);
});
app.get("/verify-email", authController.verifyEmail);
app.delete("/delete-me", (req, res, next) => {
  req.user = { id: "user123" };
  authController.deleteMe(req, res, next);
});
app.patch("/update-me", (req, res, next) => {
  req.user = { id: "user123" };
  authController.updateMe(req, res, next);
});

describe("Auth Controller", () => {
  beforeEach(() => jest.clearAllMocks());

  // ----------------- REGISTER -----------------
  describe("register", () => {
    it("should register a user and send verification email", async () => {
      User.findOne.mockResolvedValue(null);
      const saveMock = jest.fn().mockResolvedValue(true);
      User.create.mockResolvedValue({ _id: "123", name: "John", email: "john@test.com", save: saveMock });

      const res = await request(app).post("/register").send({
        name: "John",
        email: "john@test.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(User.create).toHaveBeenCalled();
      expect(saveMock).toHaveBeenCalled();
    });

    it("should fail if email already exists", async () => {
      User.findOne.mockResolvedValue({ email: "john@test.com" });

      const res = await request(app).post("/register").send({
        name: "John",
        email: "john@test.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(400);
    });
  });

  // ----------------- LOGIN -----------------
 describe("login", () => {
  it("should login successfully", async () => {
    const comparePassword = jest.fn().mockResolvedValue(true);

    User.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(), // chainable
      _id: "user123",
      email: "test@test.com",
      name: "Test",
      role: "user",
      isEmailVerified: true,
      accountStatus: "active",
      comparePassword,
    });

    const res = await request(app).post("/login").send({
      email: "test@test.com",
      password: "password123",
    });

    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(comparePassword).toHaveBeenCalled();
  });
});

  // ----------------- FORGOT PASSWORD -----------------
  describe("forgotPassword", () => {
    it("should return success message even if email doesn't exist", async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post("/forgot-password").send({ email: "fake@test.com" });
      expect(res.body.success).toBe(true);
    });
  });

  // ----------------- RESET PASSWORD -----------------
  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ save: saveMock, password: "old" }),
      });

      const res = await request(app).post("/reset-password").send({
        token: "token123",
        newPassword: "newpass123",
        confirmPassword: "newpass123",
      });

      expect(res.body.success).toBe(true);
      expect(saveMock).toHaveBeenCalled();
    });

    it("should fail if passwords do not match", async () => {
      const res = await request(app).post("/reset-password").send({
        token: "token123",
        newPassword: "a",
        confirmPassword: "b",
      });
      expect(res.statusCode).toBe(400);
    });
  });

  // ----------------- GET CURRENT USER -----------------
  describe("me", () => {
    it("should return current user", async () => {
      const res = await request(app).get("/me");
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
    });
  });

  // ----------------- VERIFY EMAIL -----------------
  describe("verifyEmail", () => {
    it("should verify email successfully", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      User.findOne.mockReturnValue({
        save: saveMock,
        isEmailVerified: false,
      });

      const res = await request(app).get("/verify-email").query({ token: "token123" });
      expect(res.body.success).toBe(true);
      expect(saveMock).toHaveBeenCalled();
    });
  });

  // ----------------- DELETE ME -----------------
  describe("deleteMe", () => {
    it("should delete current user", async () => {
      User.findByIdAndDelete.mockResolvedValue(true);

      const res = await request(app).delete("/delete-me");
      expect(res.body.success).toBe(true);
      expect(User.findByIdAndDelete).toHaveBeenCalled();
    });
  });

  // ----------------- UPDATE ME -----------------
  describe("updateMe", () => {
    it("should update name and password", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "user123",
          name: "Old",
          password: "123",
          save: saveMock,
        }),
      });

      const res = await request(app).patch("/update-me").send({
        name: "New Name",
        newPassword: "newpass",
        confirmPassword: "newpass",
      });

      expect(res.body.success).toBe(true);
      expect(saveMock).toHaveBeenCalled();
    });
  });
});