export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "h-5 w-5" : size === "lg" ? "h-12 w-12" : "h-8 w-8";
  return (
    <div className="flex items-center justify-center py-12" role="status">
      <div className={`${dim} animate-spin rounded-full border-2 border-white/10 border-t-cyan-400`} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
