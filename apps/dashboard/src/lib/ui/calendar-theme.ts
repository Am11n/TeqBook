/**
 * Calendar Theme — Single source of truth for all calendar colors.
 *
 * Every calendar component MUST import from here.
 * No component may define its own calendar colors.
 */

// ─── Types ─────────────────────────────────────────────

export type CalendarDensity = "compact" | "comfortable";

export type BookingClasses = {
  /** Card wrapper: border-l accent + bg + shadow + rounded */
  card: string;
  /** Service / customer name text color (high contrast) */
  title: string;
  /** Time / meta text color (muted) */
  subtitle: string;
};

export type EmployeeAccent = {
  /** bg class for the header dot */
  dot: string;
  /** border-t class for the column top-bar */
  border: string;
};

export type EmployeeAccentFull = EmployeeAccent & {
  /** Background for shift cards */
  bg: string;
  /** Hover background for shift cards */
  bgHover: string;
  /** Left border accent for shift cards (3px stripe) */
  borderLeft: string;
  /** Text color for labels in colored context */
  text: string;
};

export type DensityConfig = {
  slotHeight: number;
  fontSize: string;
  padding: string;
  minCardHeight: number;
};

// ─── Segment Classes (Layer 1 + 2: Base grid + dead time) ──

export function getSegmentClasses(type: string): string {
  switch (type) {
    case "working":
      return "bg-white dark:bg-zinc-950";
    case "closed":
      return "bg-zinc-100 dark:bg-zinc-900/60";
    case "break":
      return "bg-zinc-100 dark:bg-zinc-800 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.06)_4px,rgba(0,0,0,0.06)_8px)]";
    case "time_block":
      return "bg-zinc-200 dark:bg-zinc-700";
    case "buffer":
      return "bg-zinc-100/60 dark:bg-zinc-800/40 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.04)_3px,rgba(0,0,0,0.04)_6px)]";
    default:
      return "";
  }
}

// ─── Booking Card Classes (Layer 3: status colors) ─────

const BOOKING_BASE = "rounded-md shadow-sm hover:shadow-md transition-shadow";

const BOOKING_MAP: Record<string, BookingClasses> = {
  confirmed: {
    card: `border-l-[3px] border-l-blue-500 bg-blue-50 dark:bg-blue-950/30 ${BOOKING_BASE}`,
    title: "text-blue-950 dark:text-blue-100",
    subtitle: "text-blue-800/70 dark:text-blue-300/70",
  },
  pending: {
    card: `border-l-[3px] border-l-amber-500 bg-amber-50 dark:bg-amber-950/30 ${BOOKING_BASE}`,
    title: "text-amber-950 dark:text-amber-100",
    subtitle: "text-amber-800/70 dark:text-amber-300/70",
  },
  completed: {
    card: `border-l-[3px] border-l-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 ${BOOKING_BASE}`,
    title: "text-emerald-950 dark:text-emerald-100",
    subtitle: "text-emerald-800/70 dark:text-emerald-300/70",
  },
  cancelled: {
    card: `border-l-[3px] border-l-red-400 bg-red-50/50 dark:bg-red-950/20 opacity-60 ${BOOKING_BASE}`,
    title: "text-red-500 dark:text-red-400 line-through",
    subtitle: "text-red-400/70 dark:text-red-400/60",
  },
  "no-show": {
    card: `border-l-[3px] border-l-orange-500 bg-orange-50 dark:bg-orange-950/30 ${BOOKING_BASE}`,
    title: "text-orange-950 dark:text-orange-100",
    subtitle: "text-orange-800/70 dark:text-orange-300/70",
  },
};

const BOOKING_DEFAULT: BookingClasses = {
  card: `border-l-[3px] border-l-zinc-300 bg-zinc-50 dark:bg-zinc-800 ${BOOKING_BASE}`,
  title: "text-zinc-600 dark:text-zinc-300",
  subtitle: "text-zinc-500/70 dark:text-zinc-400/70",
};

export function getBookingClasses(status: string | null | undefined): BookingClasses {
  if (!status) return BOOKING_DEFAULT;
  return BOOKING_MAP[status] ?? BOOKING_DEFAULT;
}

