import { createClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as unknown as {
  supabaseAdmin: ReturnType<typeof createClient> | undefined;
};

export const supabaseAdmin =
  globalForSupabase.supabaseAdmin ??
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

globalForSupabase.supabaseAdmin = supabaseAdmin;
