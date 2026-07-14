"use client";

import { useStore } from "@/lib/store";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const title = useStore((s) => s.project?.title ?? "");
  const artist = useStore((s) => s.project?.artist ?? "");
  const settings = useStore((s) => s.project?.settings);
  const setTitle = useStore((s) => s.setTitle);
  const setArtist = useStore((s) => s.setArtist);
  const updateSettings = useStore((s) => s.updateSettings);

  if (!settings) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Project settings"
      description="Song details and karaoke preview behavior."
      footer={
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Song title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-ink)] outline-none focus-visible:border-[var(--color-accent)]"
            />
          </Field>
          <Field label="Artist">
            <input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist"
              className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-ink)] outline-none focus-visible:border-[var(--color-accent)]"
            />
          </Field>
        </div>

        <div className="h-px bg-[var(--color-line)]" />

        <Field label={`Preview lead-in (${settings.leadInSeconds}s)`}>
          <input
            type="range"
            min={0}
            max={8}
            step={1}
            value={settings.leadInSeconds}
            onChange={(e) => updateSettings({ leadInSeconds: parseInt(e.target.value, 10) })}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-line-strong)] accent-[var(--color-accent)]"
          />
          <p className="mt-1 text-xs text-[var(--color-ink-subtle)]">
            How early the &ldquo;get ready&rdquo; countdown appears before a line.
          </p>
        </Field>

        <label className="flex cursor-pointer items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2.5">
          <span>
            <span className="block text-sm font-medium text-[var(--color-ink)]">Word-level wipe</span>
            <span className="block text-xs text-[var(--color-ink-subtle)]">
              Animate each word filling with color (vs. whole line).
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.wordWipe}
            aria-label="Word-level wipe"
            onClick={(e) => {
              updateSettings({ wordWipe: !settings.wordWipe });
              e.currentTarget.blur();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              height: 24,
              width: 44,
              padding: 2,
              border: "none",
              borderRadius: 9999,
              cursor: "pointer",
              outline: "none",
              boxShadow: "none",
              backgroundColor: settings.wordWipe
                ? "var(--color-accent)"
                : "var(--color-line-strong)",
              transition: "background-color 0.2s",
            }}
          >
            <span
              style={{
                height: 20,
                width: 20,
                borderRadius: 9999,
                background: "#ffffff",
                boxShadow: "var(--shadow-sm)",
                transform: settings.wordWipe ? "translateX(20px)" : "translateX(0)",
                transition: "transform 0.2s",
              }}
            />
          </button>
        </label>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-subtle)]">
        {label}
      </span>
      {children}
    </label>
  );
}
