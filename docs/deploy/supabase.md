# Supabase Setup

Residente uses Supabase for two production concerns:

- PostgreSQL database through Prisma.
- Storage bucket for uploaded media and algorithm flowcharts.

## 1. Create Project

Create a Supabase project named `residente` from the Supabase dashboard.

Save these values:

- Project URL: `https://<project-ref>.supabase.co`
- Service role key: Project Settings -> API -> `service_role`
- Database password
- Database connection string

Do not expose the service role key in frontend or mobile apps.

## 2. Backend Environment

For local backend development, create `.env` at the repo root or inject these variables in your shell:

```env
DATABASE_URL=postgresql://postgres:<db-password>@db.<project-ref>.supabase.co:5432/postgres?schema=public
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_STORAGE_BUCKET=media
SUPABASE_STORAGE_PUBLIC=true
SUPABASE_STORAGE_MAX_FILE_SIZE_BYTES=10485760
```

For Railway, put the same variables in the backend service environment.

## 3. Apply Prisma Schema

Run migrations against Supabase:

```sh
pnpm --filter @residente/backend prisma:deploy
```

For a fresh development project without migration files yet, use:

```sh
pnpm --filter @residente/backend exec prisma db push
```

Then seed demo data and the admin user:

```sh
pnpm --filter @residente/backend prisma:seed
```

Seed admin credentials:

```text
Email: admin@residente.app
Password: password123
```

## 4. Create Storage Bucket

The backend expects a public bucket named `media`.

Run:

```sh
pnpm --filter @residente/backend supabase:setup-storage
```

The script is idempotent. It creates or updates the bucket with:

- Public files enabled.
- Max file size: 10 MB.
- Allowed MIME types: JPG, PNG, WebP, SVG, PDF.

## 5. Verify Uploads

Start the backend with Supabase variables loaded, log in as ADMIN, and call:

```text
POST /api/media/upload
```

Expected response:

```json
{
  "id": "...",
  "url": "https://<project-ref>.supabase.co/storage/v1/object/public/media/...",
  "key": "uploads/YYYY-MM-DD/..."
}
```

## 6. Security Notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Do not put Supabase service credentials in `NEXT_PUBLIC_*` variables.
- Public bucket URLs are appropriate for published algorithm assets. Use signed URLs if future content becomes private.
