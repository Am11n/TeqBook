import type { MetadataRoute } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://teqbook.com");

export default function sitemap(): MetadataRoute.Sitemap {
  const base = baseUrl.replace(/\/$/, "");
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/landing/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/login/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/signup/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}
