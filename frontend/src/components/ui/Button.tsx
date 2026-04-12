import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  ...props
}: Readonly<ButtonProps>) {
  const variants = {
    primary: 'bg-[#2f6e54] text-white shadow-[0_8px_18px_-12px_rgba(47,110,84,0.95)] hover:bg-[#275d47]',
    secondary: 'bg-white/80 text-neutral-800 border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(17,24,39,0.06)] hover:bg-white/95',
    outline:
    'border border-neutral-300 bg-white/55 backdrop-blur-md hover:bg-white/80 text-neutral-700',
    ghost: 'bg-transparent hover:bg-white/65 text-neutral-600',
    danger: 'bg-[#ff453a] text-white hover:bg-[#e03e33] shadow-[0_8px_18px_-12px_rgba(255,69,58,0.9)]'
  };
  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-[10px]',
    md: 'h-10 px-4 py-2 rounded-[12px]',
    lg: 'h-12 px-6 text-lg rounded-[14px]'
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold tracking-[0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#429172] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70 active:scale-[0.99]',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}>

      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>);

}