// ─── Booking Badge Classes (for inline status pills) ───

const BADGE_MAP: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  "no-show": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
};

export function getBookingBadgeClasses(status: string | null | undefined): string {
  if (!status) return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  return BADGE_MAP[status] ?? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
}

// ─── Employee Accent (deterministic from ID) ───────────

const ACCENT_PALETTE: EmployeeAccent[] = [
  { dot: "bg-blue-400", border: "border-t-blue-400" },
  { dot: "bg-emerald-400", border: "border-t-emerald-400" },
  { dot: "bg-amber-400", border: "border-t-amber-400" },
  { dot: "bg-purple-400", border: "border-t-purple-400" },
  { dot: "bg-rose-400", border: "border-t-rose-400" },
  { dot: "bg-cyan-400", border: "border-t-cyan-400" },
  { dot: "bg-lime-400", border: "border-t-lime-400" },
  { dot: "bg-fuchsia-400", border: "border-t-fuchsia-400" },
];

const ACCENT_FULL_PALETTE: EmployeeAccentFull[] = [
  { dot: "bg-blue-400", border: "border-t-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40", bgHover: "hover:bg-blue-100 dark:hover:bg-blue-900/50", borderLeft: "border-l-blue-400", text: "text-blue-700 dark:text-blue-300" },
  { dot: "bg-emerald-400", border: "border-t-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", bgHover: "hover:bg-emerald-100 dark:hover:bg-emerald-900/50", borderLeft: "border-l-emerald-400", text: "text-emerald-700 dark:text-emerald-300" },
  { dot: "bg-amber-400", border: "border-t-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", bgHover: "hover:bg-amber-100 dark:hover:bg-amber-900/50", borderLeft: "border-l-amber-400", text: "text-amber-700 dark:text-amber-300" },
  { dot: "bg-purple-400", border: "border-t-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40", bgHover: "hover:bg-purple-100 dark:hover:bg-purple-900/50", borderLeft: "border-l-purple-400", text: "text-purple-700 dark:text-purple-300" },
  { dot: "bg-rose-400", border: "border-t-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40", bgHover: "hover:bg-rose-100 dark:hover:bg-rose-900/50", borderLeft: "border-l-rose-400", text: "text-rose-700 dark:text-rose-300" },
  { dot: "bg-cyan-400", border: "border-t-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/40", bgHover: "hover:bg-cyan-100 dark:hover:bg-cyan-900/50", borderLeft: "border-l-cyan-400", text: "text-cyan-700 dark:text-cyan-300" },
  { dot: "bg-lime-400", border: "border-t-lime-400", bg: "bg-lime-50 dark:bg-lime-950/40", bgHover: "hover:bg-lime-100 dark:hover:bg-lime-900/50", borderLeft: "border-l-lime-400", text: "text-lime-700 dark:text-lime-300" },
  { dot: "bg-fuchsia-400", border: "border-t-fuchsia-400", bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40", bgHover: "hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/50", borderLeft: "border-l-fuchsia-400", text: "text-fuchsia-700 dark:text-fuchsia-300" },
];

function employeeHash(employeeId: string): number {
  let hash = 0;
  for (let i = 0; i < employeeId.length; i++) {
    hash = ((hash << 5) - hash + employeeId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getEmployeeAccent(employeeId: string): EmployeeAccent {
  return ACCENT_PALETTE[employeeHash(employeeId) % ACCENT_PALETTE.length];
}

export function getEmployeeAccentFull(employeeId: string): EmployeeAccentFull {
  return ACCENT_FULL_PALETTE[employeeHash(employeeId) % ACCENT_FULL_PALETTE.length];
}

// ─── Density Config ────────────────────────────────────

const DENSITY_MAP: Record<CalendarDensity, DensityConfig> = {
  compact: {
    slotHeight: 32,
    fontSize: "text-xs",
    padding: "px-1.5 py-0.5",
    minCardHeight: 28,
  },
  comfortable: {
    slotHeight: 48,
    fontSize: "text-sm",
    padding: "px-2 py-1",
    minCardHeight: 40,
  },
};

export function getDensityConfig(density: CalendarDensity): DensityConfig {
  return DENSITY_MAP[density];
}
