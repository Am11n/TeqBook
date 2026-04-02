/** Deep-merge plain objects for locale overrides (no arrays). */
export function deepMergeAdminConsole<T extends Record<string, unknown>>(
  base: T,
  patch: Record<string, unknown>
): T {
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(patch)) {
    const pv = patch[key];
    const bv = out[key];
    if (
      pv !== undefined &&
      typeof pv === "object" &&
      pv !== null &&
      !Array.isArray(pv) &&
      typeof bv === "object" &&
      bv !== null &&
      !Array.isArray(bv)
    ) {
      out[key] = deepMergeAdminConsole(bv as Record<string, unknown>, pv as Record<string, unknown>);
    } else if (pv !== undefined) {
      out[key] = pv;
    }
  }
  return out as T;
}
