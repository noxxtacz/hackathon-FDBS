"use client";

import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import ReportCard from "@/components/ReportCard";
import ReportFilters from "@/components/ReportFilters";
import type { ThreatReport } from "@/lib/types";

const SAMPLE_REPORTS: ThreatReport[] = [
  {
    id: "1",
    threat_type: "Phishing",
    governorate: "Muscat",
    description: "Fake bank login page mimicking Bank Muscat.",
    solution: "Do not enter credentials. Report to your bank.",
    defanged_url: "hxxps://bank-muscat-login[.]xyz/auth",
    risk_score: 92,
    risk_label: "dangerous",
    reasons: ["Suspicious domain", "No SSL certificate match"],
    created_at: "2026-02-10T08:30:00Z",
  },
  {
    id: "2",
    threat_type: "Scam",
    governorate: "Dhofar",
    description: "WhatsApp message offering fake government subsidies.",
    solution: "Ignore and block the sender.",
    defanged_url: "hxxps://free-subsidy-om[.]com/claim",
    risk_score: 78,
    risk_label: "suspicious",
    reasons: ["Newly registered domain", "Urgency language"],
    created_at: "2026-02-12T14:00:00Z",
  },
  {
    id: "3",
    threat_type: "Malware",
    governorate: "Al Dakhiliyah",
    description: "PDF attachment containing macro-based malware.",
    solution: "Scan attachments with antivirus before opening.",
    defanged_url: "hxxps://docs-share[.]net/invoice.pdf",
    risk_score: 45,
    risk_label: "suspicious",
    reasons: ["Executable content in PDF"],
    created_at: "2026-02-14T09:15:00Z",
  },
  {
    id: "4",
    threat_type: "Social Engineering",
    governorate: "Muscat",
    description: "Phone call impersonating ROP asking for OTP.",
    solution: "Never share OTPs. Hang up and call official numbers.",
    defanged_url: "N/A",
    risk_score: 88,
    risk_label: "dangerous",
    reasons: ["Impersonation of authority"],
    created_at: "2026-02-13T11:45:00Z",
  },
];

export default function ReportsPage() {
  const [govFilter, setGovFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const governorates = useMemo(
    () => [...new Set(SAMPLE_REPORTS.map((r) => r.governorate))],
    []
  );
  const threatTypes = useMemo(
    () => [...new Set(SAMPLE_REPORTS.map((r) => r.threat_type))],
    []
  );

  const filtered = useMemo(() => {
    return SAMPLE_REPORTS.filter((r) => {
      if (govFilter && r.governorate !== govFilter) return false;
      if (typeFilter && r.threat_type !== typeFilter) return false;
      return true;
    });
  }, [govFilter, typeFilter]);

  return (
    <>
      <PageHeader
        title="Threat Reports"
        subtitle="Browse crowdsourced threat reports."
      />

      <ReportFilters
        governorates={governorates}
        threatTypes={threatTypes}
        selectedGovernorate={govFilter}
        selectedThreatType={typeFilter}
        onGovernorateChange={setGovFilter}
        onThreatTypeChange={setTypeFilter}
      />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-gray-400">No reports match your filters.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </>
  );
}
