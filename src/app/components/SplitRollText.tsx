"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface SplitRollTextProps {
  text: string;
  triggered?: boolean;
  className?: string;
  baseClassName?: string;
  rollClassName?: string;
}

export default function SplitRollText({
  text,
  triggered,
  className = "",
  baseClassName = "",
  rollClassName = "text-accent",
}: SplitRollTextProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const [selfActive, setSelfActive] = useState(false);
  const active = triggered !== undefined ? triggered : selfActive;

  useEffect(() => {
    if (triggered !== undefined) return;
    const root = rootRef.current;
    if (!root) return;
    const target = root.closest("button, a") ?? root;
    const onEnter = () => setSelfActive(true);
    const onFocus = () => {
      if (target.matches(":focus-visible")) {
        setSelfActive(true);
      }
    };
    const onReset = () => setSelfActive(false);

    target.addEventListener("mouseenter", onEnter);
    target.addEventListener("mouseleave", onReset);
    target.addEventListener("focus", onFocus);
    target.addEventListener("blur", onReset);
    target.addEventListener("click", onReset);
    target.addEventListener("pointercancel", onReset);
    window.addEventListener("blur", onReset);

    return () => {
      target.removeEventListener("mouseenter", onEnter);
      target.removeEventListener("mouseleave", onReset);
      target.removeEventListener("focus", onFocus);
      target.removeEventListener("blur", onReset);
      target.removeEventListener("click", onReset);
      target.removeEventListener("pointercancel", onReset);
      window.removeEventListener("blur", onReset);
    };
  }, [triggered]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const slots = root.querySelectorAll<HTMLElement>("[data-roll-slot]");
    if (slots.length === 0) return;

    gsap.killTweensOf(slots);

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      gsap.set(slots, { yPercent: active ? -100 : 0 });
      return;
    }

    gsap.to(slots, {
      yPercent: active ? -100 : 0,
      duration: active ? 0.42 : 0.34,
      stagger: active ? 0.022 : 0.016,
      ease: active ? "power3.inOut" : "power3.out",
      overwrite: true,
    });

    return () => {
      gsap.killTweensOf(slots);
    };
  }, [active, text]);

  const chars = Array.from(text);

  return (
    <span ref={rootRef} className={`inline-flex items-baseline ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {chars.map((char, idx) => {
          const displayChar = char === " " ? "\u00A0" : char;
          return (
            <span
              key={`${idx}-${char}`}
              className="relative inline-block overflow-hidden leading-[1.08]"
            >
              <span
                data-roll-slot
                className="relative inline-block will-change-transform"
              >
                <span className={`block ${baseClassName}`}>{displayChar}</span>
                <span
                  className={`block absolute left-0 top-full ${rollClassName}`}
                >
                  {displayChar}
                </span>
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
