"use client";

import { memo, useState } from "react";
import { Crosshair, Flag, Pencil, Play } from "lucide-react";
import type { Line } from "@/lib/types";
import { countTimedWords, effectiveEnd, effectiveStart, lineDuration, lineText } from "@/lib/model";
import { useStore } from "@/lib/store";
import { formatTimecode } from "@/lib/time";
import { cn } from "@/lib/cn";

interface LineRowProps {
  line: Line;
  index: number;
  isActive: boolean;
  isSelected: boolean;
  isSyncTarget: boolean;
}

function LineRowInner({ line, index, isActive, isSelected, isSyncTarget }: LineRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => lineText(line));

  const seek = useStore((s) => s.seek);
  const play = useStore((s) => s.play);
  const selectLine = useStore((s) => s.selectLine);
  const stampLineStart = useStore((s) => s.stampLineStart);
  const stampLineEnd = useStore((s) => s.stampLineEnd);
  const updateLineText = useStore((s) => s.updateLineText);

  const start = effectiveStart(line);
  const end = effectiveEnd(line);
  const dur = lineDuration(line);
  const timedWords = countTimedWords(line);

  return (
    <div
      onClick={() => selectLine(line.id)}
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 transition-colors",
        isSyncTarget
          ? "border-[var(--color-accent)] shadow-[var(--shadow-glow)]"
          : isSelected
            ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
            : isActive
              ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_6%,transparent)]"
              : "border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-line-strong)]"
      )}
    >
      <div className="flex w-6 shrink-0 items-center justify-center">
        {isActive ? (
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_color-mix(in_srgb,var(--color-accent)_70%,transparent)]" />
        ) : (
          <span className="font-mono text-xs tabular-nums text-[var(--color-ink-subtle)]">
            {index + 1}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={() => {
              setEditing(false);
              if (draft.trim() !== lineText(line)) updateLineText(line.id, draft);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setDraft(lineText(line));
                setEditing(false);
              }
            }}
            className="w-full rounded-[var(--radius-xs)] border border-[var(--color-line-strong)] bg-[var(--color-bg)] px-2 py-1 text-sm text-[var(--color-ink)] outline-none"
          />
        ) : (
          <p
            onDoubleClick={(e) => {
              e.stopPropagation();
              setDraft(lineText(line));
              setEditing(true);
            }}
            className={cn(
              "truncate text-sm leading-snug",
              start != null ? "text-[var(--color-ink)]" : "text-[var(--color-ink-muted)]",
              !lineText(line) && "italic text-[var(--color-ink-subtle)]"
            )}
            title="Double-click to edit text"
          >
            {lineText(line) || "empty line"}
          </p>
        )}
        <div className="mt-0.5 flex items-center gap-2 font-mono text-[11px] tabular-nums text-[var(--color-ink-subtle)]">
          <span className={cn(start != null && "text-[var(--color-ink-muted)]")}>
            {formatTimecode(start)}
          </span>
          <span>→</span>
          <span className={cn(end != null && "text-[var(--color-ink-muted)]")}>
            {formatTimecode(end)}
          </span>
          {dur != null && (
            <span className="rounded-full bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--color-ink-subtle)]">
              {dur.toFixed(2)}s
            </span>
          )}
          {timedWords > 0 && (
            <span className="text-[10px]">· {timedWords}/{line.words.length} words</span>
          )}
        </div>
      </div>

      {/* quick actions — always visible on touch; hover-reveal on desktop */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <QuickBtn
          label="Edit line text"
          onClick={() => {
            setDraft(lineText(line));
            setEditing(true);
          }}
        >
          <Pencil className="h-4 w-4" />
        </QuickBtn>
        <QuickBtn label="Set in-point to playhead" onClick={() => stampLineStart(line.id)}>
          <Crosshair className="h-4 w-4" />
        </QuickBtn>
        <QuickBtn label="Set out-point to playhead" onClick={() => stampLineEnd(line.id)}>
          <Flag className="h-4 w-4" />
        </QuickBtn>
        <QuickBtn
          label="Play from line start"
          disabled={start == null}
          onClick={() => {
            if (start != null) {
              seek(start);
              play();
            }
          }}
        >
          <Play className="h-4 w-4" />
        </QuickBtn>
      </div>
    </div>
  );
}

function QuickBtn({
  label,
  onClick,
  children,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-xs)] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export const LineRow = memo(LineRowInner);
