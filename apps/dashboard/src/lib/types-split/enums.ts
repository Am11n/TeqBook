export type BookingStatus = 
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show"
  | "scheduled";

export type EmployeeRole = 
  | "owner"
  | "manager"
  | "staff";

export type PlanType = 
  | "starter"
  | "pro"
  | "business";

export type NotificationType = 
  | "sms"
  | "email"
  | "whatsapp";

export type NotificationStatus = 
  | "pending"
  | "sent"
  | "failed";

export type PaymentMethod = 
  | "in_salon"
  | "online";
