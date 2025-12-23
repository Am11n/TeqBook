import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel supports full Next.js with SSR, API routes, and image optimization
  // No need for static export - Vercel handles everything automatically
  images: {
    // Vercel supports Next.js Image Optimization by default
    // Keep unoptimized: true only if you have specific requirements
    // For now, we'll enable optimization for better performance
    unoptimized: false,
  },
  // No basePath or assetPrefix - site is served at root of domain
  trailingSlash: true,
};

export default nextConfig;
