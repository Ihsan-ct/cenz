import { createClient } from "@supabase/supabase-js";

export const BUCKET = (process.env.SUPABASE_BUCKET ?? "audio").trim();

// Hanya dipakai di server/worker. Jangan di-import dari komponen client.
export const supabaseAdmin = createClient(
  (process.env.SUPABASE_URL ?? "").trim(),
  (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim(),
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Semua file milik user disimpan di bawah users/{userId}/
export const userPrefix = (userId: string) => `users/${userId}/`;
export const objectKey = (userId: string, jobId: string, ext = "mp3") =>
  `${userPrefix(userId)}${jobId}.${ext}`;

export async function createDownloadUrl(key: string, expiresIn = 300) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(key, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function createUploadUrl(key: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUploadUrl(key);
  if (error) throw error;
  return data; // { signedUrl, token, path }
}

export async function removeObjects(keys: string[]) {
  if (!keys.length) return;
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove(keys);
  if (error) throw error;
}
