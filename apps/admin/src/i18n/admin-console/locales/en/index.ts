import { enNavShellCommon } from "./nav-shell-common";
import { enLoginErrorsCmd } from "./login-errors-cmd";
import { enPagesPart1 } from "./pages-part1";
import { enPagesPart2 } from "./pages-part2";
import { enPagesPart3 } from "./pages-part3";
import { enWidgets } from "./widgets";

export const enAdminConsole = {
  ...enNavShellCommon,
  ...enLoginErrorsCmd,
  widgets: enWidgets,
  pages: {
    ...enPagesPart1,
    ...enPagesPart2,
    ...enPagesPart3,
  },
} as const;

export type AdminConsoleMessages = typeof enAdminConsole;
