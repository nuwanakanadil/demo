import React from "react";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

type TextSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function TextSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: TextSearchInputProps) {
  return (
    <div className={cn("relative max-w-md flex-1 min-w-[260px]", className)}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-neutral-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="pl-12 pr-4 py-3 w-full bg-white/80 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow shadow-sm outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
