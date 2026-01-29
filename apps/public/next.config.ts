import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Public app: optimized for SEO and performance
  images: {
    unoptimized: false,
  },
  trailingSlash: true,

  // Performance optimizations
  compiler: {
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

  // Exclude server-only packages from client builds
  serverExternalPackages: ["resend", "@sentry/node"],

  // Single domain: teqbook.com → Public, teqbook.com/dashboard → Dashboard, teqbook.com/admin → Admin
  // VIKTIG: Sett DASHBOARD_APP_URL og ADMIN_APP_URL i Vercel (Public-prosjektet) og redeploy Public – rewrites leses ved build.
  async rewrites() {
    const dashboardUrl = process.env.DASHBOARD_APP_URL?.replace(/\/$/, "");
    const adminUrl = process.env.ADMIN_APP_URL?.replace(/\/$/, "");
    if (process.env.CI !== undefined || process.env.VERCEL === "1") {
      console.log("[teqbook-public] rewrites: DASHBOARD_APP_URL=" + (dashboardUrl ? "set" : "MISSING") + " ADMIN_APP_URL=" + (adminUrl ? "set" : "MISSING"));
    }
    const rewrites: { source: string; destination: string }[] = [];
    if (dashboardUrl) {
      rewrites.push({ source: "/dashboard", destination: `${dashboardUrl}/dashboard` });
      rewrites.push({ source: "/dashboard/", destination: `${dashboardUrl}/dashboard/` });
      rewrites.push({ source: "/dashboard/:path*", destination: `${dashboardUrl}/dashboard/:path*` });
    }
    if (adminUrl) {
      rewrites.push({ source: "/admin", destination: `${adminUrl}/admin` });
      rewrites.push({ source: "/admin/", destination: `${adminUrl}/admin/` });
      rewrites.push({ source: "/admin/:path*", destination: `${adminUrl}/admin/:path*` });
    }
    return rewrites;
  },

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

  // Security headers - stricter for public app (no auth cookies needed)
  async headers() {
    const isDevelopment = process.env.NODE_ENV === "development";

    const cspDirectives = [
      "default-src 'self'",
      isDevelopment
        ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
        : "script-src 'self' 'unsafe-inline'",
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
