"use client";

import { useEffect, useState } from "react";
import { Crosshair, Eraser, Flag as FlagIcon, MagnetIcon, Play, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  activeLineIndex,
  activeWordIndex,
  effectiveEnd,
  effectiveStart,
  lineDuration,
  lineText,
  round2,
} from "@/lib/model";
import { formatTimecode } from "@/lib/time";
import { Button } from "../ui/Button";
import { TimeField } from "./TimeField";
import { WordChip } from "./WordChip";

export function Inspector() {
  const lines = useStore((s) => s.project?.lines ?? []);
  const flags = useStore((s) => s.project?.flags ?? []);
  const selectedLineId = useStore((s) => s.selectedLineId);
  const selectedFlagId = useStore((s) => s.selectedFlagId);

  const selectedFlag = flags.find((f) => f.id === selectedFlagId) ?? null;
  const selectedLine = lines.find((l) => l.id === selectedLineId) ?? null;

  return (
    <aside className="flex h-full w-full flex-col rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)]">
      <header className="border-b border-[var(--color-line)] px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
          {selectedFlag ? "Flag" : "Line inspector"}
        </h2>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {selectedFlag ? (
          <FlagInspector flagId={selectedFlag.id} />
        ) : selectedLine ? (
          <LineInspector lineId={selectedLine.id} />
        ) : (
          <p className="py-8 text-center text-sm text-[var(--color-ink-subtle)]">
            Select a line to edit its timing, or a flag to edit its marker.
          </p>
        )}
      </div>
    </aside>
  );
}

