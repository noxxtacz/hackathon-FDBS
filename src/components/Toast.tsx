interface Props {
  type: "success" | "error";
  message: string;
  onDismiss?: () => void;
}

export default function Toast({ type, message, onDismiss }: Props) {
  const styles =
    type === "success"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : "border-red-500/20 bg-red-500/10 text-red-400";

  return (
    <div
      role="alert"
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm animate-slide-up ${styles}`}
    >
      <div className="flex items-center gap-2">
        {type === "success" ? (
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        )}
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
}
