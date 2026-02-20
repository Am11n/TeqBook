import type { ShiftsMessages } from "@/i18n/translations";

export type CopyShiftsTranslations = Pick<
  ShiftsMessages,
  | "copyShifts" | "copyStepSource" | "copyStepPattern" | "copyStepTargets"
  | "copyFromEmployee" | "copyFromOpeningHours" | "copyNoShiftsHint"
  | "copyAddInterval" | "copyMondayToRest" | "copyTotalHours"
  | "copySelectTargets" | "copySearchEmployee"
  | "copySelectAll" | "copySelectNone" | "copySelectWithoutShifts"
  | "copyStrategyAdditive" | "copyStrategyAdditiveDesc"
  | "copyStrategyReplace" | "copyStrategyReplaceDesc" | "copyStrategyReplaceConfirm"
  | "copyPreviewCreate" | "copyPreviewSkip" | "copyPreviewConflict" | "copyPreviewDetails"
  | "copyApplyButton" | "copyApplyingButton"
  | "copyResultToast" | "copyResultSkipped" | "copyResultClose"
  | "copyBack" | "copyNext"
  | "daysWorking"
>;

export type Step = "source" | "pattern" | "targets" | "result";

export const ISO_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

const DAY_LABELS_NB: Record<number, string> = {
  1: "Man", 2: "Tir", 3: "Ons", 4: "Tor", 5: "Fre", 6: "Lør", 7: "Søn",
};
const DAY_LABELS_EN: Record<number, string> = {
  1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 7: "Sun",
};

export function getDayLabel(isoDay: number, locale: string): string {
  return locale === "nb" ? (DAY_LABELS_NB[isoDay] ?? "") : (DAY_LABELS_EN[isoDay] ?? "");
}
