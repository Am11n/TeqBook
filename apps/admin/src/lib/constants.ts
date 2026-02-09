/** Must match basePath in next.config.ts. Falls back to "" when no basePath is set (local dev). */
export const BASE_PATH = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH ?? "";

export const FAVICON_PATH = "/Favikon.svg";
