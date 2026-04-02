import type { TranslationNamespaces } from "../../types/namespaces";

export const services: TranslationNamespaces["services"] = {

    title: "Services",
    description:
      "Define services with duration and price. Used in the booking engine.",
    mustBeLoggedIn: "You must be signed in to view services.",
    noSalon:
      "No salon is linked to your user. Please complete onboarding first.",
    addError: "Could not add service.",
    updateError: "Could not update service.",
    newService: "New service",
    nameLabel: "Name",
    namePlaceholder: "e.g. Women's cut",
    categoryLabel: "Category",
    categoryCut: "Cut",
    categoryBeard: "Beard",
    categoryColor: "Color",
    categoryNails: "Nails",
    categoryMassage: "Massage",
    categoryOther: "Other",
    durationLabel: "Duration (minutes)",
    priceLabel: "Price (NOK)",
    sortOrderLabel: "Sort order",
    loading: "Loading services…",
    emptyTitle: "No services added yet",
    emptyDescription:
      "Add services in the form on the left. They are used to calculate duration and price in the booking engine.",
    tableTitle: "Your services",
    colName: "Name",
    colCategory: "Category",
    colDuration: "Duration",
    colPrice: "Price",
    colStatus: "Status",
    colActions: "Actions",
    active: "Active",
    inactive: "Inactive",
    delete: "Delete",
};
