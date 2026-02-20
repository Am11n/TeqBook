import { logError } from "@/lib/services/logger";
import type { GoogleOAuthTokens } from "@/lib/types/calendar";

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
  "openid",
  "email",
];

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
