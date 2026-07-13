import type {ReactNode} from 'react';
import {SectionHeader} from '@/components/primitives';
import {RevealSection} from '@/components/landing/reveal-section';
import WatchStream from '@/components/landing/watch-stream';

/**
 * 04 DELTAS_ONLY. The watch-vs-poll story: prose on the left, the live delta
 * terminal on the right, and a dotted-leader spec sheet pairing each CI budget
 * against the measured result below.
 */

const SPECS: Array<{label: string; budget: string; measured: string}> = [
  {label: 'Initial JS', budget: 'tracked, not capped', measured: 'measured 175 KB'},
  {label: 'Delta apply', budget: 'budget 8 ms', measured: 'hit'},
  {label: '10k rows', budget: '60 fps', measured: 'only visible rows in the DOM'},
  {label: 'Idle RSS', budget: 'budget 80 MB', measured: 'measured 49 MB'},
];

export function WatchSection(): ReactNode {
  return (
    <RevealSection className="border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          index="03"
          kicker="Deltas_only"
          title="Subscribe once, apply deltas"
          align="left"
        />

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <div className="reveal flex flex-col gap-5">
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Most dashboards poll: they re-list the whole cluster on a timer, burn the API server,
              and still show you stale rows between ticks. Clustrail does the opposite.
            </p>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              A shared informer keeps a warm cache next to each API server. The browser subscribes
              once over a single multiplexed WebSocket, and from then on only the deltas flow -
              ADDED, MODIFIED, DELETED - straight into a normalized store and a virtualized table.
              Nothing re-lists. Nothing polls.
            </p>
          </div>

          <WatchStream className="reveal" />
        </div>

        {/* Spec sheet: budget vs measured, dotted leaders. */}
        <div className="reveal mt-14 rounded-xl border border-border bg-card/50 p-6 sm:p-8">
          <ul className="grid list-none gap-x-12 gap-y-5 p-0 sm:grid-cols-2">
            {SPECS.map((s) => (
              <li key={s.label} className="flex items-baseline gap-3">
                <span className="shrink-0 text-sm font-medium text-foreground">{s.label}</span>
                <span
                  aria-hidden
                  className="min-w-4 flex-1 self-center border-b border-dotted border-muted-foreground/40"
                />
                <span className="shrink-0 font-mono text-2xs uppercase tracking-[0.12em] text-muted-foreground">
                  {s.budget}
                </span>
                <span className="shrink-0 font-mono text-2xs font-semibold uppercase tracking-[0.12em] text-link">
                  {s.measured}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </RevealSection>
  );
}
