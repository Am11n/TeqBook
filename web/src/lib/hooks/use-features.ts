"use client";

// =====================================================
// useFeatures Hook
// =====================================================
// React hook for checking feature availability in the current salon

import { useState, useEffect } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import type { FeatureKey } from "@/lib/types/domain";
import * as featureFlagsService from "@/lib/services/feature-flags-service";

export function useFeatures() {
  const { salon, isReady } = useCurrentSalon();
  const [features, setFeatures] = useState<FeatureKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Only run on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Don't load features until mounted (client-side only)
    if (!mounted) {
      return;
    }

    async function loadFeatures() {
      if (!isReady || !salon?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { features: featureKeys, error: featuresError } =
        await featureFlagsService.getFeaturesForSalon(salon.id);

      if (featuresError) {
        setError(featuresError);
        setFeatures([]);
      } else {
        setFeatures(featureKeys);
      }

      setLoading(false);
    }

    loadFeatures();
  }, [mounted, isReady, salon?.id]);

  /**
   * Check if a specific feature is available
   * Returns false during SSR to avoid hydration mismatch
   */
  function hasFeature(featureKey: FeatureKey): boolean {
    // During SSR or before mount, always return false to avoid hydration mismatch
    if (!mounted) {
      return false;
    }
    return features.includes(featureKey);
  }

  return {
    features,
    hasFeature,
    loading: loading || !mounted, // Show loading during SSR
    error,
  };
}

