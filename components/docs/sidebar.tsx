'use client';

import {useEffect, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {ChevronDown} from 'lucide-react';
import type {NavGroup, NavItem} from '@/lib/docs';

/**
 * The docs navigation rail. A sticky column on desktop; on mobile an inline
 * disclosure - the trigger shows the current page and expands the tree in
 * place, pushing the article down rather than sliding over it. Active state
 * follows the current pathname (usePathname island). The active item is
 * marked by a 2px primary left rail; group headers are quiet sentence-case
 * labels.
 */

function ItemLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}): ReactNode {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'block border-l-2 py-1 pl-3 pr-2 text-sm no-underline transition-colors',
        active
          ? 'border-primary font-medium text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground',
      )}>
      {item.label}
    </Link>
  );
}

function NavTree({
  tree,
  pathname,
  onNavigate,
}: {
  tree: Array<NavItem | NavGroup>;
  pathname: string;
  onNavigate?: () => void;
}): ReactNode {
  return (
    <nav aria-label="Docs" className="flex flex-col gap-0.5">
      {tree.map((entry) =>
        'items' in entry ? (
          <div key={entry.href} className="mt-5 first:mt-0">
            <span className="mb-1.5 block pl-3 text-xs font-semibold text-muted-foreground">
              {entry.label}
            </span>
            <div className="flex flex-col gap-0.5">
              {entry.items.map((item) => (
                <ItemLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ) : (
          <div key={entry.href} className="[&:not(:first-child)]:mt-0.5">
            <ItemLink item={entry} active={pathname === entry.href} onNavigate={onNavigate} />
          </div>
        ),
      )}
    </nav>
  );
}

/** The current page's sidebar label, for the mobile trigger. */
function currentLabel(tree: Array<NavItem | NavGroup>, pathname: string): string | null {
  for (const entry of tree) {
    if ('items' in entry) {
      const hit = entry.items.find((item) => item.href === pathname);
      if (hit) return hit.label;
    } else if (entry.href === pathname) {
      return entry.label;
    }
  }
  return null;
}

export default function DocsSidebar({tree}: {tree: Array<NavItem | NavGroup>}): ReactNode {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Collapse the mobile disclosure after a client navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile: inline disclosure that expands in place. */}
      <div className="lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="docs-menu"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-input">
          <span className="truncate">{currentLabel(tree, pathname) ?? 'Docs menu'}</span>
          <ChevronDown
            className={clsx('size-4 shrink-0 transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        </button>
        {open && (
          <div
            id="docs-menu"
            className="mt-2 max-h-[65dvh] overflow-y-auto rounded-lg border border-border bg-card px-4 py-4">
            <NavTree tree={tree} pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
        )}
      </div>

      {/* Desktop: rail (stickiness owned by the layout column). */}
      <div className="hidden lg:block">
        <NavTree tree={tree} pathname={pathname} />
      </div>
    </>
  );
}
