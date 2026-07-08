"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PasteLyricsDialog({ open, onClose }: Props) {
  const setLyricsFromText = useStore((s) => s.setLyricsFromText);
  const existing = useStore((s) => s.project?.lines ?? []);
  const [text, setText] = useState("");

  const lineCount = text.split(/\r?\n/).filter((l) => l.trim()).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Paste lyrics"
      description="One line per lyric line. Blank lines are ignored. Timing for unchanged lines is preserved."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={lineCount === 0}
            onClick={() => {
              setLyricsFromText(text);
              onClose();
            }}
          >
            {existing.length > 0 ? "Replace lyrics" : "Add lyrics"} ({lineCount})
          </Button>
        </>
      }
    >
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"Paste your lyrics here…\n\nEvery line becomes a timing row.\nWords split automatically for word-level sync."}
        className="h-64 w-full resize-none rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] p-3 text-sm leading-relaxed text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-subtle)] focus-visible:border-[var(--color-accent)]"
      />
    </Modal>
  );
}
