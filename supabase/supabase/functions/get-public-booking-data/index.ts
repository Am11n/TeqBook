// =====================================================
// Get Public Booking Data Edge Function
// =====================================================
// Task: Fase A - Produksjonsstabilitet
// Purpose: Contract-based edge proxy for public booking data access
// Provides sanitized data with rate limiting and caching

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { checkRateLimit, createRateLimitErrorResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GetPublicBookingDataRequest {
  salonSlug: string;
  dateFrom?: string;
  dateTo?: string;
  timezone?: string;
}

interface PublicBookingDataResponse {
  version: 1;
  salon: {
    id: string;
    name: string;
    slug: string;
    timezone: string | null;
    preferred_language: string | null;
  };
  services: Array<{
    id: string;
    name: string;
    duration: number | null;
    price: number | null;
  }>;
  employees: Array<{
    id: string;
    name: string;
    languages: string[] | null;
  }>;
  // Note: Availability is not included here as it requires employee_id and service_id
  // Clients should call availability endpoints separately when needed
}

// Cache configuration
const CACHE_TTL_SALON_SERVICES = 5 * 60 * 1000; // 5 minutes
const CACHE_TTL_AVAILABILITY = 2 * 60 * 1000; // 2 minutes

// Simple in-memory cache (for edge function - resets on cold start)
const cache = new Map<string, { data: unknown; expires: number }>();

function getCacheKey(type: string, key: string): string {
  return `${type}:${key}`;
}

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data as T;
  }
  if (cached) {
    cache.delete(key);
  }
  return null;
}

function setCache(key: string, data: unknown, ttl: number): void {
  cache.set(key, {
    data,
    expires: Date.now() + ttl,
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    let body: GetPublicBookingDataRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { salonSlug, dateFrom, dateTo, timezone } = body;

    if (!salonSlug) {
      return new Response(
        JSON.stringify({ error: "salonSlug is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Rate limiting: per IP + per salon slug
    const rateLimitResult = await checkRateLimit(req, {
      endpointType: "public-booking-data",
      identifier: `${salonSlug}:${req.headers.get("x-forwarded-for") || "unknown"}`,
      identifierType: "ip",
      supabaseUrl,
      supabaseServiceKey,
    }, null);

    if (!rateLimitResult.allowed) {
      return createRateLimitErrorResponse(
        rateLimitResult,
        `${salonSlug}:${req.headers.get("x-forwarded-for") || "unknown"}`,
        "ip",
        "public-booking-data",
        supabaseUrl,
        supabaseServiceKey
      );
    }

    // Get salon by slug (with caching)
    const salonCacheKey = getCacheKey("salon", salonSlug);
    let salon = getCached<{ id: string; name: string; slug: string; timezone: string | null; preferred_language: string | null }>(salonCacheKey);

    if (!salon) {
      const { data: salonData, error: salonError } = await supabase
        .from("salons")
        .select("id, name, slug, timezone, preferred_language")
        .eq("slug", salonSlug)
        .eq("is_public", true)
        .maybeSingle();

      if (salonError || !salonData) {
        return new Response(
          JSON.stringify({ error: "Salon not found or not public" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      salon = {
        id: salonData.id,
        name: salonData.name,
        slug: salonData.slug,
        timezone: salonData.timezone || null,
        preferred_language: salonData.preferred_language || null,
      };

      setCache(salonCacheKey, salon, CACHE_TTL_SALON_SERVICES);
    }

    // Get services (with caching)
    const servicesCacheKey = getCacheKey("services", salon.id);
    let services = getCached<Array<{ id: string; name: string; duration: number | null; price: number | null }>>(servicesCacheKey);

    if (!services) {
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("id, name, duration, price")
        .eq("salon_id", salon.id)
        .eq("is_active", true)
        .order("name")
        .limit(1000);

      if (servicesError) {
        console.error("Error fetching services:", servicesError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch services" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Sanitize: only return necessary fields
      services = (servicesData || []).map((s) => ({
        id: s.id,
        name: s.name,
        duration: s.duration || null,
        price: s.price || null,
      }));

      setCache(servicesCacheKey, services, CACHE_TTL_SALON_SERVICES);
    }

    // Get employees (with caching)
    const employeesCacheKey = getCacheKey("employees", salon.id);
    let employees = getCached<Array<{ id: string; name: string; languages: string[] | null }>>(employeesCacheKey);

    if (!employees) {
      const { data: employeesData, error: employeesError } = await supabase
        .from("employees")
        .select("id, full_name, languages, is_active")
        .eq("salon_id", salon.id)
        .eq("is_active", true)
        .limit(1000);

      if (employeesError) {
        console.error("Error fetching employees:", employeesError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch employees" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Sanitize: only return necessary fields, no email/phone
      employees = (employeesData || []).map((e) => ({
        id: e.id,
        name: e.full_name,
        languages: e.languages || null,
      }));

      setCache(employeesCacheKey, employees, CACHE_TTL_SALON_SERVICES);
    }

    // Note: Availability requires employee_id and service_id, so it's not included in this endpoint
    // Clients should call availability separately when user selects employee/service/date
    // This keeps the edge function fast and cacheable

    // Build response with versioned contract
    const response: PublicBookingDataResponse = {
      version: 1,
      salon,
      services,
      employees,
    };

    // Add ETag for caching (simple hash of response)
    const responseStr = JSON.stringify(response);
    // Simple hash for ETag (Deno doesn't have Buffer, use TextEncoder)
    const encoder = new TextEncoder();
    const data = encoder.encode(responseStr);
    const hash = Array.from(data.slice(0, 16))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
    const etag = `"${hash}"`;
    
    const ifNoneMatch = req.headers.get("if-none-match");
    if (ifNoneMatch === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          ...corsHeaders,
          ETag: etag,
          ...rateLimitResult.headers,
        },
      });
    }

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          ETag: etag,
          "Cache-Control": "public, max-age=300", // 5 minutes
          ...rateLimitResult.headers,
        },
      }
    );
  } catch (error) {
    console.error("Error in get-public-booking-data:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
