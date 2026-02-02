import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served at teqbook.com/dashboard when behind Public app rewrites.
  // Standalone (e.g. localhost:3002): use basePath only when env is set so / works locally.
  basePath: process.env.NEXT_PUBLIC_DASHBOARD_BASE_PATH ?? "",

  // Dashboard app: standard Next.js config
  images: {
    unoptimized: false,
  },
  trailingSlash: true,
  // Avoid redirect loop when proxied from Public (teqbook.com/dashboard/): do not redirect /dashboard ↔ /dashboard/
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

  // Exclude server-only packages from client builds
  serverExternalPackages: ["resend", "@sentry/node"],

  // Use Turbopack (Next 16 default). Custom webpack config below is ignored when using Turbopack.
  turbopack: {},

  // Custom webpack configuration (only used with next build --webpack)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle Node.js-only packages in client builds
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        buffer: false,
        path: false,
        os: false,
      };
      
      // Mark server-only modules as external for client builds
      config.externals = config.externals || [];
      config.externals.push({
        resend: "resend",
        mailparser: "mailparser",
        libmime: "libmime",
        libbase64: "libbase64",
      });
    }
    return config;
  },

  // Security headers - standard for authenticated app
  async headers() {
    const isDevelopment = process.env.NODE_ENV === "development";

    const cspDirectives = [
      "default-src 'self'",
      isDevelopment
        ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com"
        : "script-src 'self' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      isDevelopment
        ? "connect-src 'self' ws://localhost:* http://localhost:* https://*.supabase.co wss://*.supabase.co https://api.stripe.com"
        : "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
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
