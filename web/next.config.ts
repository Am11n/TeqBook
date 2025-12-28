import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel supports full Next.js with SSR, API routes, and image optimization
  // No need for static export - Vercel handles everything automatically
  images: {
    // Vercel supports Next.js Image Optimization by default
    unoptimized: false,
  },
  // No basePath or assetPrefix - site is served at root of domain
  trailingSlash: true,
  
  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
  
  // Optimize bundle size
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "framer-motion",
    ],
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize for faster builds
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic",
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            // Separate vendor chunks for better caching
            framework: {
              name: "framework",
              chunks: "all",
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module: { resource?: string }) {
                return module.resource &&
                  !module.resource.includes("node_modules") &&
                  module.resource.match(/\.(ts|tsx|js|jsx)$/);
              },
              name(module: { resource?: string }) {
                const fileName = module.resource?.split("/").pop()?.replace(/\.[^/.]+$/, "");
                return `lib-${fileName || "unknown"}`;
              },
              minChunks: 1,
              priority: 20,
              reuseExistingChunk: true,
            },
            commons: {
              name: "commons",
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name(module: { resource?: string }) {
                if (!module.resource) return "shared-unknown";
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const crypto = require("crypto");
                const hash = crypto.createHash("sha1");
                hash.update(module.resource);
                return hash.digest("hex").substring(0, 8);
              },
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
  // Security headers
  async headers() {
    const isDevelopment = process.env.NODE_ENV === "development";
    
    // CSP configuration - more permissive in development for HMR
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      // In development, allow connections to localhost for HMR and WebSocket
      isDevelopment
        ? "connect-src 'self' ws://localhost:* http://localhost:* https://*.supabase.co https://api.stripe.com"
        : "connect-src 'self' https://*.supabase.co https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ];
    
    // Only add upgrade-insecure-requests in production
    if (!isDevelopment) {
      cspDirectives.push("upgrade-insecure-requests");
    }
    
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // HSTS only in production
          ...(isDevelopment
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]),
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: cspDirectives.join("; "),
          },
        ],
      },
      // Allow iframe embedding for booking pages (needed for preview in settings)
      // Note: In development, CSP can be strict. This allows same-origin iframe embedding.
      {
        source: "/book/:path*",
        headers: [
          {
            // Override X-Frame-Options to allow iframe embedding
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            // Simplified CSP for booking pages to allow iframe embedding
            // Removed upgrade-insecure-requests which can cause issues in dev
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "frame-ancestors 'self'", // Critical: Allow same-origin iframe embedding
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
