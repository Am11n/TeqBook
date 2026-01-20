// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment configuration
  environment: process.env.NODE_ENV || "development",

  // Performance Monitoring
  // Adjust this value in production (1.0 = 100% of transactions)
  // Recommended: 0.1 (10%) in production for cost efficiency
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,


  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Session Replay for error investigation
  replaysOnErrorSampleRate: 1.0, // Always capture replay when error occurs
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0, // 10% in prod, 0% in dev

  // Integrations
  integrations: [
    // Session Replay for debugging
    Sentry.replayIntegration({
      maskAllText: true, // Mask all text for privacy
      blockAllMedia: true, // Block all media for privacy
    }),
    // Browser Tracing for performance monitoring
    Sentry.browserTracingIntegration({
      // Trace all fetch requests
      traceFetch: true,
      // Trace all XHR requests
      traceXHR: true,
    }),
  ],

  // Filter out non-critical errors
  beforeSend(event, hint) {
    // Ignore errors from extensions or third-party scripts
    if (event.exception?.values?.[0]?.stacktrace?.frames) {
      const frames = event.exception.values[0].stacktrace.frames;
      const isFromExtension = frames.some(
        (frame) =>
          frame.filename?.includes("chrome-extension://") ||
          frame.filename?.includes("moz-extension://") ||
          frame.filename?.includes("safari-extension://")
      );
      if (isFromExtension) {
        return null;
      }
    }

    // Ignore network errors that are likely user connectivity issues
    const error = hint.originalException;
    if (error instanceof Error) {
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("Load failed")
      ) {
        // Still log but at reduced rate
        if (Math.random() > 0.1) {
          return null;
        }
      }
    }

    return event;
  },

  // Ignore certain URLs for performance traces
  tracesSampler: (samplingContext) => {
    // Don't trace health checks or static assets
    const url = samplingContext.transactionContext?.name || "";
    if (
      url.includes("/_next/") ||
      url.includes("/api/health") ||
      url.includes(".ico") ||
      url.includes(".png") ||
      url.includes(".svg")
    ) {
      return 0;
    }

    // Higher sample rate for critical paths
    if (
      url.includes("/api/bookings") ||
      url.includes("/api/billing") ||
      url.includes("/book/")
    ) {
      return 0.5; // 50% for critical booking/billing operations
    }

    // Default sample rate
    return process.env.NODE_ENV === "production" ? 0.2 : 1.0;
  },
});

