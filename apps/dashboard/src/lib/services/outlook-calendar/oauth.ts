import { logError } from "@/lib/services/logger";
import type {
  MicrosoftOAuthTokens,
  MicrosoftUserInfo,
} from "@/lib/types/outlook-calendar";

const MICROSOFT_AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const MICROSOFT_TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const GRAPH_API_BASE = "https://graph.microsoft.com/v1.0";

const CLIENT_ID = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || "";
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || "";

const SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "Calendars.ReadWrite",
];

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
