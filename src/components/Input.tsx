import { InputHTMLAttributes, forwardRef } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, id, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 backdrop-blur transition-all duration-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
