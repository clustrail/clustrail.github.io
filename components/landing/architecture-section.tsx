import type {CSSProperties, ReactNode} from 'react';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {SectionHeader} from '@/components/primitives';
import {RevealSection} from '@/components/landing/reveal-section';
import {ArchitectureDiagram} from '@/components/architecture/architecture-diagram';

/**
 * 03 ARCHITECTURE. The data-plane diagram (owned by the architecture module,
 * landing variant) over the eight load-bearing decisions - the same ones in
 * docs/ARCHITECTURE.md - as a numbered mono list.
 */

const DECISIONS: Array<{title: string; gloss: string}> = [
  {
    title: 'One WebSocket, many subscriptions',
    gloss: 'The browser opens exactly one /ws; every list and detail view multiplexes over it by subscription key.',
  },
  {
    title: 'Server is the cache, client is a projection',
    gloss: 'Informers hold the authoritative watch cache in-process; the browser mirrors only what is subscribed.',
  },
  {
    title: 'Watch, never poll',
    gloss: 'Lists and anything live stream as deltas over the socket; nothing re-lists on a timer.',
  },
  {
    title: 'Cluster is a key, never an assumption',
    gloss: 'Every entity, request and cache row is keyed by cluster, sanitized into a collision-safe ID.',
  },
  {
    title: 'RBAC is never in our code',
    gloss: 'The backend proxies with your own credentials; the API server enforces every permission upstream.',
  },
  {
    title: 'One generic resource path',
    gloss: 'Resources are declared in a registry of GVR plus columns, so one dynamic path serves them all.',
  },
  {
    title: 'Single static binary',
    gloss: 'The built SPA is embedded via go:embed into one binary, with no external assets to ship.',
  },
  {
    title: 'No database',
    gloss: 'State is the kubeconfig and in-memory caches, rebuilt from each API server on startup.',
  },
];

export function ArchitectureSection(): ReactNode {
  return (
    <RevealSection className="border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          index="03"
          kicker="Architecture"
          title="Eight decisions, one data plane"
          lede="The load-bearing choices that make Clustrail fast and small - each spanning multiple packages, none negotiable."
        />

        <div className="reveal mt-14">
          <ArchitectureDiagram variant="landing" />
        </div>

        <ol className="mt-14 grid list-none gap-x-10 gap-y-6 p-0 md:grid-cols-2">
          {DECISIONS.map((d, i) => (
            <li
              key={d.title}
              className="reveal flex gap-4"
              style={{'--reveal-delay': `${(i % 2) * 60}ms`} as CSSProperties}>
              <span className="shrink-0 font-mono text-sm font-medium text-link tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{d.title}</span>
                <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">
                  {d.gloss}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-12">
          <Link
            href="/architecture"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-link transition-colors hover:underline">
            Read the full architecture
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </RevealSection>
  );
}
