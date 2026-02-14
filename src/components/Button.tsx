import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "danger" | "secondary" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0e1a]";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:shadow-[0_0_24px_rgba(6,214,160,0.3)] hover:brightness-110 focus:ring-cyan-500/50",
  danger:
    "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-[0_0_24px_rgba(239,68,68,0.3)] hover:brightness-110 focus:ring-red-500/50",
  secondary:
    "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white focus:ring-white/20",
  ghost:
    "text-gray-400 hover:text-white hover:bg-white/5 focus:ring-white/10",
};

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: Props) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
