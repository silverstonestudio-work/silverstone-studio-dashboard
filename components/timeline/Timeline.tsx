"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Flag as FlagIcon, Plus, ZoomIn, ZoomOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { effectiveEnd, effectiveStart, lineText, snapTime } from "@/lib/model";
import { formatShort } from "@/lib/time";
import type { Line } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Button } from "../ui/Button";

const ROW_H = 30;
const ROW_GAP = 4;
const MIN_REGION_PX = 26;
const RULER_H = 26;
const FLAG_LANE_H = 24;
const SNAP_PX = 7;
const MIN_LEN = 0.1;

type DragState =
  | { kind: "move"; lineId: string; startX: number; origS: number; origE: number }
  | { kind: "resize"; lineId: string; edge: "start" | "end"; startX: number; origS: number; origE: number }
  | { kind: "flag"; flagId: string; startX: number; origT: number };

export function Timeline() {
  const lines = useStore((s) => s.project?.lines ?? []);
  const flags = useStore((s) => s.project?.flags ?? []);
  const duration = useStore((s) => s.duration);
  const currentTime = useStore((s) => s.currentTime);
  const pps = useStore((s) => s.project?.settings.timelineZoom ?? 12);
  const selectedLineId = useStore((s) => s.selectedLineId);
  const selectedFlagId = useStore((s) => s.selectedFlagId);

  const seek = useStore((s) => s.seek);
  const selectLine = useStore((s) => s.selectLine);
  const selectFlag = useStore((s) => s.selectFlag);
  const setLineTimeLive = useStore((s) => s.setLineTimeLive);
  const updateFlagTimeLive = useStore((s) => s.updateFlagTimeLive);
  const persistProject = useStore((s) => s.persistProject);
  const addFlag = useStore((s) => s.addFlag);
  const updateSettings = useStore((s) => s.updateSettings);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [viewportW, setViewportW] = useState(800);

  useLayoutEffect(() => {
    const el = contentRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewportW(el.clientWidth));
    ro.observe(el);
    setViewportW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const contentW = Math.max(viewportW, duration * pps + 40);
  const timeToX = useCallback((t: number) => t * pps, [pps]);
  const xFromClient = useCallback((clientX: number) => {
    const rect = contentRef.current?.getBoundingClientRect();
    return rect ? clientX - rect.left : 0;
  }, []);
  const timeFromClient = useCallback(
    (clientX: number) => Math.max(0, xFromClient(clientX) / pps),
    [pps, xFromClient]
  );

  // ---- drag lifecycle (window-level move/up while dragging) ----
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const t = timeFromClient(e.clientX);

      if (drag.kind === "flag") {
        const others = flags.filter((f) => f.id !== drag.flagId).map((f) => f.time);
        updateFlagTimeLive(drag.flagId, snapTime(t, [...others, currentTime], SNAP_PX / pps));
        return;
      }

      const snaps = buildSnaps(lines, flags, drag.lineId, currentTime);

      if (drag.kind === "move") {
        const len = drag.origE - drag.origS;
        let newS = drag.origS + (t - drag.startX);
        newS = Math.max(0, snapTime(newS, snaps, SNAP_PX / pps));
        // also try snapping the end edge
        const snappedEnd = snapTime(newS + len, snaps, SNAP_PX / pps);
        if (Math.abs(snappedEnd - (newS + len)) < SNAP_PX / pps) newS = snappedEnd - len;
        setLineTimeLive(drag.lineId, "start", newS);
        setLineTimeLive(drag.lineId, "end", newS + len);
      } else {
        if (drag.edge === "start") {
          let s = snapTime(drag.origS + (t - drag.startX), snaps, SNAP_PX / pps);
          s = Math.min(Math.max(0, s), drag.origE - MIN_LEN);
          setLineTimeLive(drag.lineId, "start", s);
        } else {
          let en = snapTime(drag.origE + (t - drag.startX), snaps, SNAP_PX / pps);
          en = Math.max(en, drag.origS + MIN_LEN);
          setLineTimeLive(drag.lineId, "end", en);
        }
      }
    };
    const onUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        persistProject();
        document.body.style.userSelect = "";
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [lines, flags, currentTime, pps, timeFromClient, setLineTimeLive, updateFlagTimeLive, persistProject]);

  const startMove = (e: React.PointerEvent, line: Line) => {
    e.stopPropagation();
    const s = effectiveStart(line);
    const en = effectiveEnd(line);
    if (s == null || en == null) return;
    selectLine(line.id);
    document.body.style.userSelect = "none";
    dragRef.current = { kind: "move", lineId: line.id, startX: timeFromClient(e.clientX), origS: s, origE: en };
  };
  const startResize = (e: React.PointerEvent, line: Line, edge: "start" | "end") => {
    e.stopPropagation();
    const s = effectiveStart(line);
    const en = effectiveEnd(line);
    if (s == null || en == null) return;
    selectLine(line.id);
    document.body.style.userSelect = "none";
    dragRef.current = { kind: "resize", lineId: line.id, edge, startX: timeFromClient(e.clientX), origS: s, origE: en };
  };
  const startFlag = (e: React.PointerEvent, flagId: string, time: number) => {
    e.stopPropagation();
    selectFlag(flagId);
    document.body.style.userSelect = "none";
    dragRef.current = { kind: "flag", flagId, startX: timeFromClient(e.clientX), origT: time };
  };

  // pack timed lines into non-overlapping rows
  const placed = packRows(lines, timeToX);
  const rowCount = Math.max(1, placed.reduce((m, p) => Math.max(m, p.row + 1), 0));
  const lanesH = rowCount * (ROW_H + ROW_GAP);
  const playheadX = timeToX(currentTime);

  const zoom = (dir: 1 | -1) =>
    updateSettings({ timelineZoom: clampZoom(dir === 1 ? pps * 1.5 : pps / 1.5) });

  const ticks = buildTicks(duration, pps);

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
          Timeline
        </h2>
        <span className="text-xs text-[var(--color-ink-subtle)]">
          {flags.length} {flags.length === 1 ? "flag" : "flags"}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="secondary" size="sm" onClick={() => addFlag()}>
            <FlagIcon className="h-3.5 w-3.5" /> Add flag
          </Button>
          <div className="flex items-center rounded-[var(--radius-sm)] border border-[var(--color-line)]">
            <button
              onClick={() => zoom(-1)}
              className="flex h-7 w-7 items-center justify-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => zoom(1)}
              className="flex h-7 w-7 items-center justify-center border-l border-[var(--color-line)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {duration <= 0 ? (
        <div className="flex h-28 items-center justify-center text-sm text-[var(--color-ink-subtle)]">
          Load audio to use the timeline.
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-hidden">
          <div
            ref={contentRef}
            className="relative select-none"
            style={{ width: contentW, height: RULER_H + FLAG_LANE_H + lanesH + 8 }}
            onDoubleClick={(e) => {
              // add a flag where you double-click empty space
              if ((e.target as HTMLElement).closest("[data-region],[data-flag]")) return;
              addFlag(timeFromClient(e.clientX));
            }}
          >
            {/* ruler */}
            <div
              className="absolute inset-x-0 top-0 cursor-pointer border-b border-[var(--color-line)]"
              style={{ height: RULER_H }}
              onPointerDown={(e) => seek(timeFromClient(e.clientX))}
            >
              {ticks.map((t) => (
                <div key={t} className="absolute top-0 h-full" style={{ left: timeToX(t) }}>
                  <div className="h-2 w-px bg-[var(--color-line-strong)]" />
                  <span className="absolute left-1 top-1.5 font-mono text-[10px] tabular-nums text-[var(--color-ink-subtle)]">
                    {formatShort(t)}
                  </span>
                </div>
              ))}
            </div>

            {/* flag lane */}
            <div
              className="absolute inset-x-0"
              style={{ top: RULER_H, height: FLAG_LANE_H }}
            >
              {flags.map((f) => (
                <div
                  key={f.id}
                  data-flag
                  onPointerDown={(e) => startFlag(e, f.id, f.time)}
                  className="group absolute top-0 -translate-x-1/2 cursor-ew-resize"
                  style={{ left: timeToX(f.time) }}
                  title={f.label || formatShort(f.time)}
                >
                  <div
                    className={cn(
                      "flex h-4 items-center gap-1 rounded-[var(--radius-xs)] px-1",
                      f.id === selectedFlagId
                        ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                        : "bg-[var(--color-warn)] text-[var(--color-accent-ink)]"
                    )}
                  >
                    <FlagIcon className="h-2.5 w-2.5" />
                    {f.label && (
                      <span className="max-w-[80px] truncate text-[9px] font-semibold">{f.label}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* line-region lanes */}
            <div className="absolute inset-x-0" style={{ top: RULER_H + FLAG_LANE_H }}>
              {placed.map(({ line, idx, row, x, w }) => {
                const selected = line.id === selectedLineId;
                return (
                  <div
                    key={line.id}
                    data-region
                    onPointerDown={(e) => startMove(e, line)}
                    className={cn(
                      "absolute flex items-center overflow-hidden rounded-[var(--radius-xs)] border text-left transition-colors",
                      selected
                        ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_26%,var(--color-surface-2))] z-10"
                        : "border-[var(--color-line-strong)] bg-[var(--color-surface-2)] hover:border-[var(--color-accent)]"
                    )}
                    style={{ left: x, width: Math.max(MIN_REGION_PX, w), top: row * (ROW_H + ROW_GAP), height: ROW_H, cursor: "grab" }}
                  >
                    {/* left handle */}
                    <span
                      onPointerDown={(e) => startResize(e, line, "start")}
                      className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize bg-[var(--color-accent)] opacity-0 hover:opacity-100"
                    />
                    <span className="pointer-events-none truncate px-2 text-xs font-medium text-[var(--color-ink)]">
                      <span className="mr-1 text-[var(--color-ink-subtle)]">{idx + 1}</span>
                      {lineText(line) || "—"}
                    </span>
                    {/* right handle */}
                    <span
                      onPointerDown={(e) => startResize(e, line, "end")}
                      className="absolute right-0 top-0 h-full w-1.5 cursor-ew-resize bg-[var(--color-accent)] opacity-0 hover:opacity-100"
                    />
                  </div>
                );
              })}
              {placed.length === 0 && (
                <div className="flex h-16 items-center px-3 text-xs text-[var(--color-ink-subtle)]">
                  Timed lines appear here as draggable regions. Set a line&apos;s in/out points to begin.
                </div>
              )}
            </div>

            {/* playhead */}
            <div
              className="pointer-events-none absolute top-0 z-20 w-px bg-white"
              style={{ left: playheadX, height: RULER_H + FLAG_LANE_H + lanesH + 8 }}
            >
              <div className="absolute -left-[3px] -top-0.5 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ---- helpers ----

function buildSnaps(lines: Line[], flags: { time: number }[], exceptLineId: string, playhead: number): number[] {
  const pts = flags.map((f) => f.time);
  lines.forEach((l) => {
    if (l.id === exceptLineId) return;
    const s = effectiveStart(l);
    const e = effectiveEnd(l);
    if (s != null) pts.push(s);
    if (e != null) pts.push(e);
  });
  pts.push(playhead);
  return pts;
}

function packRows(
  lines: Line[],
  timeToX: (t: number) => number
): Array<{ line: Line; idx: number; row: number; x: number; w: number }> {
  const timed = lines
    .map((line, idx) => ({ line, idx, s: effectiveStart(line), e: effectiveEnd(line) }))
    .filter((r): r is { line: Line; idx: number; s: number; e: number } => r.s != null && r.e != null)
    .sort((a, b) => a.s - b.s);

  const rowEnds: number[] = [];
  return timed.map((r) => {
    const x = timeToX(r.s);
    const w = Math.max(MIN_REGION_PX, timeToX(r.e) - x);
    let row = rowEnds.findIndex((end) => x >= end + 4);
    if (row === -1) {
      row = rowEnds.length;
      rowEnds.push(0);
    }
    rowEnds[row] = x + w;
    return { line: r.line, idx: r.idx, row, x, w };
  });
}

function buildTicks(duration: number, pps: number): number[] {
  if (duration <= 0) return [];
  const steps = [1, 2, 5, 10, 15, 30, 60, 120];
  const step = steps.find((s) => s * pps >= 64) ?? 120;
  const ticks: number[] = [];
  for (let t = 0; t <= duration; t += step) ticks.push(t);
  return ticks;
}

function clampZoom(v: number): number {
  return Math.min(120, Math.max(4, Math.round(v)));
}
