import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { deleteVaultItem } from "@/lib/vaultDb";

/**
 * DELETE /api/vault/items/[id]
 * Auth required — deletes a vault item by ID.
 * Enforces ownership via user_id check in the query.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteVaultItem(user.id, id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Item not found or not owned by you" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[vault/items/[id] DELETE]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
