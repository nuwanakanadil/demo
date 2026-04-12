import React from 'react';
import { cn } from '../../lib/utils';
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
  className?: string;
}
export function Badge({
  children,
  variant = 'default',
  className
}: BadgeProps) {
  const variants = {
    default: 'bg-white/70 text-neutral-800 border border-white/80 backdrop-blur-sm',
    success: 'bg-[#e8f8ef] text-[#1e8e4b] border border-[#c9edd8]',
    warning: 'bg-[#fff5e6] text-[#b27311] border border-[#f7e2b9]',
    error: 'bg-[#ffecec] text-[#c43d3d] border border-[#ffd0d0]',
    outline: 'border border-neutral-300 text-neutral-600 bg-white/55 backdrop-blur-sm'
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}>

      {children}
    </span>);

}