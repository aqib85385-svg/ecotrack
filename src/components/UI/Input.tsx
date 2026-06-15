import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-sm font-semibold text-slate-300">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald focus:outline-none transition-colors text-slate-100 ${
            error ? 'border-brand-danger focus:border-brand-danger focus:ring-brand-danger' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-brand-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
