import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Static export for deployment at root of custom domain
  // In dev mode, we don't use static export to allow dynamic routes
  ...(isDev ? {} : { output: "export" }),
  images: {
    // Static export does not support the default image optimizer
    unoptimized: true,
  },
  // No basePath or assetPrefix - site is served at root of domain
  trailingSlash: true,
};

export default nextConfig;
