/** Time formatting + parsing helpers. All times are in seconds. */

/** 75.42 -> "01:15.42" (mm:ss.cs) */
export function formatTimecode(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "––:––.––";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.round((seconds - Math.floor(seconds)) * 100);
  // handle rounding spillover (e.g. 0.999 -> 1.00)
  const centi = cs === 100 ? 0 : cs;
  const secAdj = cs === 100 ? s + 1 : s;
  return `${pad(m)}:${pad(secAdj)}.${pad(centi)}`;
}

/** 75.42 -> "1:15" (mm:ss) for compact displays */
export function formatShort(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${pad(s)}`;
}

/** Parse "mm:ss.cs" | "ss.cs" | "ss" into seconds. Returns null when invalid. */
export function parseTimecode(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const m = trimmed.match(/^(?:(\d+):)?(\d{1,2})(?:[.,](\d{1,3}))?$/);
  if (!m) return null;
  const minutes = m[1] ? parseInt(m[1], 10) : 0;
  const secs = parseInt(m[2], 10);
  const fracStr = m[3] ?? "";
  const frac = fracStr ? parseInt(fracStr.padEnd(3, "0").slice(0, 3), 10) / 1000 : 0;
  return minutes * 60 + secs + frac;
}

/** LRC-style timestamp: "[01:15.42]" */
export function toLrcTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.round((seconds - Math.floor(seconds)) * 100);
  const centi = cs === 100 ? 0 : cs;
  const secAdj = cs === 100 ? s + 1 : s;
  return `[${pad(m)}:${pad(secAdj)}.${pad(centi)}]`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
