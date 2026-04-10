import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddItemPage } from "./AddItemPage";
import "@testing-library/jest-dom";

/* --------------------------------------------
   MOCK API
-------------------------------------------- */
jest.mock("../../api/apparel.api", () => ({
  createItemWithImages: jest.fn(),
}));

const apparelApi = require("../../api/apparel.api");

/* --------------------------------------------
   MOCK ICONS (lucide-react)
-------------------------------------------- */
jest.mock("lucide-react", () => ({
  ImagePlus: () => <div>ImageIcon</div>,
  CheckCircle: () => <div>CheckIcon</div>,
  ArrowLeft: () => <div>BackIcon</div>,
}));

/* --------------------------------------------
   MOCK category/condition mappings
-------------------------------------------- */
jest.mock("./apparelMappings", () => ({
  categoryToApi: {
    Tops: "TOPS",
  },
  conditionToApi: {
    Good: "GOOD",
  },
}));

/* --------------------------------------------
   HELPER
-------------------------------------------- */
const onSubmitMock = jest.fn();
const onCancelMock = jest.fn();

function renderComponent() {
  return render(
    <AddItemPage onSubmit={onSubmitMock} onCancel={onCancelMock} />
  );
}

/* --------------------------------------------
   TESTS
-------------------------------------------- */
describe("AddItemPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* --------------------------------------------
     RENDER FORM
  -------------------------------------------- */
  test("should render form fields", () => {
    renderComponent();

    expect(screen.getByText(/List a New Item/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Vintage Denim Jacket/i)).toBeInTheDocument();
    expect(screen.getByText(/Category/i)).toBeInTheDocument();
    expect(screen.getByText(/Size/i)).toBeInTheDocument();
  });

  /* --------------------------------------------
     VALIDATION
  -------------------------------------------- */
  test("should show validation errors if form empty", async () => {
    renderComponent();

    const submitBtn = screen.getByText(/List Item for Swap/i);

    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Item name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/At least one image is required/i)).toBeInTheDocument();
  });

  /* --------------------------------------------
     IMAGE UPLOAD
  -------------------------------------------- */
  test("should handle image upload", async () => {
    renderComponent();

    const file = new File(["test"], "test.png", { type: "image/png" });

    const input = screen.getByLabelText(/Images/i);

    fireEvent.change(input, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByAltText(/Preview 0/i)).toBeInTheDocument();
    });
  });

  /* --------------------------------------------
     SUCCESS SUBMIT
  -------------------------------------------- */
  test("should submit form successfully", async () => {
    apparelApi.createItemWithImages.mockResolvedValue({
      data: { id: "1", title: "Test Item" },
    });

    renderComponent();

    // fill name
    fireEvent.change(screen.getByPlaceholderText(/Vintage Denim Jacket/i), {
      target: { value: "Test Item" },
    });

    // upload file
    const file = new File(["test"], "test.png", { type: "image/png" });

    fireEvent.change(screen.getByLabelText(/Images/i), {
      target: { files: [file] },
    });

    // submit
    fireEvent.click(screen.getByText(/List Item for Swap/i));

    await waitFor(() => {
      expect(apparelApi.createItemWithImages).toHaveBeenCalled();
    });

    expect(onSubmitMock).toHaveBeenCalled();

    // success UI
    expect(await screen.findByText(/Item Listed Successfully/i)).toBeInTheDocument();
  });

  /* --------------------------------------------
     API ERROR
  -------------------------------------------- */
  test("should show API error if request fails", async () => {
    apparelApi.createItemWithImages.mockRejectedValue({
      response: { data: { message: "API failed" } },
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Vintage Denim Jacket/i), {
      target: { value: "Test Item" },
    });

    const file = new File(["test"], "test.png", { type: "image/png" });

    fireEvent.change(screen.getByLabelText(/Images/i), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByText(/List Item for Swap/i));

    expect(await screen.findByText("API failed")).toBeInTheDocument();
  });

  /* --------------------------------------------
     RESET AFTER SUCCESS
  -------------------------------------------- */
  test("should reset form when clicking 'Add Another Item'", async () => {
    apparelApi.createItemWithImages.mockResolvedValue({
      data: { id: "1" },
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Vintage Denim Jacket/i), {
      target: { value: "Test Item" },
    });

    const file = new File(["test"], "test.png", { type: "image/png" });

    fireEvent.change(screen.getByLabelText(/Images/i), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByText(/List Item for Swap/i));

    await screen.findByText(/Item Listed Successfully/i);

    fireEvent.click(screen.getByText(/Add Another Item/i));

    expect(screen.getByPlaceholderText(/Vintage Denim Jacket/i)).toHaveValue("");
  });

  /* --------------------------------------------
     CANCEL BUTTON
  -------------------------------------------- */
  test("should call onCancel when cancel clicked", () => {
    renderComponent();

    fireEvent.click(screen.getAllByText(/Cancel/i)[0]);

    expect(onCancelMock).toHaveBeenCalled();
  });
});