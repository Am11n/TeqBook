// =====================================================
// Notification Service
// =====================================================
// Service for checking notification preferences before sending notifications

import { getProfileByUserId, updateUserPreferences } from "@/lib/repositories/profiles";
import { logWarn } from "@/lib/services/logger";

export type NotificationType = "email" | "sms" | "whatsapp";
export type EmailNotificationType = 
  | "booking_confirmation"
  | "booking_reminder"
  | "booking_cancellation"
  | "payment_failure"
  | "payment_retry"
  | "access_restriction_warning"
  | "new_booking";

export interface NotificationPreferences {
  email: {
    bookingConfirmation: boolean;
    bookingReminder: boolean;
    bookingCancellation: boolean;
    newBooking: boolean;
    paymentFailure?: boolean;
    paymentRetry?: boolean;
    accessRestrictionWarning?: boolean;
  };
  sms?: {
    bookingConfirmation?: boolean;
    bookingReminder?: boolean;
    bookingCancellation?: boolean;
  };
  whatsapp?: {
    bookingConfirmation?: boolean;
    bookingReminder?: boolean;
    bookingCancellation?: boolean;
  };
}

export interface ShouldSendNotificationInput {
  userId: string;
  notificationType: NotificationType;
  emailType?: EmailNotificationType;
  salonId?: string | null;
}

/**
 * Get default notification preferences
 * Default is opt-in (all enabled by default)
 */
export function getDefaultPreferences(): NotificationPreferences {
  return {
    email: {
      bookingConfirmation: true,
      bookingReminder: true,
      bookingCancellation: true,
      newBooking: true,
      paymentFailure: true,
      paymentRetry: true,
      accessRestrictionWarning: true,
    },
    sms: {
      bookingConfirmation: false,
      bookingReminder: false,
      bookingCancellation: false,
    },
    whatsapp: {
      bookingConfirmation: false,
      bookingReminder: false,
      bookingCancellation: false,
    },
  };
}

/**
 * Map email type to preference key
 */
function mapEmailTypeToPreference(emailType: EmailNotificationType): keyof NotificationPreferences["email"] {
  const mapping: Record<EmailNotificationType, keyof NotificationPreferences["email"]> = {
    booking_confirmation: "bookingConfirmation",
    booking_reminder: "bookingReminder",
    booking_cancellation: "bookingCancellation",
    new_booking: "newBooking",
    payment_failure: "paymentFailure",
    payment_retry: "paymentRetry",
    access_restriction_warning: "accessRestrictionWarning",
  };
  return mapping[emailType];
}

/**
 * Check if notification should be sent based on user preferences
 */
export async function shouldSendNotification(
  input: ShouldSendNotificationInput
): Promise<boolean> {
  try {
    // Get user profile with preferences
    const { data: profile, error } = await getProfileByUserId(input.userId);

    if (error || !profile) {
      logWarn("Failed to get user profile for notification preference check", {
        userId: input.userId,
        error: error || "Profile not found",
      });
      // Default to true if we can't check preferences (opt-in by default)
      return true;
    }

    // Get preferences or use defaults
    const preferences = profile.user_preferences?.notifications || getDefaultPreferences();
    const defaults = getDefaultPreferences();

    // Check email preferences
    if (input.notificationType === "email" && input.emailType) {
      const preferenceKey = mapEmailTypeToPreference(input.emailType);
      const emailPrefs = preferences.email || defaults.email;
      
      // Check if preference is explicitly set
      const preferenceValue = emailPrefs[preferenceKey];
      
      // If preference is explicitly false, don't send
      if (preferenceValue === false) {
        return false;
      }
      
      // If preference is true or undefined (default), send
      return preferenceValue === true || preferenceValue === undefined;
    }

    // For SMS and WhatsApp, check if enabled (default is false)
    if (input.notificationType === "sms") {
      const smsPrefs = preferences.sms || defaults.sms;
      // SMS notifications are opt-in, so default to false
      return smsPrefs?.bookingConfirmation === true || 
             smsPrefs?.bookingReminder === true || 
             smsPrefs?.bookingCancellation === true;
    }

    if (input.notificationType === "whatsapp") {
      const whatsappPrefs = preferences.whatsapp || defaults.whatsapp;
      // WhatsApp notifications are opt-in, so default to false
      return whatsappPrefs?.bookingConfirmation === true || 
             whatsappPrefs?.bookingReminder === true || 
             whatsappPrefs?.bookingCancellation === true;
    }

    // Default to true for email (opt-in by default)
    return true;
  } catch (error) {
    logWarn("Exception checking notification preferences", {
      userId: input.userId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    // Default to true if we can't check preferences
    return true;
  }
}

/**
 * Update notification preferences for a user
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<{ error: string | null }> {
  try {
    if (!userId) {
      return { error: "User ID is required" };
    }

    // Update preferences via profiles repository
    const result = await updateUserPreferences(userId, {
      notifications: preferences as NotificationPreferences,
    });

    return result;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get notification preferences for a user
 */
export async function getNotificationPreferences(
  userId: string
): Promise<{ data: NotificationPreferences | null; error: string | null }> {
  try {
    const { data: profile, error } = await getProfileByUserId(userId);

    if (error) {
      return { data: null, error: error };
    }

    if (!profile) {
      return { data: null, error: "Profile not found" };
    }

    // Get preferences or use defaults
    const userPrefs = profile.user_preferences?.notifications;
    const preferences = (userPrefs as NotificationPreferences | undefined) || getDefaultPreferences();
    const defaults = getDefaultPreferences();

    // Merge with defaults to ensure all fields are present
    const mergedPreferences: NotificationPreferences = {
      email: {
        ...defaults.email,
        ...(preferences as NotificationPreferences).email,
      },
      sms: {
        ...defaults.sms,
        ...(preferences as NotificationPreferences).sms,
      },
      whatsapp: {
        ...defaults.whatsapp,
        ...(preferences as NotificationPreferences).whatsapp,
      },
    };

    return { data: mergedPreferences, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

