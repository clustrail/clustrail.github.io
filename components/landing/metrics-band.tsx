import type {CSSProperties, ReactNode} from 'react';
import {SectionHeader} from '@/components/primitives';
import {StatTile} from '@/components/stat-tile';
import {RevealSection} from '@/components/landing/reveal-section';

/**
 * 02 PERFORMANCE. A split band: the claim on the left, the receipts on the
 * right as a 2x2 hairline-celled instrument panel. Every number is measured
 * (counted up on first view); each cell states its honest condition, and the
 * cells with a CI budget say so explicitly - the story is the headroom, not
 * the adjective.
 */

type Cell = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix: string;
  label: string;
  sublabel: string;
  /** The CI gate this figure is held to, when one exists. */
  budget?: string;
};

const CELLS: Cell[] = [
  {
    value: 8,
    prefix: '<',
    suffix: 'ms',
    label: 'watch delta to screen',
    sublabel: '10,000-row table',
    budget: 'CI gate · 8 ms',
  },
  {
    value: 1.5,
    decimals: 1,
    suffix: 'ms',
    label: 'subscribe to snapshot',
    sublabel: 'warm informer cache',
  },
  {
    value: 60,
    suffix: 'fps',
    label: '10,000-row tables',
    sublabel: 'only visible rows in the DOM',
    budget: 'CI gate · 16 ms/frame',
  },
  {
    value: 49,
    suffix: 'MB',
    label: 'backend idle RSS',
    sublabel: 'one cluster, core resources',
    budget: 'CI gate · 80 MB',
  },
];

export function MetricsBand(): ReactNode {
  return (
    <RevealSection className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-20">
          {/* The claim. */}
          <div className="reveal flex flex-col gap-6 lg:sticky lg:top-28">
            <SectionHeader
              kicker="Performance"
              title="Numbers, not adjectives"
              lede="Every figure here is measured, not marketed. The budgets are hard acceptance criteria: a change that ships over one is not done."
              align="left"
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Measured on a local three-node kind cluster - the same one the project develops
              against, so the numbers are reproducible, not lab-tuned.
            </p>
          </div>

          {/* The receipts: a 2x2 instrument panel. */}
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            {CELLS.map((c, i) => (
              <div
                key={c.label}
                className="reveal flex flex-col justify-between gap-8 bg-card p-6 sm:p-8"
                style={{'--reveal-delay': `${i * 70}ms`} as CSSProperties}>
                <StatTile
                  value={c.value}
                  decimals={c.decimals}
                  prefix={c.prefix}
                  suffix={c.suffix}
                  label={c.label}
                  sublabel={c.sublabel}
                />
                <span className="text-xs text-muted-foreground">
                  {c.budget ?? 'measured, no gate'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
