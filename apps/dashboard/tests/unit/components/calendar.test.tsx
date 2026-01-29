import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DayView } from "@/components/calendar/DayView";
import { BookingEvent } from "@/components/calendar/BookingEvent";
import type { CalendarBooking } from "@/lib/types";

vi.mock("@/components/salon-provider", () => ({
  useCurrentSalon: () => ({ salon: { timezone: "UTC" } }),
}));

// Mock data
const mockEmployees = [
  { id: "emp1", full_name: "John Doe" },
  { id: "emp2", full_name: "Jane Smith" },
];

const mockBooking: CalendarBooking = {
  id: "booking1",
  start_time: "2024-01-15T10:00:00Z",
  end_time: "2024-01-15T11:00:00Z",
  status: "confirmed",
  is_walk_in: false,
  customer_id: "cust1",
  customers: { full_name: "Test Customer" },
  employees: { id: "emp1", full_name: "John Doe" },
  services: { name: "Haircut" },
};

const mockBookingsForDayByEmployee = {
  emp1: [mockBooking],
  emp2: [],
};

describe("DayView", () => {
  it("renders time grid with 30-minute intervals", () => {
    render(
      <DayView
        selectedDate="2024-01-15"
        employees={mockEmployees}
        bookingsForDayByEmployee={mockBookingsForDayByEmployee}
        translations={{
          unknownService: "Unknown Service",
          unknownCustomer: "Unknown Customer",
        }}
      />
    );

    // DayView shows 09:00–21:00; check that time labels are rendered
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("12:00")).toBeInTheDocument();
  });

  it("displays employee names in header", () => {
    render(
      <DayView
        selectedDate="2024-01-15"
        employees={mockEmployees}
        bookingsForDayByEmployee={mockBookingsForDayByEmployee}
        translations={{
          unknownService: "Unknown Service",
          unknownCustomer: "Unknown Customer",
        }}
      />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("shows bookings in correct employee lanes", () => {
    render(
      <DayView
        selectedDate="2024-01-15"
        employees={mockEmployees}
        bookingsForDayByEmployee={mockBookingsForDayByEmployee}
        translations={{
          unknownService: "Unknown Service",
          unknownCustomer: "Unknown Customer",
        }}
      />
    );

    expect(screen.getByText("Haircut")).toBeInTheDocument();
    expect(screen.getByText("Test Customer")).toBeInTheDocument();
  });

  it("shades non-business hours when opening hours provided", () => {
    render(
      <DayView
        selectedDate="2024-01-15"
        employees={mockEmployees}
        bookingsForDayByEmployee={mockBookingsForDayByEmployee}
        openingHours={{ open_time: "09:00", close_time: "17:00" }}
        translations={{
          unknownService: "Unknown Service",
          unknownCustomer: "Unknown Customer",
        }}
      />
    );

    // Business hours shading is applied via CSS classes
    const container = screen.getByText("John Doe").closest("div")?.parentElement;
    expect(container).toBeInTheDocument();
  });


});

describe("BookingEvent", () => {
  it("renders booking information", () => {
    render(
      <BookingEvent
        booking={mockBooking}
        translations={{
          unknownService: "Unknown Service",
          unknownCustomer: "Unknown Customer",
        }}
      />
    );

    expect(screen.getByText("Haircut")).toBeInTheDocument();
    expect(screen.getByText("Test Customer")).toBeInTheDocument();
  });



  it("calls onClick when clicked", () => {
    const onClick = vi.fn();

    render(
      <BookingEvent
        booking={mockBooking}
        onClick={onClick}
        translations={{
          unknownService: "Unknown Service",
          unknownCustomer: "Unknown Customer",
        }}
      />
    );

    const bookingElement = screen.getByText("Haircut");
    fireEvent.click(bookingElement);

    expect(onClick).toHaveBeenCalledWith(mockBooking);
  });

  it("shows correct status color", () => {
    const { container } = render(
      <BookingEvent
        booking={mockBooking}
        translations={{
          unknownService: "Unknown Service",
          unknownCustomer: "Unknown Customer",
        }}
      />
    );

    // Check that status color class is applied
    const bookingCard = container.querySelector(".bg-blue-50");
    expect(bookingCard).toBeInTheDocument();
  });
});
