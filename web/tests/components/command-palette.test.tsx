/**
 * Command Palette Component Tests
 * Task Group 48: Command Palette & Global Search
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CommandPalette } from "@/components/command-palette";

// Mock dependencies
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockOnClose = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

vi.mock("@/components/salon-provider", () => ({
  useCurrentSalon: () => ({
    salon: { id: "salon-123", name: "Test Salon" },
  }),
}));

vi.mock("@/lib/services/search-service", () => ({
  searchSalonEntities: vi.fn(() =>
    Promise.resolve({
      data: [],
      error: null,
    })
  ),
}));

describe("CommandPalette", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should not render when closed", () => {
      render(<CommandPalette open={false} onClose={mockOnClose} />);
      expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument();
    });

    it("should render when open", () => {
      render(<CommandPalette open={true} onClose={mockOnClose} />);
      expect(
        screen.getByPlaceholderText(/search bookings, customers, services/i)
      ).toBeInTheDocument();
    });

    it("should show navigation items when no query", async () => {
      render(<CommandPalette open={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Go to Calendar")).toBeInTheDocument();
        expect(screen.getByText("New booking")).toBeInTheDocument();
        expect(screen.getByText("New customer")).toBeInTheDocument();
      });
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should close on Escape key", async () => {
      render(<CommandPalette open={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.keyDown(input, { key: "Escape" });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it("should select item with Enter", async () => {
      render(<CommandPalette open={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.keyDown(input, { key: "Enter" });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe("Quick Actions", () => {
    it("should navigate to bookings page with new=true for new booking", async () => {
      render(<CommandPalette open={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText("New booking")).toBeInTheDocument();
      });

      const newBookingButton = screen.getByText("New booking");
      fireEvent.click(newBookingButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/bookings?new=true");
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it("should navigate to customers page with new=true for new customer", async () => {
      render(<CommandPalette open={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText("New customer")).toBeInTheDocument();
      });

      const newCustomerButton = screen.getByText("New customer");
      fireEvent.click(newCustomerButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/customers?new=true");
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it("should navigate to calendar", async () => {
      render(<CommandPalette open={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText("Go to Calendar")).toBeInTheDocument();
      });

      const calendarButton = screen.getByText("Go to Calendar");
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/calendar");
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });
});
