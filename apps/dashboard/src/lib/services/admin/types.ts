export type AdminSalon = {
  id: string;
  name: string;
  salon_type: string | null;
  created_at: string;
  owner_email?: string;
  plan?: "starter" | "pro" | "business" | null;
  is_public?: boolean;
  employee_count?: number;
  booking_count?: number;
};

export type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  is_superadmin: boolean;
  salon_name?: string;
};
