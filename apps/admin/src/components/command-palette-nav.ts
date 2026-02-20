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

export const navigationItems: SearchResult[] = [
  { id: "nav-dashboard", type: "navigation", label: "Go to Dashboard", href: "/dashboard", icon: Settings },
  { id: "nav-calendar", type: "navigation", label: "Go to Calendar", href: "/calendar", icon: Calendar },
  { id: "nav-create-booking", type: "navigation", label: "New booking", href: "/bookings?new=true", icon: BookOpen },
  { id: "nav-create-customer", type: "navigation", label: "New customer", href: "/customers?new=true", icon: UserCircle },
  { id: "nav-employees", type: "navigation", label: "Manage employees", href: "/employees", icon: Users },
  { id: "nav-services", type: "navigation", label: "Manage services", href: "/services", icon: Scissors },
  { id: "nav-customers", type: "navigation", label: "Manage customers", href: "/customers", icon: UserCircle },
  { id: "nav-shifts", type: "navigation", label: "Manage shifts", href: "/shifts", icon: Clock },
  { id: "nav-settings", type: "navigation", label: "Settings", href: "/settings/general", icon: Settings },
];

export function getIconForType(type: string) {
  if (type === "customer") return UserCircle;
  if (type === "employee") return Users;
  if (type === "service") return Scissors;
  if (type === "booking") return Calendar;
  return Settings;
}
