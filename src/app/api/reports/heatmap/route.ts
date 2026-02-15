import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Canonical name mapping — GeoJSON NAME_1 → DB governorate name.
 * The GeoJSON uses GADM names (e.g. "BenArous(TunisSud)"),
 * while the DB may store user-entered or Arabic-transliterated values.
 * We normalise both sides to match.
 */
const GEOJSON_TO_DB: Record<string, string[]> = {
  Tunis: ["Tunis", "tunis"],
  Ariana: ["Ariana", "ariana"],
  "BenArous(TunisSud)": ["Ben Arous", "ben arous", "BenArous"],
  Manubah: ["Manouba", "manouba", "Manubah"],
  Nabeul: ["Nabeul", "nabeul"],
  Zaghouan: ["Zaghouan", "zaghouan"],
  Bizerte: ["Bizerte", "bizerte"],
  Béja: ["Béja", "Beja", "beja", "béja"],
  Jendouba: ["Jendouba", "jendouba"],
  LeKef: ["Le Kef", "Kef", "le kef", "kef", "LeKef"],
  Siliana: ["Siliana", "siliana"],
  Sousse: ["Sousse", "sousse"],
  Monastir: ["Monastir", "monastir"],
  Mahdia: ["Mahdia", "mahdia"],
  Sfax: ["Sfax", "sfax"],
  Kairouan: ["Kairouan", "kairouan"],
  Kassérine: ["Kasserine", "kasserine", "Kassérine"],
  SidiBouZid: ["Sidi Bouzid", "sidi bouzid", "SidiBouZid"],
  Gabès: ["Gabès", "Gabes", "gabes", "gabès"],
  Médenine: ["Medenine", "medenine", "Médenine", "médenine"],
  Tataouine: ["Tataouine", "tataouine"],
  Gafsa: ["Gafsa", "gafsa"],
  Tozeur: ["Tozeur", "tozeur"],
  Kebili: ["Kebili", "kebili"],
};

/**
 * GET /api/reports/heatmap
 * Public — returns aggregated report counts keyed by GeoJSON governorate name.
 * Response: { "Tunis": 12, "Sfax": 7, ... }
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("threat_reports")
      .select("governorate")
      .eq("status", "approved");

    if (error) {
      console.error("[reports/heatmap] DB error:", error);
      return NextResponse.json(
        { error: "Failed to fetch heatmap data" },
        { status: 500 },
      );
    }

    // Count per raw DB governorate value
    const rawCounts: Record<string, number> = {};
    for (const row of data ?? []) {
      const g = (row.governorate as string) ?? "";
      if (g) rawCounts[g] = (rawCounts[g] ?? 0) + 1;
    }

    // Map to GeoJSON keys
    const result: Record<string, number> = {};
    for (const [geoKey, dbAliases] of Object.entries(GEOJSON_TO_DB)) {
      let total = 0;
      for (const alias of dbAliases) {
        if (rawCounts[alias]) total += rawCounts[alias];
        // Also case-insensitive match
        const lower = alias.toLowerCase();
        for (const [k, v] of Object.entries(rawCounts)) {
          if (k.toLowerCase() === lower && k !== alias) total += v;
        }
      }
      result[geoKey] = total;
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[reports/heatmap]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
