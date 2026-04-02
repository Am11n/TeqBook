import type { AdminConsoleMessages } from "../en";
import { deepMergeAdminConsole } from "../../merge-deep";
import { cloneAdminConsoleFromEn } from "../clone-from-en";
import { nbOverlayCore } from "./overlay-core";
import { nbOverlayPages1 } from "./overlay-pages-1";
import { nbOverlayPages2 } from "./overlay-pages-2";

const base = cloneAdminConsoleFromEn() as unknown as Record<string, unknown>;
const nbOverlay = {
  ...nbOverlayCore,
  pages: {
    ...nbOverlayPages1,
    ...nbOverlayPages2,
  },
} as Record<string, unknown>;

export const nbAdminConsole = deepMergeAdminConsole(base, nbOverlay) as AdminConsoleMessages;
