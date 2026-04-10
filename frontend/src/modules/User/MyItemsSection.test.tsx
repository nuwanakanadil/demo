import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MyItemsSection } from "./MyItemsSection";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

/* --------------------------------------------
   MOCK ROUTER (FIXED)
-------------------------------------------- */
jest.mock("react-router-dom", () => {
  const mockNavigate = jest.fn();

  return {
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
  };
});

/* --------------------------------------------
   MOCK API
-------------------------------------------- */
jest.mock("../../api/apparel.api", () => ({
  getMyItems: jest.fn(),
  deleteItem: jest.fn(),
}));

const apparelApi = require("../../api/apparel.api");

/* --------------------------------------------
   MOCK TYPES MAPPER
-------------------------------------------- */
jest.mock("../../types", () => ({
  mapApparelApiToUi: jest.fn((item) => ({
    id: item._id,
    title: item.title,
    image: "test.jpg",
  })),
}));

/* --------------------------------------------
   MOCK ApparelCard
-------------------------------------------- */
jest.mock("../../components/ApparelCard", () => ({
  ApparelCard: ({ item, onEdit, onDelete, onOpenDetails }: any) => (
    <div>
      <span>{item.title}</span>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
      <button onClick={onOpenDetails}>Open</button>
    </div>
  ),
}));

/* --------------------------------------------
   HELPER
-------------------------------------------- */
function renderComponent() {
  return render(
    <BrowserRouter>
      <MyItemsSection />
    </BrowserRouter>
  );
}

/* --------------------------------------------
   TESTS
-------------------------------------------- */
describe("MyItemsSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should load and display items", async () => {
    apparelApi.getMyItems.mockResolvedValue({
      data: [
        { _id: "1", title: "Shirt" },
        { _id: "2", title: "Jacket" },
      ],
    });

    renderComponent();

    expect(await screen.findByText("Shirt")).toBeInTheDocument();
    expect(screen.getByText("Jacket")).toBeInTheDocument();
  });

  test("should show empty state", async () => {
    apparelApi.getMyItems.mockResolvedValue({ data: [] });

    renderComponent();

    expect(await screen.findByText(/No items yet/i)).toBeInTheDocument();
  });

  test("should show error if API fails", async () => {
    apparelApi.getMyItems.mockRejectedValue({
      response: { data: { message: "Failed API" } },
    });

    renderComponent();

    expect(await screen.findByText("Failed API")).toBeInTheDocument();
  });

  test("should reload items when refresh clicked", async () => {
    apparelApi.getMyItems.mockResolvedValue({
      data: [{ _id: "1", title: "Item1" }],
    });

    renderComponent();

    await screen.findByText("Item1");

    fireEvent.click(screen.getByText(/refresh/i));

    await waitFor(() => {
      expect(apparelApi.getMyItems).toHaveBeenCalledTimes(2);
    });
  });

  test("should navigate to edit page", async () => {
    const { useNavigate } = require("react-router-dom");
    const navigateMock = useNavigate();

    apparelApi.getMyItems.mockResolvedValue({
      data: [{ _id: "1", title: "Item1" }],
    });

    renderComponent();

    fireEvent.click(await screen.findByText("Edit"));

    expect(navigateMock).toHaveBeenCalledWith("/items/1/edit");
  });

  test("should navigate to item details", async () => {
    const { useNavigate } = require("react-router-dom");
    const navigateMock = useNavigate();

    apparelApi.getMyItems.mockResolvedValue({
      data: [{ _id: "1", title: "Item1" }],
    });

    renderComponent();

    fireEvent.click(await screen.findByText("Open"));

    expect(navigateMock).toHaveBeenCalledWith("/items/1");
  });

  test("should delete an item", async () => {
    apparelApi.getMyItems.mockResolvedValue({
      data: [{ _id: "1", title: "Item1" }],
    });

    apparelApi.deleteItem.mockResolvedValue({});

    renderComponent();

    fireEvent.click(await screen.findByText("Delete"));

    fireEvent.click(await screen.findByText(/Yes, delete/i));

    await waitFor(() => {
      expect(apparelApi.deleteItem).toHaveBeenCalledWith("1");
    });
  });

  test("should close delete modal on cancel", async () => {
    apparelApi.getMyItems.mockResolvedValue({
      data: [{ _id: "1", title: "Item1" }],
    });

    renderComponent();

    fireEvent.click(await screen.findByText("Delete"));

    fireEvent.click(await screen.findByText(/cancel/i));

    await waitFor(() => {
      expect(screen.queryByText(/Delete this item/i)).not.toBeInTheDocument();
    });
  });
});