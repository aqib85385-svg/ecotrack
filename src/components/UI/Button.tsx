import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle = 'inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-semibold select-none';
  
  const variants = {
    primary: 'bg-brand-emerald hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-900/20 active:scale-[0.98]',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-[0.98]',
    danger: 'bg-brand-danger hover:bg-red-400 text-white shadow-md active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-350'
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
          role="status"
          aria-label="Loading"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
