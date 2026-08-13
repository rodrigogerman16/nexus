"use client";

import { useHasMounted } from "@/hooks/useHasMounted";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { NexusMark } from "@/components/layout/NexusMark";

export function AppReady({ children }: { children: ReactNode }) {
  const mounted = useHasMounted();

  return (
    <>
      <AnimatePresence>
        {!mounted && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground"
            >
              <NexusMark className="h-6 w-6" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {mounted ? children : null}
    </>
  );
}
