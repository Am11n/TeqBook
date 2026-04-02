import type { TranslationNamespaces } from "../../types/namespaces";

export const customers: TranslationNamespaces["customers"] = {

    title: "Customers",
    description:
      "A simple customer registry for your salon. Used together with bookings.",
    mustBeLoggedIn: "You must be signed in to view customers.",
    noSalon:
      "No salon is linked to your user. Please complete onboarding first.",
    loadError: "Could not load customers.",
    addError: "Could not add customer.",
    newCustomer: "New customer",
    nameLabel: "Name",
    namePlaceholder: "e.g. Jane Doe",
    emailLabel: "Email (optional)",
    emailPlaceholder: "customer@example.com",
    phoneLabel: "Phone (optional)",
    phonePlaceholder: "+47 99 99 99 99",
    notesLabel: "Notes (optional)",
    notesPlaceholder:
      "For example preferred stylist, allergies, etc.",
    gdprLabel:
      "I have consent to store and contact this customer (GDPR).",
    saving: "Saving…",
    addButton: "Add customer",
    tableTitle: "Your customers",
    loading: "Loading customers…",
    emptyTitle: "No customers added yet",
    emptyDescription:
      "When you add customers in the form on the left they will appear here. They can be linked to bookings later.",
    mobileConsentYes: "Consent saved",
    mobileConsentNo: "No consent",
    delete: "Delete",
    colName: "Name",
    colContact: "Contact",
    colNotes: "Notes",
    colGdpr: "GDPR",
    colActions: "Actions",
    consentYes: "Yes",
    consentNo: "No",
};
