'use client';

import {useEffect, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {ChevronDown} from 'lucide-react';
import type {NavGroup, NavItem} from '@/lib/docs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

/**
 * The docs navigation rail. A sticky column on desktop; a slide-in Sheet on
 * mobile. Active state follows the current pathname (usePathname island). The
 * active item is marked by a 2px primary left rail; group headers speak in the
 * mono label voice.
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
            <span className="mb-1.5 block pl-3 font-mono text-2xs font-semibold uppercase tracking-[0.18em] text-foreground/70">
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

export default function DocsSidebar({tree}: {tree: Array<NavItem | NavGroup>}): ReactNode {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile Sheet after a client navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile: slide-in Sheet. */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-input">
              Docs menu
              <ChevronDown className="size-4" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 gap-0 overflow-y-auto p-0">
            <SheetHeader className="border-b border-border">
              <SheetTitle>Documentation</SheetTitle>
              <SheetDescription className="sr-only">Browse the documentation</SheetDescription>
            </SheetHeader>
            <div className="px-4 py-4">
              <NavTree tree={tree} pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: rail (stickiness owned by the layout column). */}
      <div className="hidden lg:block">
        <NavTree tree={tree} pathname={pathname} />
      </div>
    </>
  );
}
