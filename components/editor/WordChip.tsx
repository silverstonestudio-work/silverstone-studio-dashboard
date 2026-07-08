"use client";

import { Crosshair } from "lucide-react";
import type { Word } from "@/lib/types";
import { cn } from "@/lib/cn";
import { formatTimecode } from "@/lib/time";
import { TimeField } from "./TimeField";

interface WordChipProps {
  word: Word;
  isActive: boolean;
  onStampStart: () => void;
  onChangeStart: (v: number | null) => void;
  onSeek: () => void;
}

export function WordChip({
  word,
  isActive,
  onStampStart,
  onChangeStart,
  onSeek,
}: WordChipProps) {
  const timed = word.start != null;
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-[var(--radius-sm)] border p-2 transition-colors",
        isActive
          ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
          : timed
            ? "border-[var(--color-line)] bg-[var(--color-surface)]"
            : "border-dashed border-[var(--color-line)] bg-transparent"
      )}
    >
      <button
        onClick={onSeek}
        disabled={!timed}
        title={timed ? `Seek to ${formatTimecode(word.start)}` : undefined}
        className={cn(
          "text-left text-sm font-medium transition-colors",
          isActive ? "text-[var(--color-accent)]" : "text-[var(--color-ink)]",
          timed && "cursor-pointer hover:text-[var(--color-accent)]"
        )}
      >
        {word.text}
      </button>
      <div className="flex items-center gap-1">
        <button
          onClick={onStampStart}
          title="Set start to playhead"
          aria-label={`Set start of "${word.text}" to playhead`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-xs)] border border-[var(--color-line)] text-[var(--color-accent)] hover:bg-[var(--color-surface-2)]"
        >
          <Crosshair className="h-3.5 w-3.5" />
        </button>
        <TimeField
          label="Start"
          value={word.start}
          onChange={onChangeStart}
          compact
        />
      </div>
    </div>
  );
}
