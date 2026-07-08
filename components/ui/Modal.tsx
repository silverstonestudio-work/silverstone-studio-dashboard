"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-md)]"
          >
            <div className="flex items-start justify-between border-b border-[var(--color-line)] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-ink)]">{title}</h2>
                {description && (
                  <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-xs)] text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4">{children}</div>
            {footer && (
              <div className="flex justify-end gap-2 border-t border-[var(--color-line)] px-5 py-3">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
