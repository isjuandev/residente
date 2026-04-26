import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    tracesSampleRate: Number(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1
    ),
    beforeSend(event, hint) {
      const message = `${hint.originalException ?? ""}`;
      const statusCode = event.contexts?.response?.status_code;

      if (typeof statusCode === "number" && statusCode < 500) {
        return null;
      }

      if (
        message.includes("AbortError") ||
        message.includes("ResizeObserver loop") ||
        message.includes("ChunkLoadError")
      ) {
        return null;
      }

      return event;
    }
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
