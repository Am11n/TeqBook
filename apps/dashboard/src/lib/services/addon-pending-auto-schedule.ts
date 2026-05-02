// Auto-schedule Model A pending add-on units when the user increases languages or staff
// from settings/employees — mirrors billing-set-pending-addons + Postgres invariant.

import type { PlanType } from "@/lib/types";
import { invariantEval, type AddonDimension } from "@teqbook/shared-core";
import { getSalonById } from "@/lib/repositories/salons";
import * as addonsRepo from "@/lib/repositories/addons";
import { setSalonPendingAddons } from "@/lib/services/billing/subscription";
import { tb } from "@/lib/i18n/repo-error-codes";

export type AddonScheduledNotice = {
  dimension: "languages" | "employees";
  nextPeriodEndIso: string | null;
};

const MAX_PENDING_SEARCH_STAFF = 40;
const MAX_PENDING_SEARCH_LANG = 16;

export function minPendingColumnForInvariant(input: {
  plan: PlanType | null | undefined;
  dimension: AddonDimension;
  stripeAddonQty: number;
  currentPendingColumn: number;
  usageAfter: number;
}): number | null {
  const span =
    input.dimension === "employees" ? MAX_PENDING_SEARCH_STAFF : MAX_PENDING_SEARCH_LANG;
  const hi = input.currentPendingColumn + span;
  for (let p = input.currentPendingColumn; p <= hi; p++) {
    const inv = invariantEval({
      usageAfter: input.usageAfter,
      plan: input.plan,
      dimension: input.dimension,
      addonQtyRaw: input.stripeAddonQty + p,
    });
    if (!inv.violates) return p;
  }
  return null;
}

export async function tryAutoBumpLanguagePending(
  salonId: string,
  plan: PlanType,
  targetLanguageCount: number,
): Promise<
  | { ok: true; increased: boolean; notice: AddonScheduledNotice | null }
  | { ok: false; error: string; limitReached?: boolean }
> {
  const { data: salonRow, error: sErr } = await getSalonById(salonId);
  if (sErr || !salonRow) {
    return { ok: false, error: sErr || "Salon not found" };
  }
  if (!salonRow.billing_subscription_id) {
    return { ok: false, error: tb("ADDON_USAGE_REQUIRES_UPGRADE"), limitReached: true };
  }

  const { data: addon, error: aErr } = await addonsRepo.getAddonByType(salonId, "extra_languages");
  if (aErr) {
    return { ok: false, error: aErr };
  }

  const stripe = addon?.qty ?? 0;
  const p0 = Number(salonRow.pending_extra_languages) || 0;
  const need = minPendingColumnForInvariant({
    plan,
    dimension: "languages",
    stripeAddonQty: stripe,
    currentPendingColumn: p0,
    usageAfter: targetLanguageCount,
  });

  if (need === null) {
    return { ok: false, error: tb("ADDON_USAGE_REQUIRES_UPGRADE"), limitReached: true };
  }
  if (need <= p0) {
    return { ok: true, increased: false, notice: null };
  }

  const { error: pendErr } = await setSalonPendingAddons(salonId, {
    pending_extra_staff: Number(salonRow.pending_extra_staff) || 0,
    pending_extra_languages: need,
  });
  if (pendErr) {
    return { ok: false, error: pendErr };
  }

  return {
    ok: true,
    increased: true,
    notice: {
      dimension: "languages",
      nextPeriodEndIso: salonRow.current_period_end ?? null,
    },
  };
}

export async function tryAutoBumpStaffPending(
  salonId: string,
  plan: PlanType,
  usageAfterActiveEmployees: number,
): Promise<
  | { ok: true; increased: boolean; notice: AddonScheduledNotice | null }
  | { ok: false; error: string; limitReached?: boolean }
> {
  const { data: salonRow, error: sErr } = await getSalonById(salonId);
  if (sErr || !salonRow) {
    return { ok: false, error: sErr || "Salon not found" };
  }
  if (!salonRow.billing_subscription_id) {
    return { ok: false, error: tb("ADDON_USAGE_REQUIRES_UPGRADE"), limitReached: true };
  }

  const { data: addon, error: aErr } = await addonsRepo.getAddonByType(salonId, "extra_staff");
  if (aErr) {
    return { ok: false, error: aErr };
  }

  const stripe = addon?.qty ?? 0;
  const p0 = Number(salonRow.pending_extra_staff) || 0;
  const need = minPendingColumnForInvariant({
    plan,
    dimension: "employees",
    stripeAddonQty: stripe,
    currentPendingColumn: p0,
    usageAfter: usageAfterActiveEmployees,
  });

  if (need === null) {
    return { ok: false, error: tb("ADDON_USAGE_REQUIRES_UPGRADE"), limitReached: true };
  }
  if (need <= p0) {
    return { ok: true, increased: false, notice: null };
  }

  const { error: pendErr } = await setSalonPendingAddons(salonId, {
    pending_extra_staff: need,
    pending_extra_languages: Number(salonRow.pending_extra_languages) || 0,
  });
  if (pendErr) {
    return { ok: false, error: pendErr };
  }

  return {
    ok: true,
    increased: true,
    notice: {
      dimension: "employees",
      nextPeriodEndIso: salonRow.current_period_end ?? null,
    },
  };
}
