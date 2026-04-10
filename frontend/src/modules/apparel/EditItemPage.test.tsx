// src/modules/apparel/EditItemPage.test.tsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { EditItemPage } from "./EditItemPage";
import api from "../../api/axios";
import { updateItemWithImages } from "../../api/apparel.api";

// Mock the API modules
jest.mock("../../api/axios");
jest.mock("../../api/apparel.api");

describe("EditItemPage", () => {
  const mockItem = {
    id: "item1",
    title: "Test Item",
    category: "TOP",
    size: "M",
    condition: "NEW",
    images: [{ url: "https://placehold.co/800x800/png", public_id: "img1" }],
  };

  beforeEach(() => {
    // Mock api.get to return item details
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockItem } });

    // Mock updateItemWithImages to resolve successfully
    (updateItemWithImages as jest.Mock).mockResolvedValue({});
  });

  it("renders loading state and then form with item data", async () => {
    const onCancel = jest.fn();
    render(<EditItemPage itemId="item1" onCancel={onCancel} />);

    // Check loading first
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    // Wait for item data to load
    await waitFor(() => expect(screen.getByDisplayValue("Test Item")).toBeInTheDocument());

    // Check dropdown values
    expect(screen.getByDisplayValue("Tops")).toBeInTheDocument(); // category mapped from TOP
    expect(screen.getByDisplayValue("M")).toBeInTheDocument(); // size
    expect(screen.getByText("New")).toBeInTheDocument(); // condition button
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const onCancel = jest.fn();
    render(<EditItemPage itemId="item1" onCancel={onCancel} />);

    // Wait for form to load
    await waitFor(() => screen.getByDisplayValue("Test Item"));

    fireEvent.click(screen.getByText(/Cancel/i));
    expect(onCancel).toHaveBeenCalled();
  });

  it("submits updated item when Save Changes is clicked", async () => {
    const onCancel = jest.fn();
    const onSaved = jest.fn();
    render(<EditItemPage itemId="item1" onCancel={onCancel} onSaved={onSaved} />);

    // Wait for form to load
    await waitFor(() => screen.getByDisplayValue("Test Item"));

    // Change title
    fireEvent.change(screen.getByLabelText(/Item Name/i), { target: { value: "Updated Item" } });

    // Click Save
    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => {
      expect(updateItemWithImages).toHaveBeenCalledWith(
        "item1",
        expect.objectContaining({ title: "Updated Item" }),
        [], // no new files
        mockItem.images // existing images
      );
      expect(onSaved).toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalled();
    });
  });

  it("removes an existing image when remove button is clicked", async () => {
    const onCancel = jest.fn();
    render(<EditItemPage itemId="item1" onCancel={onCancel} />);

    await waitFor(() => screen.getByDisplayValue("Test Item"));

    // Remove image
    fireEvent.click(screen.getByText(/Remove/i));

    // Image should no longer be in the document
    expect(screen.queryByAltText("existing")).not.toBeInTheDocument();
  });
});