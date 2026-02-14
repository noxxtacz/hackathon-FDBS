"use client";

interface Props {
  governorates: string[];
  threatTypes: string[];
  selectedGovernorate: string;
  selectedThreatType: string;
  onGovernorateChange: (v: string) => void;
  onThreatTypeChange: (v: string) => void;
}

export default function ReportFilters({
  governorates,
  threatTypes,
  selectedGovernorate,
  selectedThreatType,
  onGovernorateChange,
  onThreatTypeChange,
}: Props) {
  const selectClass =
    "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 backdrop-blur focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all";

  return (
    <div className="mb-6 flex flex-wrap gap-4">
      <div>
        <label
          htmlFor="gov-filter"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500"
        >
          Governorate
        </label>
        <select
          id="gov-filter"
          value={selectedGovernorate}
          onChange={(e) => onGovernorateChange(e.target.value)}
          className={selectClass}
        >
          <option value="">All</option>
          {governorates.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="type-filter"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500"
        >
          Threat Type
        </label>
        <select
          id="type-filter"
          value={selectedThreatType}
          onChange={(e) => onThreatTypeChange(e.target.value)}
          className={selectClass}
        >
          <option value="">All</option>
          {threatTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
