import type {ReactNode} from 'react';
import clsx from 'clsx';

/**
 * The signature motif: a frozen slice of the product's actual data plane -
 * watch deltas arriving over the multiplexed WebSocket. Newest row is
 * brightest, older rows fall away; the header dot pulses like the app's
 * connection indicator. Decorative (aria-hidden), so screen readers skip it.
 */

const EVENTS: Array<{verb: 'ADDED' | 'MODIFIED' | 'DELETED'; object: string; note: string}> = [
  {verb: 'MODIFIED', object: 'pod/checkout-api-7f9cd', note: 'Ready 2/2'},
  {verb: 'ADDED', object: 'pod/worker-batch-x2vqn', note: 'Pending -> Running'},
  {verb: 'MODIFIED', object: 'deploy/frontend', note: '12/12 available'},
  {verb: 'DELETED', object: 'pod/canary-6b8f4', note: 'scaled down'},
  {verb: 'MODIFIED', object: 'node/worker-3', note: 'cpu 41% · mem 58%'},
];

const VERB_COLOR: Record<string, string> = {
  ADDED: 'text-live',
  MODIFIED: 'text-link',
  DELETED: 'text-destructive/80',
};

export default function WatchStream({className}: {className?: string}): ReactNode {
  return (
    <div
      aria-hidden
      className={clsx(
        'overflow-hidden rounded-xl border border-border bg-background select-none',
        className,
      )}>
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="font-mono text-xs text-muted-foreground">
          ws://localhost:8080/ws
        </span>
        <span className="flex items-center gap-1.5 font-mono text-2xs uppercase tracking-widest text-live">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-live" />
          </span>
          live
        </span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-4 font-mono text-xs leading-relaxed">
        {EVENTS.map((e, i) => (
          <li
            key={e.object}
            className="flex min-w-0 items-baseline gap-2 whitespace-nowrap"
            // Newest first and brightest; history dims with age.
            style={{opacity: 1 - i * 0.17}}>
            <span className={clsx('w-[4.5rem] shrink-0', VERB_COLOR[e.verb])}>{e.verb}</span>
            <span className="truncate text-foreground/90">{e.object}</span>
            <span className="hidden truncate text-muted-foreground sm:inline">{e.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
