'use client';

/*
 * ArchitectureDiagram: the site's centerpiece, now a 3D isometric instrument.
 *
 * Four PLANES float in an isometric stack (rotateX(55deg) rotateZ(-45deg)),
 * separated along their shared normal (translateZ). The browser SPA is the TOP
 * plane, your clusters the BOTTOM: delta packets RISE through the stack, which
 * is exactly the story - deltas rise to the user, no polling.
 *
 * Two layers make it up:
 *   1. The 3D stack (preserve-3d): the planes and their tier labels. Labels are
 *      counter-rotated (rotateZ(45) rotateX(-55)) so they billboard flat to the
 *      camera - text never skews - while still lifted by the same translateZ as
 *      their plane, so each label tracks its plane exactly at any depth.
 *   2. A flat conduit overlay on TOP of the stack: the glowing data beam, the
 *      rising packets, and the connector captions. Kept out of the preserve-3d
 *      z-sort so it always paints in front of every plane (packets read as
 *      rising through the ports), and stays crisp with no skew.
 *
 * Below md the isometric scene needs more width than a phone has, so it falls
 * back (via pure CSS md: breakpoints, no JS branch) to the original flat
 * vertical stack, which stays legible at 375px. Only one of the two is ever in
 * the accessibility tree (display:none hides the other).
 *
 * Client island for: the in-view gate (loops pause off-screen), reduced-motion
 * handling (no float, no parallax, no assemble, static dashed beam, no
 * packets), pointer parallax, first-in-view assemble, and tier selection
 * (hover/focus/click swaps the adjacent aria-live explainer).
 */

import {useEffect, useRef, useState, Fragment} from 'react';
import type {ReactNode, CSSProperties} from 'react';
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

/* ---- isometric geometry ---------------------------------------------------
 * ISO_X/ISO_Z: the classic isometric orientation of the whole stack.
 * A billboarded child undoes it with rotateZ(-ISO_Z) rotateX(-ISO_X).
 * PROJ: how a unit of translateZ projects onto the screen's vertical axis
 * (sin of the tilt), used to place the flat conduit overlay to match the 3D
 * planes' on-screen heights. HALF_DIAG: a diamond's screen half-width as a
 * fraction of the pre-rotation side. */
const ISO_X = 55;
const ISO_Z = -45;
const PROJ = Math.sin((ISO_X * Math.PI) / 180);
const HALF_DIAG = 0.7071;

interface IsoConfig {
  /** Perspective distance on the scene. */
  perspective: number;
  /** Scene box height in px (the planes float within it). */
  sceneH: number;
  /** Pre-rotation square side of each plane. */
  side: number;
  /** translateZ between adjacent planes. */
  step: number;
  /** Horizontal position of the stack's pierce-line inside the scene. */
  originX: string;
  /** Extra gap between a plane's right vertex and its label. */
  gap: number;
  /** Leader hairline length from that vertex to the label block. */
  leader: number;
  /** Fixed width of every label block, so boxes read uniform and the
   *  annotation line wraps at a set width instead of shrink-wrapping to
   *  min-content inside the zero-width 3D anchor. */
  labelW: number;
  /** Max parallax tilt (deg) added to the isometric rotation on pointer move. */
  tilt: number;
}

const CONFIG: Record<Variant, IsoConfig> = {
  landing: {perspective: 1200, sceneH: 360, side: 124, step: 98, originX: '36%', gap: 30, leader: 22, labelW: 244, tilt: 5},
  full: {perspective: 1350, sceneH: 440, side: 152, step: 116, originX: '31%', gap: 34, leader: 26, labelW: 250, tilt: 6},
};

const PACKET_COUNT = 4;

/** z of a tier's plane, centered so the stack pivots about its middle. */
function tierZ(index: number, step: number): number {
  return ((TIERS.length - 1) / 2 - index) * step;
}

/** On-screen vertical offset (px, up is negative) of a translateZ level,
 *  used to line the flat conduit overlay up with the 3D planes. */
function screenY(z: number): number {
  return -z * PROJ;
}

/** Billboards a child (undoes the stack rotation) after lifting it to z, so
 *  labels face the camera unskewed. */
function billboard(z: number): string {
  return `translateZ(${z}px) rotateZ(${-ISO_Z}deg) rotateX(${-ISO_X}deg)`;
}

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

/* ---- scene-scoped keyframes ------------------------------------------------
 * Injected per variant with unique names so the two variants' packet runs
 * (which differ in travel distance) never collide. Plain <style> is fine in a
 * client island and survives static export. */
function sceneCss(variant: Variant, half: number): string {
  const rise = `iso-rise-${variant}`;
  return `
@keyframes ${rise} {
  0%   { transform: translate(-50%, -50%) translateY(${half}px); opacity: 0; }
  12%  { opacity: 1; }
  88%  { opacity: 1; }
  100% { transform: translate(-50%, -50%) translateY(${-half}px); opacity: 0; }
}
@keyframes iso-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}`;
}

