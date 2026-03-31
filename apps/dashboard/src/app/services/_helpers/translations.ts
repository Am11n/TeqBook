import type { ResolvedNamespace } from "@/i18n/resolve-namespace";

type ServicesT = ResolvedNamespace<"services">;

export function buildCardViewTranslations(t: ServicesT, locale: string) {
  return {
    active: t.active,
    inactive: t.inactive,
    delete: t.delete,
    edit: t.edit,
    categoryCut: t.categoryCut,
    categoryBeard: t.categoryBeard,
    categoryColor: t.categoryColor,
    categoryNails: t.categoryNails,
    categoryMassage: t.categoryMassage,
    categoryOther: t.categoryOther,
    staffUnit: t.staffUnit,
    locale,
  };
}

export function buildTableTranslations(t: ServicesT, locale: string) {
  return {
    colName: t.colName,
    colCategory: t.colCategory,
    colDuration: t.colDuration,
    colPrice: t.colPrice,
    colStatus: t.colStatus,
    colEmployees: t.colEmployees,
    active: t.active,
    inactive: t.inactive,
    delete: t.delete,
    edit: t.edit,
    moveUp: t.moveUp,
    moveDown: t.moveDown,
    categoryCut: t.categoryCut,
    categoryBeard: t.categoryBeard,
    categoryColor: t.categoryColor,
    categoryNails: t.categoryNails,
    categoryMassage: t.categoryMassage,
    categoryOther: t.categoryOther,
    staffUnit: t.staffUnit,
    prepBadge: t.prepBadge,
    afterBadge: t.afterBadge,
    locale,
  };
}

export function buildCreateDialogTranslations(t: ServicesT) {
  return {
    dialogTitle: t.dialogTitle,
    dialogDescription: t.dialogDescription,
    nameLabel: t.nameLabel,
    namePlaceholder: t.namePlaceholder,
    categoryLabel: t.categoryLabel,
    categoryCut: t.categoryCut,
    categoryBeard: t.categoryBeard,
    categoryColor: t.categoryColor,
    categoryNails: t.categoryNails,
    categoryMassage: t.categoryMassage,
    categoryOther: t.categoryOther,
    durationLabel: t.durationLabel,
    priceLabel: t.priceLabel,
    sortOrderLabel: t.sortOrderLabel,
    cancel: t.cancel,
    newService: t.newService,
  };
}

export function buildDetailDialogTranslations(t: ServicesT, locale: string) {
  return {
    editTitle: t.detailTitle,
    detailDescription: t.detailDescription,
    editDescription: t.editDescription,
    active: t.active,
    inactive: t.inactive,
    categoryLabel: t.categoryLabel,
    categoryCut: t.categoryCut,
    categoryBeard: t.categoryBeard,
    categoryColor: t.categoryColor,
    categoryNails: t.categoryNails,
    categoryMassage: t.categoryMassage,
    categoryOther: t.categoryOther,
    durationLabel: t.durationLabel,
    priceLabel: t.priceLabel,
    staffUnit: t.staffUnit,
    colEmployees: t.colEmployees,
    prepMinutesLabel: t.prepMinutesLabel,
    cleanupMinutesLabel: t.cleanupMinutesLabel,
    nameLabel: t.nameLabel,
    sortOrderLabel: t.sortOrderLabel,
    close: t.close,
    edit: t.edit,
    cancel: t.cancel,
    save: t.save,
    saving: t.saving,
    locale,
  };
}
