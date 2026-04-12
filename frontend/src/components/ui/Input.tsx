import React from 'react';
import { cn } from '../../lib/utils';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export function Input({ className, label, error, id, ...props }: InputProps) {
  return (
    <div className="w-full space-y-1">
      {label &&
      <label htmlFor={id} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      }
      <input
        id={id}
        className={cn(
          'flex h-11 w-full rounded-[12px] border border-neutral-300 bg-white/70 backdrop-blur-sm px-3.5 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#429172] focus:border-transparent focus:shadow-[0_0_0_4px_rgba(66,145,114,0.14)] disabled:cursor-not-allowed disabled:opacity-50 transition-all',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props} />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>);

}