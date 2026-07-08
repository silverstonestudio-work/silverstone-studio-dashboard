import { effectiveStart, effectiveEnd, lineText } from "./model";
import { toLrcTimestamp } from "./time";
import type { KaraokeProject, Line } from "./types";

/**
 * Export a project to LRC format.
 * - Standard mode: one `[mm:ss.cs]` timestamp per line.
 * - Enhanced mode: adds inline `<mm:ss.cs>` word timestamps (the "A2"
 *   extension supported by many karaoke players) when word timing exists.
 */
export function toLrc(project: KaraokeProject, enhanced = true): string {
  const header: string[] = [];
  if (project.title) header.push(`[ti:${project.title}]`);
  if (project.artist) header.push(`[ar:${project.artist}]`);
  header.push(`[tool:Pace Lyric]`);
  if (project.audioDuration != null) {
    header.push(`[length:${toLrcTimestamp(project.audioDuration).slice(1, -1)}]`);
  }

  const body = project.lines
    .map((line) => renderLine(line, enhanced))
    .filter((l): l is string => l !== null);

  return [...header, "", ...body].join("\n") + "\n";
}

function renderLine(line: Line, enhanced: boolean): string | null {
  const start = effectiveStart(line);
  if (start == null) return null; // untimed lines are skipped
  const stamp = toLrcTimestamp(start);

  if (!enhanced || !line.words.some((w) => w.start != null)) {
    return `${stamp}${lineText(line)}`;
  }

  // Enhanced: inline per-word timestamps.
  const parts = line.words.map((w) => {
    if (w.start == null) return w.text;
    return `<${toLrcTimestamp(w.start).slice(1, -1)}>${w.text}`;
  });
  let out = `${stamp}${parts.join(" ")}`;
  const end = effectiveEnd(line);
  if (end != null) out += ` <${toLrcTimestamp(end).slice(1, -1)}>`;
  return out;
}

export function downloadLrc(project: KaraokeProject, enhanced = true): void {
  const content = toLrc(project, enhanced);
  const name = (project.title || "karaoke").replace(/[^\w\-]+/g, "_");
  triggerDownload(`${name}.lrc`, content, "text/plain;charset=utf-8");
}

export function downloadProjectJson(project: KaraokeProject): void {
  const content = JSON.stringify(project, null, 2);
  const name = (project.name || project.title || "project").replace(/[^\w\-]+/g, "_");
  triggerDownload(`${name}.pacelyric.json`, content, "application/json");
}

function triggerDownload(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
