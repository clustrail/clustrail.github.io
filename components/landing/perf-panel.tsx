import type {ReactNode} from 'react';
import {CtaButton, DitherStrip} from '@/components/primitives';

/**
 * The astral "Lint at lightspeed" analog: one big panel carrying the
 * performance story, with the CI-enforced budgets laid out like a spec
 * sheet. These budgets are the product's real acceptance gates, not
 * marketing numbers - the caption says so.
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
        <div className="relative overflow-hidden rounded-xl bg-card px-6 py-16 sm:px-12 sm:py-20">
          {/* Acid dither strips pinned to the panel's top corners. */}
          <DitherStrip
            id="perf-tl"
            flip
            className="pointer-events-none absolute left-0 top-0 h-10 w-60 text-acid sm:h-12 sm:w-72"
          />
          <DitherStrip
            id="perf-tr"
            className="pointer-events-none absolute right-0 top-0 h-10 w-60 text-acid sm:h-12 sm:w-72"
          />

          <div className="relative flex flex-col items-center text-center">
            <span className="font-display text-xs font-medium uppercase tracking-[0.25em] text-acid">
              Performance
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Watch at lightspeed
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              No polling. One WebSocket streams live deltas from every cluster into a virtualized
              UI.
            </p>
            <CtaButton to="/docs" variant="acid" className="mt-8">
              Learn more
            </CtaButton>
          </div>

          {/* The spec sheet: CI-enforced budgets, mono values on the right. */}
          <div className="relative mx-auto mt-14 max-w-3xl rounded-lg border border-border bg-canvas/60 p-6 sm:p-8">
            <p className="font-mono text-xs text-muted-foreground">
              Performance budgets, enforced as CI gates on every change.
            </p>
            <ul className="mt-6 flex list-none flex-col gap-5 p-0">
              {BUDGETS.map((b) => (
                <li key={b.label} className="flex items-baseline gap-3">
                  <span className="shrink-0 font-display text-xs font-medium uppercase tracking-[0.12em] text-foreground">
                    {b.label}
                  </span>
                  <span
                    aria-hidden
                    className="min-w-4 flex-1 border-b border-dotted border-muted-foreground/40"
                  />
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-sm font-semibold text-acid">
                      {b.value}
                    </span>
                    <span className="mt-0.5 hidden font-mono text-2xs text-muted-foreground sm:block">
                      {b.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
