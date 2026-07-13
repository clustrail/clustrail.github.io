'use client';

/*
 * ArchitectureDiagram: the site's centerpiece. Four tiers stacked top-to-bottom
 * with the browser at the top (what you see) and your clusters at the bottom
 * (where truth lives). Data flows UPWARD - delta packets rise from the API
 * servers, through the warm informer cache and the gateway, to the browser -
 * which is exactly the story: deltas rise to the user, no polling.
 *
 * This is a client island for three reasons only: an in-view gate (so nothing
 * animates off-screen), reduced-motion handling (packets vanish, connectors go
 * dashed and static), and tier selection (hover/click/focus swaps the adjacent
 * explainer). Everything else is static markup.
 */

import {useEffect, useState, Fragment} from 'react';
import type {ReactNode} from 'react';
import clsx from 'clsx';
import {useInView} from '@/lib/use-in-view';

type Variant = 'landing' | 'full';

interface Tier {
  id: string;
  name: string;
  /** A quiet trailing qualifier on the tier name, e.g. "one static binary". */
  tag?: string;
  annotations: string[];
  /** The product tier gets a faint primary ring. */
  emphasized?: boolean;
  blurb: string;
}

/* Top-to-bottom: browser down to clusters. Packets travel the other way. */
const TIERS: Tier[] = [
  {
    id: 'browser',
    name: 'Browser SPA',
    annotations: ['normalized store', 'virtualized tables', 'only visible rows'],
    blurb:
      'The SPA keeps a thin normalized store and renders only the rows in view, so a 10,000-row list never puts 10,000 nodes in the DOM. It applies each streamed delta as a patch, landing a change on screen in under 8 milliseconds.',
  },
  {
    id: 'gateway',
    name: 'Go gateway',
    tag: 'one static binary',
    annotations: ['embedded SPA', 'authenticating proxy'],
    emphasized: true,
    blurb:
      'One Go binary with the React SPA embedded via go:embed. It serves the UI and acts as an authenticating reverse proxy, multiplexing every list and detail view over a single WebSocket. It never holds privileges beyond your own per-cluster credentials.',
  },
  {
    id: 'cache',
    name: 'In-process informer cache',
    annotations: ['warm per-cluster cache', 'managedFields stripped'],
    blurb:
      'Per cluster, dynamic shared informers keep an authoritative watch cache warm in process. A SetTransform strips managedFields before anything is cached, and idle informers stop, so backend memory stays small.',
  },
  {
    id: 'apiservers',
    name: "Your clusters' apiservers",
    annotations: ['multi-cluster', 'your credentials', 'RBAC decides'],
    blurb:
      'Your real Kubernetes API servers, one or many. The gateway lists and proxies with your own credentials, so the API server itself enforces RBAC. There is no privileged see-everything token anywhere in the path.',
  },
];

/* Connector labels, one between each pair, read top-to-bottom. The flow they
   carry runs upward (clusters -> browser). */
const CONNECTORS = [
  'one multiplexed WebSocket - deltas only',
  'snapshots + deltas',
  'watch (client-go shared informers)',
];

/* The connector strip is w-6 (24px); the line and packet path share its
   centre. Heights differ by variant so the full-page figure reads larger. */
const LINE_X = 12;
const CONNECTOR_H: Record<Variant, number> = {landing: 56, full: 76};
const PACKET_COUNT = 3;
const PACKET_STAGGER_MS = 860;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = (): void => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduced;
}

function TierBox({
  tier,
  index,
  selected,
  animate,
  onSelect,
}: {
  tier: Tier;
  index: number;
  selected: boolean;
  animate: boolean;
  onSelect: () => void;
}): ReactNode {
  return (
    <button
      type="button"
      onMouseEnter={onSelect}
      onFocus={onSelect}
      onClick={onSelect}
      aria-pressed={selected}
      className={clsx(
        'group/tier relative w-full rounded-lg border bg-card px-4 py-3 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        tier.emphasized && 'ring-1 ring-primary/30',
        selected
          ? 'border-primary/50'
          : 'border-border hover:border-primary/40',
      )}>
      {/* Hairline glow pulse as packets land - on an overlay so it never
          fights the emphasized tier's ring (both are box-shadows). */}
      {animate && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg animate-tier-pulse"
          style={{animationDelay: `${index * (PACKET_STAGGER_MS / 2)}ms`}}
        />
      )}
      <span className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-mono text-sm font-medium text-foreground">{tier.name}</span>
        {tier.tag && (
          <span className="font-mono text-2xs text-muted-foreground">- {tier.tag}</span>
        )}
      </span>
      <span className="mt-1 block font-mono text-2xs leading-relaxed text-muted-foreground">
        {tier.annotations.join('  ·  ')}
      </span>
    </button>
  );
}

