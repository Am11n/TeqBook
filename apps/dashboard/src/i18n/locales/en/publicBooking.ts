import type { TranslationNamespaces } from '../../types';

export const publicBooking: TranslationNamespaces['publicBooking'] = {
    notFound: "Could not find this salon or it is not marked as public.",
    loadError: "Could not load services/employees.",
    loadingSalon: "Loading salon…",
    headerSubtitle: "Book an appointment – pay physically in the salon.",
    payInSalonBadge: "Pay in salon",
    step1Title: "1. Choose treatment",
    step1Description:
      "Start by choosing a service, then employee and time.",
    serviceLabel: "Service",
    servicePlaceholder: "Select service…",
    employeeLabel: "Employee",
    employeePlaceholder: "Select employee…",
    dateLabel: "Date",
    loadSlots: "Load available times",
    loadingSlots: "Loading available times…",
    step2Label: "2. Choose time",
    noSlotsYet: "Load available times first",
    selectSlotPlaceholder: "Select a time…",
    step3Title: "3. Your details",
    step3Description:
      "We use this to confirm your booking and optionally send a reminder. Payment always happens in the salon.",
    nameLabel: "Name",
    emailLabel: "Email (optional)",
    emailPlaceholder: "you@example.com",
    phoneLabel: "Phone (optional)",
    phonePlaceholder: "+47 99 99 99 99",
    submitSaving: "Sending request…",
    submitLabel: "Confirm request",
    payInfo:
      "You always pay physically in the salon. No online card payments.",
    successMessage:
      "Your booking has been registered! The salon will confirm, and payment happens in the salon.",
    createError: "Something went wrong while creating the booking.",
    unavailableTitle: "Cannot show booking page",
    unavailableDescription:
      "This salon does not exist or is not marked as public.",
  };
