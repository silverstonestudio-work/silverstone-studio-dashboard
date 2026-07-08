"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { formatTimecode, parseTimecode } from "@/lib/time";
import { cn } from "@/lib/cn";

interface TimeFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  /** Nudge step in seconds. */
  step?: number;
  compact?: boolean;
}

export function TimeField({
  label,
  value,
  onChange,
  step = 0.05,
  compact = false,
}: TimeFieldProps) {
  const [text, setText] = useState(() => (value == null ? "" : formatTimecode(value)));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setText(value == null ? "" : formatTimecode(value));
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    if (text.trim() === "") {
      onChange(null);
      return;
    }
    const parsed = parseTimecode(text);
    onChange(parsed);
  };

  const nudge = (dir: -1 | 1) => {
    const base = value ?? 0;
    onChange(Math.max(0, Math.round((base + dir * step) * 100) / 100));
  };

  return (
    <div className="flex items-center gap-1">
      {!compact && (
        <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-subtle)]">
          {label}
        </span>
      )}
      <div className="flex items-center overflow-hidden rounded-[var(--radius-xs)] border border-[var(--color-line)] bg-[var(--color-bg)]">
        <button
          type="button"
          onClick={() => nudge(-1)}
          className="flex h-7 w-6 items-center justify-center text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
          aria-label={`${label} minus ${step} seconds`}
          tabIndex={-1}
        >
          <Minus className="h-3 w-3" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setEditing(true)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setText(value == null ? "" : formatTimecode(value));
              setEditing(false);
              e.currentTarget.blur();
            }
          }}
          placeholder="––:––.––"
          className={cn(
            "h-7 border-x border-[var(--color-line)] bg-transparent text-center font-mono text-xs tabular-nums text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-subtle)]",
            compact ? "w-[68px]" : "w-[76px]"
          )}
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => nudge(1)}
          className="flex h-7 w-6 items-center justify-center text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
          aria-label={`${label} plus ${step} seconds`}
          tabIndex={-1}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
