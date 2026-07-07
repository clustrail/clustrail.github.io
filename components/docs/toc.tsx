import type {ReactNode} from 'react';
import clsx from 'clsx';
import type {Doc} from '@/lib/docs';

/** The "On this page" rail: h2/h3 anchors, desktop only. */
export default function Toc({headings}: {headings: Doc['headings']}): ReactNode {
  if (headings.length === 0) return null;
  return (
    <nav aria-label="On this page" className="flex flex-col gap-2">
      <span className="font-mono text-2xs font-semibold uppercase tracking-[0.18em] text-foreground/70">
        On this page
      </span>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={clsx(
            'text-[13px] leading-snug text-muted-foreground no-underline transition-colors hover:text-foreground',
            h.depth === 3 && 'pl-3',
          )}>
          {h.text}
        </a>
      ))}
    </nav>
  );
}
