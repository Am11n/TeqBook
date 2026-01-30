import type { MetadataRoute } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://teqbook.com");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"], // API routes not for indexing; /book/[slug] is allowed for salon booking pages
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
