"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Logo } from "../brand/Logo";

/**
 * Responsive dashboard shell. On desktop the sidebar is a static column; on
 * mobile it becomes an off-canvas drawer opened from a compact top bar, so the
 * content gets the full width of the screen. Applies to every dashboard route.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever navigation happens.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar — hidden on desktop, where the sidebar is always visible. */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <Link href="/" aria-label="SilverStone Studio home">
            <Logo showSub={false} />
          </Link>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
