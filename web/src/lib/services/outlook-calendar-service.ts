// =====================================================
// Outlook Calendar Service
// =====================================================
// Task Group 29: Outlook Calendar Sync
// Service for syncing bookings with Outlook Calendar via Microsoft Graph

import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type {
  CalendarConnection,
  BookingForCalendar,
  SyncBookingResult,
  CalendarErrorCode,
} from "@/lib/types/calendar";
import type {
  MicrosoftOAuthTokens,
  MicrosoftUserInfo,
  OutlookCalendarEvent,
  OutlookCalendar,
  GraphCalendarListResponse,
} from "@/lib/types/outlook-calendar";

// =====================================================
// Configuration
// =====================================================

const MICROSOFT_AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const MICROSOFT_TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const GRAPH_API_BASE = "https://graph.microsoft.com/v1.0";

// These should be set in environment variables
const CLIENT_ID = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || "";
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || "";

// Required scopes for calendar access
const SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "Calendars.ReadWrite",
];

// =====================================================
// OAuth Flow
// =====================================================

/**
 * Generate the Microsoft OAuth authorization URL
 */
export function getMicrosoftAuthUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SCOPES.join(" "),
    response_mode: "query",
    ...(state && { state }),
  });

  return `${MICROSOFT_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<{ data: MicrosoftOAuthTokens | null; error: string | null }> {
  try {
    const response = await fetch(MICROSOFT_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logError("Failed to exchange code for Microsoft tokens", new Error(errorData.error_description || errorData.error));
      return { data: null, error: errorData.error_description || "Failed to authenticate with Microsoft" };
    }

    const tokens: MicrosoftOAuthTokens = await response.json();
    return { data: tokens, error: null };
  } catch (error) {
    logError("Exception exchanging Microsoft code for tokens", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ data: MicrosoftOAuthTokens | null; error: string | null }> {
  try {
    const response = await fetch(MICROSOFT_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
        scope: SCOPES.join(" "),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error_description || "Failed to refresh token" };
    }

    const tokens: MicrosoftOAuthTokens = await response.json();
    return { data: tokens, error: null };
  } catch (error) {
    logError("Exception refreshing Microsoft access token", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get user info from Microsoft Graph
 */
export async function getUserInfo(
  accessToken: string
): Promise<{ data: MicrosoftUserInfo | null; error: string | null }> {
  try {
    const response = await fetch(`${GRAPH_API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error?.message || "Failed to get user info" };
    }

    const userInfo: MicrosoftUserInfo = await response.json();
    return { data: userInfo, error: null };
  } catch (error) {
    logError("Exception getting Microsoft user info", error);
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
): Promise<{ data: OutlookCalendar[] | null; error: string | null }> {
  try {
    const response = await fetch(`${GRAPH_API_BASE}/me/calendars`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error?.message || "Failed to fetch calendars" };
    }

    const data: GraphCalendarListResponse = await response.json();
    
    // Filter to only editable calendars
    const editableCalendars = (data.value || []).filter((cal) => cal.canEdit);

    return { data: editableCalendars, error: null };
  } catch (error) {
    logError("Exception fetching Outlook calendars", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: OutlookCalendarEvent
): Promise<{ data: OutlookCalendarEvent | null; error: string | null }> {
  try {
    const response = await fetch(
      `${GRAPH_API_BASE}/me/calendars/${encodeURIComponent(calendarId)}/events`,
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

    const createdEvent: OutlookCalendarEvent = await response.json();
    return { data: createdEvent, error: null };
  } catch (error) {
    logError("Exception creating Outlook calendar event", error);
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
  event: OutlookCalendarEvent
): Promise<{ data: OutlookCalendarEvent | null; error: string | null }> {
  try {
    const response = await fetch(
      `${GRAPH_API_BASE}/me/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: "PATCH",
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

    const updatedEvent: OutlookCalendarEvent = await response.json();
    return { data: updatedEvent, error: null };
  } catch (error) {
    logError("Exception updating Outlook calendar event", error);
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
      `${GRAPH_API_BASE}/me/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // 204 No Content is success, 404 means already deleted
    if (!response.ok && response.status !== 404) {
      const errorData = await response.json();
      return { success: false, error: errorData.error?.message || "Failed to delete event" };
    }

    return { success: true, error: null };
  } catch (error) {
    logError("Exception deleting Outlook calendar event", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// =====================================================
// Booking to Event Conversion
// =====================================================

/**
 * Convert a TeqBook booking to an Outlook Calendar event
 */
export function bookingToOutlookEvent(
  booking: BookingForCalendar,
  salonName: string,
  timeZone: string = "UTC"
): OutlookCalendarEvent {
  const serviceName = booking.service?.name || "Appointment";
  const customerName = booking.customer?.full_name || "Customer";
  const employeeName = booking.employee?.full_name || "";

  // Build subject
  const subject = `${serviceName} - ${customerName}`;

  // Build body content
  const bodyParts: string[] = [
    `<b>Service:</b> ${serviceName}`,
    `<b>Customer:</b> ${customerName}`,
  ];
  if (employeeName) {
    bodyParts.push(`<b>Staff:</b> ${employeeName}`);
  }
  if (booking.customer?.phone) {
    bodyParts.push(`<b>Phone:</b> ${booking.customer.phone}`);
  }
  if (booking.customer?.email) {
    bodyParts.push(`<b>Email:</b> ${booking.customer.email}`);
  }
  if (booking.notes) {
    bodyParts.push(`<b>Notes:</b> ${booking.notes}`);
  }
  bodyParts.push("", `<i>Booked via ${salonName} (TeqBook)</i>`);

  const event: OutlookCalendarEvent = {
    subject,
    body: {
      contentType: "html",
      content: bodyParts.join("<br/>"),
    },
    start: {
      dateTime: booking.start_time.replace("Z", ""),
      timeZone,
    },
    end: {
      dateTime: booking.end_time.replace("Z", ""),
      timeZone,
    },
    isReminderOn: true,
    reminderMinutesBeforeStart: 30,
    showAs: "busy",
    categories: ["TeqBook"],
  };

  // Add location if available
  if (booking.salon?.address) {
    event.location = {
      displayName: booking.salon.address,
    };
  }

  // Add customer as attendee if email available
  if (booking.customer?.email) {
    event.attendees = [
      {
        emailAddress: {
          address: booking.customer.email,
          name: customerName,
        },
        type: "required",
      },
    ];
  }

  return event;
}

/**
 * Generate a hash of booking data for change detection
 * (Reuse the same logic as Google Calendar)
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
  
  const str = JSON.stringify(relevantData);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// =====================================================
// Connection Management
// =====================================================

/**
 * Save an Outlook calendar connection to the database
 */
export async function saveOutlookConnection(
  userId: string,
  salonId: string,
  tokens: MicrosoftOAuthTokens,
  userInfo: MicrosoftUserInfo
): Promise<{ data: CalendarConnection | null; error: string | null }> {
  try {
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const { data, error } = await supabase
      .from("calendar_connections")
      .upsert(
        {
          user_id: userId,
          salon_id: salonId,
          provider: "outlook",
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: expiresAt,
          provider_user_id: userInfo.id,
          provider_email: userInfo.mail || userInfo.userPrincipalName,
          sync_enabled: true,
          sync_direction: "push",
        },
        { onConflict: "user_id,salon_id,provider" }
      )
      .select()
      .single();

    if (error) {
      logError("Failed to save Outlook calendar connection", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    logError("Exception saving Outlook calendar connection", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get an Outlook calendar connection
 */
export async function getOutlookConnection(
  userId: string,
  salonId: string
): Promise<{ data: CalendarConnection | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("calendar_connections")
      .select("*")
      .eq("user_id", userId)
      .eq("salon_id", salonId)
      .eq("provider", "outlook")
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
 * Disconnect Outlook calendar
 */
export async function disconnectOutlookCalendar(
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

    logInfo("Outlook calendar disconnected", { connectionId });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// =====================================================
// Sync Operations
// =====================================================

/**
 * Sync a booking to Outlook Calendar
 */
export async function syncBookingToOutlook(
  booking: BookingForCalendar,
  connection: CalendarConnection & { access_token: string; refresh_token?: string },
  timeZone: string = "UTC"
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
          refresh_token: newTokens.refresh_token || connection.refresh_token,
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
    const event = bookingToOutlookEvent(booking, salonName, timeZone);
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
          logError("Failed to delete Outlook calendar event", new Error(deleteError));
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

      logInfo("Booking synced to Outlook Calendar", {
        bookingId: booking.id,
        eventId: createdEvent.id,
      });

      return { success: true, eventId: createdEvent.id };
    }
  } catch (error) {
    logError("Exception syncing booking to Outlook", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Map error response to CalendarErrorCode
 */
export function mapToCalendarErrorCode(errorMessage: string): CalendarErrorCode {
  const message = errorMessage.toLowerCase();
  
  if (message.includes("unauthorized") || message.includes("invalid_grant") || message.includes("invalidauthenticationtoken")) {
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
  if (message.includes("throttl") || message.includes("rate") || message.includes("quota")) {
    return "RATE_LIMITED";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "NETWORK_ERROR";
  }
  
  return "UNKNOWN_ERROR";
}
