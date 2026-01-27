import { useState, useEffect } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { getAddonsForSalon } from "@/lib/repositories/addons";
import type { PlanType } from "@/lib/types";
import type { Addon } from "@/lib/repositories/addons";

export function useBilling() {
  const { salon, isReady } = useCurrentSalon();
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (isReady && salon?.id) {
        setLoading(true);

        // Read plan from salon
        const plan = (salon.plan || "starter") as PlanType;
        setCurrentPlan(plan);

        // Load addons
        const { data: addonsData, error: addonsError } = await getAddonsForSalon(salon.id);
        if (!addonsError && addonsData) {
          setAddons(addonsData);
        }

        setLoading(false);
      }
    }
    loadData();
  }, [isReady, salon]);

  return {
    currentPlan,
    addons,
    loading,
  };
}

