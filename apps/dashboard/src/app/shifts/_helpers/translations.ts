import type { ResolvedNamespace } from "@/i18n/resolve-namespace";

type ShiftsT = ResolvedNamespace<"shifts">;

export function buildCopyTranslations(t: ShiftsT) {
  return {
    copyShifts: t.copyShifts,
    copyStepSource: t.copyStepSource,
    copyStepPattern: t.copyStepPattern,
    copyStepTargets: t.copyStepTargets,
    copyFromEmployee: t.copyFromEmployee,
    copyFromOpeningHours: t.copyFromOpeningHours,
    copyNoShiftsHint: t.copyNoShiftsHint,
    copyAddInterval: t.copyAddInterval,
    copyMondayToRest: t.copyMondayToRest,
    copyTotalHours: t.copyTotalHours,
    copySelectTargets: t.copySelectTargets,
    copySearchEmployee: t.copySearchEmployee,
    copySelectAll: t.copySelectAll,
    copySelectNone: t.copySelectNone,
    copySelectWithoutShifts: t.copySelectWithoutShifts,
    copyStrategyAdditive: t.copyStrategyAdditive,
    copyStrategyAdditiveDesc: t.copyStrategyAdditiveDesc,
    copyStrategyReplace: t.copyStrategyReplace,
    copyStrategyReplaceDesc: t.copyStrategyReplaceDesc,
    copyStrategyReplaceConfirm: t.copyStrategyReplaceConfirm,
    copyPreviewCreate: t.copyPreviewCreate,
    copyPreviewSkip: t.copyPreviewSkip,
    copyPreviewConflict: t.copyPreviewConflict,
    copyPreviewDetails: t.copyPreviewDetails,
    copyApplyButton: t.copyApplyButton,
    copyApplyingButton: t.copyApplyingButton,
    copyResultToast: t.copyResultToast,
    copyResultSkipped: t.copyResultSkipped,
    copyResultClose: t.copyResultClose,
    copyBack: t.copyBack,
    copyNext: t.copyNext,
    daysWorking: t.daysWorking,
  };
}

export function buildCreateFormTranslations(t: ShiftsT) {
  return {
    newShift: t.newShift,
    employeeLabel: t.employeeLabel,
    employeePlaceholder: t.employeePlaceholder,
    weekdayLabel: t.weekdayLabel,
    startLabel: t.startLabel,
    endLabel: t.endLabel,
    addButton: t.addButton,
    saving: t.saving,
    needEmployeeHint: t.needEmployeeHint,
    addError: t.addError,
    overlapError: t.editShiftOverlapError,
  };
}

export function buildEditDialogTranslations(t: ShiftsT) {
  return {
    employeeLabel: t.employeeLabel,
    employeePlaceholder: t.employeePlaceholder,
    weekdayLabel: t.weekdayLabel,
    startLabel: t.startLabel,
    endLabel: t.endLabel,
  };
}

export function buildListViewTranslations(t: ShiftsT) {
  return {
    emptyTitle: t.emptyTitle,
    emptyDescription: t.emptyDescription,
    mobileUnknownEmployee: t.mobileUnknownEmployee,
    daysWorking: t.daysWorking,
    noShiftsForEmployee: t.noShiftsForEmployee,
    addShiftCta: t.addShiftCta,
    overlap: t.overlap,
    invalidTime: t.invalidTime,
    setupShiftsTitle: t.setupShiftsTitle,
    setupShiftsDescription: t.setupShiftsDescription,
    collapseAll: t.collapseAll,
    expandAll: t.expandAll,
  };
}

export function buildWeekViewTranslations(t: ShiftsT) {
  return {
    emptyTitle: t.emptyTitle,
    emptyDescription: t.emptyDescription,
    addShiftCta: t.addShiftCta,
    overlap: t.overlap,
    outsideHours: t.outsideHours,
    override: t.override,
    saved: t.saved,
    hoursThisWeek: t.hoursThisWeek,
    daysWorking: t.daysWorking,
    lowCapacity: t.lowCapacity,
    today: t.today,
    breakDefaultLabel: t.breakDefaultLabel,
  };
}
