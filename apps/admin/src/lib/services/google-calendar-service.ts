// =====================================================
// Google Calendar Service
// =====================================================
// Task Group 28: Google Calendar Sync
// Service for syncing bookings with Google Calendar

import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type {
  CalendarConnection,
  CalendarEventMapping,
  GoogleCalendarEvent,
  GoogleCalendar,
  GoogleOAuthTokens,
  BookingForCalendar,
  SyncBookingResult,
  CalendarErrorCode,
} from "@/lib/types/calendar";

// =====================================================
// Configuration
// =====================================================

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

// These should be set in environment variables
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

// Required scopes for calendar access
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
  "openid",
  "email",
];

// =====================================================
// OAuth Flow
// =====================================================

/**
 * Generate the Google OAuth authorization URL
 */
export function getGoogleAuthUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    ...(state && { state }),
  });

  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<{ data: GoogleOAuthTokens | null; error: string | null }> {
  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logError("Failed to exchange code for tokens", new Error(errorData.error_description || errorData.error));
      return { data: null, error: errorData.error_description || "Failed to authenticate with Google" };
    }

    const tokens: GoogleOAuthTokens = await response.json();
    return { data: tokens, error: null };
  } catch (error) {
    logError("Exception exchanging code for tokens", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ data: GoogleOAuthTokens | null; error: string | null }> {
  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error_description || "Failed to refresh token" };
    }

    const tokens: GoogleOAuthTokens = await response.json();
    return { data: tokens, error: null };
  } catch (error) {
    logError("Exception refreshing access token", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// =====================================================
// Calendar Operations
// =====================================================

/**
 * Get list of calendars for the authenticated user
 */
export async function getCalendars(
  accessToken: string
): Promise<{ data: GoogleCalendar[] | null; error: string | null }> {
  try {
    const response = await fetch(`${GOOGLE_CALENDAR_API}/users/me/calendarList`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error?.message || "Failed to fetch calendars" };
    }

    const data = await response.json();
    const calendars: GoogleCalendar[] = data.items || [];
    
    // Filter to only writeable calendars
    const writeableCalendars = calendars.filter(
      (cal) => cal.accessRole === "writer" || cal.accessRole === "owner"
    );

    return { data: writeableCalendars, error: null };
  } catch (error) {
    logError("Exception fetching calendars", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: GoogleCalendarEvent
): Promise<{ data: GoogleCalendarEvent | null; error: string | null }> {
  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error?.message || "Failed to create event" };
    }

    const createdEvent: GoogleCalendarEvent = await response.json();
    return { data: createdEvent, error: null };
  } catch (error) {
    logError("Exception creating calendar event", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: GoogleCalendarEvent
): Promise<{ data: GoogleCalendarEvent | null; error: string | null }> {
  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error?.message || "Failed to update event" };
    }

    const updatedEvent: GoogleCalendarEvent = await response.json();
    return { data: updatedEvent, error: null };
  } catch (error) {
    logError("Exception updating calendar event", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      const errorData = await response.json();
      return { success: false, error: errorData.error?.message || "Failed to delete event" };
    }

    return { success: true, error: null };
  } catch (error) {
    logError("Exception deleting calendar event", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// =====================================================
// Booking to Event Conversion
// =====================================================

/**
 * Convert a TeqBook booking to a Google Calendar event
 */
export function bookingToCalendarEvent(
  booking: BookingForCalendar,
  salonName: string
): GoogleCalendarEvent {
  const serviceName = booking.service?.name || "Appointment";
  const customerName = booking.customer?.full_name || "Customer";
  const employeeName = booking.employee?.full_name || "";

  // Build summary
  const summary = `${serviceName} - ${customerName}`;

  // Build description
  const descriptionParts: string[] = [
    `Service: ${serviceName}`,
    `Customer: ${customerName}`,
  ];
  if (employeeName) {
    descriptionParts.push(`Staff: ${employeeName}`);
  }
  if (booking.customer?.phone) {
    descriptionParts.push(`Phone: ${booking.customer.phone}`);
  }
  if (booking.customer?.email) {
    descriptionParts.push(`Email: ${booking.customer.email}`);
  }
  if (booking.notes) {
    descriptionParts.push(`Notes: ${booking.notes}`);
  }
  descriptionParts.push("", `Booked via ${salonName} (TeqBook)`);

  const event: GoogleCalendarEvent = {
    summary,
    description: descriptionParts.join("\n"),
    location: booking.salon?.address || undefined,
    start: {
      dateTime: booking.start_time,
    },
    end: {
      dateTime: booking.end_time,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 30 },
      ],
    },
    extendedProperties: {
      private: {
        teqbook_booking_id: booking.id,
        teqbook_status: booking.status,
      },
    },
  };

  // Add customer as attendee if email is available
  if (booking.customer?.email) {
    event.attendees = [
      {
        email: booking.customer.email,
        displayName: customerName,
      },
    ];
  }

  return event;
}

/**
 * Generate a hash of booking data for change detection
 */
