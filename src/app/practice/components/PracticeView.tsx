import Image from "next/image";
import type { LedgerEntry, OwnerData } from "@/lib/data";

interface PracticeViewProps {
  owner: OwnerData;
  ledger: LedgerEntry[];
}

export default function PracticeView({ owner, ledger }: PracticeViewProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center pb-6 border-b border-rule">
        <div className="relative w-24 h-28 sm:w-28 sm:h-32 shrink-0 border border-rule bg-sheet-alt rounded-sm overflow-hidden">
          <Image
            src={owner.portrait}
            alt={`Portrait of ${owner.fullName}`}
            fill
            sizes="120px"
            className="object-contain object-bottom pt-2"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-ink leading-tight">
            {owner.leadStatement}
          </h2>
          <p className="font-mono text-xs text-ink-muted">
            {owner.role} · {owner.school} · {owner.location}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 text-sm sm:text-base text-ink-muted leading-relaxed">
        {owner.biography.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>

      <div className="pt-2">
        <p className="font-mono text-xs text-accent mb-3">VERIFIED RECORD</p>
        <dl className="divide-y divide-rule border-t border-b border-rule">
          {ledger.map((row) => (
            <div
              key={row.label}
              className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4"
            >
              <dt className="text-sm font-medium text-ink">{row.label}</dt>
              <div className="flex items-baseline gap-3">
                <dd className="font-display font-bold text-lg text-accent">
                  {row.value}
                </dd>
                <dd className="font-mono text-xs text-ink-muted">
                  {row.scope}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
