"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { GeoJSON as GeoJSONType } from "geojson";
import L from "leaflet";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* ── Types ──────────────────────────────────────────────────── */

interface GovernorateProperties {
  name: string;
}

type GovernorateFeature = GeoJSON.Feature<GeoJSON.Geometry, GovernorateProperties>;
type GovernorateCollection = GeoJSON.FeatureCollection<GeoJSON.Geometry, GovernorateProperties>;

type ReportCounts = Record<string, number>;

/* ── Colour scale ───────────────────────────────────────────── */

function getColor(count: number, max: number): string {
  if (max === 0 || count === 0) return "#374151"; // gray-700
  const ratio = count / max;
  if (ratio > 0.75) return "#991b1b"; // red-800
  if (ratio > 0.5) return "#dc2626"; // red-600
  if (ratio > 0.25) return "#ef4444"; // red-500
  return "#fca5a5"; // red-300
}

/* ── Component ──────────────────────────────────────────────── */

export default function TunisiaHeatMap() {
  const [geoData, setGeoData] = useState<GovernorateCollection | null>(null);
  const [counts, setCounts] = useState<ReportCounts>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const geoRef = useRef<L.GeoJSON | null>(null);

  /* ── Fetch data ────────────────────────────────────────── */

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [geoRes, countRes] = await Promise.all([
        fetch("/geo/tunisia-governorates.geojson"),
        fetch("/api/reports/heatmap"),
      ]);

      if (!geoRes.ok) throw new Error("Failed to load map geometry");
      if (!countRes.ok) throw new Error("Failed to load report data");

      const geo = (await geoRes.json()) as GovernorateCollection;
      const data = (await countRes.json()) as ReportCounts;
      setGeoData(geo);
      setCounts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load map data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Derived values ────────────────────────────────────── */

  const maxCount = Math.max(1, ...Object.values(counts));

  /* ── GeoJSON style per feature ─────────────────────────── */

  const style = useCallback(
    (feature: GovernorateFeature | undefined) => {
      const name = feature?.properties?.name ?? "";
      const count = counts[name] ?? 0;
      return {
        fillColor: getColor(count, maxCount),
        weight: 1,
        color: "#1f2937",
        fillOpacity: 0.7,
      };
    },
    [counts, maxCount],
  );

  /* ── Interactivity ─────────────────────────────────────── */

  const onEachFeature = useCallback(
    (feature: GovernorateFeature, layer: L.Layer) => {
      const name = feature.properties?.name ?? "Unknown";
      const count = counts[name] ?? 0;

      layer.bindTooltip(`<strong>${name}</strong><br/>${count} report${count !== 1 ? "s" : ""}`, {
        sticky: true,
        className: "heatmap-tooltip",
      });

      layer.on({
        mouseover: (e: L.LeafletMouseEvent) => {
          const target = e.target as L.Path;
          target.setStyle({ weight: 2, fillOpacity: 0.85 });
          target.bringToFront();
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          geoRef.current?.resetStyle(e.target as L.Path);
        },
        click: () => {
          console.log(`[heatmap] clicked: ${name}`);
        },
      });
    },
    [counts],
  );

  /* ── Loading / error states ────────────────────────────── */

  if (loading) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="text-xs text-gray-500">Loading map…</p>
        </div>
      </div>
    );
  }

  if (error || !geoData) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5">
        <div className="text-center">
          <p className="text-sm text-red-400">{error || "Failed to load map"}</p>
          <button
            onClick={fetchData}
            className="mt-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ── Render map ────────────────────────────────────────── */

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5">
      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] rounded-xl border border-white/10 bg-slate-900/90 p-3 backdrop-blur-sm">
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
          Reports
        </p>
        <div className="flex items-center gap-1.5">
          {[
            { color: "#374151", label: "0" },
            { color: "#fca5a5", label: "Low" },
            { color: "#ef4444", label: "Med" },
            { color: "#dc2626", label: "High" },
            { color: "#991b1b", label: "Max" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-0.5">
              <div className="h-3 w-5 rounded-sm" style={{ backgroundColor: s.color }} />
              <span className="text-[9px] text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <MapContainer
        center={[34.0, 9.0]}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: 500, width: "100%" }}
        className="z-0 bg-slate-950"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON
          ref={geoRef as React.Ref<L.GeoJSON>}
          data={geoData}
          style={style as L.StyleFunction}
          onEachFeature={onEachFeature as (feature: GeoJSONType, layer: L.Layer) => void}
        />
      </MapContainer>

      {/* Tooltip styling */}
      <style jsx global>{`
        .heatmap-tooltip {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 0.5rem !important;
          color: #e2e8f0 !important;
          font-size: 12px !important;
          padding: 6px 10px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
        }
        .heatmap-tooltip::before {
          border-top-color: rgba(15, 23, 42, 0.95) !important;
        }
        .leaflet-container {
          background: #0a0e1a !important;
        }
      `}</style>
    </div>
  );
}
