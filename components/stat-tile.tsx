'use client';

/*
 * StatTile: one big-number metric in the ctrlb-style band. The value counts
 * up from zero on first scroll into view (~600ms ease-out, tabular numerals
 * so nothing shifts); reduced motion renders the final value instantly. Only
 * REAL measured numbers belong here - the sub-label states the condition.
 */
import {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import {useInView} from '@/lib/use-in-view';

const DURATION_MS = 600;

function useCountUp(target: number, run: boolean): number {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!run || started.current) return;
    started.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / DURATION_MS);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target]);

  return value;
}

export function StatTile({
  value,
  decimals = 0,
  prefix = '',
  suffix,
  label,
  sublabel,
  className,
}: {
  /** The real measured number the tile counts to. */
  value: number;
  decimals?: number;
  prefix?: string;
  /** Unit rendered after the number: "KB", "ms", "MB", "fps". */
  suffix: string;
  /** What the number is: "backend idle RSS". */
  label: string;
  /** The honest condition: "budget 80 MB", "measured, local cluster". */
  sublabel?: string;
  className?: string;
}): React.ReactNode {
  const [ref, inView] = useInView<HTMLDivElement>({once: true, threshold: 0.4});
  const current = useCountUp(value, inView);

  return (
    <div ref={ref} className={clsx('flex flex-col gap-1.5', className)}>
      <span className="text-4xl font-semibold tracking-tight text-foreground tabular-nums sm:text-5xl">
        {prefix}
        {current.toFixed(decimals)}
        <span className="ml-1 text-xl text-muted-foreground sm:text-2xl">{suffix}</span>
      </span>
      <span className="text-sm text-foreground/90">{label}</span>
      {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
    </div>
  );
}
