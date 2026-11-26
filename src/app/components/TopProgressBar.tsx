"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeRef = useRef(false);
  const trickleRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);
  const lastRouteRef = useRef(routeKey);

  const clearTimers = useCallback(() => {
    if (trickleRef.current !== null) {
      window.clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (safetyTimerRef.current !== null) {
      window.clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    clearTimers();
    setProgress(100);
    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 240);
  }, [clearTimers]);

  const start = useCallback(() => {
    clearTimers();
    activeRef.current = true;
    setVisible(true);
    setProgress(18);

    trickleRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return prev;
        const step = Math.max(1.5, (88 - prev) * 0.18);
        return Math.min(88, prev + step);
      });
    }, 180);

    safetyTimerRef.current = window.setTimeout(() => {
      finish();
    }, 10000);
  }, [clearTimers, finish]);

  useEffect(() => {
    if (lastRouteRef.current !== routeKey) {
      lastRouteRef.current = routeKey;
      finish();
    }
  }, [routeKey, finish]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const rawHref = anchor.getAttribute("href");
      if (
        !rawHref ||
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:")
      ) {
        return;
      }

      let dest: URL;
      try {
        dest = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (dest.origin !== window.location.origin) return;
      if (
        dest.pathname === window.location.pathname &&
        dest.search === window.location.search
      ) {
        return;
      }

      start();
    };

    const onPopState = () => {
      start();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      clearTimers();
    };
  }, [start, clearTimers]);

  return (
    <div
      aria-hidden="true"
      className={`fixed top-0 left-0 right-0 z-[1000] h-[3px] pointer-events-none transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full bg-accent-strong transition-[width] duration-200 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px rgba(200, 16, 56, 0.55)",
        }}
      />
    </div>
  );
}
