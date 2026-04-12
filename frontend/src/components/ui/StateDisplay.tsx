import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

type StateDisplayProps = {
  type: "loading" | "empty" | "error";
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function StateDisplay({
  type,
  title,
  description,
  icon,
  action,
  className,
}: StateDisplayProps) {
  const defaultIcon =
    type === "loading" ? (
      <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
    ) : type === "error" ? (
      <AlertCircle className="h-6 w-6 text-rose-500" />
    ) : null;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-12 text-center", className)}>
      {icon || defaultIcon}
      <p className="text-base font-medium text-neutral-700">{title}</p>
      {description && <p className="text-sm text-neutral-500">{description}</p>}
      {action}
    </div>
  );
}
