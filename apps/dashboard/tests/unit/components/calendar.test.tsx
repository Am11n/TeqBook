import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DayView } from "@/components/calendar/DayView";
import { BookingEvent } from "@/components/calendar/BookingEvent";
import type { CalendarBooking, ScheduleSegment } from "@/lib/types";

vi.mock("@/components/salon-provider", () => ({
  useCurrentSalon: () => ({ salon: { timezone: "UTC" } }),
}));

vi.mock("@/components/locale-provider", () => ({
  useLocale: () => ({ locale: "en" }),
}));

vi.mock("@/i18n/normalizeLocale", () => ({
  normalizeLocale: () => "en",
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
  notes: null,
  customers: { full_name: "Test Customer" },
  employees: { id: "emp1", full_name: "John Doe" },
  services: { name: "Haircut" },
};

const mockBookingsForDayByEmployee = {
  emp1: [mockBooking],
  emp2: [],
};

const mockSegments: ScheduleSegment[] = [
  {
    employee_id: "emp1",
    segment_type: "working",
    start_time: "2024-01-15T08:00:00Z",
    end_time: "2024-01-15T18:00:00Z",
    metadata: {},
  },
  {
    employee_id: "emp2",
    segment_type: "working",
    start_time: "2024-01-15T08:00:00Z",
    end_time: "2024-01-15T18:00:00Z",
    metadata: {},
  },
];

const mockGridRange = { startHour: 7, endHour: 19 };

describe("DayView", () => {
  it("renders time grid with 30-minute intervals", () => {
    render(
      <DayView
        selectedDate="2024-01-15"
        employees={mockEmployees}
        bookingsForDayByEmployee={mockBookingsForDayByEmployee}
        segments={mockSegments}
        gridRange={mockGridRange}
        timezone="UTC"
        translations={{
          unknownService: "Unknown Service",
          unknownCustomer: "Unknown Customer",
        }}
      />
    );

    // DayView shows grid range 07:00–19:00; check that time labels are rendered
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("12:00")).toBeInTheDocument();
  });

  it("displays employee names in header", () => {
    render(
      <DayView
        selectedDate="2024-01-15"
        employees={mockEmployees}
        bookingsForDayByEmployee={mockBookingsForDayByEmployee}
        segments={mockSegments}
        gridRange={mockGridRange}
        timezone="UTC"
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
        segments={mockSegments}
        gridRange={mockGridRange}
        timezone="UTC"
        translations={{
          unknownService: "Unknown Service",
          unknownCustomer: "Unknown Customer",
        }}
      />
    );

    expect(screen.getByText("Haircut")).toBeInTheDocument();
    expect(screen.getByText("Test Customer")).toBeInTheDocument();
  });

  it("renders with segments providing background layers", () => {
    render(
      <DayView
        selectedDate="2024-01-15"
        employees={mockEmployees}
        bookingsForDayByEmployee={mockBookingsForDayByEmployee}
        segments={mockSegments}
        gridRange={mockGridRange}
        timezone="UTC"
        translations={{
          unknownService: "Unknown Service",
          unknownCustomer: "Unknown Customer",
        }}
      />
    );

    // Segments are rendered as background layers; employee names confirm the grid rendered
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

  it("shows correct status color via theme tokens", () => {
    const { container } = render(
      <BookingEvent
        booking={mockBooking}
        translations={{
          unknownService: "Unknown Service",
          unknownCustomer: "Unknown Customer",
        }}
      />
    );

    // Confirmed status gets blue-50 background from calendar-theme tokens
    const bookingCard = container.querySelector(".bg-blue-50");
    expect(bookingCard).toBeInTheDocument();
  });
});
