import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: Props) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-lg backdrop-blur-md transition-all duration-300 ${
        hover ? "hover:scale-[1.02] hover:border-white/10 hover:bg-white/[0.05] hover:shadow-xl" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
