import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/locale-provider";
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
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "TeqBook – Salon Booking System",
  description: "International salon booking system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://*.supabase.co" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground overflow-x-hidden`}
        suppressHydrationWarning
      >
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
