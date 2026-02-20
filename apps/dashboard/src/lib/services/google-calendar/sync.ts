import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type { CalendarConnection, BookingForCalendar, SyncBookingResult } from "@/lib/types/calendar";
import { refreshAccessToken } from "./oauth";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "./events";
import { bookingToCalendarEvent, generateBookingHash } from "./converters";

export async function syncBookingToCalendar(
  booking: BookingForCalendar,
  connection: CalendarConnection & { access_token: string; refresh_token?: string }
): Promise<SyncBookingResult> {
  try {
    if (!connection.calendar_id) {
      return { success: false, error: "No calendar selected" };
    }

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
      
      await supabase
        .from("calendar_connections")
        .update({
          access_token: newTokens.access_token,
          token_expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
        })
        .eq("id", connection.id);
    }

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
      if (existingMapping.sync_hash === newHash) {
        return { success: true, eventId: existingMapping.external_event_id };
      }

      if (booking.status === "cancelled") {
        const { error: deleteError } = await deleteCalendarEvent(
          accessToken,
          connection.calendar_id,
          existingMapping.external_event_id
        );

        if (deleteError) {
          logError("Failed to delete calendar event", new Error(deleteError));
        }

        await supabase
          .from("calendar_event_mappings")
          .delete()
          .eq("id", existingMapping.id);

        return { success: true };
      }

      const { data: updatedEvent, error: updateError } = await updateCalendarEvent(
        accessToken,
        connection.calendar_id,
        existingMapping.external_event_id,
        event
      );

      if (updateError) {
        return { success: false, error: updateError };
      }

      await supabase
        .from("calendar_event_mappings")
        .update({
          sync_hash: newHash,
          last_synced_at: new Date().toISOString(),
        })
        .eq("id", existingMapping.id);

      return { success: true, eventId: updatedEvent?.id };
    } else {
      if (booking.status === "cancelled") {
        return { success: true };
      }

      const { data: createdEvent, error: createError } = await createCalendarEvent(
        accessToken,
        connection.calendar_id,
        event
      );

      if (createError || !createdEvent?.id) {
        return { success: false, error: createError || "Failed to create event" };
      }

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
