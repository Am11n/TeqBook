// =====================================================
// Calendar Integration Types
// =====================================================
// Task Group 28: Google Calendar Sync
// Type definitions for calendar sync functionality

// =====================================================
// Enums
// =====================================================

export type CalendarProvider = "google" | "outlook" | "apple";
export type SyncDirection = "push" | "pull" | "bidirectional";

// =====================================================
// Calendar Connection Types
// =====================================================

export interface CalendarConnection {
  id: string;
  user_id: string;
  salon_id: string;
  provider: CalendarProvider;
  
  // OAuth (tokens not exposed to client)
  token_expires_at: string | null;
  
  // Provider info
  provider_user_id: string | null;
  provider_email: string | null;
  
  // Selected calendar
  calendar_id: string | null;
  calendar_name: string | null;
  
  // Sync settings
  sync_direction: SyncDirection;
  sync_enabled: boolean;
  last_sync_at: string | null;
  last_sync_error: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CalendarEventMapping {
  id: string;
  booking_id: string;
  connection_id: string;
  external_event_id: string;
  external_calendar_id: string;
  last_synced_at: string;
  sync_hash: string | null;
  created_at: string;
}

// =====================================================
// Google Calendar API Types
// =====================================================

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: "email" | "popup";
      minutes: number;
    }>;
  };
  colorId?: string;
  status?: "confirmed" | "tentative" | "cancelled";
  extendedProperties?: {
    private?: Record<string, string>;
    shared?: Record<string, string>;
  };
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  accessRole: "freeBusyReader" | "reader" | "writer" | "owner";
  backgroundColor?: string;
  foregroundColor?: string;
}

export interface GoogleOAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

// =====================================================
// Service Input/Output Types
// =====================================================

export interface ConnectCalendarInput {
  provider: CalendarProvider;
  authCode: string;
  redirectUri: string;
}

export interface ConnectCalendarResult {
  connection: CalendarConnection;
  calendars: GoogleCalendar[];
}

export interface SelectCalendarInput {
  connectionId: string;
  calendarId: string;
  calendarName: string;
}

export interface SyncBookingInput {
  bookingId: string;
  connectionId: string;
}

export interface SyncBookingResult {
  success: boolean;
  eventId?: string;
  error?: string;
}

export interface CalendarSyncSettings {
  syncDirection: SyncDirection;
  syncEnabled: boolean;
}

// =====================================================
// Booking to Calendar Event Conversion
// =====================================================

export interface BookingForCalendar {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  customer: {
    full_name: string;
    email: string | null;
    phone: string | null;
  } | null;
  service: {
    name: string;
    duration_minutes: number;
  } | null;
  employee: {
    full_name: string;
  } | null;
  salon: {
    name: string;
    address?: string | null;
  } | null;
}

// =====================================================
// Error Types
// =====================================================

export type CalendarErrorCode = 
  | "INVALID_CREDENTIALS"
  | "TOKEN_EXPIRED"
  | "CALENDAR_NOT_FOUND"
  | "EVENT_NOT_FOUND"
  | "SYNC_CONFLICT"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export interface CalendarError {
  code: CalendarErrorCode;
  message: string;
  details?: unknown;
}
