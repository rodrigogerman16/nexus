"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useToastStore, type ToastVariant } from "@/lib/store/useToastStore";
import { cn } from "@/lib/utils";

const iconByVariant: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const colorByVariant: Record<ToastVariant, string> = {
  success: "text-success",
  error: "text-danger",
  info: "text-accent",
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 md:bottom-6 md:items-end md:pr-6">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = iconByVariant[t.variant];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              role="status"
              className="pointer-events-auto flex w-[92vw] max-w-sm items-center gap-2.5 rounded-lg border border-border bg-surface-raised px-3.5 py-2.5 shadow-overlay"
            >
              <Icon className={cn("h-4 w-4 shrink-0", colorByVariant[t.variant])} />
              <p className="min-w-0 flex-1 text-sm text-foreground">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="focus-ring shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
