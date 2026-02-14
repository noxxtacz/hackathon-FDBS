"use client";

interface Props {
  password: string;
}

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: "Weak", pct: 20, color: "bg-red-500" };
  if (score <= 2) return { level: "Fair", pct: 40, color: "bg-orange-400" };
  if (score <= 3) return { level: "Good", pct: 60, color: "bg-yellow-400" };
  if (score <= 4) return { level: "Strong", pct: 80, color: "bg-green-400" };
  return { level: "Very Strong", pct: 100, color: "bg-green-600" };
}

export default function PasswordStrengthMeter({ password }: Props) {
  if (!password) return null;

  const { level, pct, color } = getStrength(password);

  return (
    <div className="mt-2">
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-600">
        Strength: <span className="font-semibold">{level}</span>
      </p>
    </div>
  );
}
