// Business logic layer for customer booking history
// Task Group 19: Customer Booking History (Business plan feature)

import {
  getBookingHistoryForCustomer,
  getBookingStatsForCustomer,
  type CustomerBookingHistoryItem,
  type CustomerBookingStats,
  type GetBookingHistoryOptions,
} from "@/lib/repositories/bookings";
import { getCustomerById } from "@/lib/repositories/customers";
import * as featureFlagsService from "@/lib/services/feature-flags-service";
import { logInfo, logWarn } from "@/lib/services/logger";
import { formatCurrency as formatCurrencyShared } from "@teqbook/shared";

export type CustomerHistoryData = {
  customer: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
  };
  stats: CustomerBookingStats;
  bookings: CustomerBookingHistoryItem[];
  total: number;
};

export type CustomerHistoryExportRow = {
  "Booking Date": string;
  "Time": string;
  "Service": string;
  "Employee": string;
  "Status": string;
  "Price": string;
  "Notes": string;
};
