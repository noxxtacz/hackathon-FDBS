import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import Link from "next/link";

const features = [
  {
    title: "Phishing Scanner",
    desc: "Analyze URLs for phishing risk instantly.",
    href: "/phishing",
  },
  {
    title: "Threat Reports",
    desc: "Browse crowdsourced threat reports across governorates.",
    href: "/reports",
  },
  {
    title: "Heatmap",
    desc: "Visualize threat density by region.",
    href: "/heatmap",
  },
  {
    title: "Vault",
    desc: "Check password strength and manage credentials.",
    href: "/vault",
  },
  {
    title: "Security Quiz",
    desc: "Test your cybersecurity awareness.",
    href: "/quiz",
  },
];

export default function HomePage() {
  return (
    <>
      <PageHeader
        title="Welcome to ShieldsUp"
        subtitle="Your all-in-one cybersecurity awareness toolkit."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className="group">
            <Card className="transition-shadow group-hover:shadow-md">
              <h2 className="text-lg font-semibold text-gray-900">
                {f.title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
