import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? 0.05),
    integrations: [nodeProfilingIntegration()],
    beforeSend(event, hint) {
      const originalException = hint.originalException as
        | { status?: number; response?: { statusCode?: number } }
        | undefined;
      const status =
        originalException?.status ?? originalException?.response?.statusCode;

      if (status && status < 500) {
        return null;
      }

      return event;
    }
  });
}
