import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserProfilePage } from "./UserProfile";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

// ✅ MOCK NAVIGATION
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// ✅ MOCK API
jest.mock("../../api/chat.api", () => ({
  listMyConversations: jest.fn(),
  markConversationRead: jest.fn(),
}));

jest.mock("../../api/auth.api", () => ({
  updateMe: jest.fn(),
  deleteMe: jest.fn(),
}));

// ✅ MOCK CHILD COMPONENT
jest.mock("./MyItemsSection", () => ({
  MyItemsSection: () => <div>My Items Section</div>,
}));

const chatApi = require("../../api/chat.api");
const authApi = require("../../api/auth.api");

// ✅ TEST USER
const mockUser = {
  id: "u1",
  name: "John Doe",
  email: "john@test.com",
  role: "user",
  isEmailVerified: true,
};

function renderComponent() {
  return render(
    <BrowserRouter>
      <UserProfilePage user={mockUser} />
    </BrowserRouter>
  );
}

describe("UserProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ----------------------------------
     RENDER USER INFO
  ---------------------------------- */
  test("should render user details", () => {
    renderComponent();

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@test.com")).toBeInTheDocument();
    expect(screen.getByText("USER")).toBeInTheDocument();
  });

  /* ----------------------------------
     LOAD CONVERSATIONS
  ---------------------------------- */
  test("should load conversations", async () => {
    chatApi.listMyConversations.mockResolvedValue({
      data: [
        {
          id: "c1",
          itemId: "item1",
          itemTitle: "Shirt",
          otherUser: { id: "u2", name: "Alice" },
          lastMessage: "Hi",
          unreadCount: 2,
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    renderComponent();

    expect(await screen.findByText(/Alice • Shirt/i)).toBeInTheDocument();
    expect(screen.getByText("Hi")).toBeInTheDocument();
  });

  /* ----------------------------------
     EMPTY STATE
  ---------------------------------- */
  test("should show empty conversations", async () => {
    chatApi.listMyConversations.mockResolvedValue({ data: [] });

    renderComponent();

    expect(await screen.findByText(/No conversations/i)).toBeInTheDocument();
  });

  /* ----------------------------------
     OPEN CHAT
  ---------------------------------- */
  test("should navigate to chat when clicked", async () => {
    chatApi.listMyConversations.mockResolvedValue({
      data: [
        {
          id: "c1",
          itemId: "item1",
          itemTitle: "Shirt",
          otherUser: { id: "u2", name: "Alice" },
          lastMessage: "Hi",
          unreadCount: 1,
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    chatApi.markConversationRead.mockResolvedValue({});

    renderComponent();

    const chatItem = await screen.findByText(/Alice • Shirt/i);

    fireEvent.click(chatItem);

    await waitFor(() => {
      expect(chatApi.markConversationRead).toHaveBeenCalledWith("c1");
      expect(mockNavigate).toHaveBeenCalledWith("/chat/item1/u2");
    });
  });

  /* ----------------------------------
     OPEN UPDATE MODAL
  ---------------------------------- */
  test("should open update modal", () => {
    renderComponent();

    fireEvent.click(screen.getByText(/Update User/i));

    expect(screen.getByText(/Update Profile/i)).toBeInTheDocument();
  });

  /* ----------------------------------
     UPDATE VALIDATION (PASSWORD MISMATCH)
  ---------------------------------- */
  test("should show error when passwords do not match", async () => {
    renderComponent();

    fireEvent.click(screen.getByText(/Update User/i));

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "123456" },
    });

    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByText(/Save Changes/i));

    expect(
      await screen.findByText(/Passwords do not match/i)
    ).toBeInTheDocument();
  });

  /* ----------------------------------
     DELETE ACCOUNT
  ---------------------------------- */
  test("should delete account and redirect", async () => {
    authApi.deleteMe.mockResolvedValue({});

    renderComponent();

    fireEvent.click(screen.getByText(/Delete User/i));

    fireEvent.click(screen.getByText(/Yes, delete everything/i));

    await waitFor(() => {
      expect(authApi.deleteMe).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/register", {
        replace: true,
      });
    });
  });
});