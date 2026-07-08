"use client";

import { useEffect, useRef } from "react";
import { audioBus } from "@/lib/audioBus";
import { useStore } from "@/lib/store";

/**
 * Headless component: renders the single <audio> element, registers it on the
 * shared bus, keeps its src in sync with the open project's audio, and runs a
 * requestAnimationFrame loop for smooth playback-time updates.
 */
export function AudioEngine() {
  const ref = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const audioUrl = useStore((s) => s.audioUrl);
  const isPlaying = useStore((s) => s.isPlaying);
  const setCurrentTime = useStore((s) => s.setCurrentTime);
  const setDuration = useStore((s) => s.setDuration);
  const setPlaying = useStore((s) => s.setPlaying);

  useEffect(() => {
    audioBus.el = ref.current;
    return () => {
      audioBus.el = null;
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (audioUrl && el.src !== audioUrl) {
      el.src = audioUrl;
      el.load();
    } else if (!audioUrl) {
      el.removeAttribute("src");
      el.load();
    }
  }, [audioUrl]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isPlaying) {
      const tick = () => {
        setCurrentTime(el.currentTime);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, setCurrentTime]);

  return (
    <audio
      ref={ref}
      preload="metadata"
      onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
      onEnded={() => setPlaying(false)}
      onPause={() => setPlaying(false)}
      onPlay={() => setPlaying(true)}
      onTimeUpdate={(e) => {
        if (!useStore.getState().isPlaying) setCurrentTime(e.currentTarget.currentTime);
      }}
      className="hidden"
    />
  );
}
