import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/locale-provider";

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
  description: "Nordic-inspired salon booking SaaS.",
  // Use relative paths so favicon works both locally and under GitHub Pages basePath.
  icons: {
    icon: "Favikon.svg",
    shortcut: "Favikon.svg",
    apple: "Favikon.svg",
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
          <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgb(240,240,245),_transparent_55%),linear-gradient(to_bottom,_rgb(250,250,252),_rgb(243,243,247))]">
        {children}
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
