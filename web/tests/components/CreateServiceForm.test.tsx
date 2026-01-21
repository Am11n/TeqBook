/**
 * CreateServiceForm Component Tests
 * Task Group 24: Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreateServiceForm } from "@/components/services/CreateServiceForm";
import { mockServiceFormTranslations } from "./test-utils";

// Mock the useCreateService hook
vi.mock("@/lib/hooks/services/useCreateService", () => ({
  useCreateService: vi.fn(() => ({
    name: "",
    setName: vi.fn(),
    category: "",
    setCategory: vi.fn(),
    duration: 30,
    setDuration: vi.fn(),
    price: 0,
    setPrice: vi.fn(),
    sortOrder: 0,
    setSortOrder: vi.fn(),
    saving: false,
    error: null,
    handleSubmit: vi.fn((e) => e.preventDefault()),
  })),
}));

import { useCreateService } from "@/lib/hooks/services/useCreateService";

describe("CreateServiceForm", () => {
  const translations = mockServiceFormTranslations();
  const defaultProps = {
    onServiceCreated: vi.fn(),
    translations,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to default state
    vi.mocked(useCreateService).mockReturnValue({
      name: "",
      setName: vi.fn(),
      category: "",
      setCategory: vi.fn(),
      duration: 30,
      setDuration: vi.fn(),
      price: 0,
      setPrice: vi.fn(),
      sortOrder: 0,
      setSortOrder: vi.fn(),
      saving: false,
      error: null,
      handleSubmit: vi.fn((e) => e.preventDefault()),
    });
  });

  describe("Rendering", () => {
    it("should render form title", () => {
      render(<CreateServiceForm {...defaultProps} />);
      expect(screen.getByRole("heading", { name: "New Service" })).toBeInTheDocument();
    });

    it("should render all form fields", () => {
      render(<CreateServiceForm {...defaultProps} />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort order/i)).toBeInTheDocument();
    });

    it("should render category dropdown with options", () => {
      render(<CreateServiceForm {...defaultProps} />);

      const categorySelect = screen.getByLabelText(/category/i);
      expect(categorySelect).toBeInTheDocument();

      // Check category options
      expect(screen.getByRole("option", { name: "Other" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Cut" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Beard" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Color" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Nails" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Massage" })).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(<CreateServiceForm {...defaultProps} />);
      expect(screen.getByRole("button", { name: "New Service" })).toBeInTheDocument();
    });
  });

  describe("Form Interaction", () => {
    it("should call setName when name input changes", () => {
      const setName = vi.fn();
      vi.mocked(useCreateService).mockReturnValue({
        name: "",
        setName,
        category: "",
        setCategory: vi.fn(),
        duration: 30,
        setDuration: vi.fn(),
        price: 0,
        setPrice: vi.fn(),
        sortOrder: 0,
        setSortOrder: vi.fn(),
        saving: false,
        error: null,
        handleSubmit: vi.fn((e) => e.preventDefault()),
      });

      render(<CreateServiceForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.change(nameInput, { target: { value: "Haircut" } });

      expect(setName).toHaveBeenCalledWith("Haircut");
    });

    it("should call setCategory when category is selected", () => {
      const setCategory = vi.fn();
      vi.mocked(useCreateService).mockReturnValue({
        name: "",
        setName: vi.fn(),
        category: "",
        setCategory,
        duration: 30,
        setDuration: vi.fn(),
        price: 0,
        setPrice: vi.fn(),
        sortOrder: 0,
        setSortOrder: vi.fn(),
        saving: false,
        error: null,
        handleSubmit: vi.fn((e) => e.preventDefault()),
      });

      render(<CreateServiceForm {...defaultProps} />);

      const categorySelect = screen.getByLabelText(/category/i);
      fireEvent.change(categorySelect, { target: { value: "cut" } });

      expect(setCategory).toHaveBeenCalledWith("cut");
    });

    it("should call setDuration when duration input changes", () => {
      const setDuration = vi.fn();
      vi.mocked(useCreateService).mockReturnValue({
        name: "",
        setName: vi.fn(),
        category: "",
        setCategory: vi.fn(),
        duration: 30,
        setDuration,
        price: 0,
        setPrice: vi.fn(),
        sortOrder: 0,
        setSortOrder: vi.fn(),
        saving: false,
        error: null,
        handleSubmit: vi.fn((e) => e.preventDefault()),
      });

      render(<CreateServiceForm {...defaultProps} />);

      const durationInput = screen.getByLabelText(/duration/i);
      fireEvent.change(durationInput, { target: { value: "45" } });

      expect(setDuration).toHaveBeenCalledWith(45);
    });

    it("should call setPrice when price input changes", () => {
      const setPrice = vi.fn();
      vi.mocked(useCreateService).mockReturnValue({
        name: "",
        setName: vi.fn(),
        category: "",
        setCategory: vi.fn(),
        duration: 30,
        setDuration: vi.fn(),
        price: 0,
        setPrice,
        sortOrder: 0,
        setSortOrder: vi.fn(),
        saving: false,
        error: null,
        handleSubmit: vi.fn((e) => e.preventDefault()),
      });

      render(<CreateServiceForm {...defaultProps} />);

      const priceInput = screen.getByLabelText(/price/i);
      fireEvent.change(priceInput, { target: { value: "35000" } });

      expect(setPrice).toHaveBeenCalledWith(35000);
    });
  });

  describe("Form Submission", () => {
    it("should call handleSubmit when form is submitted", () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      vi.mocked(useCreateService).mockReturnValue({
        name: "Haircut",
        setName: vi.fn(),
        category: "cut",
        setCategory: vi.fn(),
        duration: 30,
        setDuration: vi.fn(),
        price: 35000,
        setPrice: vi.fn(),
        sortOrder: 0,
        setSortOrder: vi.fn(),
        saving: false,
        error: null,
        handleSubmit,
      });

      render(<CreateServiceForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: "New Service" });
      fireEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("should disable submit button when saving", () => {
      vi.mocked(useCreateService).mockReturnValue({
        name: "Haircut",
        setName: vi.fn(),
        category: "cut",
        setCategory: vi.fn(),
        duration: 30,
        setDuration: vi.fn(),
        price: 35000,
        setPrice: vi.fn(),
        sortOrder: 0,
        setSortOrder: vi.fn(),
        saving: true,
        error: null,
        handleSubmit: vi.fn(),
      });

      render(<CreateServiceForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: "…" });
      expect(submitButton).toBeDisabled();
    });

    it("should show ellipsis text when saving", () => {
      vi.mocked(useCreateService).mockReturnValue({
        name: "Haircut",
        setName: vi.fn(),
        category: "cut",
        setCategory: vi.fn(),
        duration: 30,
        setDuration: vi.fn(),
        price: 35000,
        setPrice: vi.fn(),
        sortOrder: 0,
        setSortOrder: vi.fn(),
        saving: true,
        error: null,
        handleSubmit: vi.fn(),
      });

      render(<CreateServiceForm {...defaultProps} />);

      expect(screen.getByRole("button", { name: "…" })).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should display error message when error exists", () => {
      vi.mocked(useCreateService).mockReturnValue({
        name: "",
        setName: vi.fn(),
        category: "",
        setCategory: vi.fn(),
        duration: 30,
        setDuration: vi.fn(),
        price: 0,
        setPrice: vi.fn(),
        sortOrder: 0,
        setSortOrder: vi.fn(),
        saving: false,
        error: "Failed to create service",
        handleSubmit: vi.fn(),
      });

      render(<CreateServiceForm {...defaultProps} />);

      expect(screen.getByText("Failed to create service")).toBeInTheDocument();
    });
  });

  describe("Validation Attributes", () => {
    it("should have required attribute on name input", () => {
      render(<CreateServiceForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveAttribute("required");
    });

    it("should have min/max/step attributes on duration input", () => {
      render(<CreateServiceForm {...defaultProps} />);

      const durationInput = screen.getByLabelText(/duration/i);
      expect(durationInput).toHaveAttribute("min", "10");
      expect(durationInput).toHaveAttribute("max", "300");
      expect(durationInput).toHaveAttribute("step", "5");
    });

    it("should have min/step attributes on price input", () => {
      render(<CreateServiceForm {...defaultProps} />);

      const priceInput = screen.getByLabelText(/price/i);
      expect(priceInput).toHaveAttribute("min", "0");
      expect(priceInput).toHaveAttribute("step", "50");
    });
  });
});
