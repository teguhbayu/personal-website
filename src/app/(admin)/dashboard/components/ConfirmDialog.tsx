"use client";

import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  pending = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--scrim)" }}
      onClick={() => {
        if (!pending) onCancel();
      }}
    >
      <div
        className="w-full max-w-md border border-rule bg-sheet text-ink rounded-md p-6 flex flex-col gap-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display font-bold text-xl text-ink">{title}</h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="min-h-[44px] px-4 border border-rule bg-sheet-alt text-ink text-xs font-mono uppercase rounded-sm hover:border-accent-strong transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="min-h-[44px] px-4 bg-accent-strong text-white text-xs font-mono uppercase rounded-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {pending ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
