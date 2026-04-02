import type { TranslationNamespaces } from "../../types/namespaces";

export const shifts: TranslationNamespaces["shifts"] = {

    title: "Mga shift at oras ng bukas",
    description:
      "I-define ang regular na oras ng trabaho para sa bawat empleyado. Ginagamit ito para kalkulahin ang available na oras.",
    mustBeLoggedIn: "Kailangan mong mag-log in para makita ang mga shift.",
    noSalon:
      "Wala pang salon na naka-link sa account mo. Kumpletuhin muna ang onboarding.",
    loadError: "Hindi ma-load ang mga shift.",
    addError: "Hindi madagdag ang shift.",
    newShift: "Bagong shift",
    employeeLabel: "Empleyado",
    employeePlaceholder: "Pumili ng empleyado…",
    weekdayLabel: "Araw ng linggo",
    startLabel: "Simula",
    endLabel: "Tapos",
    saving: "Sine-save…",
    addButton: "Magdagdag ng shift",
    needEmployeeHint:
      "Kailangan mo munang magkaroon ng kahit isang empleyado bago magdagdag ng shift.",
    tableTitle: "Mga shift mo",
    loading: "Ikinakarga ang mga shift…",
    emptyTitle: "Wala pang nadadagdag na shift",
    emptyDescription:
      "Kapag nagdagdag ka ng shift sa form sa kaliwa, lalabas ang mga ito rito at gagamitin sa pagkalkula ng available na oras.",
    mobileUnknownEmployee: "Hindi kilalang empleyado",
    desktopUnknownEmployee: "Hindi kilalang empleyado",
    colEmployee: "Empleyado",
    colDay: "Araw",
    colTime: "Oras",
    colActions: "Mga aksyon",
    delete: "Tanggalin",
};
