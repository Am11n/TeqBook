export function buildCopyTranslations(t: Record<string, string>) {
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

export function buildCreateFormTranslations(t: Record<string, string>) {
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
  };
}

export function buildEditDialogTranslations(t: Record<string, string>) {
  return {
    employeeLabel: t.employeeLabel,
    employeePlaceholder: t.employeePlaceholder,
    weekdayLabel: t.weekdayLabel,
    startLabel: t.startLabel,
    endLabel: t.endLabel,
  };
}

export function buildListViewTranslations(t: Record<string, string>) {
  return {
    emptyTitle: t.emptyTitle,
    emptyDescription: t.emptyDescription,
    mobileUnknownEmployee: t.mobileUnknownEmployee,
    daysWorking: t.daysWorking ?? "days",
    noShiftsForEmployee: t.noShiftsForEmployee ?? "No shifts configured",
    addShiftCta: t.addShiftCta ?? "Add shift",
    overlap: t.overlap ?? "Overlap",
    invalidTime: t.invalidTime ?? "Invalid time",
    setupShiftsTitle: t.setupShiftsTitle ?? "Set up working hours",
    setupShiftsDescription: t.setupShiftsDescription ?? "Define working hours for your employees so the system can calculate available booking slots.",
    collapseAll: t.collapseAll ?? "Collapse all",
    expandAll: t.expandAll ?? "Expand all",
  };
}

export function buildWeekViewTranslations(t: Record<string, string>) {
  return {
    emptyTitle: t.emptyTitle,
    emptyDescription: t.emptyDescription,
    addShiftCta: t.addShiftCta ?? "Legg til",
    overlap: t.overlap ?? "Overlapp",
    outsideHours: t.outsideHours ?? "Utenfor åpningstid",
    override: t.override ?? "Overstyrt",
    saved: t.saved ?? "Lagret",
    hoursThisWeek: t.hoursThisWeek ?? "timer denne uken",
    daysWorking: t.daysWorking ?? "dager",
    lowCapacity: t.lowCapacity ?? "Lav kapasitet",
    today: t.today ?? "I dag",
  };
}
