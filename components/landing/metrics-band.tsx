import type {CSSProperties, ReactNode} from 'react';
import {SectionHeader} from '@/components/primitives';
import {StatTile} from '@/components/stat-tile';
import {RevealSection} from '@/components/landing/reveal-section';

/**
 * 02 PERFORMANCE. Real measured numbers, counted up on first view - no
 * adjectives. Each tile states its honest condition in the sub-label; the
 * footnote records where the numbers came from.
 */

type Tile = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix: string;
  label: string;
  sublabel: string;
};

const TILES: Tile[] = [
  {value: 175, suffix: 'KB', label: 'initial JS, gzipped', sublabel: 'tracked, not capped'},
  {value: 8, prefix: '<', suffix: 'ms', label: 'watch delta to screen', sublabel: '10,000-row table'},
  {value: 1.5, decimals: 1, suffix: 'ms', label: 'subscribe to snapshot', sublabel: 'warm informer cache'},
  {value: 49, suffix: 'MB', label: 'backend idle RSS', sublabel: 'budget 80 MB'},
  {value: 63, suffix: 'MB', label: 'one static binary', sublabel: 'SPA embedded, no database'},
];

export function MetricsBand(): ReactNode {
  return (
    <RevealSection className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          kicker="Performance"
          title="Numbers, not adjectives"
          lede="Every figure below is measured, not marketed. Runtime budgets are hard acceptance criteria; bundle and binary size are tracked, not capped."
        />

        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {TILES.map((t, i) => (
            <div
              key={t.label}
              className="reveal"
              style={{'--reveal-delay': `${i * 70}ms`} as CSSProperties}>
              <StatTile
                value={t.value}
                decimals={t.decimals}
                prefix={t.prefix}
                suffix={t.suffix}
                label={t.label}
                sublabel={t.sublabel}
              />
            </div>
          ))}
        </div>

        <p className="mt-12 text-sm text-muted-foreground">Measured on a local kind cluster.</p>
      </div>
    </RevealSection>
  );
}
