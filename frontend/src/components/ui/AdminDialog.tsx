import React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

type AdminDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  tone?: "default" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  showClose?: boolean;
  zIndexClassName?: string;
};

const SIZE_CLASS: Record<NonNullable<AdminDialogProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-5xl",
};

export function AdminDialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  tone = "default",
  size = "md",
  showClose = true,
  zIndexClassName = "z-[70]",
}: AdminDialogProps) {
  if (!open) return null;

  return (
    <div className={cn("fixed inset-0 flex items-center justify-center p-4", zIndexClassName)}>
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200",
          SIZE_CLASS[size],
        )}
      >
        <div
          className={cn(
            "flex items-start justify-between gap-4 border-b border-neutral-100 p-6",
            tone === "danger" ? "bg-rose-50/30" : "bg-neutral-50/50",
          )}
        >
          <div>
            <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-neutral-500">{subtitle}</p> : null}
          </div>
          {showClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <div className="p-6">{children}</div>

        {footer ? <div className="border-t border-neutral-100 bg-neutral-50/50 p-6">{footer}</div> : null}
      </div>
    </div>
  );
}
