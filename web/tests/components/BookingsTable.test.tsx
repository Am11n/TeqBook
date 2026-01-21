/**
 * BookingsTable Component Tests
 * Task Group 24: Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  within,
  mockBooking,
  mockEmployee,
  mockShift,
  mockBookingsTableTranslations,
} from "./test-utils";
import { BookingsTable } from "@/components/bookings/BookingsTable";

describe("BookingsTable", () => {
  const translations = mockBookingsTableTranslations();
  const defaultProps = {
    employees: [mockEmployee()],
    shifts: [mockShift()],
    translations,
    locale: "en",
    onCancelBooking: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render table headers correctly", () => {
      render(<BookingsTable {...defaultProps} bookings={[]} />);

      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Time")).toBeInTheDocument();
      expect(screen.getByText("Service")).toBeInTheDocument();
      expect(screen.getByText("Employee")).toBeInTheDocument();
      expect(screen.getByText("Customer")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Type")).toBeInTheDocument();
      expect(screen.getByText("Notes")).toBeInTheDocument();
    });

    it("should render booking data in table rows", () => {
      const booking = mockBooking({
        status: "confirmed",
        is_walk_in: false,
        notes: "Test notes",
      });

      render(<BookingsTable {...defaultProps} bookings={[booking]} />);

      // Check booking data is displayed
      expect(screen.getByText("Haircut")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Test notes")).toBeInTheDocument();
    });

    it("should render multiple bookings", () => {
      const bookings = [
        mockBooking({ id: "1", services: { ...mockBooking().services, name: "Haircut" } }),
        mockBooking({ id: "2", services: { ...mockBooking().services, name: "Beard Trim" } }),
        mockBooking({ id: "3", services: { ...mockBooking().services, name: "Color" } }),
      ];

      render(<BookingsTable {...defaultProps} bookings={bookings} />);

      const rows = screen.getAllByRole("row");
      // +1 for header row
      expect(rows).toHaveLength(4);
    });
  });

  describe("Status Display", () => {
    it("should display confirmed status badge", () => {
      const booking = mockBooking({ status: "confirmed" });
      render(<BookingsTable {...defaultProps} bookings={[booking]} />);

      expect(screen.getByText("Confirmed")).toBeInTheDocument();
    });

    it("should display pending status badge", () => {
      const booking = mockBooking({ status: "pending" });
      render(<BookingsTable {...defaultProps} bookings={[booking]} />);

      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("should display cancelled status badge", () => {
      const booking = mockBooking({ status: "cancelled" });
      render(<BookingsTable {...defaultProps} bookings={[booking]} />);

      expect(screen.getByText("Cancelled")).toBeInTheDocument();
    });

    it("should display completed status badge", () => {
      const booking = mockBooking({ status: "completed" });
      render(<BookingsTable {...defaultProps} bookings={[booking]} />);

      expect(screen.getByText("Completed")).toBeInTheDocument();
    });
  });

  describe("Type Display", () => {
    it("should display walk-in type", () => {
      const booking = mockBooking({ is_walk_in: true });
      render(<BookingsTable {...defaultProps} bookings={[booking]} />);

      expect(screen.getByText("Walk-in")).toBeInTheDocument();
    });

    it("should display online type", () => {
      const booking = mockBooking({ is_walk_in: false });
      render(<BookingsTable {...defaultProps} bookings={[booking]} />);

      expect(screen.getByText("Online")).toBeInTheDocument();
    });
  });

  describe("Cancel Button", () => {
    it("should show cancel button for confirmed bookings", () => {
      const booking = mockBooking({ status: "confirmed" });
      const onCancelBooking = vi.fn();

      render(
        <BookingsTable
          {...defaultProps}
          bookings={[booking]}
          onCancelBooking={onCancelBooking}
        />
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });

    it("should call onCancelBooking when cancel button is clicked", async () => {
      const booking = mockBooking({ status: "confirmed" });
      const onCancelBooking = vi.fn();

      const { user } = render(
        <BookingsTable
          {...defaultProps}
          bookings={[booking]}
          onCancelBooking={onCancelBooking}
        />
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      cancelButton.click();

      expect(onCancelBooking).toHaveBeenCalledWith(booking);
    });

    it("should NOT show cancel button for cancelled bookings", () => {
      const booking = mockBooking({ status: "cancelled" });
      render(<BookingsTable {...defaultProps} bookings={[booking]} />);

      expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
    });

    it("should NOT show cancel button for completed bookings", () => {
      const booking = mockBooking({ status: "completed" });
      render(<BookingsTable {...defaultProps} bookings={[booking]} />);

      expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  describe("Fallback Text", () => {
    it("should show unknown service when service is missing", () => {
      const booking = mockBooking({ services: null });
      render(<BookingsTable {...defaultProps} bookings={[booking]} />);

      expect(screen.getByText("Unknown service")).toBeInTheDocument();
    });

    it("should show unknown employee when employee is missing", () => {
      const booking = mockBooking({ employees: null });
      render(<BookingsTable {...defaultProps} bookings={[booking]} />);

      expect(screen.getByText("Unknown employee")).toBeInTheDocument();
    });

    it("should show unknown customer when customer is missing", () => {
      const booking = mockBooking({ customers: null });
      render(<BookingsTable {...defaultProps} bookings={[booking]} />);

      expect(screen.getByText("Unknown customer")).toBeInTheDocument();
    });
  });

  describe("Products Display", () => {
    it("should display products when present", () => {
      const booking = mockBooking({
        products: [
          {
            id: "bp-1",
            product: { id: "p-1", name: "Shampoo" },
            quantity: 2,
            price_cents: 15000,
          },
        ],
      });

      render(<BookingsTable {...defaultProps} bookings={[booking]} />);

      expect(screen.getByText(/Shampoo x2/)).toBeInTheDocument();
      expect(screen.getByText(/300.00 NOK/)).toBeInTheDocument();
    });

    it("should display dash when no notes and no products", () => {
      const booking = mockBooking({ notes: null, products: [] });
      render(<BookingsTable {...defaultProps} bookings={[booking]} />);

      // The dash "-" should be in the notes column
      const rows = screen.getAllByRole("row");
      const dataRow = rows[1]; // First data row
      expect(within(dataRow).getByText("-")).toBeInTheDocument();
    });
  });
});
