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
        appearance: {
          backgroundMode: "soft_gradient",
          gradientStart: "#0f2027",
          gradientEnd: "#2c5364",
          gradientAngle: 135,
        },
        components: {
          surfaceStyle: "elevated",
          buttonStyle: "rounded",
          slotStyle: "pill",
          headerStyle: "branded",
        },
      },
      theme: {
        primary: "#00ff00",
        font: "Roboto",
      },
    });

    expect(resolved.source).toBe("teqbook-default");
    expect(resolved.primaryColor).toBe(TEQBOOK_DEFAULT.primaryColor);
    expect(resolved.fontFamily).toBe(TEQBOOK_DEFAULT.fontFamily);
    expect(resolved.backgroundMode).toBe("default");
    expect(resolved.surfaceStyle).toBe("soft");
    expect(resolved.buttonStyle).toBe("soft");
    expect(resolved.slotStyle).toBe("minimal");
  });

  it("normalizes non-canonical business plan strings", () => {
    const resolved = resolveEffectiveBranding({
      plan: "Business",
      theme_overrides: {
        colors: { primary: "#317481" },
      },
    });

    expect(resolved.plan).toBe("business");
    expect(resolved.primaryColor).toBe("#317481");
    expect(resolved.source).toBe("pro-neutral-default");
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

  it("accepts all six v1 controls on pro", () => {
    const validation = validateThemeOverrides("pro", {
      colors: {
        primary: "#317481",
      },
      appearance: {
        backgroundMode: "soft_gradient",
        gradientStart: "#e0f2fe",
        gradientEnd: "#f8fafc",
        gradientAngle: 160,
      },
      components: {
        surfaceStyle: "elevated",
        buttonStyle: "rounded",
        slotStyle: "pill",
        headerStyle: "branded",
      },
    });

    expect(validation.ok).toBe(true);
  });

  it("maps six controls into stable token outputs", () => {
    const resolved = resolveEffectiveBranding({
      plan: "pro",
      theme_pack_id: "barber-bold",
      theme_pack_snapshot: createThemePackSnapshot(findThemePackById("barber-bold")!),
      theme_overrides: {
        colors: { primary: "#317481" },
        appearance: {
          backgroundMode: "soft_gradient",
          gradientStart: "#e0f2fe",
          gradientEnd: "#f8fafc",
          gradientAngle: 170,
        },
        components: {
          surfaceStyle: "elevated",
          buttonStyle: "rounded",
          slotStyle: "pill",
          headerStyle: "branded",
        },
      },
    });

    const tokens = buildSharedTokens(resolved);
    expect(tokens.colors.pageBackground).toContain("linear-gradient");
    expect(tokens.button.radius).toBe("9999px");
    expect(tokens.slot.radius).toBe("9999px");
    expect(tokens.header.logoSize).toBe("52px");
  });

  it("locks profile context to platform background while keeping booking customizable", () => {
    const input = {
      plan: "business" as const,
      theme_pack_id: "barber-bold",
      theme_pack_snapshot: createThemePackSnapshot(findThemePackById("barber-bold")!),
      theme_overrides: {
        appearance: {
          backgroundMode: "soft_gradient" as const,
          gradientStart: "#e0f2fe",
          gradientEnd: "#f8fafc",
          gradientAngle: 160,
        },
      },
    };

    const bookingResolved = resolveEffectiveBranding({
      ...input,
      context: "public_booking",
    });
    const profileResolved = resolveEffectiveBranding({
      ...input,
      context: "public_profile",
    });

    expect(bookingResolved.backgroundMode).toBe("soft_gradient");
    expect(profileResolved.backgroundMode).toBe("default");
    expect(profileResolved.backgroundColor).toBe("#f5f6f8");
    expect(profileResolved.pageBackgroundMode).toBe("solid");
  });

  it("falls back to legacy theme when override object has unknown keys", () => {
    const resolved = resolveEffectiveBranding({
      plan: "business",
      theme_pack_id: "barber-bold",
      theme_pack_snapshot: createThemePackSnapshot(findThemePackById("barber-bold")!),
      theme_overrides: {
        colors: { primary: "#317481" },
        // Simulate stale persisted key from older schema versions.
        unknownContainer: { stale: true },
      } as unknown as Record<string, unknown>,
      theme: {
        primary: "#317481",
        logo_url: "https://example.com/logo.png",
      },
    });

    expect(resolved.primaryColor).toBe("#317481");
    expect(resolved.logoUrl).toBe("https://example.com/logo.png");
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
      pageBackground: sharedResolved.pageBackground,
      cardBackground: sharedResolved.cardBackground,
      pageBackgroundMode: sharedResolved.pageBackgroundMode,
      backgroundMode: sharedResolved.backgroundMode,
      backgroundColor: sharedResolved.backgroundColor,
      gradientStart: sharedResolved.gradientStart,
      gradientEnd: sharedResolved.gradientEnd,
      gradientAngle: sharedResolved.gradientAngle,
      headerVariant: sharedResolved.headerVariant,
      surfaceStyle: sharedResolved.surfaceStyle,
      buttonStyle: sharedResolved.buttonStyle,
      slotStyle: sharedResolved.slotStyle,
      headerStyle: sharedResolved.headerStyle,
      radiusScale: sharedResolved.radiusScale,
      shadowScale: sharedResolved.shadowScale,
      motionPreset: sharedResolved.motionPreset,
    }));
    expect(JSON.stringify(publicTokens)).toBe(JSON.stringify(sharedTokens));
  });
});
