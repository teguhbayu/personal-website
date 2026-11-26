"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ChannelId, OWNER } from "@/data/portfolio";
import SplitRollText from "./SplitRollText";

interface DrawerFrameProps {
  channel: Exclude<ChannelId, "home"> | null;
  onClose: () => void;
  children: React.ReactNode;
}

export default function DrawerFrame({
  channel,
  onClose,
  children,
}: DrawerFrameProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!channel || !panelRef.current) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!prefersReduced) {
      gsap.fromTo(
        panelRef.current,
        { x: 48, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.45,
          ease: "power3.out",
          clearProps: "transform",
        },
      );
    }
    const timer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [channel]);

  useEffect(() => {
    if (!channel) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (document.querySelector("[data-lightbox-modal]")) return;
      onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [channel, onClose]);

  if (!channel) return null;

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-label={`${channel} section panel`}
      className="fixed z-30 inset-x-3 bottom-3 top-[74px] sm:inset-x-6 sm:top-[84px] sm:bottom-6 lg:left-auto lg:right-6 lg:w-[min(740px,56vw)] border border-rule bg-sheet text-ink rounded-md flex flex-col overflow-hidden shadow-2xl"
    >
      <div className="flex items-center justify-between gap-4 px-5 sm:px-7 py-4 border-b border-rule bg-sheet shrink-0">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-accent font-medium uppercase">
            {channel}
          </span>
          <span className="font-mono text-xs text-ink-muted">
            / {OWNER.fullName}
          </span>
        </div>
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] px-4 inline-flex items-center justify-center border border-rule bg-sheet-alt text-ink text-xs sm:text-sm font-mono rounded-sm hover:border-accent-strong transition-colors"
        >
          <SplitRollText
            text="Close"
            baseClassName="text-ink"
            rollClassName="text-accent"
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 sm:py-8">
        {children}
      </div>
    </aside>
  );
}
