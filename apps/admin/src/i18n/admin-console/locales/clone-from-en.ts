import type { AdminConsoleMessages } from "./en";
import { enAdminConsole } from "./en";

export function cloneAdminConsoleFromEn(): AdminConsoleMessages {
  return JSON.parse(JSON.stringify(enAdminConsole)) as AdminConsoleMessages;
}
