'use client';

import {useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {ChevronDown} from 'lucide-react';
import type {NavGroup, NavItem} from '@/lib/docs';

/**
 * The docs navigation rail. A fixed column on desktop; a disclosure above
 * the article on mobile. Active state follows the current pathname.
 */

function ItemLink({item, active}: {item: NavItem; active: boolean}): ReactNode {
  return (
    <Link
      href={item.href}
      className={clsx(
        'block rounded-[4px] border-l-2 py-1.5 pl-3 pr-2 text-sm no-underline transition-colors',
        active
          ? 'border-primary bg-white/5 font-medium text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground',
      )}>
      {item.label}
    </Link>
  );
}

function NavTree({tree, pathname}: {tree: Array<NavItem | NavGroup>; pathname: string}): ReactNode {
  return (
    <nav aria-label="Docs" className="flex flex-col gap-1">
      {tree.map((entry) =>
        'items' in entry ? (
          <div key={entry.href} className="mt-4 first:mt-0">
            <span className="block px-3 pb-1.5 font-mono text-2xs font-semibold uppercase tracking-[0.18em] text-foreground/70">
              {entry.label}
            </span>
            <div className="flex flex-col gap-0.5">
              {entry.items.map((item) => (
                <ItemLink key={item.href} item={item} active={pathname === item.href} />
              ))}
            </div>
          </div>
        ) : (
          <div key={entry.href} className="[&:not(:first-child)]:mt-3">
            <ItemLink item={entry} active={pathname === entry.href} />
          </div>
        ),
      )}
    </nav>
  );
}

export default function DocsSidebar({tree}: {tree: Array<NavItem | NavGroup>}): ReactNode {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile: disclosure above the article. */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground">
          Docs menu
          <ChevronDown className={clsx('size-4 transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="mt-2 rounded-lg border border-border bg-card p-3">
            <NavTree tree={tree} pathname={pathname} />
          </div>
        )}
      </div>

      {/* Desktop: sticky rail. */}
      <div className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
          <NavTree tree={tree} pathname={pathname} />
        </div>
      </div>
    </>
  );
}
