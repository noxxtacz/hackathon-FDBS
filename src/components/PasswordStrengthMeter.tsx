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

  const levels = [
    { level: "Weak", pct: 20, color: "bg-red-500", glow: "shadow-[0_0_8px_rgba(239,68,68,0.4)]" },
    { level: "Fair", pct: 40, color: "bg-orange-400", glow: "shadow-[0_0_8px_rgba(251,146,60,0.3)]" },
    { level: "Good", pct: 60, color: "bg-yellow-400", glow: "shadow-[0_0_8px_rgba(250,204,21,0.3)]" },
    { level: "Strong", pct: 80, color: "bg-emerald-400", glow: "shadow-[0_0_8px_rgba(52,211,153,0.3)]" },
    { level: "Very Strong", pct: 100, color: "bg-cyan-400", glow: "shadow-[0_0_8px_rgba(6,214,160,0.4)]" },
  ];

  const idx = Math.min(score, levels.length) - 1;
  return levels[Math.max(0, idx)];
}

export default function PasswordStrengthMeter({ password }: Props) {
  if (!password) return null;

  const { level, pct, color, glow } = getStrength(password);

  return (
    <div className="mt-3 animate-fade-in">
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color} ${glow}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="text-gray-500">
          Strength: <span className="font-semibold text-gray-300">{level}</span>
        </span>
        <span className="font-mono text-gray-600">{password.length} chars</span>
      </div>
    </div>
  );
}
