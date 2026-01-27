// =====================================================
// Outlook Calendar Types
// =====================================================
// Task Group 29: Outlook Calendar Sync
// Type definitions for Microsoft Graph Calendar API

// =====================================================
// Microsoft Graph OAuth Types
// =====================================================

export interface MicrosoftOAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
}

export interface MicrosoftUserInfo {
  id: string;
  displayName: string;
  mail: string | null;
  userPrincipalName: string;
}

// =====================================================
// Outlook Calendar Event Types
// =====================================================

export interface OutlookCalendarEvent {
  id?: string;
  subject: string;
  body?: {
    contentType: "text" | "html";
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      countryOrRegion?: string;
      postalCode?: string;
    };
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
    type: "required" | "optional" | "resource";
    status?: {
      response: "none" | "organizer" | "tentativelyAccepted" | "accepted" | "declined" | "notResponded";
      time?: string;
    };
  }>;
  isReminderOn?: boolean;
  reminderMinutesBeforeStart?: number;
  showAs?: "free" | "tentative" | "busy" | "oof" | "workingElsewhere" | "unknown";
  sensitivity?: "normal" | "personal" | "private" | "confidential";
  categories?: string[];
  // Extended properties for TeqBook metadata
  extensions?: Array<{
    "@odata.type": "microsoft.graph.openTypeExtension";
    extensionName: string;
    [key: string]: unknown;
  }>;
}

export interface OutlookCalendar {
  id: string;
  name: string;
  color?: string;
  isDefaultCalendar?: boolean;
  canEdit: boolean;
  canViewPrivateItems?: boolean;
  owner?: {
    name: string;
    address: string;
  };
}

// =====================================================
// Service Input/Output Types
// =====================================================

export interface OutlookConnectResult {
  userId: string;
  email: string;
  displayName: string;
}

export interface OutlookSyncResult {
  success: boolean;
  eventId?: string;
  error?: string;
}

// =====================================================
// Microsoft Graph API Response Types
// =====================================================

export interface GraphCalendarListResponse {
  value: OutlookCalendar[];
  "@odata.nextLink"?: string;
}

export interface GraphEventResponse {
  value: OutlookCalendarEvent[];
  "@odata.nextLink"?: string;
}
