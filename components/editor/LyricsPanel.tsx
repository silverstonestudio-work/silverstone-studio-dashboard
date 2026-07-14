"use client";

import { useMemo, useState } from "react";
import { ListPlus, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { activeLineIndex, flatWordAt } from "@/lib/model";
import { Button } from "../ui/Button";
import { LineRow } from "./LineRow";
import { PasteLyricsDialog } from "./PasteLyricsDialog";

export function LyricsPanel() {
  const lines = useStore((s) => s.project?.lines ?? []);
  const currentTime = useStore((s) => s.currentTime);
  const selectedLineId = useStore((s) => s.selectedLineId);
  const syncMode = useStore((s) => s.syncMode);
  const syncLevel = useStore((s) => s.syncLevel);
  const cursor = useStore((s) => s.cursor);
  const addLine = useStore((s) => s.addLine);

  const [pasteOpen, setPasteOpen] = useState(false);

  const activeIdx = useMemo(() => activeLineIndex(lines, currentTime), [lines, currentTime]);

  const syncTargetLineId = useMemo(() => {
    if (!syncMode) return null;
    if (syncLevel === "line") return lines[cursor]?.id ?? null;
    return flatWordAt(lines, cursor)?.line.id ?? null;
  }, [syncMode, syncLevel, cursor, lines]);

  return (
    <section className="flex flex-col lg:min-h-0 lg:flex-1">
      <header className="flex flex-wrap items-center justify-between gap-2 px-1 pb-3">
        <div className="flex shrink-0 items-baseline gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
            Lyrics
          </h2>
          <span className="text-xs text-[var(--color-ink-subtle)]">
            {lines.length} {lines.length === 1 ? "line" : "lines"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPasteOpen(true)}>
            <ListPlus className="h-4 w-4" /> Paste lyrics
          </Button>
          <Button variant="ghost" size="sm" onClick={() => addLine()}>
            <Plus className="h-4 w-4" /> Add line
          </Button>
        </div>
      </header>

      <div className="space-y-2 px-1 pb-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        {lines.length === 0 ? (
          <EmptyLyrics onPaste={() => setPasteOpen(true)} />
        ) : (
          lines.map((line, i) => (
            <LineRow
              key={line.id}
              line={line}
              index={i}
              isActive={i === activeIdx}
              isSelected={line.id === selectedLineId}
              isSyncTarget={line.id === syncTargetLineId}
            />
          ))
        )}
      </div>

      <PasteLyricsDialog open={pasteOpen} onClose={() => setPasteOpen(false)} />
    </section>
  );
}

function EmptyLyrics({ onPaste }: { onPaste: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-2)] ring-1 ring-[var(--color-line)]">
        <ListPlus className="h-6 w-6 text-[var(--color-accent)]" />
      </div>
      <p className="text-sm font-medium text-[var(--color-ink)]">No lyrics yet</p>
      <p className="mt-1 max-w-xs text-xs text-[var(--color-ink-subtle)]">
        Paste the song&apos;s lyrics to create timing rows for every line and word.
      </p>
      <Button variant="primary" size="sm" className="mt-4" onClick={onPaste}>
        <ListPlus className="h-4 w-4" /> Paste lyrics
      </Button>
    </div>
  );
}
