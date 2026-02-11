import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served at teqbook.com/admin when behind Public app rewrites.
  // On Vercel, always use /admin as basePath so asset URLs are correct.
  // Locally (no VERCEL env), basePath is empty so / works on localhost:3003.
  basePath: process.env.NEXT_PUBLIC_ADMIN_BASE_PATH || (process.env.VERCEL === "1" ? "/admin" : ""),

  // Admin app: stricter security
  images: {
    unoptimized: false,
  },
  trailingSlash: true,
  // Avoid redirect loop when proxied from Public (teqbook.com/admin/): do not redirect /admin ↔ /admin/
  skipTrailingSlashRedirect: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

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

  // Security headers - stricter for admin app
  async headers() {
    const isDevelopment = process.env.NODE_ENV === "development";

    const cspDirectives = [
      "default-src 'self'",
      isDevelopment
        ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
        : "script-src 'self' 'unsafe-inline'", // Stricter: no unsafe-eval in production
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      isDevelopment
        ? "connect-src 'self' ws://localhost:* http://localhost:* https://*.supabase.co wss://*.supabase.co"
        : "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

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
            value: "DENY", // Stricter: deny all framing for admin
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
            value: "strict-origin-when-cross-origin", // Stricter referrer policy
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: cspDirectives.join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
