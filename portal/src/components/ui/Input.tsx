import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = "", ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={
            [error ? errorId : "", hint ? hintId : ""].filter(Boolean).join(" ") || undefined
          }
          className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors
            placeholder:text-gray-400
            ${error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
            }
            focus:outline-none focus:ring-1
            disabled:bg-gray-100 disabled:text-gray-500
            ${className}`}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="mt-1 text-xs text-gray-500">{hint}</p>
        )}
        {error && (
          <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
