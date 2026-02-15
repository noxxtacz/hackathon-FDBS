import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * GET  /api/vault/blob – fetch user's encrypted vault blob
 * PUT  /api/vault/blob – upsert user's encrypted vault blob
 *
 * Both endpoints require authentication.
 * The client encrypts/decrypts locally; the server stores opaque data.
 */

export async function GET() {
  try {
    const supabase = await createSupabaseServer();

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("vault_blobs")
      .select("encrypted_data, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[vault/blob GET] DB error:", error);
      return NextResponse.json(
        { error: "Failed to fetch vault" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      blob: data?.encrypted_data ?? null,
      updated_at: data?.updated_at ?? null,
    });
  } catch (err) {
    console.error("[vault/blob GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const encrypted_data: unknown = body?.encrypted_data;

    if (typeof encrypted_data !== "string" || encrypted_data.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty encrypted_data" },
        { status: 400 }
      );
    }

    // Upsert – insert or update on conflict
    const { error } = await supabase
      .from("vault_blobs")
      .upsert(
        { user_id: user.id, encrypted_data },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("[vault/blob PUT] DB error:", error);
      return NextResponse.json(
        { error: "Failed to save vault" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[vault/blob PUT]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
