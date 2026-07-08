import { del, get, set } from "idb-keyval";

/**
 * Low-level binary storage: each project's MP3 blob lives in IndexedDB,
 * keyed by project id, so a reload restores the full session including audio.
 */

const audioKey = (projectId: string) => `pace-lyric:audio:${projectId}`;

export async function loadAudioBlob(projectId: string): Promise<Blob | null> {
  try {
    return (await get<Blob>(audioKey(projectId))) ?? null;
  } catch {
    return null;
  }
}

export async function saveAudioBlob(projectId: string, blob: Blob): Promise<void> {
  try {
    await set(audioKey(projectId), blob);
  } catch {
    /* IndexedDB unavailable — audio simply won't persist */
  }
}

export async function deleteAudioBlob(projectId: string): Promise<void> {
  try {
    await del(audioKey(projectId));
  } catch {
    /* ignore */
  }
}

export async function copyAudioBlob(fromId: string, toId: string): Promise<void> {
  const blob = await loadAudioBlob(fromId);
  if (blob) await saveAudioBlob(toId, blob);
}

/** Legacy v1 single-project audio key (for one-time migration). */
export const LEGACY_AUDIO_KEY = "pace-lyric:audio-blob:v1";
export async function loadLegacyAudioBlob(): Promise<Blob | null> {
  try {
    return (await get<Blob>(LEGACY_AUDIO_KEY)) ?? null;
  } catch {
    return null;
  }
}
export async function clearLegacyAudioBlob(): Promise<void> {
  try {
    await del(LEGACY_AUDIO_KEY);
  } catch {
    /* ignore */
  }
}
