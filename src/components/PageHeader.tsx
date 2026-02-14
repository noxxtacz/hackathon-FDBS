interface Props {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-gray-500">{subtitle}</p>
      )}
    </header>
  );
}
