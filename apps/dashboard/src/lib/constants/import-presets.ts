export type ImportPreset = {
  id: string;
  name: string;
  importType: "customers" | "services" | "employees" | "bookings";
  mappings: Record<string, string>;
};

export const IMPORT_PRESETS: ImportPreset[] = [
  // Timma presets
  {
    id: "timma-customers",
    name: "Timma",
    importType: "customers",
    mappings: {
      "Nimi": "full_name",
      "Sähköposti": "email",
      "Puhelin": "phone",
      "Muistiinpanot": "notes",
    },
  },
  {
    id: "timma-services",
    name: "Timma",
    importType: "services",
    mappings: {
      "Nimi": "name",
      "Kesto (min)": "duration_minutes",
      "Hinta": "price_cents",
      "Kategoria": "category",
    },
  },
  {
    id: "timma-employees",
    name: "Timma",
    importType: "employees",
    mappings: {
      "Nimi": "full_name",
      "Sähköposti": "email",
      "Rooli": "role",
    },
  },
  {
    id: "timma-bookings",
    name: "Timma",
    importType: "bookings",
    mappings: {
      "Alkaa": "start_time",
      "Päättyy": "end_time",
      "Asiakas": "customer_name",
      "Palvelu": "service_name",
      "Työntekijä": "employee_name",
      "Tila": "status",
    },
  },
  // Fresha presets
  {
    id: "fresha-customers",
    name: "Fresha",
    importType: "customers",
    mappings: {
      "Client Name": "full_name",
      "Email": "email",
      "Mobile": "phone",
      "Notes": "notes",
    },
  },
  {
    id: "fresha-services",
    name: "Fresha",
    importType: "services",
    mappings: {
      "Service Name": "name",
      "Duration": "duration_minutes",
      "Price": "price_cents",
      "Category": "category",
    },
  },
  {
    id: "fresha-employees",
    name: "Fresha",
    importType: "employees",
    mappings: {
      "Staff Name": "full_name",
      "Email": "email",
      "Role": "role",
    },
  },
  {
    id: "fresha-bookings",
    name: "Fresha",
    importType: "bookings",
    mappings: {
      "Start": "start_time",
      "End": "end_time",
      "Client": "customer_name",
      "Service": "service_name",
      "Staff": "employee_name",
      "Status": "status",
    },
  },
  // Setmore presets
  {
    id: "setmore-customers",
    name: "Setmore",
    importType: "customers",
    mappings: {
      "Customer Name": "full_name",
      "Email Address": "email",
      "Phone Number": "phone",
      "Notes": "notes",
    },
  },
  {
    id: "setmore-services",
    name: "Setmore",
    importType: "services",
    mappings: {
      "Service Name": "name",
      "Duration (mins)": "duration_minutes",
      "Price": "price_cents",
      "Category": "category",
    },
  },
  {
    id: "setmore-employees",
    name: "Setmore",
    importType: "employees",
    mappings: {
      "Staff Name": "full_name",
      "Email": "email",
      "Role": "role",
    },
  },
  {
    id: "setmore-bookings",
    name: "Setmore",
    importType: "bookings",
    mappings: {
      "Start Time": "start_time",
      "End Time": "end_time",
      "Customer": "customer_name",
      "Service": "service_name",
      "Staff Member": "employee_name",
      "Status": "status",
    },
  },
];

export function getPresetsForType(importType: string): ImportPreset[] {
  return IMPORT_PRESETS.filter((p) => p.importType === importType);
}

/**
 * Auto-suggest mapping by fuzzy matching CSV headers to TeqBook fields.
 */
export function autoSuggestMapping(
  csvHeaders: string[],
  importType: string
): Record<string, string> {
  const mapping: Record<string, string> = {};
  const targetFields = getTargetFields(importType);

  for (const header of csvHeaders) {
    const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, "");

    for (const field of targetFields) {
      const fieldNormalized = field.key.toLowerCase().replace(/_/g, "");
      if (
        normalized === fieldNormalized ||
        normalized.includes(fieldNormalized) ||
        fieldNormalized.includes(normalized) ||
        field.aliases.some((a) => normalized.includes(a) || a.includes(normalized))
      ) {
        mapping[header] = field.key;
        break;
      }
    }
  }

  return mapping;
}

type TargetField = {
  key: string;
  label: string;
  required: boolean;
  aliases: string[];
};

export function getTargetFields(importType: string): TargetField[] {
  switch (importType) {
    case "customers":
      return [
        { key: "full_name", label: "Full Name", required: true, aliases: ["name", "fullname", "nimi", "client", "customer", "kundenavn", "navn"] },
        { key: "email", label: "Email", required: false, aliases: ["email", "epost", "mail", "sahkoposti"] },
        { key: "phone", label: "Phone", required: false, aliases: ["phone", "mobile", "tel", "telefon", "puhelin", "mobil"] },
        { key: "notes", label: "Notes", required: false, aliases: ["notes", "comments", "muistiinpanot", "notat", "merknad"] },
      ];
    case "services":
      return [
        { key: "name", label: "Service Name", required: true, aliases: ["name", "service", "nimi", "tjeneste", "palvelu"] },
        { key: "duration_minutes", label: "Duration (min)", required: true, aliases: ["duration", "kesto", "varighet", "minutter", "min"] },
        { key: "price_cents", label: "Price", required: true, aliases: ["price", "hinta", "pris", "cost"] },
        { key: "category", label: "Category", required: false, aliases: ["category", "kategoria", "kategori", "type"] },
      ];
    case "employees":
      return [
        { key: "full_name", label: "Full Name", required: true, aliases: ["name", "fullname", "nimi", "staff", "ansatt", "navn"] },
        { key: "email", label: "Email", required: false, aliases: ["email", "epost", "mail"] },
        { key: "role", label: "Role", required: false, aliases: ["role", "rooli", "rolle"] },
      ];
    case "bookings":
      return [
        { key: "start_time", label: "Start Time", required: true, aliases: ["start", "alkaa", "starttid", "begin"] },
        { key: "end_time", label: "End Time", required: false, aliases: ["end", "paattyy", "sluttid", "finish"] },
        { key: "customer_name", label: "Customer", required: false, aliases: ["customer", "client", "asiakas", "kunde"] },
        { key: "service_name", label: "Service", required: false, aliases: ["service", "palvelu", "tjeneste"] },
        { key: "employee_name", label: "Employee", required: false, aliases: ["employee", "staff", "tyontekija", "ansatt"] },
        { key: "status", label: "Status", required: false, aliases: ["status", "tila"] },
      ];
    default:
      return [];
  }
}
