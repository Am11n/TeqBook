// Auto-schedule pending_target add-on quantities when the user increases languages or staff
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

/** Smallest absolute paid-extra target ≥ max(stripe, currentPendingTarget) that satisfies the invariant. */
export function minAbsolutePendingTarget(input: {
  plan: PlanType | null | undefined;
  dimension: AddonDimension;
  stripeAddonQty: number;
  currentPendingTarget: number;
  usageAfter: number;
}): number | null {
  const span = input.dimension === "employees" ? MAX_PENDING_SEARCH_STAFF : MAX_PENDING_SEARCH_LANG;
  const start = Math.max(input.stripeAddonQty, input.currentPendingTarget);
  const hi = start + span;
  for (let t = start; t <= hi; t++) {
    const inv = invariantEval({
      usageAfter: input.usageAfter,
      plan: input.plan,
      dimension: input.dimension,
      addonQtyRaw: t,
    });
    if (!inv.violates) return t;
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
  const includedLang = plan === "starter" ? 2 : plan === "pro" ? 5 : 0;
  const prevTarget =
    Math.max(Number(salonRow.pending_target_language_capacity ?? 0) - includedLang, 0) ||
    Number(salonRow.pending_target_extra_languages) ||
    0;
  const need = minAbsolutePendingTarget({
    plan,
    dimension: "languages",
    stripeAddonQty: stripe,
    currentPendingTarget: prevTarget,
    usageAfter: targetLanguageCount,
  });

  if (need === null) {
    return { ok: false, error: tb("ADDON_USAGE_REQUIRES_UPGRADE"), limitReached: true };
  }
  if (need <= prevTarget) {
    return { ok: true, increased: false, notice: null };
  }

  const { error: pendErr } = await setSalonPendingAddons(salonId, {
    active_target_staff_capacity: Number(salonRow.active_target_staff_capacity ?? 0),
    active_target_language_capacity: Number(salonRow.active_target_language_capacity ?? 0),
    pending_target_staff_capacity: Number(salonRow.pending_target_staff_capacity ?? 0),
    pending_target_language_capacity: includedLang + need,
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
  const includedStaff = plan === "starter" ? 2 : plan === "pro" ? 5 : 0;
  const prevTarget =
    Math.max(Number(salonRow.pending_target_staff_capacity ?? 0) - includedStaff, 0) ||
    Number(salonRow.pending_target_extra_staff) ||
    0;
  const need = minAbsolutePendingTarget({
    plan,
    dimension: "employees",
    stripeAddonQty: stripe,
    currentPendingTarget: prevTarget,
    usageAfter: usageAfterActiveEmployees,
  });

  if (need === null) {
    return { ok: false, error: tb("ADDON_USAGE_REQUIRES_UPGRADE"), limitReached: true };
  }
  if (need <= prevTarget) {
    return { ok: true, increased: false, notice: null };
  }

  const { error: pendErr } = await setSalonPendingAddons(salonId, {
    active_target_staff_capacity: Number(salonRow.active_target_staff_capacity ?? 0),
    active_target_language_capacity: Number(salonRow.active_target_language_capacity ?? 0),
    pending_target_staff_capacity: includedStaff + need,
    pending_target_language_capacity: Number(salonRow.pending_target_language_capacity ?? 0),
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
