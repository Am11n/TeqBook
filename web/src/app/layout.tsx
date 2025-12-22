import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/locale-provider";
import { SalonProvider } from "@/components/salon-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TeqBook – Salon Dashboard",
  description: "International salon booking system.",
  // Use relative paths so favicon works correctly.
  icons: {
    icon: "/Favikon.svg",
    shortcut: "/Favikon.svg",
    apple: "/Favikon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground overflow-x-hidden`}
      >
        <LocaleProvider>
          <SalonProvider>
            {/* Main app container - uses design token for background */}
            {/* Note: Marketing pages (landing, login, signup, onboarding) override this with their own gradients */}
            <div className="min-h-screen w-full bg-background">
              {children}
            </div>
          </SalonProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
