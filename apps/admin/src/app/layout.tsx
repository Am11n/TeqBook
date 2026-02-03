import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/locale-provider";
import { SalonProvider } from "@/components/salon-provider";
import { ErrorBoundary } from "@/components/error-boundary";

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
  display: "swap", // Optimize font loading
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
  preload: true,
});

import { FAVICON_PATH } from "@/lib/constants";

export const metadata: Metadata = {
  title: "TeqBook – Salon Dashboard",
  description: "International salon booking system.",
  icons: {
    icon: FAVICON_PATH,
    shortcut: FAVICON_PATH,
    apple: FAVICON_PATH,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Resource hints for faster external connections */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://*.supabase.co" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground overflow-x-hidden`}
        suppressHydrationWarning
      >
        <LocaleProvider>
          <ErrorBoundary>
            <SalonProvider>
              {/* Main app container - uses design token for background */}
              {/* Note: Marketing pages (landing, login, signup, onboarding) override this with their own gradients */}
              <div className="min-h-screen w-full bg-background">
                {children}
              </div>
            </SalonProvider>
          </ErrorBoundary>
        </LocaleProvider>
      </body>
    </html>
  );
}