/* ---- one isometric plane --------------------------------------------------- */
function Plane({
  tier,
  index,
  cfg,
  selected,
  settled,
  animate,
  onSelect,
}: {
  tier: Tier;
  index: number;
  cfg: IsoConfig;
  selected: boolean;
  settled: boolean;
  animate: boolean;
  onSelect: () => void;
}): ReactNode {
  const z = tierZ(index, cfg.step);
  return (
    <div
      aria-hidden
      className={clsx(
        'absolute left-1/2 top-1/2 rounded-xl border bg-card/85 bg-dotgrid',
        'transition-[transform,opacity] duration-500 ease-out',
        'shadow-[0_18px_30px_-14px_rgba(0,0,0,0.5)]',
        tier.emphasized ? 'ring-1 ring-primary/40' : '',
        selected ? 'border-primary/60' : 'border-border',
      )}
      style={{
        width: cfg.side,
        height: cfg.side,
        // Assemble: collapse to the mid-plane at opacity 0, then settle to z,
        // staggered top-to-bottom. Reduced motion renders settled instantly.
        transform: `translate(-50%, -50%) translateZ(${settled ? z : 0}px)`,
        opacity: settled ? 1 : 0,
        transitionDelay: settled ? `${index * 90}ms` : '0ms',
        transformStyle: 'preserve-3d',
      }}
      onClick={onSelect}>
      {/* The port where the data beam pierces the plane (skews to an ellipse -
          reads as a grommet, which is the intent). */}
      <span
        className={clsx(
          'absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border',
          selected ? 'border-primary/50' : 'border-border',
        )}
      />
      {/* Hairline glow pulse as packets land, kept on this overlay so it never
          fights the emphasized plane's ring. */}
      {animate && (
        <span
          className="pointer-events-none absolute inset-0 rounded-xl animate-tier-pulse"
          style={{animationDelay: `${index * 650}ms`}}
        />
      )}
    </div>
  );
}

