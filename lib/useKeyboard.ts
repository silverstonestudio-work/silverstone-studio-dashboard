"use client";

import { useEffect } from "react";
import { useStore } from "./store";

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

/** Focused element that natively responds to Space/Enter — don't hijack it. */
function isActivatable(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (["BUTTON", "A", "SELECT"].includes(el.tagName)) return true;
  const role = el.getAttribute("role");
  return role === "button" || role === "menuitem" || role === "slider";
}

/**
 * Global transport + sync shortcuts.
 * - Space: tap (while syncing) or play/pause (otherwise)
 * - K: play/pause · J/L: −5s/+5s · ←/→: −1s/+1s
 * - Enter: tap · Backspace: undo tap (sync mode)
 */
export function useKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const s = useStore.getState();

      switch (e.code) {
        case "Space":
          // Let a focused button/link handle its own activation.
          if (isActivatable(e.target)) return;
          e.preventDefault();
          if (s.syncMode) s.tap();
          else s.togglePlay();
          return;
        case "Enter":
          if (s.syncMode && !isActivatable(e.target)) {
            e.preventDefault();
            s.tap();
          }
          return;
        case "Backspace":
          if (s.syncMode) {
            e.preventDefault();
            s.undoTap();
          }
          return;
        case "KeyK":
          e.preventDefault();
          s.togglePlay();
          return;
        case "KeyJ":
          e.preventDefault();
          s.seekBy(-5);
          return;
        case "KeyL":
          e.preventDefault();
          s.seekBy(5);
          return;
        case "ArrowLeft":
          if (!s.syncMode) {
            e.preventDefault();
            s.seekBy(-1);
          }
          return;
        case "ArrowRight":
          if (!s.syncMode) {
            e.preventDefault();
            s.seekBy(1);
          }
          return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
