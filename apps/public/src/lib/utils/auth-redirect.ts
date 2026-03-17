const DEFAULT_PUBLIC_APP_ORIGIN = "https://teqbook.com";

function toOrigin(rawUrl: string | undefined): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

export function resolvePublicAppOrigin(): string {
  const configuredOrigin = toOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (configuredOrigin) return configuredOrigin;

  if (typeof window !== "undefined") {
    const browserOrigin = toOrigin(window.location.origin);
    if (browserOrigin) return browserOrigin;
  }

  return DEFAULT_PUBLIC_APP_ORIGIN;
}

export function buildPublicAuthRedirect(pathname: string, searchParams?: Record<string, string>): string {
  const url = new URL(pathname, resolvePublicAppOrigin());
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}
