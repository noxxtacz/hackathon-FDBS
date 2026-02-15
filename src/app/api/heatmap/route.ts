import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET /api/heatmap
 * Public – returns count of approved reports per governorate.
 */
export async function GET() {
  try {
    // Use an RPC or raw query to group by governorate.
    // Fallback: fetch all approved reports and aggregate in JS.
    const { data, error } = await supabaseAdmin
      .from("threat_reports")
      .select("governorate")
      .eq("status", "approved");

    if (error) {
      console.error("[heatmap] DB error:", error);
      return NextResponse.json(
        { error: "Failed to fetch heatmap data" },
        { status: 500 }
      );
    }

    // Aggregate counts
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      const g = row.governorate as string;
      counts[g] = (counts[g] ?? 0) + 1;
    }

    // Shape as array sorted descending by count
    const heatmap = Object.entries(counts)
      .map(([governorate, count]) => ({ governorate, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ heatmap });
  } catch (err) {
    console.error("[heatmap]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
