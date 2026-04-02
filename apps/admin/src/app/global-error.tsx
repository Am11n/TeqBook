"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AppLocale } from "@/i18n/translations";
import { APP_LOCALES } from "@/i18n/translations";
import { getAdminConsoleMessages } from "@/i18n/admin-console";

const VALID = new Set<string>(APP_LOCALES);

function localeFromDocument(): AppLocale {
  if (typeof document === "undefined") return "en";
  const lang = document.documentElement.getAttribute("lang");
  if (lang && VALID.has(lang)) return lang as AppLocale;
  return "en";
}

/**
 * Catches errors in the root layout (e.g. 502, critical failures).
 * Renders a minimal HTML page so we don't depend on layout/components.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<AppLocale>("en");

  useEffect(() => {
    console.error("Admin app global error:", error);
  }, [error]);

  useEffect(() => {
    setLocale(localeFromDocument());
  }, []);

  const e = getAdminConsoleMessages(locale).errors;

  return (
    <html lang={locale}>
      <body style={{
        margin: 0,
        fontFamily: "system-ui, sans-serif",
        background: "#f8fafc",
        color: "#1e293b",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        boxSizing: "border-box",
        direction: ["ar", "fa", "ur", "dar"].includes(locale) ? "rtl" : "ltr",
      }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            {e.globalTitle}
          </h1>
          <p style={{ color: "#64748b", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            {e.globalDescription}
          </p>
          <div style={{
            padding: "1rem",
            background: "#fef3c7",
            border: "1px solid #fcd34d",
            borderRadius: "0.5rem",
            marginBottom: "1.5rem",
            textAlign: "left",
            fontSize: "0.875rem",
            color: "#92400e",
          }}
          >
            <strong>{e.globalHintTitle}</strong>
            <ul style={{ margin: "0.5rem 0 0 1.25rem", padding: 0 }}>
              <li>{e.globalHint1}</li>
              <li>{e.globalHint2}</li>
              <li>{e.globalHint3}</li>
            </ul>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "1rem",
                fontWeight: 500,
                background: "#e2e8f0",
                color: "#334155",
                border: "1px solid #cbd5e1",
                borderRadius: "0.375rem",
                cursor: "pointer",
              }}
            >
              {e.globalRefresh}
            </button>
            <Link
              href="/"
              style={{
                padding: "0.5rem 1rem",
                fontSize: "1rem",
                fontWeight: 500,
                background: "transparent",
                color: "#475569",
                border: "1px solid #94a3b8",
                borderRadius: "0.375rem",
                textDecoration: "none",
              }}
            >
              {e.globalBackDashboard}
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
