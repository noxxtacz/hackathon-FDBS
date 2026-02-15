import { NextRequest, NextResponse } from "next/server";
import { analyzeUrl } from "@/lib/phishing";
import { isUrl } from "@/lib/validators";

/**
 * POST /api/analyze/url
 * Body: { url: string }
 * Returns phishing analysis result.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl: unknown = body?.url;

    if (typeof rawUrl !== "string" || rawUrl.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or empty 'url' field" },
        { status: 400 }
      );
    }

    if (!isUrl(rawUrl)) {
      return NextResponse.json(
        { error: "Value does not look like a valid URL" },
        { status: 400 }
      );
    }

    const result = analyzeUrl(rawUrl);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[analyze/url]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
