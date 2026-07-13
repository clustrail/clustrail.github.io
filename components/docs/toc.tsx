'use client';

import {useEffect, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import type {Doc} from '@/lib/docs';

/**
 * The "On this page" rail: h2/h3 anchors extracted at build time, plus a
 * client scroll-spy that highlights the section currently in view. Desktop
 * only (mounted inside a sticky aside by the page).
 */
export default function Toc({headings}: {headings: Doc['headings']}): ReactNode {
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      {rootMargin: '-88px 0px -70% 0px', threshold: 0},
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page" className="flex flex-col">
      <span className="mb-3 text-xs font-semibold text-muted-foreground">On this page</span>
      <div className="flex flex-col border-l border-border">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={clsx(
              '-ml-px border-l-2 py-1 text-[13px] leading-snug no-underline transition-colors',
              h.depth === 3 ? 'pl-6' : 'pl-3',
              active === h.id
                ? 'border-l-primary text-link'
                : 'border-l-transparent text-muted-foreground hover:text-foreground',
            )}>
            {h.text}
          </a>
        ))}
      </div>
    </nav>
  );
}
