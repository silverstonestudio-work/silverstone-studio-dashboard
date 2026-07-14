import { AppShell } from "@/components/shell/AppShell";

/**
 * Dashboard shell — responsive sidebar (static on desktop, drawer on mobile) +
 * scrollable content region. Applies to every top-level dashboard route
 * (overview, tools, projects). The focused Pace Lyric editor lives outside this
 * group so it can run full-screen.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
