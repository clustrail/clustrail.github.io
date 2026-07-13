'use client';

import {useState, type ReactNode} from 'react';
import Link from 'next/link';
import {Menu} from 'lucide-react';
import {Wordmark} from '@/components/primitives';
import {Button} from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import ThemeToggle from '@/components/theme-toggle';
import {GITHUB_URL, GithubMark, NAV_LINKS} from '@/components/navbar';

/**
 * Below md, the nav links live in a right-hand Sheet. The Sheet is controlled
 * so tapping a link closes it before the route change; focus is trapped and
 * restored by the underlying Radix dialog.
 */
export default function MobileNav(): ReactNode {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="size-5" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 gap-0 bg-canvas p-0">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" width={22} height={22} draggable={false} />
            <Wordmark className="text-lg" />
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col px-6 py-6">
          <span className="mb-4 font-mono text-2xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Menu
          </span>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2.5 text-2xl font-semibold tracking-tight text-foreground/90 transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between border-t border-border px-6 py-5">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Clustrail on GitHub"
            className="inline-flex items-center gap-2 font-mono text-2xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground">
            <GithubMark size={16} />
            GitHub
          </a>
          <ThemeToggle />
        </div>

        <div className="border-t border-border p-6">
          <Button asChild size="lg" className="w-full">
            <Link href="/#install" onClick={() => setOpen(false)}>
              Get started
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
