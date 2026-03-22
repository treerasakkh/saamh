import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client ใช้ service_role key
 * bypass RLS ทั้งหมด — ใช้ใน Server Components และ API routes เท่านั้น
 * ห้ามใช้ใน Client Components เด็ดขาด
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
