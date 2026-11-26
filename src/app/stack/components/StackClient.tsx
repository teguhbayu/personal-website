"use client";

import { useState } from "react";
import type { SkillGroup } from "@/data/portfolio";
import type { ResolvedIcon } from "@/lib/icon-data";
import { useCloudDeck } from "@/app/components/CloudDeckContext";

interface StackClientProps {
  skillGroups: SkillGroup[];
  iconMap: Record<string, ResolvedIcon | null>;
}

export default function StackClient({
  skillGroups,
  iconMap,
}: StackClientProps) {
  const { spinConsole } = useCloudDeck();
  const [stackLayer, setStackLayer] = useState<string>("all");
  const [focusedSkill, setFocusedSkill] = useState<string>(
    skillGroups.flatMap((g) => g.items).find((i) => i.id.toLowerCase().includes("aws"))
      ?.id ??
      skillGroups[0]?.items[0]?.id ??
      "",
  );

  const totalCount = skillGroups.reduce((sum, g) => sum + g.items.length, 0);
  const visibleSkillGroups =
    stackLayer === "all"
      ? skillGroups
      : skillGroups.filter((g) => g.id === stackLayer);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-ink">
          Technical Stack
        </h2>
        <p className="text-sm text-ink-muted">
          Core technologies used across frontend interfaces, backend services,
          and AWS cloud deployments.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Filter stack by engineering layer"
        className="flex flex-wrap gap-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={stackLayer === "all"}
          onClick={() => setStackLayer("all")}
          className={`min-h-[44px] px-3.5 text-xs font-mono rounded-sm border transition-colors ${
            stackLayer === "all"
              ? "bg-accent-strong text-white border-accent-strong"
              : "bg-sheet-alt text-ink border-rule hover:border-accent-strong"
          }`}
        >
          All ({totalCount})
        </button>
        {skillGroups.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={stackLayer === g.id}
            onClick={() => setStackLayer(g.id)}
            className={`min-h-[44px] px-3.5 text-xs font-mono rounded-sm border transition-colors ${
              stackLayer === g.id
                ? "bg-accent-strong text-white border-accent-strong"
                : "bg-sheet-alt text-ink border-rule hover:border-accent-strong"
            }`}
          >
            {g.domain}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {visibleSkillGroups.map((group) => (
          <div key={group.id} className="stack-band flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-display font-bold text-xl text-ink">
                {group.domain}
              </h3>
              <span className="font-mono text-xs text-ink-muted">
                LAYER {group.index}
              </span>
            </div>
            <div className="divide-y divide-rule border border-rule rounded-sm overflow-hidden">
              {group.items.map((item) => {
                const active = focusedSkill === item.id;
                const icon = iconMap[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setFocusedSkill(item.id);
                      spinConsole();
                    }}
                    className={`w-full text-left px-4 py-3.5 min-h-[56px] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 transition-colors ${
                      active
                        ? "bg-sheet-alt text-ink"
                        : "bg-sheet hover:bg-sheet-alt/70 text-ink"
                    }`}
                  >
                    <span className="inline-flex items-center gap-3.5">
                      {icon && (
                        <svg
                          viewBox={icon.viewBox}
                          fill="currentColor"
                          aria-hidden="true"
                          className={`w-5 h-5 shrink-0 ${
                            active ? "text-accent" : "text-ink"
                          }`}
                        >
                          {icon.paths.map((d, idx) => (
                            <path key={idx} d={d} />
                          ))}
                        </svg>
                      )}
                      <span className="font-display font-bold text-base sm:text-lg">
                        {item.name}
                      </span>
                    </span>
                    <span className="font-mono text-xs text-ink-muted">
                      {item.note}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
