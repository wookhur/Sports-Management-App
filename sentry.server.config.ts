// Server-side error reporting. Entirely inert until SENTRY_DSN is set, so the
// app runs identically without a Sentry account.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    // Never ship request bodies or headers — they can carry credentials.
    sendDefaultPii: false,
  });
}
