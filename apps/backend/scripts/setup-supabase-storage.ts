import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "media";
const isPublic = process.env.SUPABASE_STORAGE_PUBLIC !== "false";
const maxFileSizeBytes = Number(
  process.env.SUPABASE_STORAGE_MAX_FILE_SIZE_BYTES ?? 10 * 1024 * 1024
);

async function main() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(`Unable to list Supabase buckets: ${listError.message}`);
  }

  const exists = buckets.some((item) => item.name === bucket);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(bucket, {
      public: isPublic,
      fileSizeLimit: maxFileSizeBytes,
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/svg+xml",
        "application/pdf"
      ]
    });

    if (error) {
      throw new Error(`Unable to create Supabase bucket: ${error.message}`);
    }

    console.log(`Created Supabase bucket "${bucket}"`);
    return;
  }

  const { error } = await supabase.storage.updateBucket(bucket, {
    public: isPublic,
    fileSizeLimit: maxFileSizeBytes,
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "application/pdf"
    ]
  });

  if (error) {
    throw new Error(`Unable to update Supabase bucket: ${error.message}`);
  }

  console.log(`Supabase bucket "${bucket}" is ready`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
