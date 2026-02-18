import React from 'react';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}
export function Card({
  children,
  className = '',
  interactive = false
}: CardProps) {
  const baseStyles =
  'bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition-all duration-200';
  const interactiveStyles = interactive ?
  'hover:shadow-md hover:scale-[1.02] cursor-pointer' :
  '';
  return (
    <div className={`${baseStyles} ${interactiveStyles} ${className}`}>
      {children}
    </div>);

}