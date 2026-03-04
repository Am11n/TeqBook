import { describe, expect, it } from "vitest";
import {
  TEQBOOK_DEFAULT,
  buildPublicBookingTokens as buildSharedTokens,
  createThemePackSnapshot,
  findThemePackById,
  resolveEffectiveBranding,
  validateThemeOverrides,
} from "@teqbook/shared/branding";
import { buildPublicBookingTokens, computeEffectiveBranding } from "./publicBookingUtils";

describe("public booking branding resolver", () => {
  it("returns TeqBook defaults for starter even with pack and overrides", () => {
    const pack = findThemePackById("barber-bold");
    expect(pack).toBeTruthy();
    const resolved = resolveEffectiveBranding({
      plan: "starter",
      theme_pack_id: "barber-bold",
      theme_pack_snapshot: pack ? createThemePackSnapshot(pack) : null,
      theme_overrides: {
        colors: { primary: "#ff0000" },
      },
      theme: {
        primary: "#00ff00",
        font: "Roboto",
      },
    });

    expect(resolved.source).toBe("teqbook-default");
    expect(resolved.primaryColor).toBe(TEQBOOK_DEFAULT.primaryColor);
    expect(resolved.fontFamily).toBe(TEQBOOK_DEFAULT.fontFamily);
  });

  it("resolves pro pack and keeps deterministic metadata", () => {
    const pack = findThemePackById("nail-gloss");
    expect(pack).toBeTruthy();
    const snapshot = pack ? createThemePackSnapshot(pack) : null;
    const resolved = resolveEffectiveBranding({
      plan: "pro",
      theme_pack_id: pack?.id,
      theme_pack_version: pack?.version,
      theme_pack_hash: snapshot?.hash,
      theme_pack_snapshot: snapshot,
      theme_overrides: {
        colors: {
          primary: "rgb(236, 72, 153)",
        },
      },
    });

    expect(resolved.source).toBe("theme-pack-snapshot");
    expect(resolved.themePackId).toBe("nail-gloss");
    expect(resolved.themePackVersion).toBe(1);
    expect(resolved.themePackHash).toBe(snapshot?.hash);
    expect(resolved.primaryColor).toBe("#ec4899");
  });

  it("falls back when color override is invalid", () => {
    const pack = findThemePackById("barber-bold");
    expect(pack).toBeTruthy();
    const resolved = resolveEffectiveBranding({
      plan: "business",
      theme_pack_id: "barber-bold",
      theme_pack_snapshot: pack ? createThemePackSnapshot(pack) : null,
      theme_overrides: {
        colors: {
          primary: "var(--bad-color)",
        },
      },
    });

    expect(resolved.primaryColor).toBe(pack?.tokens.primaryColor);
  });

  it("rejects business-only override keys on pro save validation", () => {
    const validation = validateThemeOverrides("pro", {
      components: {
        headerVariant: "compact",
      },
    });
    expect(validation.ok).toBe(false);
    expect(validation.issues?.join(" ")).toContain("requires Business");
  });
});

describe("public/dashboard parity wrapper", () => {
  it("produces identical serialized branding and tokens for shared input", () => {
    const salonInput = {
      id: "salon-1",
      name: "Edge Barber",
      plan: "business" as const,
      theme_pack_id: "massage-calm",
      theme_pack_version: 1,
      theme_pack_hash: "tb-manual",
      theme_pack_snapshot: createThemePackSnapshot(findThemePackById("massage-calm")!),
      theme_overrides: {
        logoUrl: "https://example.com/logo.png",
        colors: { primary: "#0d9488" },
        typography: { fontFamily: "Lato" },
      },
      theme: null,
    };

    const sharedResolved = resolveEffectiveBranding(salonInput);
    const sharedTokens = buildSharedTokens(sharedResolved);

    const publicResolved = computeEffectiveBranding(salonInput);
    const publicTokens = buildPublicBookingTokens(publicResolved);

    expect(JSON.stringify(publicResolved)).toBe(JSON.stringify({
      plan: sharedResolved.plan,
      source: sharedResolved.source,
      logoUrl: sharedResolved.logoUrl || "/Favikon.svg",
      primaryColor: sharedResolved.primaryColor,
      secondaryColor: sharedResolved.secondaryColor,
      fontFamily: sharedResolved.fontFamily,
      headerVariant: sharedResolved.headerVariant,
      radiusScale: sharedResolved.radiusScale,
      shadowScale: sharedResolved.shadowScale,
      motionPreset: sharedResolved.motionPreset,
    }));
    expect(JSON.stringify(publicTokens)).toBe(JSON.stringify(sharedTokens));
  });
});
