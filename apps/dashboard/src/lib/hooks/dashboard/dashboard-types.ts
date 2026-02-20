export type DashboardBooking = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  customers: { full_name: string | null } | null;
  employees: { full_name: string | null } | null;
  services: { name: string | null } | null;
};

export type DashboardEmployee = {
  id: string;
  full_name: string;
  role: string | null;
  is_active: boolean;
};

export type PerformanceData = {
  bookingsCount: number;
  newCustomersCount: number;
  returningCustomersCount: number;
  topService: string | null;
  mostBookedStaff: string | null;
  chartData: { label: string; bookings: number }[];
};

export type TimeRange = "daily" | "weekly" | "monthly";
