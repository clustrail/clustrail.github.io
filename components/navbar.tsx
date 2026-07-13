import type {ReactNode} from 'react';
import Link from 'next/link';
import {Wordmark} from '@/components/primitives';
import {Button} from '@/components/ui/button';
import ThemeToggle from '@/components/theme-toggle';
import MobileNav from '@/components/mobile-nav';

export const GITHUB_URL = 'https://github.com/clustrail/clustrail';

export const NAV_LINKS: Array<{href: string; label: string}> = [
  {href: '/architecture', label: 'Architecture'},
  {href: '/docs', label: 'Docs'},
  {href: '/changelog', label: 'Changelog'},
];

function NavLink({href, children}: {href: string; children: ReactNode}): ReactNode {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
      {children}
    </Link>
  );
}

/** The GitHub mark, shared by the bar and the mobile sheet. */
export function GithubMark({size = 18}: {size?: number}): ReactNode {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

/**
 * The site chrome, matching the app's top bar: a sticky bar with a hairline,
 * quiet links, and the one blue CTA on the right. It sits inside the layout's
 * boxed frame, which bounds its width; below md the links collapse into a
 * Sheet-based mobile nav.
 */
export default function Navbar(): ReactNode {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-sm">
      <nav className="flex h-16 w-full items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" width={26} height={26} draggable={false} />
          <Wordmark className="text-lg" />
        </Link>

        {/* Desktop: full link row + controls. */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
          <ThemeToggle />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Clustrail on GitHub"
            className="text-foreground/80 transition-colors hover:text-foreground">
            <GithubMark />
          </a>
          <Button asChild size="lg">
            <Link href="/#install">Get started</Link>
          </Button>
        </div>

        {/* Mobile: hamburger sheet. */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </nav>
    </header>
  );
}
