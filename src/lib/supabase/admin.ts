import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client – bypasses RLS.
 * Use **only** in server-side code (API routes, server actions).
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
