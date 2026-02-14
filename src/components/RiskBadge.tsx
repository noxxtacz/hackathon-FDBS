import type { RiskLabel } from "@/lib/types";

const styles: Record<RiskLabel, string> = {
  safe: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 glow-cyan",
  suspicious: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 glow-yellow",
  dangerous: "bg-red-500/10 text-red-400 border-red-500/20 glow-red",
};

interface Props {
  label: RiskLabel;
}

export default function RiskBadge({ label }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${styles[label]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${
        label === "safe" ? "bg-emerald-400" :
        label === "suspicious" ? "bg-yellow-400" : "bg-red-400"
      }`} />
      {label}
    </span>
  );
}
