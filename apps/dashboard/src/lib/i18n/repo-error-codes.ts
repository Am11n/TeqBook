/** Stable machine codes for repository/service errors; UI maps via `mapRepoError`. */
export function tb(code: string): string {
  return `TB|${code}`;
}