export function generateBookingHash(booking: BookingForCalendar): string {
  const relevantData = {
    start_time: booking.start_time,
    end_time: booking.end_time,
    status: booking.status,
    notes: booking.notes,
    customer_name: booking.customer?.full_name,
    customer_email: booking.customer?.email,
    service_name: booking.service?.name,
    employee_name: booking.employee?.full_name,
  };
  
  // Simple hash using JSON stringify
  const str = JSON.stringify(relevantData);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

// =====================================================
// Connection Management
// =====================================================

/**
 * Save a calendar connection to the database
 */
export async function saveCalendarConnection(
  userId: string,
  salonId: string,
  tokens: GoogleOAuthTokens,
  providerEmail?: string
): Promise<{ data: CalendarConnection | null; error: string | null }> {
  try {
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const { data, error } = await supabase
      .from("calendar_connections")
      .upsert(
        {
          user_id: userId,
          salon_id: salonId,
          provider: "google",
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: expiresAt,
          provider_email: providerEmail,
          sync_enabled: true,
          sync_direction: "push",
        },
        { onConflict: "user_id,salon_id,provider" }
      )
      .select()
      .single();

    if (error) {
      logError("Failed to save calendar connection", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    logError("Exception saving calendar connection", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get a calendar connection
 */
export async function getCalendarConnection(
  userId: string,
  salonId: string
): Promise<{ data: CalendarConnection | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("calendar_connections")
      .select("*")
      .eq("user_id", userId)
      .eq("salon_id", salonId)
      .eq("provider", "google")
      .single();

    if (error && error.code !== "PGRST116") {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Update calendar selection
 */
export async function updateCalendarSelection(
  connectionId: string,
  calendarId: string,
  calendarName: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from("calendar_connections")
      .update({
        calendar_id: calendarId,
        calendar_name: calendarName,
      })
      .eq("id", connectionId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Disconnect calendar
 */
export async function disconnectCalendar(
  connectionId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from("calendar_connections")
      .delete()
      .eq("id", connectionId);

    if (error) {
      return { success: false, error: error.message };
    }

    logInfo("Calendar disconnected", { connectionId });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// =====================================================
// Sync Operations
// =====================================================

/**
 * Sync a booking to Google Calendar
 */
export async function syncBookingToCalendar(
  booking: BookingForCalendar,
  connection: CalendarConnection & { access_token: string; refresh_token?: string }
): Promise<SyncBookingResult> {
  try {
    if (!connection.calendar_id) {
      return { success: false, error: "No calendar selected" };
    }

    // Check if we need to refresh the token
    let accessToken = connection.access_token;
    if (connection.token_expires_at && new Date(connection.token_expires_at) < new Date()) {
      if (!connection.refresh_token) {
        return { success: false, error: "Token expired and no refresh token available" };
      }
      
      const { data: newTokens, error: refreshError } = await refreshAccessToken(connection.refresh_token);
      if (refreshError || !newTokens) {
        return { success: false, error: refreshError || "Failed to refresh token" };
      }
      
      accessToken = newTokens.access_token;
      
      // Update tokens in database
      await supabase
        .from("calendar_connections")
        .update({
          access_token: newTokens.access_token,
          token_expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
        })
        .eq("id", connection.id);
    }

    // Check if event already exists
    const { data: existingMapping } = await supabase
      .from("calendar_event_mappings")
      .select("*")
      .eq("booking_id", booking.id)
      .eq("connection_id", connection.id)
      .single();

    const salonName = booking.salon?.name || "TeqBook";
    const event = bookingToCalendarEvent(booking, salonName);
    const newHash = generateBookingHash(booking);

    if (existingMapping) {
      // Check if booking has changed
      if (existingMapping.sync_hash === newHash) {
        return { success: true, eventId: existingMapping.external_event_id };
      }

      // Handle cancelled bookings
      if (booking.status === "cancelled") {
        const { error: deleteError } = await deleteCalendarEvent(
          accessToken,
          connection.calendar_id,
          existingMapping.external_event_id
        );

        if (deleteError) {
          logError("Failed to delete calendar event", new Error(deleteError));
        }

        // Remove mapping
        await supabase
          .from("calendar_event_mappings")
          .delete()
          .eq("id", existingMapping.id);

        return { success: true };
      }

      // Update existing event
      const { data: updatedEvent, error: updateError } = await updateCalendarEvent(
        accessToken,
        connection.calendar_id,
        existingMapping.external_event_id,
        event
      );

      if (updateError) {
        return { success: false, error: updateError };
      }

      // Update mapping
      await supabase
        .from("calendar_event_mappings")
        .update({
          sync_hash: newHash,
          last_synced_at: new Date().toISOString(),
        })
        .eq("id", existingMapping.id);

      return { success: true, eventId: updatedEvent?.id };
    } else {
      // Don't create events for cancelled bookings
      if (booking.status === "cancelled") {
        return { success: true };
      }

      // Create new event
      const { data: createdEvent, error: createError } = await createCalendarEvent(
        accessToken,
        connection.calendar_id,
        event
      );

      if (createError || !createdEvent?.id) {
        return { success: false, error: createError || "Failed to create event" };
      }

      // Save mapping
      await supabase.from("calendar_event_mappings").insert({
        booking_id: booking.id,
        connection_id: connection.id,
        external_event_id: createdEvent.id,
        external_calendar_id: connection.calendar_id,
        sync_hash: newHash,
      });

      logInfo("Booking synced to Google Calendar", {
        bookingId: booking.id,
        eventId: createdEvent.id,
      });

      return { success: true, eventId: createdEvent.id };
    }
  } catch (error) {
    logError("Exception syncing booking to calendar", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Map error response to CalendarErrorCode
 */
export function mapToCalendarErrorCode(errorMessage: string): CalendarErrorCode {
  const message = errorMessage.toLowerCase();
  
  if (message.includes("unauthorized") || message.includes("invalid_grant")) {
    return "INVALID_CREDENTIALS";
  }
  if (message.includes("expired")) {
    return "TOKEN_EXPIRED";
  }
  if (message.includes("not found") && message.includes("calendar")) {
    return "CALENDAR_NOT_FOUND";
  }
  if (message.includes("not found") && message.includes("event")) {
    return "EVENT_NOT_FOUND";
  }
  if (message.includes("conflict")) {
    return "SYNC_CONFLICT";
  }
  if (message.includes("rate") || message.includes("quota")) {
    return "RATE_LIMITED";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "NETWORK_ERROR";
  }
  
  return "UNKNOWN_ERROR";
}
