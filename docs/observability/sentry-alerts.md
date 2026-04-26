# Sentry Alerts

Configure one Sentry project for each runtime: `residente-backend`, `residente-web`, and `residente-mobile`.

## Issue Alerts

- New issue: notify the engineering channel immediately when a new error type appears in production.
- Regression: notify immediately when a resolved issue reappears in production.
- High impact issue: notify when an issue affects at least 5 users in 10 minutes.

## Metric Alerts

- Error rate: alert when failed transactions are above 2% for 5 minutes.
- Latency: alert when p95 transaction duration is above 2 seconds for 10 minutes.
- Backend availability: alert when `/api/health` or `/health` reports errors in 2 consecutive checks.
- Mobile crash-free sessions: alert when crash-free sessions drop below 99.5% over 1 hour.

## Routing

- Backend alerts should include `environment`, `release`, `http.route`, `http.method`, and `user.role`.
- Web alerts should include route, browser, release, and `user.role`.
- Mobile alerts should include app version, OS, device, API path, and `user.role`.

## Expected Errors

The application filters expected client and auth failures before sending events:

- HTTP 4xx validation, authentication, authorization, and not-found responses.
- Browser abort, resize observer, and chunk loading noise.
- Mobile `ApiException` errors with a status code below 500.

Keep these filters strict. Expected product states should be handled in UI and logs, while Sentry should stay focused on operational failures.
