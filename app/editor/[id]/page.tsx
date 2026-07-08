"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AudioEngine } from "@/components/AudioEngine";
import { ImportScreen } from "@/components/ImportScreen";
import { Workspace } from "@/components/Workspace";

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const openProject = useStore((s) => s.openProject);
  const closeProject = useStore((s) => s.closeProject);

  const loaded = useStore((s) => s.loaded);
  const projectId = useStore((s) => s.project?.id);
  const hasAudio = useStore((s) => s.hasAudio);
  const audioLoading = useStore((s) => s.audioLoading);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const ok = await openProject(id);
      if (active && !ok) setNotFound(true);
    })();
    return () => {
      active = false;
      closeProject();
    };
  }, [id, openProject, closeProject]);

  useEffect(() => {
    if (notFound) router.replace("/");
  }, [notFound, router]);

  const ready = loaded && projectId === id;

  return (
    <>
      <AudioEngine />
      {!ready ? (
        <Splash />
      ) : hasAudio ? (
        <Workspace />
      ) : audioLoading ? (
        <Splash label="Restoring audio…" />
      ) : (
        <ImportScreen />
      )}
    </>
  );
}

function Splash({ label }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-line-strong)] border-t-[var(--color-accent)]" />
      {label && <p className="text-sm text-[var(--color-ink-subtle)]">{label}</p>}
    </div>
  );
}
