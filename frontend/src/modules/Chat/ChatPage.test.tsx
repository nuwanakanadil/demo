import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChatPage } from "./ChatPage";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("../../utils/env", () => ({
  API_BASE_URL: "http://localhost:5000/api",
}));

// ✅ MOCK ROUTER
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    itemId: "item1",
    ownerId: "owner1",
  }),
  useNavigate: () => jest.fn(),
}));

// ✅ MOCK SOCKET.IO
jest.mock("socket.io-client", () => ({
  io: () => ({
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
  }),
}));

// ✅ MOCK APIs
jest.mock("../../api/chat.api", () => ({
  getOrCreateConversation: jest.fn(),
  getMessages: jest.fn(),
  sendMessage: jest.fn(),
  markConversationRead: jest.fn(),
}));

jest.mock("../../api/auth.api", () => ({
  getMe: jest.fn(),
}));

const chatApi = require("../../api/chat.api");
const authApi = require("../../api/auth.api");

function renderComponent() {
  return render(
    <BrowserRouter>
      <ChatPage />
    </BrowserRouter>
  );
}

describe("ChatPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* --------------------------------------------------
     LOAD INITIAL CHAT
  -------------------------------------------------- */
  test("should load chat messages", async () => {
    authApi.getMe.mockResolvedValue({ user: { id: "user123" } });

    chatApi.getOrCreateConversation.mockResolvedValue({
      data: { _id: "conv1" },
    });

    chatApi.getMessages.mockResolvedValue({
      data: [
        {
          _id: "m1",
          text: "Hello",
          senderId: "user123",
          createdAt: new Date().toISOString(),
        },
      ],
    });

    renderComponent();

    expect(await screen.findByText("Hello")).toBeInTheDocument();
  });

  /* --------------------------------------------------
     EMPTY STATE
  -------------------------------------------------- */
  test("should show empty message state", async () => {
    authApi.getMe.mockResolvedValue({ user: { id: "user123" } });

    chatApi.getOrCreateConversation.mockResolvedValue({
      data: { _id: "conv1" },
    });

    chatApi.getMessages.mockResolvedValue({ data: [] });

    renderComponent();

    expect(await screen.findByText(/No messages yet/i)).toBeInTheDocument();
  });

  /* --------------------------------------------------
     SEND MESSAGE
  -------------------------------------------------- */
 test("should send a message", async () => {
  authApi.getMe.mockResolvedValue({ user: { id: "user123" } });

  chatApi.getOrCreateConversation.mockResolvedValue({
    data: { _id: "conv1" },
  });

  chatApi.getMessages.mockResolvedValue({ data: [] });

  chatApi.sendMessage.mockResolvedValue({
    data: {
      _id: "m2",
      text: "Hi there",
      senderId: "user123",
      createdAt: new Date().toISOString(),
    },
  });

  renderComponent();

  const input = await screen.findByPlaceholderText("Type a message...");
  const button = screen.getByRole("button", { name: /send/i });

  // ✅ TYPE FIRST
  fireEvent.change(input, { target: { value: "Hi there" } });

  // ✅ NOW button should be enabled
  await waitFor(() => {
    expect(button).not.toBeDisabled();
  });

  fireEvent.click(button);

  await waitFor(() => {
    expect(chatApi.sendMessage).toHaveBeenCalled();
  });
});

  /* --------------------------------------------------
     PREVENT EMPTY MESSAGE
  -------------------------------------------------- */
  test("should not send empty message", async () => {
    authApi.getMe.mockResolvedValue({ user: { id: "user123" } });

    chatApi.getOrCreateConversation.mockResolvedValue({
      data: { _id: "conv1" },
    });

    chatApi.getMessages.mockResolvedValue({ data: [] });

    renderComponent();

    const button = await screen.findByText(/send/i);

    fireEvent.click(button);

    expect(chatApi.sendMessage).not.toHaveBeenCalled();
  });

  /* --------------------------------------------------
     REDIRECT IF NOT AUTHENTICATED
  -------------------------------------------------- */
  test("should redirect to login if user fetch fails", async () => {
    const navigateMock = jest.fn();

    jest.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(navigateMock);

    authApi.getMe.mockRejectedValue(new Error("Unauthorized"));

    renderComponent();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/login", { replace: true });
    });
  });
});