function Connector({
  label,
  height,
  animate,
  reduced,
}: {
  label: string;
  height: number;
  animate: boolean;
  reduced: boolean;
}): ReactNode {
  return (
    <div className="flex items-stretch gap-3" style={{height}} aria-hidden>
      <div className="relative w-6 shrink-0">
        {/* The connector line: a solid hairline normally, a static dashed line
            under reduced motion (no packets ever render there). */}
        <div
          className={clsx(
            'absolute inset-y-0 left-1/2 -translate-x-1/2',
            reduced ? 'border-l border-dashed border-border' : 'w-px bg-border',
          )}
        />
        {!reduced &&
          Array.from({length: PACKET_COUNT}).map((_, n) => (
            <span
              key={n}
              className="absolute left-0 top-0 size-1.5 rounded-full bg-primary shadow-[0_0_6px] shadow-primary/60 animate-packet"
              style={
                {
                  // Path runs bottom -> top so the packet rises (clusters -> browser).
                  offsetPath: `path('M ${LINE_X} ${height} L ${LINE_X} 0')`,
                  animationDelay: `${n * PACKET_STAGGER_MS}ms`,
                  animationPlayState: animate ? 'running' : 'paused',
                } as React.CSSProperties
              }
            />
          ))}
      </div>
      <span className="self-center font-mono text-2xs text-muted-foreground">{label}</span>
    </div>
  );
}

function Explainer({tier, className}: {tier: Tier; className?: string}): ReactNode {
  return (
    <div
      aria-live="polite"
      className={clsx('rounded-lg border border-border bg-card/50 p-4 sm:p-5', className)}>
      <span className="font-mono text-2xs font-medium uppercase tracking-[0.16em] text-link">
        {tier.name}
      </span>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tier.blurb}</p>
    </div>
  );
}

function Diagram({
  variant,
  selectedId,
  onSelect,
  animate,
  reduced,
  figureRef,
}: {
  variant: Variant;
  selectedId: string;
  onSelect: (id: string) => void;
  animate: boolean;
  reduced: boolean;
  figureRef: React.RefObject<HTMLElement | null>;
}): ReactNode {
  const height = CONNECTOR_H[variant];
  return (
    <figure
      ref={figureRef}
      className={clsx('m-0', variant === 'landing' ? 'mx-auto max-w-md' : 'max-w-lg')}>
      <figcaption className="sr-only">
        Clustrail data plane, top to bottom: the browser SPA, the Go gateway, the in-process
        informer cache, and your clusters&apos; API servers. Snapshots and watch deltas flow
        upward from the API servers to the browser over a single multiplexed WebSocket - the
        gateway never holds privileges beyond your own credentials, so Kubernetes enforces RBAC.
      </figcaption>

      <div className="flex flex-col">
        {TIERS.map((tier, i) => (
          <Fragment key={tier.id}>
            <TierBox
              tier={tier}
              index={i}
              selected={selectedId === tier.id}
              animate={animate}
              onSelect={() => onSelect(tier.id)}
            />
            {i < TIERS.length - 1 && (
              <Connector
                label={CONNECTORS[i]}
                height={height}
                animate={animate}
                reduced={reduced}
              />
            )}
          </Fragment>
        ))}
      </div>

      <p className="mt-6 font-mono text-2xs leading-relaxed text-muted-foreground/80">
        The one exception: metrics.k8s.io has no watch verb, so CPU/RAM is the single short-TTL
        poll.
      </p>
    </figure>
  );
}

export function ArchitectureDiagram({variant}: {variant: 'landing' | 'full'}): ReactNode {
  // full preselects the first tier; landing highlights the product (gateway).
  const [selectedId, setSelectedId] = useState(
    variant === 'full' ? TIERS[0].id : 'gateway',
  );
  const reduced = usePrefersReducedMotion();
  // Track continuously so packets pause off-screen; once:false toggles both ways.
  const [figureRef, inView] = useInView<HTMLElement>({once: false, threshold: 0.25});
  const animate = inView && !reduced;

  const selected = TIERS.find((t) => t.id === selectedId) ?? TIERS[0];

  const diagram = (
    <Diagram
      variant={variant}
      selectedId={selectedId}
      onSelect={setSelectedId}
      animate={animate}
      reduced={reduced}
      figureRef={figureRef}
    />
  );

  if (variant === 'full') {
    return (
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {diagram}
        <Explainer tier={selected} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {diagram}
      <Explainer tier={selected} className="mx-auto max-w-md text-left" />
    </div>
  );
}
