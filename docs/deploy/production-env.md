# Production Deploy

## Railway backend

Create a Railway PostgreSQL service and connect `DATABASE_URL` to the backend service.

Required Railway variables:

```env
NODE_ENV=production
PORT=${{ PORT }}
API_PREFIX=api
CORS_ORIGIN=https://www.residente.app
DATABASE_URL=${{ Postgres.DATABASE_URL }}
JWT_ACCESS_SECRET=replace-with-strong-secret
JWT_REFRESH_SECRET=replace-with-strong-secret
JWT_SECRET=replace-with-strong-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace-with-service-role-key
SUPABASE_STORAGE_BUCKET=media
WEB_URL=https://www.residente.app
MERCADOPAGO_ACCESS_TOKEN=replace-with-mercadopago-token
MERCADOPAGO_WEBHOOK_URL=https://<railway-backend-domain>/api/billing/webhook/mercadopago
MERCADOPAGO_CURRENCY=USD
PRO_PRICE=9
SENTRY_DSN=https://example.ingest.sentry.io/000000
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=residente-backend@<git-sha>
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.05
FIREBASE_PROJECT_ID=residente
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@example.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Health check:

```text
GET https://<railway-backend-domain>/health
```

API base:

```text
https://<railway-backend-domain>/api
```

## Vercel frontend

Recommended production domains:

```text
residente.app
www.residente.app
```

Required Vercel variables:

```env
NEXT_PUBLIC_APP_NAME=Residente
NEXT_PUBLIC_SITE_URL=https://www.residente.app
NEXT_PUBLIC_API_URL=https://<railway-backend-domain>
API_URL=https://<railway-backend-domain>
NEXT_PUBLIC_SENTRY_DSN=https://example.ingest.sentry.io/000000
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_RELEASE=residente-web@<git-sha>
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_DSN=https://example.ingest.sentry.io/000000
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=residente-web@<git-sha>
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_ORG=<sentry-org>
SENTRY_PROJECT=residente-web
SENTRY_AUTH_TOKEN=<sentry-auth-token>
NEXT_PUBLIC_FIREBASE_API_KEY=<firebase-web-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=residente.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=residente
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=residente.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<web-app-id>
NEXT_PUBLIC_FIREBASE_VAPID_KEY=<web-push-vapid-key>
```

The web app calls backend routes through `/api/*` proxy routes and public pages use `NEXT_PUBLIC_API_URL` for server-side metadata and sitemap generation.

## GitHub Actions secrets

Required secrets for `.github/workflows/deploy.yml`:

```text
RAILWAY_TOKEN
RAILWAY_SERVICE
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
PRODUCTION_BACKEND_URL
PRODUCTION_WEB_URL
SENTRY_AUTH_TOKEN
```

## Flutter release flags

Pass Sentry values at build time with Dart defines:

```text
--dart-define=SENTRY_DSN=https://example.ingest.sentry.io/000000
--dart-define=SENTRY_ENVIRONMENT=production
--dart-define=SENTRY_RELEASE=residente-mobile@<version>
--dart-define=SENTRY_TRACES_SAMPLE_RATE=0.1
```

Mobile FCM also requires the native Firebase files from Firebase Console:

- `apps/mobile/android/app/google-services.json`
- `apps/mobile/ios/Runner/GoogleService-Info.plist`