function LineInspector({ lineId }: { lineId: string }) {
  const line = useStore((s) => s.project?.lines.find((l) => l.id === lineId));
  const lineIndex = useStore((s) => s.project?.lines.findIndex((l) => l.id === lineId) ?? -1);
  const flagCount = useStore((s) => s.project?.flags.length ?? 0);
  const t = useStore((s) => s.currentTime);
  const lines = useStore((s) => s.project?.lines ?? []);

  const seek = useStore((s) => s.seek);
  const play = useStore((s) => s.play);
  const setLineTime = useStore((s) => s.setLineTime);
  const setLineDuration = useStore((s) => s.setLineDuration);
  const setWordTime = useStore((s) => s.setWordTime);
  const stampLineStart = useStore((s) => s.stampLineStart);
  const stampLineEnd = useStore((s) => s.stampLineEnd);
  const clearLineTiming = useStore((s) => s.clearLineTiming);
  const deleteLine = useStore((s) => s.deleteLine);
  const updateLineText = useStore((s) => s.updateLineText);
  const snapEdge = useStore((s) => s.snapLineEdgeToNearestFlag);

  const [draft, setDraft] = useState(line ? lineText(line) : "");
  useEffect(() => {
    if (line) setDraft(lineText(line));
  }, [line, lineId]);

  if (!line) return null;

  const start = effectiveStart(line);
  const end = effectiveEnd(line);
  const dur = lineDuration(line);
  const isActive = activeLineIndex(lines, t) === lineIndex;
  const activeWord = isActive ? activeWordIndex(line, t) : -1;

  return (
    <div className="space-y-5">
      {/* line text */}
      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-subtle)]">
          Line {lineIndex + 1}
        </label>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => draft.trim() !== lineText(line) && updateLineText(line.id, draft)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus-visible:border-[var(--color-accent)]"
        />
      </div>

      {/* in / out / duration */}
      <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-bg)] p-3">
        <EdgeRow
          label="In point"
          value={line.start ?? start}
          onChange={(v) => setLineTime(line.id, "start", v)}
          onStamp={() => stampLineStart(line.id)}
          onSnap={flagCount > 0 ? () => snapEdge(line.id, "start") : undefined}
        />
        <EdgeRow
          label="Out point"
          value={line.end ?? end}
          onChange={(v) => setLineTime(line.id, "end", v)}
          onStamp={() => stampLineEnd(line.id)}
          onSnap={flagCount > 0 ? () => snapEdge(line.id, "end") : undefined}
        />
        <div className="flex items-center justify-between border-t border-[var(--color-line)] pt-3">
          <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-subtle)]">
            Duration
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.05"
              min="0"
              value={dur != null ? dur.toFixed(2) : ""}
              disabled={start == null}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (Number.isFinite(v)) setLineDuration(line.id, v);
              }}
              placeholder="—"
              className="h-7 w-20 rounded-[var(--radius-xs)] border border-[var(--color-line)] bg-[var(--color-surface)] px-2 text-center font-mono text-xs tabular-nums text-[var(--color-ink)] outline-none disabled:opacity-40"
            />
            <span className="text-xs text-[var(--color-ink-subtle)]">sec</span>
          </div>
        </div>
      </div>

      {/* actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" disabled={start == null} onClick={() => start != null && seek(start)}>
          Go to start
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={start == null}
          onClick={() => {
            if (start != null) {
              seek(start);
              play();
            }
          }}
        >
          <Play className="h-3.5 w-3.5" /> Play line
        </Button>
        <Button variant="ghost" size="sm" onClick={() => clearLineTiming(line.id)}>
          <Eraser className="h-3.5 w-3.5" /> Clear
        </Button>
        <Button variant="danger" size="sm" className="ml-auto" onClick={() => deleteLine(line.id)}>
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>

      {/* word timing */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-subtle)]">
            Word timing
          </h3>
          <span className="text-[10px] text-[var(--color-ink-subtle)]">
            {line.words.filter((w) => w.start != null).length}/{line.words.length}
          </span>
        </div>
        {line.words.length === 0 ? (
          <p className="text-xs text-[var(--color-ink-subtle)]">No words on this line.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {line.words.map((word, wi) => (
              <WordChip
                key={word.id}
                word={word}
                isActive={wi === activeWord}
                onStampStart={() => setWordTime(line.id, word.id, "start", round2(t))}
                onChangeStart={(v) => setWordTime(line.id, word.id, "start", v)}
                onSeek={() => word.start != null && seek(word.start)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EdgeRow({
  label,
  value,
  onChange,
  onStamp,
  onSnap,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  onStamp: () => void;
  onSnap?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-subtle)]">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={onStamp}
          title="Set to playhead"
          aria-label={`Set ${label} to playhead`}
          className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-xs)] border border-[var(--color-line)] text-[var(--color-accent)] hover:bg-[var(--color-surface-2)]"
        >
          <Crosshair className="h-3.5 w-3.5" />
        </button>
        {onSnap && (
          <button
            onClick={onSnap}
            title="Snap to nearest flag"
            aria-label={`Snap ${label} to nearest flag`}
            className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-xs)] border border-[var(--color-line)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
          >
            <MagnetIcon className="h-3.5 w-3.5" />
          </button>
        )}
        <TimeField label={label} value={value} onChange={onChange} compact />
      </div>
    </div>
  );
}

function FlagInspector({ flagId }: { flagId: string }) {
  const flag = useStore((s) => s.project?.flags.find((f) => f.id === flagId));
  const updateFlagTime = useStore((s) => s.updateFlagTime);
  const updateFlagLabel = useStore((s) => s.updateFlagLabel);
  const deleteFlag = useStore((s) => s.deleteFlag);
  const seek = useStore((s) => s.seek);

  const [label, setLabel] = useState(flag?.label ?? "");
  useEffect(() => {
    setLabel(flag?.label ?? "");
  }, [flag?.label, flagId]);

  if (!flag) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-bg)] p-3">
        <FlagIcon className="h-4 w-4 text-[var(--color-warn)]" />
        <span className="font-mono text-sm tabular-nums text-[var(--color-ink)]">
          {formatTimecode(flag.time)}
        </span>
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-subtle)]">
          Label
        </label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => updateFlagLabel(flag.id, label)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          placeholder="e.g. Chorus, Verse 2, Drop"
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus-visible:border-[var(--color-accent)]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-subtle)]">
          Position
        </label>
        <TimeField label="Flag time" value={flag.time} onChange={(v) => updateFlagTime(flag.id, v ?? 0)} />
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => seek(flag.time)}>
          Go to flag
        </Button>
        <Button variant="danger" size="sm" className="ml-auto" onClick={() => deleteFlag(flag.id)}>
          <Trash2 className="h-3.5 w-3.5" /> Delete flag
        </Button>
      </div>
    </div>
  );
}
