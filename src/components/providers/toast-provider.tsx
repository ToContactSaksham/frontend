"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CircleCheck, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "error";

interface ToastInput {
  title: string;
  description?: string;
  variant?: Variant;
  /** ms before auto-dismiss (default 4500) */
  duration?: number;
}

interface Toast extends ToastInput {
  id: number;
  leaving?: boolean;
}

interface ToastContextValue {
  toast: (t: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<Variant, typeof Info> = {
  default: Info,
  success: CircleCheck,
  error: AlertCircle,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(
      () => setToasts((ts) => ts.filter((t) => t.id !== id)),
      240,
    );
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((ts) => [...ts, { ...input, id }].slice(-4));
      window.setTimeout(() => dismiss(id), input.duration ?? 4500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        role="status"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        {toasts.map((t) => {
          const Icon = icons[t.variant ?? "default"];
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl p-4 pr-3 shadow-lg",
                "glass bg-surface-strong/90 text-fg",
                "transition-all duration-300 ease-out-expo",
                t.leaving ? "translate-y-2 opacity-0" : "animate-fade-up",
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "mt-0.5 shrink-0",
                  t.variant === "success" && "text-success",
                  t.variant === "error" && "text-danger",
                  (!t.variant || t.variant === "default") && "text-accent",
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-5">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-sm leading-5 text-fg-muted">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="-m-1 rounded-full p-1 text-fg-subtle transition hover:bg-surface-hover hover:text-fg"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
