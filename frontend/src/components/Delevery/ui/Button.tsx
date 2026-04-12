import React from "react";
import { Button as CoreButton } from "../../ui/Button";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <CoreButton
      variant={variant === "primary" ? "primary" : "outline"}
      size={size}
      isLoading={loading}
      className={className}
      {...props}
    >
      {children}
    </CoreButton>
  );
}