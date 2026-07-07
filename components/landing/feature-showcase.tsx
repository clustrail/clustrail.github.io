'use client';

import {useState, type ReactNode} from 'react';
import clsx from 'clsx';
import {
  Activity,
  Columns2,
  LayoutDashboard,
  ScrollText,
  Share2,
  Table2,
  type LucideIcon,
} from 'lucide-react';
import {BrowserFrame, SectionHeader} from '@/components/primitives';

type Feature = {
  id: string;
  icon: LucideIcon;
  title: string;
  blurb: string;
  shot: string;
  url: string;
};

const FEATURES: Feature[] = [
  {
    id: 'overview',
    icon: LayoutDashboard,
    title: 'Cluster overview',
    blurb: 'Nodes, capacity, workload health and problem pods at a glance.',
    shot: '/shots/overview.png',
    url: 'localhost:8080/clusters/kind-clustrail/overview',
  },
  {
    id: 'topology',
    icon: Share2,
    title: 'Topology graph',
    blurb: 'See how workloads, services and config connect across a namespace.',
    shot: '/shots/topology.png',
    url: 'localhost:8080/clusters/kind-clustrail/topology',
  },
  {
    id: 'resources',
    icon: Table2,
    title: 'Virtualized tables',
    blurb: 'Every resource type, thousands of rows, only the visible ones in the DOM.',
    shot: '/shots/pods.png',
    url: 'localhost:8080/clusters/kind-clustrail/pods',
  },
  {
    id: 'workspace',
    icon: Columns2,
    title: 'Split-pane workspace',
    blurb:
      'Open any resource in a pane beside the list - overview, live YAML, events, logs and in-browser exec.',
    shot: '/shots/detail.png',
    url: 'localhost:8080/clusters/kind-clustrail/pods',
  },
  {
    id: 'logs',
    icon: ScrollText,
    title: 'Streaming logs',
    blurb: 'Follow multi-pod logs in real time, filtered by level, source and regex.',
    shot: '/shots/logs.png',
    url: 'localhost:8080/clusters/kind-clustrail/logs',
  },
  {
    id: 'events',
    icon: Activity,
    title: 'Events timeline',
    blurb: 'A live, color-coded timeline of what your cluster is doing right now.',
    shot: '/shots/events.png',
    url: 'localhost:8080/clusters/kind-clustrail/events',
  },
];

export default function FeatureShowcase(): ReactNode {
  const [activeId, setActiveId] = useState(FEATURES[0].id);
  const active = FEATURES.find((f) => f.id === activeId) ?? FEATURES[0];

  return (
    <section className="border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          kicker="Explore"
          title="Everything in one fast pane"
          lede="Live watch data, virtualized tables, a split-pane workspace with live YAML, streaming logs, events and topology."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-stretch">
          {/* Left: selectable feature tabs. On lg the column stretches to the
              screenshot's height and the tabs distribute to fill it. */}
          <div
            role="tablist"
            aria-label="Feature showcase"
            className="flex flex-col gap-2 lg:gap-0 lg:justify-between">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              const isActive = feature.id === active.id;
              return (
                <button
                  key={feature.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveId(feature.id)}
                  className={clsx(
                    'group flex w-full cursor-pointer items-start gap-3 rounded-md p-3 text-left transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
                    isActive
                      ? 'border border-border bg-card'
                      : 'border border-transparent text-muted-foreground hover:bg-white/5',
                  )}>
                  <span
                    className={clsx(
                      'flex size-8 shrink-0 items-center justify-center rounded-md transition-colors',
                      isActive ? 'bg-acid/15 text-acid' : 'bg-white/5 text-muted-foreground',
                    )}>
                    <Icon className="size-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={clsx(
                        'block font-display text-sm font-semibold',
                        isActive ? 'text-foreground' : 'text-foreground/80',
                      )}>
                      {feature.title}
                    </span>
                    <span className="mt-1 block text-2xs leading-relaxed text-muted-foreground">
                      {feature.blurb}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: active screenshot */}
          <div className="relative min-w-0">
            <BrowserFrame key={active.id} src={active.shot} alt={active.title} url={active.url} />
          </div>
        </div>
      </div>
    </section>
  );
}
