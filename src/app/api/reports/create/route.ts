import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { sanitize, isUrl, isGovernorate, clamp } from "@/lib/validators";
import type { RiskLabel } from "@/lib/types";

const VALID_RISK_LABELS: RiskLabel[] = ["safe", "suspicious", "dangerous"];

/**
 * POST /api/reports/create
 * Auth required.
 * Body: { threat_type, governorate, description, url?, solution?,
 *         risk_score?, risk_label?, risk_reasons? }
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

    // Risk fields (optional — fall back to safe defaults)
    const risk_score = typeof body?.risk_score === "number"
      ? clamp(Math.round(body.risk_score), 0, 100)
      : 0;

    const rawLabel = String(body?.risk_label ?? "").toLowerCase();
    const risk_label: RiskLabel = VALID_RISK_LABELS.includes(rawLabel as RiskLabel)
      ? (rawLabel as RiskLabel)
      : risk_score >= 70 ? "dangerous" : risk_score >= 30 ? "suspicious" : "safe";

    const risk_reasons: string[] = Array.isArray(body?.risk_reasons)
      ? body.risk_reasons.filter((r: unknown) => typeof r === "string").slice(0, 20)
      : [];

    // Build insert payload — status column may not exist yet
    const payload: Record<string, unknown> = {
      created_by: user.id,
      threat_type,
      governorate,
      description,
      url_defanged: rawUrl ?? null,
      solution: solution ?? null,
      risk_score,
      risk_label,
      risk_reasons,
    };

    // Try with status first; fall back without if column doesn't exist
    let result = await supabase
      .from("threat_reports")
      .insert({ ...payload, status: "approved" })
      .select("id")
      .single();

    if (result.error?.code === "42703") {
      result = await supabase
        .from("threat_reports")
        .insert(payload)
        .select("id")
        .single();
    }

    const { data, error } = result;

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
