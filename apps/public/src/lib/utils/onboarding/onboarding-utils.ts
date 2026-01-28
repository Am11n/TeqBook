export type OpeningHours = {
  day: number; // 0 = Monday, 6 = Sunday
  isOpen: boolean;
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
};

export const DEFAULT_OPENING_HOURS: OpeningHours[] = [
  { day: 0, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Monday
  { day: 1, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Tuesday
  { day: 2, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Wednesday
  { day: 3, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Thursday
  { day: 4, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Friday
  { day: 5, isOpen: false, openTime: "09:00", closeTime: "17:00" }, // Saturday
  { day: 6, isOpen: false, openTime: "09:00", closeTime: "17:00" }, // Sunday
];

export type SalonType = "barber" | "nails" | "massage" | "other";

export type OnboardingStep = 1 | 2 | 3;

