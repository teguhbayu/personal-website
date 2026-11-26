"use client";

import { useState } from "react";
import type { SocialLink } from "@/data/portfolio";
import SplitRollText from "@/app/components/SplitRollText";

interface ContactClientProps {
  email: string;
  socials: SocialLink[];
}

export default function ContactClient({ email, socials }: ContactClientProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2600);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-ink">
          Start a Conversation
        </h2>
        <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
          Available for freelance web development, AWS cloud architecture, and
          software engineering collaborations.
        </p>
      </div>

      <div className="p-5 border border-rule bg-sheet-alt rounded-sm flex flex-col gap-4">
        <p className="font-mono text-xs text-accent">DIRECT EMAIL</p>
        <a
          href={`mailto:${email}`}
          className="font-display font-bold text-xl sm:text-2xl text-ink break-all underline underline-offset-4 hover:text-accent transition-colors"
        >
          {email}
        </a>
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="button"
            onClick={handleCopyEmail}
            className="min-h-[48px] px-5 inline-flex items-center justify-center border border-rule bg-sheet text-ink text-sm font-medium rounded-sm hover:border-accent-strong transition-colors"
          >
            {copyState === "copied"
              ? "Email Copied"
              : copyState === "error"
                ? "Copy Unavailable"
                : "Copy Email Address"}
          </button>
        </div>
        <p
          role="status"
          aria-live="polite"
          className="font-mono text-xs text-ink-muted min-h-[18px]"
        >
          {copyState === "copied" && `${email} copied to your clipboard.`}
          {copyState === "error" &&
            "Clipboard access was blocked by this browser. Click the email address above instead."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-ink-muted">PROFILES</p>
        <ul className="flex flex-col gap-2">
          {socials.map((s) => (
            <li key={s.id}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] px-4 border border-rule bg-sheet-alt rounded-sm flex items-center justify-between text-sm text-ink hover:border-accent-strong transition-colors"
              >
                <span className="font-semibold">
                  <SplitRollText
                    text={s.label}
                    baseClassName="text-ink"
                    rollClassName="text-accent"
                  />
                </span>
                <span className="font-mono text-xs text-ink-muted">
                  {s.handle}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
