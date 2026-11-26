"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import type { ResolvedIcon } from "@/lib/icon-data";

interface IconComboboxProps {
  id: string;
  value: string;
  initialIcon?: ResolvedIcon | null;
  onChange: (nextKey: string, nextIcon: ResolvedIcon | null) => void;
}

export function SkillIconGlyph({
  icon,
  className = "w-4 h-4 shrink-0",
}: {
  icon: ResolvedIcon | null | undefined;
  className?: string;
}) {
  if (!icon) return null;
  return (
    <svg
      viewBox={icon.viewBox}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {icon.paths.map((d, idx) => (
        <path key={idx} d={d} />
      ))}
    </svg>
  );
}

export default function IconCombobox({
  id,
  value,
  initialIcon = null,
  onChange,
}: IconComboboxProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<ResolvedIcon | null>(
    initialIcon,
  );
  const [options, setOptions] = useState<ResolvedIcon[]>([]);
  const [totalIcons, setTotalIcons] = useState<number>(3124);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setSelectedIcon(initialIcon);
  }, [initialIcon]);

  useEffect(() => {
    if (!value.trim()) {
      setSelectedIcon(null);
      return;
    }
    if (selectedIcon && selectedIcon.key.toLowerCase() === value.toLowerCase()) {
      return;
    }
    const controller = new AbortController();
    fetch(`/api/admin/icons?key=${encodeURIComponent(value)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.icon) setSelectedIcon(data.icon);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [value, selectedIcon]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/icons?q=${encodeURIComponent(query)}&limit=28`,
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const data = await res.json();
        setOptions(Array.isArray(data.icons) ? data.icons : []);
        if (typeof data.total === "number") setTotalIcons(data.total);
        setActiveIndex(0);
      } catch {
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 140);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const handleSelect = (icon: ResolvedIcon) => {
    setSelectedIcon(icon);
    onChange(icon.key, icon);
    setQuery("");
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedIcon(null);
    onChange("", null);
    setQuery("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActiveIndex((prev) =>
        options.length === 0 ? 0 : (prev + 1) % options.length,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActiveIndex((prev) =>
        options.length === 0 ? 0 : (prev - 1 + options.length) % options.length,
      );
    } else if (e.key === "Enter" && open && options[activeIndex]) {
      e.preventDefault();
      handleSelect(options[activeIndex]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    }
  };

  const listboxId = `${id}-listbox`;

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="font-mono text-xs uppercase text-ink">
          Icon ({totalIcons.toLocaleString()} Simple Icons)
        </label>
        {value && (
          <span className="font-mono text-[11px] text-accent">{value}</span>
        )}
      </div>

      <div className="relative flex items-center">
        <span
          aria-hidden="true"
          className="absolute left-3 inline-flex items-center justify-center text-ink"
        >
          {selectedIcon ? (
            <SkillIconGlyph icon={selectedIcon} className="w-4 h-4 text-accent" />
          ) : (
            <FiSearch className="w-4 h-4 text-ink-muted" />
          )}
        </span>

        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && options[activeIndex]
              ? `${id}-opt-${options[activeIndex].key}`
              : undefined
          }
          value={open ? query : selectedIcon ? `${selectedIcon.label} (${selectedIcon.key})` : value}
          placeholder="Search icons (docker, redis, aws, rust)..."
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="min-h-[44px] w-full pl-9 pr-16 bg-sheet border border-rule text-sm text-ink placeholder:text-ink-muted rounded-sm"
        />

        <div className="absolute right-1.5 flex items-center gap-0.5">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear icon"
              className="min-h-[36px] min-w-[32px] inline-flex items-center justify-center text-ink-muted hover:text-accent rounded-sm"
            >
              <FiX aria-hidden={true} className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen((v) => !v);
              if (!open) {
                setQuery("");
                inputRef.current?.focus();
              }
            }}
            aria-label="Toggle icon list"
            className="min-h-[36px] min-w-[32px] inline-flex items-center justify-center text-ink-muted hover:text-ink rounded-sm"
          >
            <FiChevronDown
              aria-hidden={true}
              className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          data-icon-combobox-open="true"
          className="absolute left-0 right-0 top-full mt-1 z-50 max-h-64 overflow-y-auto border border-rule bg-sheet rounded-sm shadow-xl"
        >
          {loading ? (
            <div className="px-3.5 py-4 font-mono text-xs text-ink-muted">
              Searching icons...
            </div>
          ) : options.length === 0 ? (
            <div className="px-3.5 py-4 font-mono text-xs text-ink-muted">
              No icons match &quot;{query}&quot;.
            </div>
          ) : (
            <ul className="divide-y divide-rule">
              {options.map((icon, idx) => {
                const isHighlighted = idx === activeIndex;
                const isSelected = icon.key === value;
                return (
                  <li
                    key={icon.key}
                    id={`${id}-opt-${icon.key}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(icon);
                    }}
                    className={`px-3.5 py-2.5 min-h-[42px] flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isHighlighted
                        ? "bg-sheet-alt text-ink"
                        : "bg-sheet text-ink"
                    }`}
                  >
                    <span className="inline-flex items-center gap-3 min-w-0">
                      <SkillIconGlyph
                        icon={icon}
                        className={`w-4 h-4 shrink-0 ${
                          isSelected || isHighlighted
                            ? "text-accent"
                            : "text-ink"
                        }`}
                      />
                      <span className="text-sm font-medium truncate">
                        {icon.label}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] text-ink-muted shrink-0">
                      {icon.key}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
