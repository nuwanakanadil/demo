import React from 'react';
import { cn } from '../../lib/utils';
export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/70 bg-white/72 shadow-[0_12px_28px_-18px_rgba(17,24,39,0.38),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl',
        className
      )}
      {...props}>

      {children}
    </div>);

}
export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
      {children}
    </div>);

}
export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-bold leading-none tracking-tight text-neutral-900', className)}
      {...props}>

      {children}
    </h3>);

}
export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>);

}
export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center p-6 pt-0', className)} {...props}>
      {children}
    </div>);

}