/* ---- a tier's flat label block, billboarded beside its plane -------------- */
function TierLabel({
  tier,
  index,
  cfg,
  selected,
  onSelect,
}: {
  tier: Tier;
  index: number;
  cfg: IsoConfig;
  selected: boolean;
  onSelect: () => void;
}): ReactNode {
  const z = tierZ(index, cfg.step);
  const start = (cfg.side / 2) * HALF_DIAG + cfg.gap; // right of the diamond's vertex.
  return (
    <div
      className="absolute left-1/2 top-1/2 h-0 w-0"
      style={{transform: billboard(z), transformStyle: 'preserve-3d'}}>
      <div
        className="flex items-center"
        style={{transform: `translate(${start}px, -50%)`}}>
        <span
          aria-hidden
          className={clsx('h-px shrink-0', selected ? 'bg-primary/60' : 'bg-border')}
          style={{width: cfg.leader}}
        />
        <button
          type="button"
          onMouseEnter={onSelect}
          onFocus={onSelect}
          onClick={onSelect}
          aria-pressed={selected}
          style={{width: cfg.labelW}}
          className={clsx(
            'group/tier ml-2 shrink-0 rounded-lg border bg-card px-3 py-2 text-left transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
            tier.emphasized && 'ring-1 ring-primary/30',
            selected ? 'border-primary/50' : 'border-border hover:border-primary/40',
          )}>
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="whitespace-nowrap font-mono text-sm font-medium text-foreground">
              {tier.name}
            </span>
            {tier.tag && (
              <span className="font-mono text-2xs text-muted-foreground">- {tier.tag}</span>
            )}
          </span>
          <span className="mt-0.5 block font-mono text-2xs leading-relaxed text-muted-foreground">
            {tier.annotations.join('  ·  ')}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ---- the flat conduit overlay: beam, packets, connector captions ----------
 * Sits above the 3D stack, centered on the pierce-line, so it always paints in
 * front of the planes and stays crisp. Its vertical extent is derived from the
 * same projection the planes use, so the beam spans browser-to-clusters. */
function Conduit({
  variant,
  cfg,
  animate,
  reduced,
}: {
  variant: Variant;
  cfg: IsoConfig;
  animate: boolean;
  reduced: boolean;
}): ReactNode {
  // Half the on-screen distance from the top plane's centre to the bottom's.
  const half = ((TIERS.length - 1) / 2) * cfg.step * PROJ;
  const beamH = 2 * half + cfg.side * 0.32;

  return (
    <div
      className="pointer-events-none absolute inset-y-0"
      style={{left: cfg.originX, transform: 'translateX(-0.5px)'}}
      aria-hidden>
      <style>{sceneCss(variant, half)}</style>

      {/* Connector captions, right-aligned to the left of the beam at the
          midpoint between each pair of planes. */}
      {CONNECTORS.map((label, i) => {
        const midZ = (tierZ(i, cfg.step) + tierZ(i + 1, cfg.step)) / 2;
        return (
          <div
            key={label}
            className="absolute left-0 top-1/2 flex w-44 items-center justify-end text-right"
            style={{transform: `translate(-100%, calc(-50% + ${screenY(midZ)}px))`}}>
            <span className="font-mono text-2xs leading-tight text-muted-foreground">{label}</span>
            <span className="ml-2 h-px w-4 shrink-0 bg-border" />
          </div>
        );
      })}

      {reduced ? (
        // Static dashed conduit, no glow: the calm reduced-motion reading.
        <div
          className="absolute left-0 top-1/2 w-0 -translate-y-1/2 border-l border-dashed border-border"
          style={{height: beamH}}
        />
      ) : (
        <>
          {/* Soft halo. */}
          <div
            className="absolute left-0 top-1/2 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
            style={{
              height: beamH,
              background:
                'linear-gradient(to top, transparent, color-mix(in oklch, var(--primary), transparent 55%) 20%, color-mix(in oklch, var(--primary), transparent 55%) 80%, transparent)',
            }}
          />
          {/* Crisp core. */}
          <div
            className="absolute left-0 top-1/2 w-px -translate-x-1/2 -translate-y-1/2 rounded-full blur-[0.4px]"
            style={{
              height: beamH,
              background:
                'linear-gradient(to top, transparent, var(--primary) 18%, color-mix(in oklch, var(--primary), white 35%) 50%, var(--primary) 82%, transparent)',
            }}
          />
          {/* Rising delta packets. */}
          {Array.from({length: PACKET_COUNT}).map((_, n) => (
            <span
              key={n}
              className="absolute left-0 top-1/2 size-[7px] rounded-full bg-primary shadow-[0_0_8px_1px] shadow-primary/70"
              style={{
                animationName: `iso-rise-${variant}`,
                animationDuration: '3.4s',
                animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                animationIterationCount: 'infinite',
                animationDelay: `${(n * 3.4) / PACKET_COUNT}s`,
                animationPlayState: animate ? 'running' : 'paused',
                opacity: 0,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

/* ---- the isometric scene (md and up) -------------------------------------- */
function IsoScene({
  variant,
  selectedId,
  onSelect,
  animate,
  reduced,
  settled,
}: {
  variant: Variant;
  selectedId: string;
  onSelect: (id: string) => void;
  animate: boolean;
  reduced: boolean;
  settled: boolean;
}): ReactNode {
  const cfg = CONFIG[variant];
  const stackRef = useRef<HTMLDivElement>(null);

  // Pointer parallax: a few degrees of extra tilt, smoothed and reset by the
  // stack's own transition. Skipped entirely under reduced motion.
  function onMove(e: React.MouseEvent<HTMLDivElement>): void {
    if (reduced) return;
    const el = stackRef.current;
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--tx', `${(-ny * cfg.tilt).toFixed(2)}deg`);
    el.style.setProperty('--tz', `${(nx * cfg.tilt).toFixed(2)}deg`);
  }
  function onLeave(): void {
    const el = stackRef.current;
    if (!el) return;
    el.style.setProperty('--tx', '0deg');
    el.style.setProperty('--tz', '0deg');
  }

  return (
    <div
      className={clsx('relative hidden select-none md:block', animate && 'is-floating')}
      style={{perspective: `${cfg.perspective}px`, height: cfg.sceneH}}
      onMouseMove={onMove}
      onMouseLeave={onLeave}>
      <div
        ref={stackRef}
        className="absolute top-1/2"
        style={{
          left: cfg.originX,
          transformStyle: 'preserve-3d',
          transform: `rotateX(calc(${ISO_X}deg + var(--tx, 0deg))) rotateZ(calc(${ISO_Z}deg + var(--tz, 0deg)))`,
          transition: 'transform 300ms ease-out',
        }}>
        {TIERS.map((tier, i) => (
          <Plane
            key={tier.id}
            tier={tier}
            index={i}
            cfg={cfg}
            selected={selectedId === tier.id}
            settled={settled}
            animate={animate}
            onSelect={() => onSelect(tier.id)}
          />
        ))}
        {TIERS.map((tier, i) => (
          <TierLabel
            key={tier.id}
            tier={tier}
            index={i}
            cfg={cfg}
            selected={selectedId === tier.id}
            onSelect={() => onSelect(tier.id)}
          />
        ))}
      </div>

      <Conduit variant={variant} cfg={cfg} animate={animate} reduced={reduced} />

      {/* iso-float lives on the scene (screen space) so it never fights the
          stack's rotation/parallax transform. */}
      <style>{`.is-floating { animation: iso-float 7s ease-in-out infinite; }`}</style>
    </div>
  );
}

/* ---- flat fallback (below md): the original vertical stack ---------------- */
const FLAT_CONNECTOR_H = 52;
const FLAT_LINE_X = 12;
const FLAT_PACKETS = 3;
const FLAT_STAGGER_MS = 860;

function FlatStack({
  selectedId,
  onSelect,
  animate,
  reduced,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  animate: boolean;
  reduced: boolean;
}): ReactNode {
  return (
    <div className="mx-auto flex max-w-md flex-col md:hidden">
      {TIERS.map((tier, i) => {
        const selected = selectedId === tier.id;
        return (
          <Fragment key={tier.id}>
            <button
              type="button"
              onMouseEnter={() => onSelect(tier.id)}
              onFocus={() => onSelect(tier.id)}
              onClick={() => onSelect(tier.id)}
              aria-pressed={selected}
              className={clsx(
                'group/tier relative w-full rounded-lg border bg-card px-4 py-3 text-left transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                tier.emphasized && 'ring-1 ring-primary/30',
                selected ? 'border-primary/50' : 'border-border hover:border-primary/40',
              )}>
              {animate && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-lg animate-tier-pulse"
                  style={{animationDelay: `${i * (FLAT_STAGGER_MS / 2)}ms`}}
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
            {i < TIERS.length - 1 && (
              <div
                className="flex items-stretch gap-3"
                style={{height: FLAT_CONNECTOR_H}}
                aria-hidden>
                <div className="relative w-6 shrink-0">
                  <div
                    className={clsx(
                      'absolute inset-y-0 left-1/2 -translate-x-1/2',
                      reduced ? 'border-l border-dashed border-border' : 'w-px bg-border',
                    )}
                  />
                  {!reduced &&
                    Array.from({length: FLAT_PACKETS}).map((_, n) => (
                      <span
                        key={n}
                        className="absolute left-0 top-0 size-1.5 rounded-full bg-primary shadow-[0_0_6px] shadow-primary/60 animate-packet"
                        style={
                          {
                            offsetPath: `path('M ${FLAT_LINE_X} ${FLAT_CONNECTOR_H} L ${FLAT_LINE_X} 0')`,
                            animationDelay: `${n * FLAT_STAGGER_MS}ms`,
                            animationPlayState: animate ? 'running' : 'paused',
                          } as CSSProperties
                        }
                      />
                    ))}
                </div>
                <span className="self-center font-mono text-2xs text-muted-foreground">
                  {CONNECTORS[i]}
                </span>
              </div>
            )}
          </Fragment>
        );
      })}
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

export function ArchitectureDiagram({variant}: {variant: 'landing' | 'full'}): ReactNode {
  // full preselects the first tier; landing highlights the product (gateway).
  const [selectedId, setSelectedId] = useState(
    variant === 'full' ? TIERS[0].id : 'gateway',
  );
  const reduced = usePrefersReducedMotion();
  // Track continuously so packets/float pause off-screen; once:false toggles both ways.
  const [figureRef, inView] = useInView<HTMLElement>({once: false, threshold: 0.25});
  const animate = inView && !reduced;

  // Assemble runs once, the first time the scene enters view. Reduced motion
  // renders the planes settled from the start.
  const [assembled, setAssembled] = useState(false);
  useEffect(() => {
    if (inView) setAssembled(true);
  }, [inView]);
  const settled = reduced || assembled;

  const selected = TIERS.find((t) => t.id === selectedId) ?? TIERS[0];

  const figure = (
    <figure ref={figureRef} className="m-0 w-full">
      <figcaption className="sr-only">
        Clustrail data plane, top to bottom: the browser SPA, the Go gateway, the in-process
        informer cache, and your clusters&apos; API servers. Snapshots and watch deltas flow
        upward from the API servers to the browser over a single multiplexed WebSocket - the
        gateway never holds privileges beyond your own credentials, so Kubernetes enforces RBAC.
      </figcaption>

      <IsoScene
        variant={variant}
        selectedId={selectedId}
        onSelect={setSelectedId}
        animate={animate}
        reduced={reduced}
        settled={settled}
      />
      <FlatStack
        selectedId={selectedId}
        onSelect={setSelectedId}
        animate={animate}
        reduced={reduced}
      />

      <p className="mt-6 font-mono text-2xs leading-relaxed text-muted-foreground/80">
        The one exception: metrics.k8s.io has no watch verb, so CPU/RAM is the single short-TTL
        poll.
      </p>
    </figure>
  );

  if (variant === 'full') {
    return (
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {figure}
        <Explainer tier={selected} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {figure}
      <Explainer tier={selected} className="mx-auto max-w-md text-left" />
    </div>
  );
}
