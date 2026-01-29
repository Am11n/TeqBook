export interface BrandingPreset {
  name: string;
  primary: string;
  secondary: string;
  font: string;
}

export const BRANDING_PRESETS: BrandingPreset[] = [
  {
    name: "Default",
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    font: "Inter",
  },
  {
    name: "Elegant",
    primary: "#1f2937",
    secondary: "#6b7280",
    font: "Montserrat",
  },
  {
    name: "Vibrant",
    primary: "#f59e0b",
    secondary: "#ef4444",
    font: "Poppins",
  },
  {
    name: "Calm",
    primary: "#10b981",
    secondary: "#3b82f6",
    font: "Open Sans",
  },
  {
    name: "Modern",
    primary: "#6366f1",
    secondary: "#8b5cf6",
    font: "Roboto",
  },
];

