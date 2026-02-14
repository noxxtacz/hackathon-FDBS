interface Props {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <header className="mb-8 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-base text-gray-400">{subtitle}</p>
      )}
    </header>
  );
}
