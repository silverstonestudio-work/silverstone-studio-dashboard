"use client";

import { effectiveEnd, effectiveStart } from "@/lib/model";
import type { Line } from "@/lib/types";
import { clamp } from "@/lib/time";

/**
 * Speed guidance: a horizontal pace track that fills as the line progresses,
 * with tick marks at each word onset so the singer can see the pace ahead.
 */
export function PaceGuide({ line, t }: { line: Line; t: number }) {
  const start = effectiveStart(line);
  const end = effectiveEnd(line);
  if (start == null || end == null || end <= start) return null;

  const span = end - start;
  const progress = clamp((t - start) / span, 0, 1);
  const remaining = Math.max(0, end - t);

  const ticks = line.words
    .map((w) => w.start)
    .filter((s): s is number => s != null && s >= start && s <= end)
    .map((s) => (s - start) / span);

  return (
    <div className="w-full max-w-xl">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--color-accent-strong)] to-[var(--color-accent)]"
          style={{ width: `${progress * 100}%` }}
        />
        {/* word onset ticks */}
        {ticks.map((pos, i) => (
          <span
            key={i}
            className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-[var(--color-bg)]/60"
            style={{ left: `${pos * 100}%` }}
          />
        ))}
        {/* moving playhead */}
        <span
          className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(56,189,248,0.8)]"
          style={{ left: `${progress * 100}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-medium tabular-nums text-[var(--color-ink-subtle)]">
        <span>Pace</span>
        <span>{remaining.toFixed(1)}s left in line</span>
      </div>
    </div>
  );
}
