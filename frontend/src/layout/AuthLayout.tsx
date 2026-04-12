import React from "react";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(165deg,#f6f8fb,#edf1f5)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-brand-200/45 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-brand-100/55 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[420px] items-center justify-center">
        <div className="w-full rounded-3xl border border-white/85 bg-white/80 p-6 shadow-[0_18px_40px_-26px_rgba(17,24,39,0.34)] backdrop-blur-2xl sm:p-8">
          <div className="text-center">
            <img
              src="/logo.png"
              alt="ReWear"
              width={176}
              height={44}
              decoding="async"
              className="mx-auto h-11 w-auto"
            />
            <h2 className="mt-4 text-[1.75rem] font-black tracking-tight text-gray-900">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
          </div>

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
