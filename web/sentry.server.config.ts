// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment configuration
  environment: process.env.NODE_ENV || "development",

  // Performance Monitoring
  // Adjust this value in production (1.0 = 100% of transactions)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out non-critical errors
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Ignore expected errors (e.g., validation errors)
    if (error instanceof Error) {
      // Ignore rate limit errors (expected behavior)
      if (error.message.includes("Rate limit exceeded")) {
        return null;
      }
      // Ignore authentication errors (user not logged in)
      if (error.message.includes("Not authenticated")) {
        return null;
      }
    }

    return event;
  },

  // Custom sampling for traces
  tracesSampler: (samplingContext) => {
    const url = samplingContext.transactionContext?.name || "";

    // Don't trace static assets or health checks
    if (
      url.includes("/_next/") ||
      url.includes("/api/health") ||
      url.includes(".ico")
    ) {
      return 0;
    }

    // Higher sample rate for API routes
    if (url.includes("/api/")) {
      return process.env.NODE_ENV === "production" ? 0.3 : 1.0;
    }

    // Default sample rate
    return process.env.NODE_ENV === "production" ? 0.2 : 1.0;
  },
});

