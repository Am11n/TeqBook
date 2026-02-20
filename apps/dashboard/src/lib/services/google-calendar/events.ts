import { logError } from "@/lib/services/logger";
import type { GoogleCalendarEvent, GoogleCalendar } from "@/lib/types/calendar";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

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
    const writeableCalendars = calendars.filter(
      (cal) => cal.accessRole === "writer" || cal.accessRole === "owner"
    );

    return { data: writeableCalendars, error: null };
  } catch (error) {
    logError("Exception fetching calendars", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

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
