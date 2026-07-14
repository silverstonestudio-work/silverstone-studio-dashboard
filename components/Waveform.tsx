"use client";

import { useCallback, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { effectiveStart } from "@/lib/model";
import { clamp } from "@/lib/time";

// Canvas fills can't reference CSS custom properties, so we resolve the brand
// tokens to concrete colors at runtime (see the resolver effect below). These
// are fallbacks that mirror the OX blue theme until the real values are read.
interface WaveColors {
  played: string;
  unplayed: string;
  center: string;
  marker: string;
  cursor: string;
}

const FALLBACK_COLORS: WaveColors = {
  played: "#0091ff",
  unplayed: "#3e3e3e",
  center: "#343434",
  marker: "#707070",
  cursor: "#ededed",
};

export function Waveform() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const colorsRef = useRef<WaveColors>(FALLBACK_COLORS);

  const peaks = useStore((s) => s.peaks);
  const duration = useStore((s) => s.duration);
  const currentTime = useStore((s) => s.currentTime);
  const lines = useStore((s) => s.project?.lines ?? []);
  const seek = useStore((s) => s.seek);
  const audioLoading = useStore((s) => s.audioLoading);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const mid = h / 2;
    const progress = duration > 0 ? currentTime / duration : 0;
    const playedX = progress * w;
    const COLORS = colorsRef.current;

    // center line
    ctx.strokeStyle = COLORS.center;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();

    // waveform bars
    if (peaks.length) {
      const barW = Math.max(1, w / peaks.length - 0.5);
      for (let i = 0; i < peaks.length; i += 1) {
        const x = (i / peaks.length) * w;
        const amp = Math.max(peaks[i] * (mid - 2), 1);
        ctx.fillStyle = x <= playedX ? COLORS.played : COLORS.unplayed;
        ctx.fillRect(x, mid - amp, barW, amp * 2);
      }
    }

    // lyric line-start markers
    if (duration > 0) {
      ctx.fillStyle = COLORS.marker;
      lines.forEach((line) => {
        const s = effectiveStart(line);
        if (s == null) return;
        const x = (s / duration) * w;
        ctx.fillRect(x, 0, 1.5, h);
      });
    }

    // playhead
    ctx.fillStyle = COLORS.cursor;
    ctx.fillRect(playedX - 0.75, 0, 1.5, h);
    ctx.beginPath();
    ctx.arc(playedX, 0, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [peaks, duration, currentTime, lines]);

  // Resolve brand tokens (e.g. --color-accent) to concrete colors the canvas
  // can paint with. A hidden probe lets the browser compute the var() chain,
  // so the waveform tracks the active theme automatically after a brand swap.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const read = (token: string, fallback: string): string => {
      const probe = document.createElement("span");
      probe.style.cssText = `color:var(${token});display:none`;
      el.appendChild(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value || fallback;
    };
    colorsRef.current = {
      played: read("--color-accent", FALLBACK_COLORS.played),
      unplayed: read("--color-line-strong", FALLBACK_COLORS.unplayed),
      center: read("--color-line", FALLBACK_COLORS.center),
      marker: read("--color-ink-subtle", FALLBACK_COLORS.marker),
      cursor: read("--color-ink", FALLBACK_COLORS.cursor),
    };
    draw();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const ro = new ResizeObserver(() => draw());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [draw]);

  const seekFromEvent = useCallback(
    (clientX: number) => {
      const wrap = wrapRef.current;
      if (!wrap || duration <= 0) return;
      const rect = wrap.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      seek(ratio * duration);
    },
    [duration, seek]
  );

  return (
    <div
      ref={wrapRef}
      className="relative h-24 w-full cursor-crosshair overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] select-none"
      onPointerDown={(e) => {
        draggingRef.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        seekFromEvent(e.clientX);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) seekFromEvent(e.clientX);
      }}
      onPointerUp={(e) => {
        draggingRef.current = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      role="slider"
      aria-label="Seek through track"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(currentTime)}
      tabIndex={0}
      onKeyDown={(e) => {
        // Own arrow-key seeking when focused; stop the global handler from
        // also firing (which would double the seek).
        if (e.key === "ArrowLeft") {
          e.stopPropagation();
          seek(currentTime - 1);
        }
        if (e.key === "ArrowRight") {
          e.stopPropagation();
          seek(currentTime + 1);
        }
      }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      {audioLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--color-ink-subtle)]">
          Analyzing waveform…
        </div>
      )}
      {!audioLoading && !peaks.length && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--color-ink-subtle)]">
          Waveform unavailable
        </div>
      )}
    </div>
  );
}
