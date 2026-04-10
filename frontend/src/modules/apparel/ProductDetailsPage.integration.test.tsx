import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProductDetailsPage } from "./ProductDetailsPage";

jest.mock("../../api/apparel.api", () => ({
  getItemById: jest.fn(),
}));

jest.mock("../../api/ownerReview.api", () => ({
  getOwnerReviews: jest.fn(),
  addOwnerReview: jest.fn(),
}));

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

import { getItemById } from "../../api/apparel.api";
import { getOwnerReviews, addOwnerReview } from "../../api/ownerReview.api";

describe("ProductDetailsPage review integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderPage(initialPath = "/items/item123") {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/items/:id" element={<ProductDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );
  }

  async function waitForProductTitle() {
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Blue Jacket" })
      ).toBeInTheDocument();
    });
  }

  it("loads product details and owner reviews", async () => {
    (getItemById as jest.Mock).mockResolvedValue({
      data: {
        _id: "item123",
        title: "Blue Jacket",
        images: [{ url: "img.jpg" }],
        category: "Jackets",
        size: "M",
        condition: "Used",
        isAvailable: true,
        owner: {
          _id: "owner1",
          name: "Kasun",
        },
        description: "Nice jacket",
      },
    });

    (getOwnerReviews as jest.Mock).mockResolvedValue({
      data: {
        avgRating: 4.5,
        count: 1,
        reviews: [
          {
            id: "r1",
            rating: 5,
            comment: "Great owner",
            createdAt: "2026-04-08T00:00:00.000Z",
            reviewer: { id: "u1", name: "Nimal" },
            item: { id: "item123", title: "Blue Jacket" },
          },
        ],
      },
    });

    renderPage();

    expect(screen.getByText(/loading details/i)).toBeInTheDocument();

    await waitForProductTitle();

    expect(screen.getAllByText("Kasun").length).toBeGreaterThan(0);
    expect(screen.getByText("Great owner")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(getOwnerReviews).toHaveBeenCalledWith("owner1");
  });

  it("shows empty state when there are no owner reviews", async () => {
    (getItemById as jest.Mock).mockResolvedValue({
      data: {
        _id: "item123",
        title: "Blue Jacket",
        images: [],
        category: "Jackets",
        size: "M",
        condition: "Used",
        isAvailable: true,
        owner: {
          _id: "owner1",
          name: "Kasun",
        },
        description: "Nice jacket",
      },
    });

    (getOwnerReviews as jest.Mock).mockResolvedValue({
      data: {
        avgRating: 0,
        count: 0,
        reviews: [],
      },
    });

    renderPage();

    await waitForProductTitle();

    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
  });

  it("submits a new owner review and refreshes the review list", async () => {
    const user = userEvent.setup();

    (getItemById as jest.Mock).mockResolvedValue({
      data: {
        _id: "item123",
        title: "Blue Jacket",
        images: [],
        category: "Jackets",
        size: "M",
        condition: "Used",
        isAvailable: true,
        owner: {
          _id: "owner1",
          name: "Kasun",
        },
        description: "Nice jacket",
      },
    });

    (getOwnerReviews as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          avgRating: 0,
          count: 0,
          reviews: [],
        },
      })
      .mockResolvedValueOnce({
        data: {
          avgRating: 5,
          count: 1,
          reviews: [
            {
              id: "r1",
              rating: 5,
              comment: "Very reliable owner",
              createdAt: "2026-04-08T00:00:00.000Z",
              reviewer: { id: "u1", name: "Saman" },
              item: { id: "item123", title: "Blue Jacket" },
            },
          ],
        },
      });

    (addOwnerReview as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: "r1",
        rating: 5,
        comment: "Very reliable owner",
      },
    });

    renderPage();

    await waitForProductTitle();

    const textarea = screen.getByPlaceholderText(
      /write your experience with this owner/i
    );

    await user.type(textarea, "Very reliable owner");

    const button = screen.getByRole("button", { name: /add review/i });
    await user.click(button);

    await waitFor(() => {
      expect(addOwnerReview).toHaveBeenCalledWith(
        "owner1",
        "item123",
        5,
        "Very reliable owner"
      );
    });

    await waitFor(() => {
      expect(getOwnerReviews).toHaveBeenCalledTimes(2);
      expect(screen.getByText("Very reliable owner")).toBeInTheDocument();
    });
  });

  it("shows validation behavior when review text is empty", async () => {
    (getItemById as jest.Mock).mockResolvedValue({
      data: {
        _id: "item123",
        title: "Blue Jacket",
        images: [],
        category: "Jackets",
        size: "M",
        condition: "Used",
        isAvailable: true,
        owner: {
          _id: "owner1",
          name: "Kasun",
        },
        description: "Nice jacket",
      },
    });

    (getOwnerReviews as jest.Mock).mockResolvedValue({
      data: {
        avgRating: 0,
        count: 0,
        reviews: [],
      },
    });

    renderPage();

    await waitForProductTitle();

    const button = screen.getByRole("button", { name: /add review/i });
    expect(button).toBeDisabled();
  });

  it("shows backend submit error message", async () => {
    const user = userEvent.setup();

    (getItemById as jest.Mock).mockResolvedValue({
      data: {
        _id: "item123",
        title: "Blue Jacket",
        images: [],
        category: "Jackets",
        size: "M",
        condition: "Used",
        isAvailable: true,
        owner: {
          _id: "owner1",
          name: "Kasun",
        },
        description: "Nice jacket",
      },
    });

    (getOwnerReviews as jest.Mock).mockResolvedValue({
      data: {
        avgRating: 0,
        count: 0,
        reviews: [],
      },
    });

    (addOwnerReview as jest.Mock).mockRejectedValue({
      response: {
        data: {
          message: "You cannot review yourself",
        },
      },
    });

    renderPage();

    await waitForProductTitle();

    const textarea = screen.getByPlaceholderText(
      /write your experience with this owner/i
    );

    await user.type(textarea, "Test review");

    const button = screen.getByRole("button", { name: /add review/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("You cannot review yourself")).toBeInTheDocument();
    });
  });

  it("shows review loading failure message", async () => {
    (getItemById as jest.Mock).mockResolvedValue({
      data: {
        _id: "item123",
        title: "Blue Jacket",
        images: [],
        category: "Jackets",
        size: "M",
        condition: "Used",
        isAvailable: true,
        owner: {
          _id: "owner1",
          name: "Kasun",
        },
        description: "Nice jacket",
      },
    });

    (getOwnerReviews as jest.Mock).mockRejectedValue({
      response: {
        data: {
          message: "Failed to load owner reviews",
        },
      },
    });

    renderPage();

    await waitForProductTitle();

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load owner reviews")
      ).toBeInTheDocument();
    });
  });

  it("shows item loading failure message", async () => {
    (getItemById as jest.Mock).mockRejectedValue({
      response: {
        data: {
          message: "Failed to load item details",
        },
      },
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load item details")
      ).toBeInTheDocument();
    });
  });

  it("navigates to chat page when chat button is clicked", async () => {
    const user = userEvent.setup();

    (getItemById as jest.Mock).mockResolvedValue({
      data: {
        _id: "item123",
        title: "Blue Jacket",
        images: [],
        category: "Jackets",
        size: "M",
        condition: "Used",
        isAvailable: true,
        owner: {
          _id: "owner1",
          name: "Kasun",
        },
        description: "Nice jacket",
      },
    });

    (getOwnerReviews as jest.Mock).mockResolvedValue({
      data: {
        avgRating: 0,
        count: 0,
        reviews: [],
      },
    });

    renderPage();

    await waitForProductTitle();

    const chatButtons = screen.getAllByRole("button", { name: /chat/i });
    await user.click(chatButtons[0]);

    expect(mockedNavigate).toHaveBeenCalledWith("/chat/item123/owner1");
  });

  it("shows owner not found error when submitting a review for unknown owner", async () => {
    const user = userEvent.setup();

    (getItemById as jest.Mock).mockResolvedValue({
      data: {
        _id: "item123",
        title: "Blue Jacket",
        images: [],
        category: "Jackets",
        size: "M",
        condition: "Used",
        isAvailable: true,
        owner: null,
        description: "Nice jacket",
      },
    });

    renderPage();

    await waitForProductTitle();

    const textarea = screen.getByPlaceholderText(
      /write your experience with this owner/i
    );

    await user.type(textarea, "Test review");

    const button = screen.getByRole("button", { name: /add review/i });
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText("Owner not found for this item.")
      ).toBeInTheDocument();
    });

    expect(addOwnerReview).not.toHaveBeenCalled();
  });
});