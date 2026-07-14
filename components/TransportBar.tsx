"use client";

import { Pause, Play, RotateCcw, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "./ui/Button";
import { formatTimecode } from "@/lib/time";
import { cn } from "@/lib/cn";

const RATES = [0.5, 0.75, 1, 1.25, 1.5];

export function TransportBar() {
  const isPlaying = useStore((s) => s.isPlaying);
  const currentTime = useStore((s) => s.currentTime);
  const duration = useStore((s) => s.duration);
  const rate = useStore((s) => s.playbackRate);
  const volume = useStore((s) => s.volume);
  const togglePlay = useStore((s) => s.togglePlay);
  const seek = useStore((s) => s.seek);
  const seekBy = useStore((s) => s.seekBy);
  const setRate = useStore((s) => s.setRate);
  const setVolume = useStore((s) => s.setVolume);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => seek(0)}
          aria-label="Restart"
          title="Restart"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => seekBy(-5)}
          aria-label="Back 5 seconds"
          title="Back 5s"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="primary"
          size="icon"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="h-11 w-11"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 translate-x-[1px] fill-current" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => seekBy(5)}
          aria-label="Forward 5 seconds"
          title="Forward 5s"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-baseline gap-1.5 font-mono text-sm tabular-nums">
        <span className="text-[var(--color-ink)]">{formatTimecode(currentTime)}</span>
        <span className="text-[var(--color-ink-subtle)]">/</span>
        <span className="text-[var(--color-ink-subtle)]">{formatTimecode(duration)}</span>
      </div>

      <div className="flex w-full flex-wrap items-center gap-3 sm:ml-auto sm:w-auto sm:flex-nowrap sm:gap-4">
        {/* Playback rate — full-width even row on mobile, natural on desktop */}
        <div className="flex w-full items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] p-0.5 sm:w-auto">
          {RATES.map((r) => (
            <button
              key={r}
              onClick={() => setRate(r)}
              className={cn(
                "flex-1 rounded-[var(--radius-xs)] px-2 py-1 text-xs font-medium tabular-nums transition-colors sm:flex-none",
                r === rate
                  ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              )}
              aria-pressed={r === rate}
            >
              {r}×
            </button>
          ))}
        </div>

        {/* Volume — slider fills its own row on mobile, fixed width on desktop */}
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Volume2 className="h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label="Volume"
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-line-strong)] accent-[var(--color-accent)] sm:w-24"
          />
        </div>
      </div>
    </div>
  );
}
