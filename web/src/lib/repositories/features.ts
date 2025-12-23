// =====================================================
// Features Repository
// =====================================================
// Repository for managing features and plan_features

import { supabase } from "@/lib/supabase-client";
import type { FeatureKey } from "@/lib/types/domain";

export type Feature = {
  id: string;
  key: FeatureKey;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type PlanFeature = {
  id: string;
  plan_type: "starter" | "pro" | "business";
  feature_id: string;
  limit_value: number | null;
  created_at: string;
};

/**
 * Get all features
 */
export async function getAllFeatures(): Promise<{
  data: Feature[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from("features")
      .select("*")
      .order("key");

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Feature[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get feature by key
 */
export async function getFeatureByKey(key: FeatureKey): Promise<{
  data: Feature | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from("features")
      .select("*")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Feature | null, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get features for a specific plan type
 */
export async function getFeaturesForPlan(
  planType: "starter" | "pro" | "business"
): Promise<{
  data: Array<{ feature: Feature; limit_value: number | null }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from("plan_features")
      .select(
        `
        feature_id,
        limit_value,
        features:feature_id (
          id,
          key,
          name,
          description,
          created_at,
          updated_at
        )
      `
      )
      .eq("plan_type", planType);

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: [], error: null };
    }

    const result = data.map((item) => ({
      feature: item.features as unknown as Feature,
      limit_value: item.limit_value as number | null,
    }));

    return { data: result, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get feature keys for a specific plan type
 */
export async function getFeatureKeysForPlan(
  planType: "starter" | "pro" | "business"
): Promise<{
  data: FeatureKey[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from("plan_features")
      .select("features:feature_id (key)")
      .eq("plan_type", planType);

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: [], error: null };
    }

    const featureKeys = data
      .map((item) => {
        const feature = item.features as unknown as Feature | null;
        return feature?.key;
      })
      .filter((key): key is FeatureKey => key !== undefined);

    return { data: featureKeys, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

