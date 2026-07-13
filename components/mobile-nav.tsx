'use client';

import {useEffect, useState, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Menu, X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import ThemeToggle from '@/components/theme-toggle';
import {GITHUB_URL, GithubMark, NAV_LINKS} from '@/components/navbar';

/**
 * Below md, the hamburger expands a full-width panel pinned under the sticky
 * bar - a disclosure, not a dialog: the trigger carries aria-expanded, the
 * panel is plain in-page content, and the route change (or the X) collapses
 * it. Body scroll locks while it is open so the page underneath stays put.
 *
 * The panel portals to <body>: the sticky header's backdrop-blur makes the
 * header the containing block for position:fixed, which would otherwise
 * collapse a fixed panel rendered inside it to nothing.
 */
export default function MobileNav(): ReactNode {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close after a client navigation (covers browser back too).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock the page scroll while the takeover panel is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}>
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </Button>

      {open &&
        createPortal(
          <div
            id="mobile-menu"
            className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col overflow-y-auto bg-background md:hidden">
          <nav className="flex flex-col px-6 pt-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-4 text-lg font-medium text-foreground/90 transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 border-b border-border/60 py-4 text-lg font-medium text-foreground/90 transition-colors hover:text-foreground">
              <GithubMark size={18} />
              GitHub
            </a>
          </nav>

          <div className="mt-auto flex flex-col gap-4 px-6 pb-8 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Button asChild size="lg" className="w-full">
              <Link href="/#install" onClick={() => setOpen(false)}>
                Get started
              </Link>
            </Button>
          </div>
          </div>,
          document.body,
        )}
    </>
  );
}
