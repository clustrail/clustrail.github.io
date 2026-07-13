'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';
import {Check, Copy} from 'lucide-react';
import {useCopy} from '@/components/copy-button';

/**
 * Client wrapper mapped onto MDX `<pre>` for the docs. It renders the
 * rehype-pretty-code block unchanged and overlays a copy button pinned to a
 * non-scrolling wrapper (so it stays put while the code scrolls sideways).
 *
 * The raw text is read from the rendered DOM rather than reconstructed from
 * the syntax-highlight span tree: rehype-pretty-code splits every line into a
 * `[data-line]` span, so a flat `textContent` would drop the newlines. We
 * join the per-line spans with "\n" and fall back to `textContent` for the
 * degenerate single-line case. Reading what actually rendered survives any
 * theme or decoration the highlighter emits.
 */
export default function CodeBlock({
  children,
  ...props
}: React.ComponentPropsWithoutRef<'pre'>): ReactNode {
  const ref = useRef<HTMLPreElement>(null);
  const [raw, setRaw] = useState('');
  const [copied, copy] = useCopy(raw);

  useEffect(() => {
    const code = ref.current?.querySelector('code');
    const lines = code?.querySelectorAll('[data-line]');
    if (lines && lines.length > 0) {
      setRaw(Array.from(lines).map((l) => l.textContent ?? '').join('\n'));
    } else {
      setRaw(code?.textContent ?? ref.current?.textContent ?? '');
    }
  }, [children]);

  return (
    <div className="group relative">
      <pre ref={ref} {...props}>
        {children}
      </pre>
      {raw && (
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="absolute right-2.5 top-2.5 inline-flex size-7 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-white/5 text-zinc-400 opacity-0 backdrop-blur transition hover:bg-white/10 hover:text-zinc-100 focus-visible:opacity-100 group-hover:opacity-100">
          {copied ? (
            <Check className="size-3.5 text-live" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      )}
    </div>
  );
}
