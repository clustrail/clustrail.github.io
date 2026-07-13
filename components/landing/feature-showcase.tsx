import type {CSSProperties, ReactNode} from 'react';
import clsx from 'clsx';
import {RevealSection} from '@/components/landing/reveal-section';
import {ThemedShot} from '@/components/primitives';

/*
 * Features bento. An asymmetric grid of soft cards: accent title, one-line
 * description, and a raw product screenshot bleeding off the card's bottom-right
 * edge (cropped by the card's overflow-hidden, anchored top-left so each card
 * reads as a window into the app). One tall card spans two rows, one wide card
 * spans two columns. Pure RSC - no state.
 */

type Feature = {
  title: string;
  desc: string;
  /** /shots path stem; ThemedShot appends -dark/-light. */
  shot: string;
  alt: string;
  span?: 'tall' | 'wide';
};

const FEATURES: Feature[] = [
  {
    title: 'Cluster overview',
    desc: 'Health, capacity, and activity for the whole cluster on one screen.',
    shot: '/shots/overview',
    alt: 'Cluster overview screen with health, capacity and activity panels',
  },
  {
    title: 'Every resource, live',
    desc: 'Virtualized tables stream watch deltas: 10,000 rows at 60 fps.',
    shot: '/shots/pods',
    alt: 'Virtualized pods table streaming live watch updates',
  },
  {
    title: 'An IDE-style workspace',
    desc: 'Panes, tabs, YAML with diff, exec and logs that survive navigation.',
    shot: '/shots/detail',
    alt: 'Detail workspace with split panes, YAML editor and tabs',
    span: 'tall',
  },
  {
    title: 'Logs across workloads',
    desc: 'One stream aggregating every pod, live, with search.',
    shot: '/shots/logs',
    alt: 'Aggregated live log stream across multiple pods',
  },
  {
    title: 'Events as they happen',
    desc: 'A live timeline instead of kubectl get events.',
    shot: '/shots/events',
    alt: 'Live timeline of cluster events',
  },
  {
    title: 'The cluster as a graph',
    desc: 'Ownership and traffic relationships, laid out live.',
    shot: '/shots/topology',
    alt: 'Topology graph of workloads, services and config',
    span: 'wide',
  },
  {
    title: 'Usage joined to requests',
    desc: 'CPU and memory against what you asked for.',
    shot: '/shots/metrics',
    alt: 'CPU and memory usage charts joined to requests and limits',
  },
];

function FeatureCard({feature, index}: {feature: Feature; index: number}): ReactNode {
  return (
    <div
      className={clsx(
        'reveal group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-sm transition-colors hover:border-border',
        feature.span === 'tall' && 'md:row-span-2',
        feature.span === 'wide' && 'md:col-span-2',
      )}
      style={{'--reveal-delay': `${index * 70}ms`} as CSSProperties}>
      <h3 className="text-base font-semibold text-primary">{feature.title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
      <div
        className={clsx(
          '-mr-10 -mb-10 mt-6 min-h-0 overflow-hidden rounded-tl-xl border border-border/60 transition-transform group-hover:-translate-y-0.5',
          feature.span ? 'aspect-[16/10] md:aspect-auto md:flex-1' : 'aspect-[16/10]',
        )}>
        {/* Tall and wide cards render the image larger on desktop, so their
            `sizes` hint is roughly doubled. */}
        <ThemedShot
          stem={feature.shot}
          alt={feature.alt}
          sizes={feature.span ? '(max-width: 768px) 100vw, 820px' : '(max-width: 768px) 100vw, 420px'}
          className="block h-full w-full object-cover object-left-top"
        />
      </div>
    </div>
  );
}

export default function FeatureShowcase(): ReactNode {
  return (
    <RevealSection className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="reveal flex flex-col items-center text-center">
          <span className="text-sm font-semibold text-primary">Features</span>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything your cluster is doing, on one surface
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Live watch data, virtualized tables, and a workspace that keeps YAML, logs, events,
            topology and metrics one click apart.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.shot} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
