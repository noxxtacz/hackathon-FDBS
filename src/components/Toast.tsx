interface Props {
  type: "success" | "error";
  message: string;
  onDismiss?: () => void;
}

export default function Toast({ type, message, onDismiss }: Props) {
  const color =
    type === "success"
      ? "border-green-400 bg-green-50 text-green-800"
      : "border-red-400 bg-red-50 text-red-800";

  return (
    <div
      role="alert"
      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${color}`}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 font-bold opacity-60 hover:opacity-100"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
