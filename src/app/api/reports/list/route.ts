import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isGovernorate } from "@/lib/validators";

/**
 * GET /api/reports/list
 * Public – returns approved threat reports.
 * Query params: ?governorate=Tunis&threat_type=phishing&page=1
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const governorate = searchParams.get("governorate");
    const threat_type = searchParams.get("threat_type");
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = 20;

    let query = supabaseAdmin
      .from("threat_reports")
      .select("*", { count: "exact" })
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (governorate && isGovernorate(governorate)) {
      query = query.eq("governorate", governorate);
    }

    if (threat_type) {
      query = query.eq("threat_type", threat_type);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("[reports/list] DB error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reports: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("[reports/list]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
