'use client';

import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {Dialog} from 'radix-ui';
import {Search} from 'lucide-react';
import {cn} from '@/lib/utils';

/**
 * Docs search: a Cmd-K / "/" command palette over Pagefind.
 *
 * Pagefind's bundle (`/pagefind/pagefind.js`) only exists AFTER a production
 * build runs the postbuild indexer - it is not on disk during `next dev` and
 * must never be resolved by the bundler. We therefore load it through a
 * runtime `new Function('return import(...)')()` so webpack/turbopack treat the
 * specifier as opaque, and swallow the inevitable dev-time 404 into a quiet
 * "index not built" state instead of crashing the route.
 */

interface PagefindResult {
  url: string;
  excerpt: string;
  meta: {title?: string};
}

type Pagefind = {
  debouncedSearch: (
    term: string,
  ) => Promise<{results: Array<{data: () => Promise<PagefindResult>}>} | null>;
};

// Opaque dynamic import: keeps the build from trying to resolve the (post-build
// only) Pagefind bundle.
const importPagefind = () =>
  (new Function('return import("/pagefind/pagefind.js")')() as Promise<Pagefind>);

/** Strip the static-export html tail so Pagefind urls map to app routes. */
function toRoute(url: string): string {
  return url.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/';
}

export default function DocsSearch({className}: {className?: string}): ReactNode {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);
  const pagefind = useRef<Pagefind | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global shortcuts: Cmd/Ctrl-K anywhere, "/" outside form fields.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
        return;
      }
      const el = e.target as HTMLElement | null;
      const typing =
        el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (e.key === '/' && !typing && !open) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const load = useCallback(async (): Promise<Pagefind | null> => {
    if (pagefind.current) return pagefind.current;
    try {
      const pf = await importPagefind();
      pagefind.current = pf;
      return pf;
    } catch {
      setFailed(true);
      return null;
    }
  }, []);

  // Warm the index when the palette opens.
  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    let cancelled = false;
    if (!query.trim()) {
      setResults([]);
      setActive(0);
      return;
    }
    (async () => {
      const pf = await load();
      if (!pf || cancelled) return;
      const search = await pf.debouncedSearch(query);
      if (!search || cancelled) return; // superseded or empty
      const data = await Promise.all(search.results.slice(0, 8).map((r) => r.data()));
      if (cancelled) return;
      setResults(data);
      setActive(0);
    })();
    return () => {
      cancelled = true;
    };
  }, [query, load]);

  const go = useCallback(
    (url: string) => {
      setOpen(false);
      setQuery('');
      router.push(toRoute(url));
    },
    [router],
  );

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active].url);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-input hover:text-foreground',
          className,
        )}>
        <Search className="size-4" />
        <span className="flex-1 text-left">Search</span>
        <kbd className="hidden items-center rounded border border-border px-1.5 font-mono text-2xs text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed left-1/2 top-24 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95">
            <Dialog.Title className="sr-only">Search documentation</Dialog.Title>
            <div className="flex items-center gap-2.5 border-b border-border px-4">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search the docs"
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent py-3.5 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden items-center rounded border border-border px-1.5 font-mono text-2xs text-muted-foreground sm:inline-flex">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {failed ? (
                <p className="px-3 py-6 text-center font-mono text-2xs uppercase tracking-[0.18em] text-muted-foreground">
                  Search index not built
                </p>
              ) : results.length > 0 ? (
                <ul className="flex flex-col gap-0.5">
                  {results.map((r, i) => (
                    <li key={r.url}>
                      <button
                        type="button"
                        onClick={() => go(r.url)}
                        onMouseEnter={() => setActive(i)}
                        className={cn(
                          'block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left transition-colors',
                          i === active ? 'bg-accent' : 'hover:bg-accent/60',
                        )}>
                        <div className="text-sm font-medium text-foreground">
                          {r.meta.title ?? 'Untitled'}
                        </div>
                        <div
                          className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground [&_mark]:bg-primary/25 [&_mark]:text-foreground [&_mark]:rounded-[2px]"
                          dangerouslySetInnerHTML={{__html: r.excerpt}}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {query.trim() ? 'No results' : 'Type to search the documentation'}
                </p>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
