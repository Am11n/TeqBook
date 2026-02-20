export function buildCardViewTranslations(t: Record<string, string>, locale: string) {
  return {
    active: t.active, inactive: t.inactive, delete: t.delete, edit: t.edit ?? "Edit",
    categoryCut: t.categoryCut, categoryBeard: t.categoryBeard, categoryColor: t.categoryColor,
    categoryNails: t.categoryNails, categoryMassage: t.categoryMassage, categoryOther: t.categoryOther,
    staffUnit: t.staffUnit ?? "staff", locale,
  };
}

export function buildTableTranslations(t: Record<string, string>, locale: string) {
  return {
    colName: t.colName, colCategory: t.colCategory, colDuration: t.colDuration,
    colPrice: t.colPrice, colStatus: t.colStatus, colEmployees: t.colEmployees ?? "Staff",
    active: t.active, inactive: t.inactive, delete: t.delete, edit: t.edit ?? "Edit",
    moveUp: t.moveUp ?? "Move up", moveDown: t.moveDown ?? "Move down",
    categoryCut: t.categoryCut, categoryBeard: t.categoryBeard, categoryColor: t.categoryColor,
    categoryNails: t.categoryNails, categoryMassage: t.categoryMassage, categoryOther: t.categoryOther,
    staffUnit: t.staffUnit ?? "staff", prepBadge: t.prepBadge ?? "prep",
    afterBadge: t.afterBadge ?? "after", locale,
  };
}

export function buildCreateDialogTranslations(t: Record<string, string>) {
  return {
    dialogTitle: t.dialogTitle, dialogDescription: t.dialogDescription,
    nameLabel: t.nameLabel, namePlaceholder: t.namePlaceholder,
    categoryLabel: t.categoryLabel, categoryCut: t.categoryCut,
    categoryBeard: t.categoryBeard, categoryColor: t.categoryColor,
    categoryNails: t.categoryNails, categoryMassage: t.categoryMassage,
    categoryOther: t.categoryOther, durationLabel: t.durationLabel,
    priceLabel: t.priceLabel, sortOrderLabel: t.sortOrderLabel,
    cancel: t.cancel, newService: t.newService,
  };
}

export function buildDetailDialogTranslations(t: Record<string, string>, locale: string) {
  return {
    editTitle: t.detailTitle ?? "Edit service",
    detailDescription: t.detailDescription ?? "Overview of service, staff and status.",
    editDescription: t.editDescription ?? "Update service details.",
    active: t.active, inactive: t.inactive, categoryLabel: t.categoryLabel,
    categoryCut: t.categoryCut, categoryBeard: t.categoryBeard, categoryColor: t.categoryColor,
    categoryNails: t.categoryNails, categoryMassage: t.categoryMassage, categoryOther: t.categoryOther,
    durationLabel: t.durationLabel, priceLabel: t.priceLabel,
    staffUnit: t.staffUnit ?? "staff", colEmployees: t.colEmployees ?? "Staff",
    prepMinutesLabel: t.prepMinutesLabel ?? "Prep time (min)",
    cleanupMinutesLabel: t.cleanupMinutesLabel ?? "Cleanup time (min)",
    nameLabel: t.nameLabel, sortOrderLabel: t.sortOrderLabel,
    close: t.close ?? "Close", edit: t.edit ?? "Edit",
    cancel: t.cancel, save: t.save ?? "Save", saving: t.saving ?? "Saving...",
    locale,
  };
}
