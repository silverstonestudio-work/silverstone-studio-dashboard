"use client";

import { Hand, Pause, Play, Undo2, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { flatWordAt, lineText, totalWords } from "@/lib/model";
import { Button } from "../ui/Button";
import type { Line, TimingLevel } from "@/lib/types";

export function SyncBar() {
  const syncMode = useStore((s) => s.syncMode);
  const level = useStore((s) => s.syncLevel);
  const cursor = useStore((s) => s.cursor);
  const lines = useStore((s) => s.project?.lines ?? []);
  const isPlaying = useStore((s) => s.isPlaying);
  const startSync = useStore((s) => s.startSync);
  const stopSync = useStore((s) => s.stopSync);
  const tap = useStore((s) => s.tap);
  const undoTap = useStore((s) => s.undoTap);
  const togglePlay = useStore((s) => s.togglePlay);

  const hasLines = lines.length > 0;

  if (!syncMode) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-3">
        <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
          <Hand className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
          <span>Tap-to-sync — play the track, then tap in time to place each cue.</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled={!hasLines} onClick={() => startSync("line")}>
            Sync lines
          </Button>
          <Button variant="secondary" size="sm" disabled={!hasLines} onClick={() => startSync("word")}>
            Sync words
          </Button>
        </div>
      </div>
    );
  }

  const target = describeTarget(lines, level, cursor);
  const total = level === "line" ? lines.length : totalWords(lines);
  const done = cursor >= total;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] p-3 shadow-[var(--shadow-glow)]">
      <span className="rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-accent-ink)]">
        Syncing {level}s · {Math.min(cursor, total)}/{total}
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 text-xs text-[var(--color-ink-subtle)]">Next:</span>
        <span className="truncate text-sm font-medium text-[var(--color-ink)]">
          {done ? "All cues placed — nicely done." : target}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="icon" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="secondary" size="sm" onClick={undoTap} disabled={cursor === 0}>
          <Undo2 className="h-3.5 w-3.5" /> Undo
        </Button>
        <Button variant="primary" size="lg" onClick={tap} disabled={done} className="min-w-[132px]">
          Tap
          <kbd className="ml-1 rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-semibold">Space</kbd>
        </Button>
        <Button variant="ghost" size="icon" onClick={stopSync} aria-label="Exit sync mode">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function describeTarget(lines: Line[], level: TimingLevel, cursor: number): string {
  if (level === "line") {
    const line = lines[cursor];
    return line ? `Line ${cursor + 1} — “${lineText(line) || "empty"}”` : "—";
  }
  const at = flatWordAt(lines, cursor);
  if (!at) return "—";
  return `“${at.word.text}” · line ${at.lineIndex + 1}`;
}
