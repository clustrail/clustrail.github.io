'use client';

/*
 * The signature motif, now alive: a terminal that streams watch deltas the way
 * the real data plane does - one row at a time, newest at the bottom, oldest
 * falling off the top (FIFO, ~8 visible). Paced with jitter so it feels like a
 * cluster, not a ticker. The loop pauses when the card scrolls out of view, and
 * reduced-motion viewers get a static block of rows instead. Decorative
 * (aria-hidden), but the header carries a real live status label.
 *
 * The terminal is intentionally dark in BOTH themes - a terminal is a terminal.
 */
import {useEffect, useRef, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import {StatusLabel} from '@/components/primitives';
import {useInView} from '@/lib/use-in-view';

type Verb = 'ADDED' | 'MODIFIED' | 'DELETED';
type Delta = {verb: Verb; object: string; note: string};

const VERB_COLOR: Record<Verb, string> = {
  ADDED: 'text-live',
  MODIFIED: 'text-[#85a8f1]',
  DELETED: 'text-[#e0526e]',
};

// Realistic deltas across the product's demo namespaces.
const FEED: Delta[] = [
  {verb: 'MODIFIED', object: 'clustrail-demo/pod/web-6f9dd', note: 'Ready 2/2'},
  {verb: 'ADDED', object: 'team-a/pod/worker-batch-x2vqn', note: 'Pending -> Running'},
  {verb: 'MODIFIED', object: 'clustrail-demo/deploy/frontend', note: '12/12 available'},
  {verb: 'DELETED', object: 'team-a/pod/canary-6b8f4', note: 'scaled down'},
  {verb: 'MODIFIED', object: 'kube-system/pod/coredns-5d78', note: 'Ready 1/1'},
  {verb: 'ADDED', object: 'clustrail-demo/pod/checkout-api-77bd', note: 'ContainerCreating'},
  {verb: 'MODIFIED', object: 'team-a/statefulset/redis', note: '3/3 ready'},
  {verb: 'MODIFIED', object: 'kube-system/node/worker-3', note: 'cpu 41% mem 58%'},
  {verb: 'ADDED', object: 'clustrail-demo/pod/ingest-9f2ka', note: 'Pending -> Running'},
  {verb: 'DELETED', object: 'team-a/job/backfill-2xk', note: 'Completed'},
  {verb: 'MODIFIED', object: 'clustrail-demo/pod/web-6f9dd', note: 'restart 0 -> 1'},
  {verb: 'ADDED', object: 'kube-system/pod/metrics-server-6c', note: 'Ready 1/1'},
];

const MAX_ROWS = 8;

function jitter(): number {
  return 600 + Math.random() * 500; // 600-1100ms
}

function Row({d, dim}: {d: Delta; dim: boolean}): ReactNode {
  return (
    <li
      className={clsx(
        'flex min-w-0 items-baseline gap-2 whitespace-nowrap transition-opacity',
        dim ? 'opacity-70' : 'opacity-100',
      )}>
      <span className={clsx('w-[4.75rem] shrink-0', VERB_COLOR[d.verb])}>{d.verb}</span>
      <span className="truncate text-white/90">{d.object}</span>
      <span className="hidden truncate text-white/45 sm:inline">{d.note}</span>
    </li>
  );
}

export default function WatchStream({className}: {className?: string}): ReactNode {
  const [ref, inView] = useInView<HTMLDivElement>({once: false, threshold: 0.25});
  const [rows, setRows] = useState<Delta[]>(() => FEED.slice(0, MAX_ROWS));
  const cursor = useRef(MAX_ROWS % FEED.length);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (!inView || reduced.current) return;
    let timeout: ReturnType<typeof setTimeout>;
    const push = () => {
      setRows((prev) => {
        const next = FEED[cursor.current % FEED.length];
        cursor.current += 1;
        return [...prev.slice(-(MAX_ROWS - 1)), next];
      });
      timeout = setTimeout(push, jitter());
    };
    timeout = setTimeout(push, jitter());
    return () => clearTimeout(timeout);
  }, [inView]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={clsx(
        'flex select-none flex-col overflow-hidden rounded-xl border border-border bg-[oklch(0.145_0_0)]',
        className,
      )}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="font-mono text-xs text-white/50">ws://localhost:8080/ws</span>
        <StatusLabel live className="text-white/70">
          WATCH_CONNECTED
        </StatusLabel>
      </div>
      <ul className="m-0 flex min-h-[15rem] list-none flex-col justify-end gap-1.5 p-4 font-mono text-xs leading-relaxed">
        {rows.map((d, i) => (
          <Row key={`${cursor.current}-${i}`} d={d} dim={i < rows.length - 4} />
        ))}
        <li className="flex items-center gap-1 pt-0.5">
          <span className="text-live">$</span>
          <span
            aria-hidden
            className="inline-block h-[1.05em] w-[0.5ch] translate-y-[0.12em] animate-caret bg-white/70"
          />
        </li>
      </ul>
    </div>
  );
}
