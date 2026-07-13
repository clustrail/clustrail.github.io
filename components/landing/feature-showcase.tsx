'use client';

import type {ReactNode} from 'react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {BrowserFrame, SectionHeader} from '@/components/primitives';
import {RevealSection} from '@/components/landing/reveal-section';

/**
 * 05 SURFACE. The product surface, one tab per view. A vertical tab rail on the
 * left (each trigger carries a one-line description), the live screenshot on the
 * right; stacked on mobile. A small client island - only the tab state is
 * interactive.
 */

type Feature = {
  id: string;
  label: string;
  desc: string;
  shot: string;
  url: string;
};

const FEATURES: Feature[] = [
  {
    id: 'overview',
    label: 'Overview',
    desc: 'Nodes, capacity and problem pods at a glance.',
    shot: '/shots/overview.png',
    url: 'localhost:8080/clusters/kind-clustrail/overview',
  },
  {
    id: 'resources',
    label: 'Resource browser',
    desc: 'Every type, thousands of rows, only the visible ones in the DOM.',
    shot: '/shots/pods.png',
    url: 'localhost:8080/clusters/kind-clustrail/pods',
  },
  {
    id: 'logs',
    label: 'Logs',
    desc: 'Follow multi-pod logs in real time, filtered as you type.',
    shot: '/shots/logs.png',
    url: 'localhost:8080/clusters/kind-clustrail/logs',
  },
  {
    id: 'events',
    label: 'Events',
    desc: 'A live, color-coded timeline of what the cluster is doing.',
    shot: '/shots/events.png',
    url: 'localhost:8080/clusters/kind-clustrail/events',
  },
  {
    id: 'topology',
    label: 'Topology',
    desc: 'How workloads, services and config connect across a namespace.',
    shot: '/shots/topology.png',
    url: 'localhost:8080/clusters/kind-clustrail/topology',
  },
  {
    id: 'metrics',
    label: 'Metrics',
    desc: 'CPU and memory joined to requests and limits, polled at ~12s.',
    shot: '/shots/metrics.png',
    url: 'localhost:8080/clusters/kind-clustrail/metrics',
  },
  {
    id: 'detail',
    label: 'Detail workspace',
    desc: 'Open any resource beside the list - YAML, events, logs, exec.',
    shot: '/shots/detail.png',
    url: 'localhost:8080/clusters/kind-clustrail/pods',
  },
];

export default function FeatureShowcase(): ReactNode {
  return (
    <RevealSection className="border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          index="04"
          kicker="Surface"
          title="Everything in one fast pane"
          lede="Live watch data, virtualized tables, a split-pane workspace with YAML, logs, events, topology and metrics."
        />

        <Tabs
          defaultValue={FEATURES[0].id}
          orientation="vertical"
          className="reveal mt-12 flex flex-col gap-8 lg:flex-row lg:gap-10">
          <TabsList
            variant="line"
            className="h-fit w-full shrink-0 flex-col gap-1 bg-transparent p-0 lg:w-[22rem]">
            {FEATURES.map((f) => (
              <TabsTrigger
                key={f.id}
                value={f.id}
                className="h-auto w-full flex-none flex-col items-start gap-1 whitespace-normal rounded-lg border border-transparent p-3 text-left data-active:border-border data-active:bg-card">
                <span className="block text-sm font-semibold text-foreground">{f.label}</span>
                <span className="block text-2xs leading-relaxed text-muted-foreground">
                  {f.desc}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-w-0 flex-1">
            {FEATURES.map((f) => (
              <TabsContent key={f.id} value={f.id} className="mt-0">
                <BrowserFrame src={f.shot} alt={f.label} url={f.url} />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </RevealSection>
  );
}
