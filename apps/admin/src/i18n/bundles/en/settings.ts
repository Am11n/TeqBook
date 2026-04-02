import type { TranslationNamespaces } from "../../types/namespaces";

export const settings: TranslationNamespaces["settings"] = {

    title: "Settings",
    description: "Manage your salon settings and preferences.",
    generalTab: "General",
    notificationsTab: "Notifications",
    billingTab: "Billing",
    brandingTab: "Branding",
    // General settings
    generalTitle: "General Settings",
    generalDescription: "Manage your salon's basic information and contact details.",
    salonNameLabel: "Salon Name",
    salonTypeLabel: "Salon Type",
    whatsappNumberLabel: "WhatsApp Number",
    whatsappNumberPlaceholder: "+47 99 99 99 99",
    whatsappNumberHint: "Include country code. This number will be shown on your public booking page.",
    supportedLanguagesLabel: "Supported Languages",
    supportedLanguagesHint: "Select which languages should be available on your public booking page.",
    defaultLanguageLabel: "Default Language",
    defaultLanguageHint: "Default language for public booking page if no other is selected.",
    userPreferredLanguageLabel: "Your Preferred Language",
    userPreferredLanguageHint: "This language is used in your dashboard. This can be different from the salon's default language.",
    saveButton: "Save Changes",
    saving: "Saving…",
    saved: "Settings saved successfully",
    error: "Failed to save settings",
    // Notifications settings
    notificationsTitle: "Notification Preferences",
    notificationsDescription: "Configure how you receive booking reminders and updates.",
    emailRemindersEnabled: "Enable email reminders",
    emailRemindersHint: "Send email reminders to customers before their appointments.",
    // Billing settings
    billingTitle: "Billing & Subscription",
    billingDescription: "Manage your subscription plan and add-ons.",
    currentPlan: "Current Plan",
    planStarter: "Starter",
    planPro: "Pro",
    planBusiness: "Business",
    addOns: "Add-ons",
    // Branding settings
    brandingTitle: "Branding & Theme",
    brandingDescription: "Customize your salon's appearance and booking page theme.",
    comingSoon: "Coming soon",
};
