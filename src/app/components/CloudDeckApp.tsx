"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa6";
import { CHANNELS, ChannelId, OWNER, SOCIALS } from "@/data/portfolio";
import CloudConsoleStage, {
  SCREEN_MODEL_META,
  SCREEN_MODEL_ORDER,
  ScreenModelId,
  SkyMode,
} from "./CloudConsoleStage";
import ChannelDrawer from "./ChannelDrawer";
import SplitRollText from "./SplitRollText";

const CHANNEL_TO_SCREEN: Record<ChannelId, ScreenModelId> = {
  home: "camera",
  practice: "aws",
  projects: "laptop",
  stack: "stack",
  awards: "trophy",
  contact: "mail",
};

export default function CloudDeckApp() {
  const [sky, setSky] = useState<SkyMode>("day");
  const [cycleIndex, setCycleIndex] = useState<number>(0);
  const [hoveredChannel, setHoveredChannel] = useState<ChannelId | null>(null);
  const [openChannel, setOpenChannel] = useState<Exclude<
    ChannelId,
    "home"
  > | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [spinNonce, setSpinNonce] = useState(0);
  const mobileDrawerRef = useRef<HTMLDivElement | null>(null);

  const [loadPct, setLoadPct] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneError, setSceneError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("bayu-sky");
      if (saved === "day" || saved === "night") {
        setSky(saved);
        document.documentElement.dataset.sky = saved;
      } else {
        document.documentElement.dataset.sky = "day";
      }
    } catch {
      document.documentElement.dataset.sky = "day";
    }
  }, []);

  useEffect(() => {
    if (!sceneReady || hoveredChannel !== null || openChannel !== null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % SCREEN_MODEL_ORDER.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [sceneReady, hoveredChannel, openChannel]);

  const activeScreenModel: ScreenModelId = hoveredChannel
    ? CHANNEL_TO_SCREEN[hoveredChannel]
    : openChannel
      ? CHANNEL_TO_SCREEN[openChannel]
      : SCREEN_MODEL_ORDER[cycleIndex];

  const previewChannel: ChannelId =
    hoveredChannel ??
    openChannel ??
    SCREEN_MODEL_META[activeScreenModel].channel;

  const handleSelectChannel = useCallback((ch: ChannelId) => {
    setHoveredChannel(null);
    setMobileMenuOpen(false);
    const modelIdx = SCREEN_MODEL_ORDER.indexOf(CHANNEL_TO_SCREEN[ch]);
    if (modelIdx >= 0) setCycleIndex(modelIdx);
    if (ch === "home") {
      setOpenChannel(null);
    } else {
      setOpenChannel(ch);
    }
  }, []);

  const handleCycleScreenModel = useCallback(() => {
    setHoveredChannel(null);
    setCycleIndex((prev) => (prev + 1) % SCREEN_MODEL_ORDER.length);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    if (
      mobileDrawerRef.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const items = mobileDrawerRef.current.querySelectorAll(
        "[data-mobile-link-anim]",
      );
      gsap.fromTo(
        items,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.045,
          ease: "power3.out",
          overwrite: "auto",
        },
      );
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  const socialIcon = (id: string) => {
    if (id === "github")
      return <FaGithub aria-hidden="true" className="text-lg" />;
    if (id === "linkedin")
      return <FaLinkedin aria-hidden="true" className="text-lg" />;
    return <FaInstagram aria-hidden="true" className="text-lg" />;
  };

  return (
    <div
      id="main-stage"
      className="sky-backdrop relative min-h-[100dvh] w-full overflow-hidden flex flex-col justify-between"
    >
      <CloudConsoleStage
        sky={sky}
        screenModel={activeScreenModel}
        previewChannel={previewChannel}
        openChannel={openChannel}
        spinNonce={spinNonce}
        onLoadProgress={setLoadPct}
        onLoadReady={() => setSceneReady(true)}
        onLoadError={(msg) => {
          setSceneError(msg);
          setSceneReady(true);
        }}
        onSelectChannel={handleSelectChannel}
        onCycleScreenModel={handleCycleScreenModel}
      />

      {!sceneReady && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[200] bg-[#06142B] text-[#F5F2EB] flex flex-col items-center justify-center gap-5 px-6"
        >
          <div className="relative w-24 h-28 flex items-center justify-center">
            <svg
              viewBox="0 0 120 140"
              className="w-full h-full"
              aria-hidden="true"
            >
              <defs>
                <clipPath id="cloud-loader-clip">
                  <path d="M60 12 C74 12 85 20 88 31 C102 33 112 45 112 60 C112 70 107 79 99 84 C105 91 107 101 102 111 C96 123 82 128 60 128 C38 128 24 123 18 111 C13 101 15 91 21 84 C13 79 8 70 8 60 C8 45 18 33 32 31 C35 20 46 12 60 12 Z" />
                </clipPath>
              </defs>
              <rect
                x="0"
                y="0"
                width="120"
                height="140"
                fill="rgba(245,242,235,0.16)"
                clipPath="url(#cloud-loader-clip)"
              />
              <rect
                x="0"
                y={140 - (loadPct / 100) * 140}
                width="120"
                height={(loadPct / 100) * 140}
                fill="#FF204E"
                clipPath="url(#cloud-loader-clip)"
              />
            </svg>
          </div>
          <p className="font-mono text-sm tracking-wide">
            Loading Site {loadPct}%
          </p>
        </div>
      )}

      <header className="relative z-50 pointer-events-none px-5 sm:px-8 lg:px-12 pt-5 sm:pt-7 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => handleSelectChannel("home")}
          className="pointer-events-auto min-h-[44px] px-3.5 inline-flex items-center gap-2.5 rounded-sm bg-sheet/95 border border-rule text-ink hover:border-accent-strong transition-colors"
        >
          <span
            aria-hidden="true"
            className="inline-block w-3 h-3 bg-accent-strong"
          />
          <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight">
            {OWNER.shortName}
          </span>
        </button>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-channel-drawer"
            className="md:hidden min-h-[44px] min-w-[44px] px-3.5 inline-flex items-center justify-center border border-rule bg-sheet text-ink text-sm font-semibold rounded-sm hover:border-accent-strong transition-colors"
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {sceneError && (
        <div
          role="alert"
          className="relative z-20 mx-5 sm:mx-8 lg:mx-12 mt-4 max-w-md p-3.5 border border-rule bg-sheet text-ink text-xs font-mono rounded-sm"
        >
          {sceneError}
        </div>
      )}

      <main className="relative z-20 pointer-events-none flex-1 flex flex-col justify-end md:justify-center px-5 sm:px-8 lg:px-12 py-6">
        <div className="flex flex-col gap-5 max-w-sm">
          <nav
            aria-label="Portfolio channels"
            onMouseLeave={() => setHoveredChannel(null)}
            className={`hidden md:flex flex-col items-start gap-0.5 pointer-events-auto transition-all duration-300 ${
              openChannel
                ? "p-4 pr-6 border border-rule bg-sheet/95 rounded-sm w-fit min-w-[256px]"
                : ""
            }`}
          >
            {CHANNELS.map((ch) => {
              const isSelected =
                (ch.id === "home" && openChannel === null) ||
                openChannel === ch.id;
              const isHovered = hoveredChannel === ch.id;

              return (
                <button
                  key={ch.id}
                  type="button"
                  onMouseEnter={() => setHoveredChannel(ch.id)}
                  onFocus={() => setHoveredChannel(ch.id)}
                  onBlur={() => setHoveredChannel(null)}
                  onClick={() => handleSelectChannel(ch.id)}
                  aria-current={isSelected ? "page" : undefined}
                  className={`group min-h-[44px] py-1 pr-3 inline-flex items-center gap-3 text-left transition-transform duration-200 ${
                    isHovered || isSelected
                      ? "translate-x-1.5"
                      : "translate-x-0"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block h-2.5 transition-all duration-200 ${
                      isSelected
                        ? "w-4 bg-accent-strong"
                        : isHovered
                          ? "w-2.5 bg-accent-strong"
                          : "w-0 bg-transparent"
                    }`}
                  />
                  <span
                    className={`font-display font-extrabold uppercase tracking-[-0.02em] leading-[1.04] transition-all ${
                      openChannel
                        ? "text-xl lg:text-2xl"
                        : "text-[clamp(1.75rem,3.4vw,3.15rem)]"
                    }`}
                  >
                    <SplitRollText
                      text={ch.label}
                      triggered={isHovered || isSelected}
                      baseClassName={openChannel ? "text-ink" : "text-sky-ink"}
                      rollClassName="text-accent"
                    />
                  </span>
                </button>
              );
            })}
          </nav>

          {/* {!openChannel && (
            <div className="hidden md:flex flex-col gap-1.5 pointer-events-auto max-w-[310px] p-3.5 border border-rule bg-sheet/95 text-ink rounded-sm">
              <p className="font-mono text-[11px] text-accent">
                {OWNER.role.toUpperCase()}
              </p>
              <p className="text-xs sm:text-sm text-ink-muted leading-snug">
                1st Place National LKS Cloud Computing. Hover any link to switch
                its 3D deck model, or drag the console to spin.
              </p>
            </div>
          )} */}

          <div className="md:hidden pointer-events-auto flex flex-col gap-2.5 mt-auto">
            <div className="p-3.5 border border-rule bg-sheet/95 text-ink rounded-sm flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-display font-extrabold text-xl text-ink leading-tight">
                    {OWNER.fullName}
                  </p>
                  <p className="font-mono text-xs text-ink-muted mt-0.5">
                    {OWNER.role} · 1st Place LKSN
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-20 pointer-events-none px-5 sm:px-8 lg:px-12 pb-5 sm:pb-7 flex items-center justify-center">
        <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 border border-rule bg-sheet/95 rounded-sm">
          {SOCIALS.map((s) => (
            <a
              key={s.id}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${s.label} (${s.handle})`}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-ink hover:text-accent transition-colors rounded-sm"
            >
              {socialIcon(s.id)}
            </a>
          ))}
          <a
            href={`mailto:${OWNER.email}`}
            className="min-h-[44px] px-3 inline-flex items-center font-mono text-xs text-ink border-l border-rule"
          >
            <SplitRollText text="Email" baseClassName="text-ink" rollClassName="text-accent" />
          </a>
        </div>
      </footer>

      <ChannelDrawer
        channel={openChannel}
        onClose={() => {
          setOpenChannel(null);
          setHoveredChannel(null);
        }}
        onSpinConsole={() => setSpinNonce((n) => n + 1)}
      />

      <div
        id="mobile-channel-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile channel navigation"
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-200 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-sheet"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          ref={mobileDrawerRef}
          className="relative h-full flex flex-col justify-between px-6 pt-24 pb-8 overflow-y-auto text-ink"
        >
          <nav aria-label="Mobile channels" className="flex flex-col">
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => handleSelectChannel(ch.id)}
                className="py-4 min-h-[52px] border-b border-rule flex items-baseline justify-between text-left text-ink overflow-hidden"
              >
                <span
                  data-mobile-link-anim
                  className="font-display font-extrabold text-3xl inline-block"
                >
                  <SplitRollText
                    text={ch.label}
                    baseClassName="text-ink"
                    rollClassName="text-accent"
                  />
                </span>
                <span className="font-mono text-xs text-ink-muted">
                  {ch.code}
                </span>
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-rule flex flex-col gap-3">
            <a
              href={`mailto:${OWNER.email}`}
              className="font-mono text-sm text-ink underline underline-offset-4 break-all"
            >
              {OWNER.email}
            </a>
            <div className="flex flex-wrap gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-4 inline-flex items-center border border-rule bg-sheet-alt text-sm text-ink rounded-sm"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
