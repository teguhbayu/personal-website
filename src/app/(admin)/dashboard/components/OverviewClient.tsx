"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiDatabase } from "react-icons/fi";
import { sileo } from "sileo";
import { seedPortfolioDefaults } from "@/lib/admin-actions";

interface MetricCard {
  label: string;
  count: number;
  note: string;
  href: string;
}

interface OverviewClientProps {
  metrics: MetricCard[];
  hasAnyData: boolean;
}

export default function OverviewClient({
  metrics,
  hasAnyData,
}: OverviewClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await seedPortfolioDefaults();
      if (!res.ok) {
        setError(res.error);
        sileo.error({
          title: "Seed failed",
          description: res.error,
        });
        return;
      }
      const okMsg =
        "Default portfolio records have been seeded into MySQL without overwriting existing rows.";
      setMessage(okMsg);
      sileo.success({
        title: "Defaults seeded",
        description: "Portfolio records synced without overwriting existing rows.",
      });
      router.refresh();
    });
  };

  return (
    <>
      <section className="border border-rule bg-sheet-alt rounded-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-ink uppercase">
            Portfolio Content Overview
          </h2>
          <p className="text-sm text-ink-muted">
            {hasAnyData
              ? "Public pages read live from MySQL and fall back safely to static defaults for any empty table."
              : "Your database tables are currently empty. Seed your current portfolio content to start editing right away."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSeed}
          disabled={isPending}
          className="min-h-[46px] px-5 inline-flex items-center justify-center gap-2 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0"
        >
          <FiDatabase aria-hidden={true} className="text-sm" />
          <span>{isPending ? "Seeding..." : "Seed Default Data"}</span>
        </button>
      </section>

      {error && (
        <div
          role="alert"
          className="p-4 border border-accent-strong bg-sheet-alt text-sm text-ink rounded-sm"
        >
          {error}
        </div>
      )}
      {message && (
        <div
          role="status"
          className="p-4 border border-rule bg-sheet-alt text-sm text-ink rounded-sm"
        >
          {message}
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group border border-rule bg-sheet-alt rounded-sm p-5 flex flex-col justify-between gap-4 hover:border-accent-strong transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="px-2.5 py-1 border border-rule bg-sheet font-mono text-[11px] uppercase text-ink-muted rounded-sm">
                {m.label}
              </span>
              <FiArrowRight
                aria-hidden={true}
                className="text-ink-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all"
              />
            </div>
            <div>
              <p className="font-display font-extrabold text-3xl text-ink">
                {m.count}
              </p>
              <p className="font-mono text-xs text-ink-muted mt-1">{m.note}</p>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
