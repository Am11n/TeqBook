import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://teqbook.com");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl.replace(/\/$/, "");
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/landing/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/login/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/signup/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return staticEntries;

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: salons } = await supabase
      .from("salons")
      .select("slug, updated_at")
      .eq("is_public", true)
      .not("slug", "is", null)
      .limit(5000);
    const salonEntries: MetadataRoute.Sitemap = (salons || [])
      .filter((salon) => typeof salon.slug === "string" && salon.slug.length > 0)
      .map((salon) => ({
        url: `${base}/salon/${salon.slug}`,
        lastModified: salon.updated_at ? new Date(salon.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    return [...staticEntries, ...salonEntries];
  } catch {
    return staticEntries;
  }
}
