import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { sanitize, isUrl, isGovernorate } from "@/lib/validators";

/**
 * POST /api/reports/create
 * Auth required.
 * Body: { threat_type, governorate, description, url?, solution? }
 * Inserts a row into `threat_reports` (status = "pending").
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();

    // Auth check
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

    // Validate required fields
    const threat_type = sanitize(body?.threat_type ?? "");
    const governorate = sanitize(body?.governorate ?? "");
    const description = sanitize(body?.description ?? "");
    const rawUrl: string | undefined = body?.url;
    const solution: string | undefined = body?.solution
      ? sanitize(body.solution)
      : undefined;

    if (!threat_type || !governorate || !description) {
      return NextResponse.json(
        { error: "threat_type, governorate, and description are required" },
        { status: 400 }
      );
    }

    if (!isGovernorate(governorate)) {
      return NextResponse.json(
        { error: "Invalid governorate" },
        { status: 400 }
      );
    }

    if (rawUrl && !isUrl(rawUrl)) {
      return NextResponse.json(
        { error: "Invalid URL provided" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("threat_reports")
      .insert({
        user_id: user.id,
        threat_type,
        governorate,
        description,
        defanged_url: rawUrl ?? null,
        solution: solution ?? null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[reports/create] DB error:", error);
      return NextResponse.json(
        { error: "Failed to create report" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err) {
    console.error("[reports/create]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
