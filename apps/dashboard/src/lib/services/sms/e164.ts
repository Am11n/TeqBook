const E164_REGEX = /^\+[1-9]\d{1,14}$/;

export function normalizeToE164(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Keep leading + and digits only.
  const normalized = trimmed
    .replace(/[^\d+]/g, "")
    .replace(/(?!^)\+/g, "");

  if (!E164_REGEX.test(normalized)) {
    return null;
  }

  return normalized;
}
