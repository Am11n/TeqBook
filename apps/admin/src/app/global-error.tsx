"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    console.error("Admin app global error:", error);
  }, [error]);

  return (
    <html lang="nb">
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
      }}>
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            TeqBook Admin – noe gikk galt
          </h1>
          <p style={{ color: "#64748b", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Det oppstod en alvorlig feil. Prøv å laste siden på nytt, eller kontakt TeqBook-eieren / support.
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
          }}>
            <strong>Hva kan du gjøre?</strong>
            <ul style={{ margin: "0.5rem 0 0 1.25rem", padding: 0 }}>
              <li>Last siden på nytt (F5)</li>
              <li>Kontakt den som har gitt deg tilgang til Admin</li>
              <li>Ved vedvarende feil: kontakt TeqBook support</li>
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
              Prøv på nytt
            </button>
            <a
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
              Til Admin-forsiden
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
