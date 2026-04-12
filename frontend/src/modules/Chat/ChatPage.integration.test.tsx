import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("../../api/chat.api", () => ({
  getOrCreateConversation: jest.fn(),
  getMessages: jest.fn(),
  sendMessage: jest.fn(),
  markConversationRead: jest.fn(),
}));

jest.mock("../../api/auth.api", () => ({
  getMe: jest.fn(),
}));

jest.mock("../../utils/env", () => ({
  API_BASE_URL: "http://localhost:5000/api",
}));

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock("socket.io-client", () => ({
  io: jest.fn(() => mockSocket),
}));

import { ChatPage } from "./ChatPage";
import {
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markConversationRead,
} from "../../api/chat.api";
import { getMe } from "../../api/auth.api";
import { io } from "socket.io-client";

describe("ChatPage integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Storage.prototype.getItem = jest.fn((key: string) => {
      if (key === "token") return "fake-jwt-token";
      return null;
    });

    Storage.prototype.removeItem = jest.fn();

    globalThis.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  function renderPage(initialPath = "/chat/item123/owner1") {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/chat/:itemId/:ownerId" element={<ChatPage />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("loads chat history successfully", async () => {
    (getMe as jest.Mock).mockResolvedValue({
      user: { id: "me1" },
    });

    (getOrCreateConversation as jest.Mock).mockResolvedValue({
      data: { _id: "conv1" },
    });

    (getMessages as jest.Mock).mockResolvedValue({
      data: [
        {
          _id: "m1",
          conversationId: "conv1",
          senderId: "owner1",
          text: "Hello there",
          createdAt: "2026-04-08T10:00:00.000Z",
        },
      ],
    });

    (markConversationRead as jest.Mock).mockResolvedValue({ success: true });

    renderPage();

    expect(screen.getByText(/loading chat/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Hello there")).toBeInTheDocument();
    });

    expect(getMe).toHaveBeenCalled();
    expect(getOrCreateConversation).toHaveBeenCalledWith("item123", "owner1");
    expect(getMessages).toHaveBeenCalledWith("conv1");
    expect(markConversationRead).toHaveBeenCalledWith("conv1");
    expect(io).toHaveBeenCalled();
  });

  it("shows empty state when there are no messages", async () => {
    (getMe as jest.Mock).mockResolvedValue({
      user: { id: "me1" },
    });

    (getOrCreateConversation as jest.Mock).mockResolvedValue({
      data: { _id: "conv1" },
    });

    (getMessages as jest.Mock).mockResolvedValue({
      data: [],
    });

    (markConversationRead as jest.Mock).mockResolvedValue({ success: true });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    });
  });

  it("sends a message successfully", async () => {
    const user = userEvent.setup();

    (getMe as jest.Mock).mockResolvedValue({
      user: { id: "me1" },
    });

    (getOrCreateConversation as jest.Mock).mockResolvedValue({
      data: { _id: "conv1" },
    });

    (getMessages as jest.Mock).mockResolvedValue({
      data: [],
    });

    (markConversationRead as jest.Mock).mockResolvedValue({ success: true });

    (sendMessage as jest.Mock).mockResolvedValue({
      data: {
        _id: "m2",
        conversationId: "conv1",
        senderId: "me1",
        text: "Hi owner",
        createdAt: "2026-04-08T10:05:00.000Z",
        clientMessageId: "mock-client-id",
      },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/type a message/i);
    await user.type(input, "Hi owner");

    const button = screen.getByRole("button", { name: /send/i });
    await user.click(button);

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalled();
    });

    expect(screen.getAllByText("Hi owner").length).toBeGreaterThan(0);
  });

  it("sends message on Enter key", async () => {
    const user = userEvent.setup();

    (getMe as jest.Mock).mockResolvedValue({
      user: { id: "me1" },
    });

    (getOrCreateConversation as jest.Mock).mockResolvedValue({
      data: { _id: "conv1" },
    });

    (getMessages as jest.Mock).mockResolvedValue({
      data: [],
    });

    (markConversationRead as jest.Mock).mockResolvedValue({ success: true });

    (sendMessage as jest.Mock).mockResolvedValue({
      data: {
        _id: "m3",
        conversationId: "conv1",
        senderId: "me1",
        text: "Enter message",
        createdAt: "2026-04-08T10:06:00.000Z",
        clientMessageId: "mock-enter-id",
      },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/type a message/i);
    await user.click(input);
    await user.type(input, "Enter message{enter}");

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalled();
    });
  });

  it("redirects to login when getMe fails", async () => {
    (getMe as jest.Mock).mockRejectedValue(new Error("Unauthorized"));

    renderPage();

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith("token");
      expect(mockedNavigate).toHaveBeenCalledWith("/login", { replace: true });
    });
  });

  it("navigates to items page when route params are missing", async () => {
    (getMe as jest.Mock).mockResolvedValue({
      user: { id: "me1" },
    });

    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <Routes>
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith("/items");
    });
  });

  it("clicks back button", async () => {
    const user = userEvent.setup();

    (getMe as jest.Mock).mockResolvedValue({
      user: { id: "me1" },
    });

    (getOrCreateConversation as jest.Mock).mockResolvedValue({
      data: { _id: "conv1" },
    });

    (getMessages as jest.Mock).mockResolvedValue({
      data: [],
    });

    (markConversationRead as jest.Mock).mockResolvedValue({ success: true });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    });

    const backButton = screen.getByRole("button", { name: /back/i });
    await user.click(backButton);

    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });
});