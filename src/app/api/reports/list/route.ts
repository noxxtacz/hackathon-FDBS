import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isGovernorate } from "@/lib/validators";

/**
 * GET /api/reports/list
 * Public – returns approved threat reports with vote counts.
 * Query params: ?governorate=Tunis&threat_type=phishing&page=1
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const governorate = searchParams.get("governorate");
    const threat_type = searchParams.get("threat_type");
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = 20;

    // Get current user (optional — for user_voted flag)
    let currentUserId: string | null = null;
    try {
      const supabase = await createSupabaseServer();
      const { data: { user } } = await supabase.auth.getUser();
      currentUserId = user?.id ?? null;
    } catch {
      // Not logged in — that's fine
    }

    // Build base query
    const buildQuery = (withStatus: boolean) => {
      let q = supabaseAdmin
        .from("threat_reports")
        .select("*, threat_votes(count)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (withStatus) q = q.eq("status", "approved");

      if (governorate && isGovernorate(governorate)) {
        q = q.eq("governorate", governorate);
      }

      if (threat_type) {
        q = q.eq("threat_type", threat_type);
      }

      return q;
    };

    // Try with status filter; fall back if column doesn't exist yet
    let result = await buildQuery(true);
    if (result.error?.code === "42703") {
      result = await buildQuery(false);
    }

    const { data, count, error } = result;

    if (error) {
      console.error("[reports/list] DB error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 }
      );
    }

    // Get the current user's votes for these reports
    const reportIds = (data ?? []).map((r: Record<string, unknown>) => r.id as string);
    let userVotedSet = new Set<string>();

    if (currentUserId && reportIds.length > 0) {
      const { data: votes } = await supabaseAdmin
        .from("threat_votes")
        .select("report_id")
        .eq("user_id", currentUserId)
        .in("report_id", reportIds);

      if (votes) {
        userVotedSet = new Set(votes.map((v: { report_id: string }) => v.report_id));
      }
    }

    // Shape the response
    const reports = (data ?? []).map((r: Record<string, unknown>) => {
      const voteArr = r.threat_votes as { count: number }[] | undefined;
      const vote_count = voteArr?.[0]?.count ?? 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { threat_votes: _tv, ...rest } = r;
      return {
        ...rest,
        vote_count,
        user_voted: userVotedSet.has(r.id as string),
      };
    });

    return NextResponse.json({
      reports,
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
