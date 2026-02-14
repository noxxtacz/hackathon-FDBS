import type { RiskLabel } from "@/lib/types";

const styles: Record<RiskLabel, string> = {
  safe: "bg-green-100 text-green-800",
  suspicious: "bg-yellow-100 text-yellow-800",
  dangerous: "bg-red-100 text-red-800",
};

interface Props {
  label: RiskLabel;
}

export default function RiskBadge({ label }: Props) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide ${styles[label]}`}
    >
      {label}
    </span>
  );
}
