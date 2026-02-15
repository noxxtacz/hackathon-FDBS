import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/reports/vote
 * Auth required. Toggles an upvote on a threat report.
 * Body: { report_id: string }
 * Returns: { voted: boolean, vote_count: number }
 */
export async function POST(req: NextRequest) {
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
    const report_id = typeof body?.report_id === "string" ? body.report_id.trim() : "";

    if (!report_id) {
      return NextResponse.json(
        { error: "report_id is required" },
        { status: 400 }
      );
    }

    // Check if the report exists
    const { data: report, error: reportErr } = await supabaseAdmin
      .from("threat_reports")
      .select("id")
      .eq("id", report_id)
      .single();

    if (reportErr || !report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Check if user already voted
    const { data: existingVote } = await supabaseAdmin
      .from("threat_votes")
      .select("id")
      .eq("report_id", report_id)
      .eq("user_id", user.id)
      .maybeSingle();

    let voted: boolean;

    if (existingVote) {
      // Remove vote (toggle off)
      await supabaseAdmin
        .from("threat_votes")
        .delete()
        .eq("id", existingVote.id);
      voted = false;
    } else {
      // Add vote
      const { error: insertErr } = await supabaseAdmin
        .from("threat_votes")
        .insert({ report_id, user_id: user.id });

      if (insertErr) {
        console.error("[reports/vote] Insert error:", insertErr);
        return NextResponse.json(
          { error: "Failed to vote" },
          { status: 500 }
        );
      }
      voted = true;
    }

    // Get updated vote count
    const { count } = await supabaseAdmin
      .from("threat_votes")
      .select("*", { count: "exact", head: true })
      .eq("report_id", report_id);

    return NextResponse.json({
      voted,
      vote_count: count ?? 0,
    });
  } catch (err) {
    console.error("[reports/vote]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
