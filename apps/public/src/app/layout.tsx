import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/locale-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Analytics } from "@/components/analytics";

// Initialize Sentry
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  // Dynamic import to avoid bundling in development
  import("@sentry/nextjs").catch(() => {
    // Sentry not available, ignore
  });
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://teqbook.com");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TeqBook – Easy Salon Booking System for Salons",
    template: "%s | TeqBook",
  },
  description:
    "Simple, multilingual salon booking system. Easy booking for salons, no credit card required. Start your free trial – TeqBook makes salon scheduling simple.",
  keywords: [
    "salon booking system",
    "easy booking for salons",
    "multilingual salon booking",
    "simple booking for salons",
    "salon scheduling",
    "booking software",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "TeqBook",
    title: "TeqBook – Easy Salon Booking System for Salons",
    description:
      "Simple, multilingual salon booking system. Easy booking for salons, no credit card required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TeqBook – Easy Salon Booking System for Salons",
    description: "Simple, multilingual salon booking. Start your free trial.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "TeqBook",
        description:
          "Simple, multilingual salon booking system for salons. Easy booking, no credit card required.",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/book/{salon_slug}` },
          "query-input": "required name=salon_slug",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "TeqBook",
        url: siteUrl,
        description: "Easy salon booking system – multilingual, simple scheduling for salons.",
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://*.supabase.co" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground overflow-x-hidden`}
        suppressHydrationWarning
      >
        <Analytics />
        <LocaleProvider>
          <ErrorBoundary>
            <div className="min-h-screen w-full bg-background">
              {children}
            </div>
          </ErrorBoundary>
        </LocaleProvider>
      </body>
    </html>
  );
}
