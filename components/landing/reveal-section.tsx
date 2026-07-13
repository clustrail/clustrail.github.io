'use client';

/*
 * The one wrapper every landing section shares: a <section> that flips to
 * `.in-view` the moment it scrolls into view, letting its `.reveal` children
 * fade+rise in (see the .reveal rules in globals.css). Content is always
 * rendered visible-first - the class only ENHANCES, so no-JS and reduced-motion
 * viewers still see everything. Stagger children by setting `--reveal-delay`
 * inline on each `.reveal` element.
 */
import type {ReactNode} from 'react';
import clsx from 'clsx';
import {useInView} from '@/lib/use-in-view';

export function RevealSection({
  id,
  className,
  children,
  threshold = 0.12,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
  threshold?: number;
}): ReactNode {
  const [ref, inView] = useInView<HTMLElement>({once: true, threshold});
  return (
    <section ref={ref} id={id} className={clsx(inView && 'in-view', className)}>
      {children}
    </section>
  );
}
