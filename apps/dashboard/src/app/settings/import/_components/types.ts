export type ImportStep = "upload" | "mapping" | "preview" | "importing" | "done";
export type ImportType = "customers" | "services" | "employees" | "bookings";

export const TABS: { key: ImportType; label: string }[] = [
  { key: "customers", label: "Customers" },
  { key: "services", label: "Services" },
  { key: "employees", label: "Employees" },
  { key: "bookings", label: "Bookings" },
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
