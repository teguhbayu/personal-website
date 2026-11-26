"use client";

import { useEffect } from "react";
import { FiX } from "react-icons/fi";

interface FormModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  maxWidthClass?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function FormModal({
  open,
  title,
  subtitle,
  maxWidthClass = "max-w-2xl",
  onClose,
  children,
}: FormModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (
        document.querySelector("[data-crop-modal]") ||
        document.querySelector("[data-icon-combobox-open]") ||
        document.querySelectorAll('[role="dialog"]').length > 1
      ) {
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "var(--scrim)" }}
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidthClass} max-h-[90dvh] overflow-y-auto border border-rule bg-sheet text-ink rounded-md flex flex-col shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-rule bg-sheet-alt">
          <div className="min-w-0">
            <h2 className="font-display font-extrabold text-xl text-ink truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="font-mono text-xs text-ink-muted truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-rule bg-sheet text-ink rounded-sm hover:border-accent-strong transition-colors shrink-0"
          >
            <FiX aria-hidden={true} className="text-base" />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
