import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * POST /api/auth/signout
 * Signs the user out and clears session cookies.
 */
export async function POST() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
