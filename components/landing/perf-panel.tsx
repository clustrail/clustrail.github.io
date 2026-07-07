import type {ReactNode} from 'react';
import {CtaButton} from '@/components/primitives';
import WatchStream from '@/components/landing/watch-stream';

/**
 * The performance story in one panel: the watch-based data plane (shown as a
 * live delta stream, the product's signature) beside the pitch, with the
 * CI-enforced budgets laid out like a spec sheet below. The budgets are the
 * product's real acceptance gates, not marketing numbers - the caption says
 * so.
 */

const BUDGETS: Array<{label: string; value: string; detail: string}> = [
  {
    label: 'Initial JS bundle',
    value: '< 350 KB',
    detail: 'gzipped, heavy views lazy-loaded',
  },
  {
    label: '10,000-row table',
    value: '< 16 ms',
    detail: 'per frame, only visible rows in the DOM',
  },
  {
    label: 'Watch delta to screen',
    value: '< 8 ms',
    detail: 'applied to a visible list',
  },
  {
    label: 'Backend idle memory',
    value: '< 80 MB',
    detail: 'RSS, one cluster watching core resources',
  },
];

export default function PerfPanel(): ReactNode {
  return (
    <section className="pb-20 sm:pb-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-xl border border-border bg-background px-6 py-14 sm:px-12 sm:py-16">
          {/* Faint brand glow rising from the panel's top edge. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_50%_100%_at_50%_0%,rgba(50,108,229,0.12),transparent)]"
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div className="flex flex-col items-start">
              <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-link">
                Performance
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Watch at lightspeed.
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                No polling, ever. Informers keep a warm cache next to each API server, and one
                multiplexed WebSocket streams only the deltas into a virtualized UI.
              </p>
              <CtaButton to="/docs" variant="primary" className="mt-8">
                Learn more
              </CtaButton>
            </div>

            <WatchStream />
          </div>

          {/* The spec sheet: CI-enforced budgets, mono values on the right. */}
          <div className="relative mt-12 rounded-lg border border-border bg-card/50 p-6 sm:p-8">
            <p className="font-mono text-xs text-muted-foreground">
              Performance budgets, enforced as CI gates on every change.
            </p>
            <ul className="mt-6 grid list-none gap-x-12 gap-y-5 p-0 sm:grid-cols-2">
              {BUDGETS.map((b) => (
                <li key={b.label} className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-3">
                    <span className="shrink-0 text-sm font-medium text-foreground">{b.label}</span>
                    <span
                      aria-hidden
                      className="min-w-4 flex-1 border-b border-dotted border-muted-foreground/40"
                    />
                    <span className="shrink-0 font-mono text-sm font-semibold text-link">
                      {b.value}
                    </span>
                  </div>
                  <span className="font-mono text-2xs text-muted-foreground">{b.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
