import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BookingForm } from "@/components/forms/BookingForm";
import type { Product } from "@/lib/repositories/products";

// Mock data
const mockEmployees = [
  { id: "emp1", full_name: "John Doe" },
  { id: "emp2", full_name: "Jane Smith" },
];

const mockServices = [
  { id: "svc1", name: "Haircut" },
  { id: "svc2", name: "Coloring" },
];

const mockProducts: Product[] = [
  { id: "prod1", name: "Shampoo", price_cents: 10000, salon_id: "salon1" },
];

const mockSlots = [
  { start: "2024-01-15T10:00:00Z", end: "2024-01-15T11:00:00Z", label: "10:00 – 11:00" },
  { start: "2024-01-15T11:00:00Z", end: "2024-01-15T12:00:00Z", label: "11:00 – 12:00" },
];

const defaultProps = {
  employeeId: "",
  setEmployeeId: vi.fn(),
  serviceId: "",
  setServiceId: vi.fn(),
  date: "2024-01-15",
  setDate: vi.fn(),
  slots: [],
  selectedSlot: "",
  setSelectedSlot: vi.fn(),
  loadingSlots: false,
  customerName: "",
  setCustomerName: vi.fn(),
  customerEmail: "",
  setCustomerEmail: vi.fn(),
  customerPhone: "",
  setCustomerPhone: vi.fn(),
  isWalkIn: false,
  setIsWalkIn: vi.fn(),
  selectedProducts: [],
  setSelectedProducts: vi.fn(),
  fieldErrors: {},
  fieldValid: {},
  validateField: vi.fn(),
  isFormValid: false,
  existingCustomer: null,
  checkingCustomer: false,
  showQuickCreate: false,
  creatingCustomer: false,
  handleQuickCreateCustomer: vi.fn(),
  employees: mockEmployees,
  services: mockServices,
  products: mockProducts,
  hasInventory: true,
  translations: {
    employeeLabel: "Employee",
    employeePlaceholder: "Select employee",
    serviceLabel: "Service",
    servicePlaceholder: "Select service",
    dateLabel: "Date",
    timeLabel: "Time",
    loadingSlots: "Loading slots...",
    noSlotsYet: "No slots available",
    selectSlotPlaceholder: "Select time slot",
    customerNameLabel: "Customer Name",
    customerEmailLabel: "Email",
    customerEmailPlaceholder: "Enter email",
    customerPhoneLabel: "Phone",
    customerPhonePlaceholder: "Enter phone",
    isWalkInLabel: "Walk-in",
  },
};

describe("BookingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<BookingForm {...defaultProps} />);

    expect(screen.getByLabelText(/Employee/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Service/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Customer Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
  });

  it("shows loading state when loading slots", () => {
    render(<BookingForm {...defaultProps} loadingSlots={true} />);

    expect(screen.getByText("Loading slots...")).toBeInTheDocument();
  });

  it("displays available time slots", () => {
    render(<BookingForm {...defaultProps} slots={mockSlots} />);

    expect(screen.getByText("10:00 – 11:00")).toBeInTheDocument();
    expect(screen.getByText("11:00 – 12:00")).toBeInTheDocument();
  });

  it("calls validateField when field changes", () => {
    const validateField = vi.fn();
    render(<BookingForm {...defaultProps} validateField={validateField} />);

    const nameInput = screen.getByLabelText(/Customer Name/i);
    fireEvent.change(nameInput, { target: { value: "Test Customer" } });

    expect(validateField).toHaveBeenCalledWith("customerName", "Test Customer");
  });

  it("shows error message for invalid field", () => {
    render(
      <BookingForm
        {...defaultProps}
        fieldErrors={{ customerName: "Name is required" }}
      />
    );

    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });

  it("shows green checkmark for valid field", () => {
    const { container } = render(
      <BookingForm
        {...defaultProps}
        customerName="Test Customer"
        fieldValid={{ customerName: true }}
      />
    );

    // Check for CheckCircle2 icon (SVG with green-500 class)
    const checkmarks = container.querySelectorAll(".text-green-500");
    expect(checkmarks.length).toBeGreaterThan(0);
  });

  it("shows existing customer badge when customer is found", () => {
    render(
      <BookingForm
        {...defaultProps}
        existingCustomer={{
          id: "cust1",
          full_name: "Jane Customer",
          email: "jane@example.com",
          phone: "12345678",
        }}
      />
    );

    expect(screen.getByText("Existing customer")).toBeInTheDocument();
    expect(screen.getByText("Jane Customer")).toBeInTheDocument();
  });

  it("shows quick create customer button when customer not found", () => {
    render(
      <BookingForm
        {...defaultProps}
        customerEmail="new@example.com"
        showQuickCreate={true}
      />
    );

    expect(screen.getByText(/Customer not found/i)).toBeInTheDocument();
    expect(screen.getByText("Create Customer")).toBeInTheDocument();
  });

  it("calls handleQuickCreateCustomer when create button is clicked", async () => {
    const handleQuickCreateCustomer = vi.fn();
    render(
      <BookingForm
        {...defaultProps}
        customerName="New Customer"
        customerEmail="new@example.com"
        showQuickCreate={true}
        handleQuickCreateCustomer={handleQuickCreateCustomer}
      />
    );

    const createButton = screen.getByText("Create Customer");
    fireEvent.click(createButton);

    expect(handleQuickCreateCustomer).toHaveBeenCalled();
  });

  it("disables create customer button when creating", () => {
    render(
      <BookingForm
        {...defaultProps}
        customerName="New Customer"
        customerEmail="new@example.com"
        showQuickCreate={true}
        creatingCustomer={true}
      />
    );

    const createButton = screen.getByText(/Creating/i);
    expect(createButton.closest("button")).toBeDisabled();
  });

  it("shows checking customer indicator when searching", () => {
    const { container } = render(
      <BookingForm
        {...defaultProps}
        customerEmail="test@example.com"
        checkingCustomer={true}
      />
    );

    // Check for loading spinner (Loader2 component with animate-spin class)
    const spinners = container.querySelectorAll(".animate-spin");
    expect(spinners.length).toBeGreaterThan(0);
  });
});
