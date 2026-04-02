import type { TranslationNamespaces } from "../../types/namespaces";

export const shifts: TranslationNamespaces["shifts"] = {

    title: "Shifts & opening hours",
    description:
      "Define fixed working hours per employee. Used later to calculate available bookable times.",
    mustBeLoggedIn: "You must be signed in to view shifts.",
    noSalon:
      "No salon is linked to your user. Please complete onboarding first.",
    loadError: "Could not load shifts.",
    addError: "Could not add shift.",
    newShift: "New shift",
    employeeLabel: "Employee",
    employeePlaceholder: "Select employee…",
    weekdayLabel: "Weekday",
    startLabel: "Start",
    endLabel: "End",
    saving: "Saving…",
    addButton: "Add shift",
    needEmployeeHint:
      "You must create at least one employee before you can add shifts.",
    tableTitle: "Your shifts",
    loading: "Loading shifts…",
    emptyTitle: "No shifts added yet",
    emptyDescription:
      "When you add shifts in the form on the left, they will appear here and later be used to calculate available times.",
    mobileUnknownEmployee: "Unknown employee",
    desktopUnknownEmployee: "Unknown employee",
    colEmployee: "Employee",
    colDay: "Day",
    colTime: "Time",
    colActions: "Actions",
    delete: "Delete",
};
