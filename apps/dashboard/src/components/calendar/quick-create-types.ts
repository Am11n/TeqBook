import type { Booking, Service } from "@/lib/types";

export interface QuickCreatePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillEmployeeId?: string;
  prefillTime?: string;
  prefillDate?: string;
  prefillServiceId?: string;
  prefillCustomerName?: string;
  prefillCustomerPhone?: string;
  prefillCustomerEmail?: string;
  onBookingCreated: (booking: Booking) => void;
}

export type CustomerSuggestion = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
};
