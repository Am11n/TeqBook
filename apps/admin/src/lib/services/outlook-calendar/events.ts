import { logError } from "@/lib/services/logger";
import type {
  OutlookCalendarEvent,
  OutlookCalendar,
  GraphCalendarListResponse,
} from "@/lib/types/outlook-calendar";

const GRAPH_API_BASE = "https://graph.microsoft.com/v1.0";

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
    const editableCalendars = (data.value || []).filter((cal) => cal.canEdit);

    return { data: editableCalendars, error: null };
  } catch (error) {
    logError("Exception fetching Outlook calendars", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

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
