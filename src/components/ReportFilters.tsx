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
  return (
    <div className="mb-6 flex flex-wrap gap-4">
      <div>
        <label
          htmlFor="gov-filter"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Governorate
        </label>
        <select
          id="gov-filter"
          value={selectedGovernorate}
          onChange={(e) => onGovernorateChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
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
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Threat Type
        </label>
        <select
          id="type-filter"
          value={selectedThreatType}
          onChange={(e) => onThreatTypeChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
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
