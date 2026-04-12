import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

type ToastContextValue = {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 3800);
  }, [removeToast]);

  const value = useMemo<ToastContextValue>(() => ({
    success: (title, message) => pushToast("success", title, message),
    error: (title, message) => pushToast("error", title, message),
    info: (title, message) => pushToast("info", title, message),
  }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[min(92vw,380px)] flex-col gap-2">
        {toasts.map((toast) => {
          const styles = toast.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : toast.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-blue-200 bg-blue-50 text-blue-800";

          const Icon = toast.type === "success"
            ? CheckCircle2
            : toast.type === "error"
              ? AlertTriangle
              : Info;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-xl border px-3 py-2 shadow-sm backdrop-blur-sm ${styles}`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-5">{toast.title}</p>
                  {toast.message ? <p className="mt-0.5 text-xs opacity-90">{toast.message}</p> : null}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="rounded-md p-0.5 opacity-70 transition hover:opacity-100"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx;
}
