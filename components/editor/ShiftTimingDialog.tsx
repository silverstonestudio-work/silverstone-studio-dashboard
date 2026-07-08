"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

export function ShiftTimingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const shiftAllTiming = useStore((s) => s.shiftAllTiming);
  const [value, setValue] = useState("0");

  const delta = parseFloat(value);
  const valid = Number.isFinite(delta) && delta !== 0;

  const apply = () => {
    if (valid) shiftAllTiming(delta);
    onClose();
    setValue("0");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Shift all timing"
      description="Nudge every timestamp forward (+) or backward (−) to compensate for latency or a trimmed intro."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!valid} onClick={apply}>
            Apply shift
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <input
          type="number"
          step="0.05"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          autoFocus
          className="h-11 w-32 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3 text-center font-mono text-lg tabular-nums text-[var(--color-ink)] outline-none focus-visible:border-[var(--color-accent)]"
        />
        <span className="text-sm text-[var(--color-ink-muted)]">seconds</span>
        <div className="ml-auto flex gap-1">
          {[-0.5, -0.1, 0.1, 0.5].map((d) => (
            <Button
              key={d}
              variant="secondary"
              size="sm"
              onClick={() => setValue((parseFloat(value || "0") + d).toFixed(2))}
            >
              {d > 0 ? `+${d}` : d}
            </Button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
