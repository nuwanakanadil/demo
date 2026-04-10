import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ProductDetailsPage } from "./ProductDetailsPage";
import * as reactRouter from "react-router-dom";
import * as apparelApi from "../../api/apparel.api";
import * as ownerReviewApi from "../../api/ownerReview.api";

// -------------------------
// MOCK REACT ROUTER
// -------------------------
const mockNavigate = jest.fn();
jest.spyOn(reactRouter, "useNavigate").mockReturnValue(mockNavigate);
jest.spyOn(reactRouter, "useParams").mockReturnValue({ id: "item123" });

// -------------------------
// MOCK API FUNCTIONS
// -------------------------
const fakeItem = {
  id: "item123",
  title: "Cool T-Shirt",
  images: [{ url: "image.jpg" }],
  category: "Apparel",
  size: "M",
  condition: "New",
  isAvailable: true,
  owner: { id: "owner1", name: "Alice" },
  description: "A cool t-shirt",
};

const fakeReviews = {
  data: {
    reviews: [
      {
        id: "r1",
        rating: 5,
        comment: "Great owner!",
        createdAt: "2026-04-08T10:00:00Z",
        reviewer: { id: "u1", name: "Bob" },
        item: { title: "Cool T-Shirt" },
      },
    ],
    avgRating: 5,
    count: 1,
  },
};

jest.spyOn(apparelApi, "getItemById").mockResolvedValue({ data: fakeItem });
jest
  .spyOn(ownerReviewApi, "getOwnerReviews")
  .mockResolvedValue(fakeReviews);
jest.spyOn(ownerReviewApi, "addOwnerReview").mockResolvedValue({});

// -------------------------
// TESTS
// -------------------------
describe("ProductDetailsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    render(<ProductDetailsPage />);
    expect(screen.getByText(/Loading details/i)).toBeInTheDocument();
  });

  it("renders product details after API call", async () => {
    render(<ProductDetailsPage />);
    await waitFor(() => {
      expect(screen.getByText("Cool T-Shirt")).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Apparel")).toBeInTheDocument();
      expect(screen.getByText("M")).toBeInTheDocument();
      expect(screen.getByText("Available")).toBeInTheDocument();
      expect(screen.getByText("A cool t-shirt")).toBeInTheDocument();
    });
  });

  it("renders owner reviews", async () => {
    render(<ProductDetailsPage />);
    await waitFor(() => {
      expect(screen.getByText("Great owner!")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("(1)")).toBeInTheDocument();
    });
  });

  it("navigates to chat page on chat button click", async () => {
    render(<ProductDetailsPage />);
    await waitFor(() => screen.getAllByText(/Chat/i));
    fireEvent.click(screen.getAllByText(/Chat/i)[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/chat/item123/owner1");
  });

  it("validates empty review submission", async () => {
    render(<ProductDetailsPage />);
    await waitFor(() => screen.getByText(/Review this owner/i));

    fireEvent.click(screen.getByText("Add Review"));

    expect(await screen.findByText("Please write a review.")).toBeInTheDocument();
  });

  it("submits a review successfully", async () => {
    render(<ProductDetailsPage />);
    await waitFor(() => screen.getByText(/Review this owner/i));

    const textarea = screen.getByPlaceholderText(
      /Write your experience with this owner/i
    );
    fireEvent.change(textarea, { target: { value: "Nice seller" } });

    fireEvent.click(screen.getByText("Add Review"));

    await waitFor(() => {
      expect(ownerReviewApi.addOwnerReview).toHaveBeenCalledWith(
        "owner1",
        "item123",
        5,
        "Nice seller"
      );
    });
  });
});