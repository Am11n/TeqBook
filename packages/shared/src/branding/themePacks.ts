import type { BrandingPackTokens } from "./defaults";

export type ThemePackCategory = "barber" | "nail" | "massage" | "general";

export type ThemePackDefinition = {
  id: string;
  category: ThemePackCategory;
  name: string;
  version: number;
  tokens: BrandingPackTokens;
};

export const THEME_PACKS: readonly ThemePackDefinition[] = [
  {
    id: "barber-bold",
    category: "barber",
    name: "Barber Bold",
    version: 1,
    tokens: {
      primaryColor: "#111827",
      secondaryColor: "#e5e7eb",
      fontFamily: "Montserrat",
      radiusScale: "standard",
      shadowScale: "medium",
      headerVariant: "compact",
      motionPreset: "standard",
    },
  },
  {
    id: "nail-gloss",
    category: "nail",
    name: "Nail Gloss",
    version: 1,
    tokens: {
      primaryColor: "#ec4899",
      secondaryColor: "#fce7f3",
      fontFamily: "Poppins",
      radiusScale: "rounded",
      shadowScale: "soft",
      headerVariant: "standard",
      motionPreset: "calm",
    },
  },
  {
    id: "massage-calm",
    category: "massage",
    name: "Massage Calm",
    version: 1,
    tokens: {
      primaryColor: "#0d9488",
      secondaryColor: "#ccfbf1",
      fontFamily: "Lato",
      radiusScale: "rounded",
      shadowScale: "soft",
      headerVariant: "standard",
      motionPreset: "calm",
    },
  },
];

export function findThemePackById(themePackId: string | null | undefined): ThemePackDefinition | null {
  if (!themePackId) return null;
  return THEME_PACKS.find((pack) => pack.id === themePackId) ?? null;
}
