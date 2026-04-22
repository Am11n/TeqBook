import {
  Settings,
  Calendar,
  BookOpen,
  UserCircle,
  Users,
  Scissors,
  Clock,
} from "lucide-react";

export type SearchResult = {
  id: string;
  type: "booking" | "customer" | "employee" | "service" | "shift" | "navigation";
  label: string;
  metadata?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavigationLabels = {
  goToDashboard: string;
  goToCalendar: string;
  newBooking: string;
  newCustomer: string;
  manageEmployees: string;
  manageServices: string;
  manageCustomers: string;
  manageShifts: string;
  settings: string;
};

export function buildNavigationItems(labels: NavigationLabels): SearchResult[] {
  return [
    { id: "nav-dashboard", type: "navigation", label: labels.goToDashboard, href: "/", icon: Settings },
    { id: "nav-calendar", type: "navigation", label: labels.goToCalendar, href: "/calendar", icon: Calendar },
    { id: "nav-create-booking", type: "navigation", label: labels.newBooking, href: "/bookings?new=true", icon: BookOpen },
    { id: "nav-create-customer", type: "navigation", label: labels.newCustomer, href: "/customers?new=true", icon: UserCircle },
    { id: "nav-employees", type: "navigation", label: labels.manageEmployees, href: "/employees", icon: Users },
    { id: "nav-services", type: "navigation", label: labels.manageServices, href: "/services", icon: Scissors },
    { id: "nav-customers", type: "navigation", label: labels.manageCustomers, href: "/customers", icon: UserCircle },
    { id: "nav-shifts", type: "navigation", label: labels.manageShifts, href: "/shifts", icon: Clock },
    { id: "nav-settings", type: "navigation", label: labels.settings, href: "/settings/general", icon: Settings },
  ];
}

export function getIconForType(type: string) {
  if (type === "customer") return UserCircle;
  if (type === "employee") return Users;
  if (type === "service") return Scissors;
  if (type === "booking") return Calendar;
  return Settings;
}
