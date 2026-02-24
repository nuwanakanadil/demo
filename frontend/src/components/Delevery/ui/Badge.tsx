import React from 'react';
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'accepted' | 'pending' | 'scheduled' | 'transit' | 'done';
  className?: string;
}
export function Badge({
  children,
  variant = 'pending',
  className = ''
}: BadgeProps) {
  const variantStyles = {
    accepted: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    scheduled: 'bg-green-50 text-green-700 border-green-200',
    transit: 'bg-purple-50 text-purple-700 border-purple-200',
    done: 'bg-green-50 text-green-700 border-green-200'
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${variantStyles[variant]} ${className}`}>

      {children}
    </span>);

}