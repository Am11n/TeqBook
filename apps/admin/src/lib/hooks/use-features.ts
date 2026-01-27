"use client";

// =====================================================
// useFeatures Hook
// =====================================================
// React hook for checking feature availability in the current salon

import { useState, useEffect, useRef } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import type { FeatureKey } from "@/lib/types/domain";
import * as featureFlagsService from "@/lib/services/feature-flags-service";

// Global cache for features per salon to avoid re-loading on every render
type FeaturesCache = {
  salonId: string;
  features: FeatureKey[];
  loading: boolean;
  error: string | null;
};

let globalFeaturesCache: FeaturesCache | null = null;

export function useFeatures() {
  const { salon, isReady } = useCurrentSalon();
  const [features, setFeatures] = useState<FeatureKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const loadingRef = useRef(false);

  // Only run on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Don't load features until mounted (client-side only)
    if (!mounted) {
      return;
    }

    // If no salon or not ready, clear features
    if (!isReady || !salon?.id) {
      setLoading(false);
      setFeatures([]);
      globalFeaturesCache = null;
      return;
    }

    const salonId = salon.id;

    // Check if we already have cached features for this salon
    if (globalFeaturesCache && globalFeaturesCache.salonId === salonId) {
      // Use cached features immediately
      setFeatures(globalFeaturesCache.features);
      setLoading(false);
      setError(globalFeaturesCache.error);
      return;
    }

    // Prevent multiple simultaneous loads for the same salon
    if (loadingRef.current) {
      return;
    }

    async function loadFeatures() {
      // Double-check cache after async gap
      if (globalFeaturesCache && globalFeaturesCache.salonId === salonId) {
        setFeatures(globalFeaturesCache.features);
        setLoading(false);
        setError(globalFeaturesCache.error);
        loadingRef.current = false;
        return;
      }

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const { features: featureKeys, error: featuresError } =
        await featureFlagsService.getFeaturesForSalon(salonId);

      if (featuresError) {
        setError(featuresError);
        setFeatures([]);
        globalFeaturesCache = {
          salonId,
          features: [],
          loading: false,
          error: featuresError,
        };
      } else {
        setFeatures(featureKeys);
        // Cache the features for this salon
        globalFeaturesCache = {
          salonId,
          features: featureKeys,
          loading: false,
          error: null,
        };
      }

      setLoading(false);
      loadingRef.current = false;
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

