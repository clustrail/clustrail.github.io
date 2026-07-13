'use client';

/*
 * ArchitectureDiagram: one centered isometric TOWER built from real extruded
 * CSS boxes (the ctrlb technique), read bottom-up as the data plane.
 *
 * ONE tilted canvas: a fixed 640x460 div with transform-style: preserve-3d and
 * transform: rotateX(50deg) rotateZ(35deg), scaled responsively by measuring
 * the wrapper (transform: scale on a fixed stage, so all 3D coordinates stay
 * in one authored space).
 *
 * Every component is a TRUE extruded box, hand-built from three faces: an
 * absolutely positioned top-face div plus two wall divs - the front wall
 * (width W, height DEPTH, transform-origin top, rotateX(-90deg)) hanging from
 * the top face's bottom edge, and the right wall (width DEPTH, height H,
 * transform-origin left, rotateY(90deg)) hanging from its right edge. Walls
 * carry a translucent black overlay so shading works in both themes.
 *
 * The tower: four altitudes on one vertical axis, narrowing upward.
 *   - z=0..16   THE CLUSTER BASE: the widest, thinnest slab (your clusters'
 *     apiservers) carrying the three cluster chips in a row near its front
 *     edge (the back of the base sits under the gateway's silhouette).
 *   - z=114..138 THE GO GATEWAY platform, centered over the base, strongest
 *     edge glow - it is the product.
 *   - ON the gateway, four extruded internals arranged in the L that stays
 *     visible under the floating SPA slab (the slab's projected silhouette
 *     hides the platform's back-left): AUTH PROXY, INFORMER CACHE and
 *     MULTIPLEXER across the front band, SWR MEMOIZERS on the right flank.
 *   - z=260..282 THE BROWSER SPA slab (smallest footprint) with the
 *     NORMALIZED STORE and VIRTUALIZED TABLE micro-boxes on top.
 *
 * Flows: three thin WATCH beams rise from the chips and vanish under the
 * gateway (the middle one directly beneath the informer cache); the flat
 * SNAPSHOTS + DELTAS trace bridges cache -> multiplexer on the platform; the
 * hero WEBSOCKET beam (brightest, rising packets) climbs from the
 * multiplexer to the SPA slab. Every beam terminus is SOLVED GEOMETRICALLY:
 * the beam's height is computed so its projected top edge lands exactly on
 * the projected front-bottom edge of the slab above it (Chrome drops clipped
 * elements out of plane splitting, so nothing relies on overflow clipping).
 *
 * Soft dark drop-shadow planes lie on the surface below each floating level
 * (positioned half-way along the occlusion shift so they peek out behind the
 * standing boxes), keeping the altitudes legible in the light theme.
 *
 * Labels live ON the top faces (quiet sentence-case Inter, tilted with the
 * canvas); flow captions are flat 2D overlays pinned at precomputed projected
 * coordinates so they stay crisp and never fight 3D occlusion.
 *
 * Interaction: four focusable tier buttons (cluster base, gateway platform,
 * cache box, SPA slab) drive the aria-live explainer below the scene; the
 * other internals and the chips hover-select their tier. Below md the 3D
 * canvas hides and a flat stacked tier-button list takes over. Reduced
 * motion renders everything settled; off-viewport pauses the packet loops.
 */

import {useEffect, useRef, useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import clsx from 'clsx';
import {useInView} from '@/lib/use-in-view';

type Variant = 'landing' | 'full';

interface Tier {
  id: string;
  name: string;
  tag?: string;
  annotations: string[];
  emphasized?: boolean;
  blurb: string;
}

/* The four tiers of the explainer, top of the stack to the clusters. */
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
    annotations: ['embedded SPA', 'authenticating proxy', 'one /ws'],
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

/* ---- authored 3D geometry (all coordinates in one 640x460 canvas space) ----
 * The canvas is tilted rotateX(50deg) rotateZ(35deg). Altitudes are translateZ
 * in px. Everything below is a module constant: nothing is computed per frame.
 */
const CANVAS_W = 700;
const CANVAS_H = 520;
/** The fixed stage the tilted scene renders into; scaled to fit the wrapper. */
const STAGE_W = 940;
const STAGE_H = 700;
const CANVAS_LEFT = (STAGE_W - CANVAS_W) / 2;
const CANVAS_TOP = 160;
const TILT = 'rotateX(50deg) rotateZ(35deg)';

/* The scene renders orthographically (no perspective property), so this
 * projection of a canvas-space point (x, y, altitude z) to stage-space screen
 * coordinates is EXACT - it is how beam termini are solved and the caption
 * overlay is pinned without ever fighting 3D occlusion. */
const COS35 = Math.cos((35 * Math.PI) / 180);
const SIN35 = Math.sin((35 * Math.PI) / 180);
const COS50 = Math.cos((50 * Math.PI) / 180);
const SIN50 = Math.sin((50 * Math.PI) / 180);
function proj(x: number, y: number, z: number): {x: number; y: number} {
  const lx = x - CANVAS_W / 2;
  const ly = y - CANVAS_H / 2;
  const rx = lx * COS35 - ly * SIN35;
  const ry = lx * SIN35 + ly * COS35;
  return {
    x: Math.round((CANVAS_LEFT + CANVAS_W / 2 + rx) * 10) / 10,
    y: Math.round((CANVAS_TOP + CANVAS_H / 2 + ry * COS50 - z * SIN50) * 10) / 10,
  };
}

interface BoxGeom {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Altitude of the box underside. */
  base: number;
  depth: number;
}

/** TIER 1 - the cluster base: widest, thinnest slab at ground level. */
const BASE: BoxGeom = {x: 45, y: 40, w: 550, h: 380, base: 0, depth: 16};

/** Apiserver chips in a row on the base's front band (even 25px margins and
 *  gaps; the front strip below them carries the base label). */
const CHIP_W = 140;
const CHIP_H = 58;
const CHIP_Y = 298;
const CHIPS: BoxGeom[] = [75, 250, 425].map((cx) => ({
  x: cx,
  y: CHIP_Y,
  w: CHIP_W,
  h: CHIP_H,
  base: BASE.depth,
  depth: 18,
}));
const CHIP_NAMES = ['cluster-a', 'cluster-b', 'cluster-c'];

/** TIER 2 - the Go gateway platform, floating at z=114, centered on the
 *  tower axis (canvas 320, 230). */
const PLATFORM: BoxGeom = {x: 85, y: 75, w: 470, h: 310, base: 150, depth: 24};

/** Gateway internals on the platform top (z=138), arranged in the L that the
 *  floating SPA slab's silhouette never hides: three across the front band
 *  (24px side margins), one on the right flank. The middle watch beam rises
 *  directly beneath the informer cache. */
const AUTH: BoxGeom = {x: 109, y: 245, w: 100, h: 96, base: 174, depth: 24};
const CACHE: BoxGeom = {x: 249, y: 245, w: 118, h: 96, base: 174, depth: 28};
const MUX: BoxGeom = {x: 407, y: 245, w: 118, h: 96, base: 174, depth: 28};
const SWR: BoxGeom = {x: 423, y: 138, w: 108, h: 76, base: 174, depth: 22};

/** TIER 4 - the browser SPA slab: smallest footprint, top of the tower. */
const SLAB: BoxGeom = {x: 166, y: 158, w: 308, h: 140, base: 340, depth: 22};
const STORE: BoxGeom = {x: 180, y: 174, w: 128, h: 60, base: 362, depth: 14};
const VTABLE: BoxGeom = {x: 330, y: 174, w: 128, h: 60, base: 362, depth: 14};

/** A vertical beam terminus, solved geometrically: the beam's top altitude is
 *  authored so its projected top edge lands EXACTLY on the projected
 *  front-bottom edge of the floating box above it, at the beam's screen x -
 *  the beam reads as vanishing under that slab without relying on browser
 *  plane splitting (which drops overflow-clipped elements). */
interface BeamGeom {
  x: number;
  y: number;
  z0: number;
  h: number;
}
function solveBeam(x: number, y: number, z0: number, over: BoxGeom): BeamGeom {
  const p1 = proj(over.x, over.y + over.h, over.base);
  const p2 = proj(over.x + over.w, over.y + over.h, over.base);
  const at = proj(x, y, 0);
  const t = (at.x - p1.x) / (p2.x - p1.x);
  const edgeY = p1.y + t * (p2.y - p1.y);
  const zTop = (at.y - edgeY) / SIN50; // screen-flush with the wall edge
  return {x, y, z0, h: Math.round((zTop - z0) * 10) / 10};
}

/** watch: one thin beam per chip, rising until it vanishes under the gateway. */
const WATCH_BEAMS: BeamGeom[] = CHIPS.map((c) =>
  solveBeam(c.x + CHIP_W / 2, CHIP_Y + CHIP_H / 2, c.base + c.depth, PLATFORM),
);
/** The hero WebSocket beam: multiplexer top face up to the SPA slab. */
const HERO_AT = {x: 440, y: 320};
const HERO = solveBeam(HERO_AT.x, HERO_AT.y, MUX.base + MUX.depth, SLAB);

/** Flat glowing traces (lying in-plane at a given altitude). */
interface TraceGeom {
  x: number;
  y: number;
  len: number;
  angle: number;
  z: number;
}
function trace(x1: number, y1: number, x2: number, y2: number, z: number): TraceGeom {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return {
    x: x1,
    y: y1,
    len: Math.round(Math.hypot(dx, dy) * 100) / 100,
    angle: Math.round((Math.atan2(dy, dx) * 180) / Math.PI * 100) / 100,
  z};
}
/** snapshots + deltas: cache top -> multiplexer top, bridging the gap near
 *  the boxes' front corners so the hero beam's glow never swallows it. */
const SNAP_TRACE: TraceGeom = trace(CACHE.x + CACHE.w, 316, MUX.x, 316, MUX.base + MUX.depth);

/** Soft drop shadows under the floating levels, lying flat on the surface
 *  below, shifted half the occlusion offset toward the viewer so they peek
 *  out behind the standing boxes (the fully "correct" shadow footprint is
 *  itself hidden by the slab that casts it). Rects are trimmed to avoid
 *  intersecting any standing box's walls. */
const SHADOWS: Array<{x: number; y: number; w: number; h: number; z: number; delay: number}> = [
  {x: 55, y: 45, w: 470, h: 250, z: BASE.depth + 1, delay: 480},      // gateway -> base
  {x: 124, y: 98, w: 285, h: 140, z: PLATFORM.base + PLATFORM.depth + 1, delay: 930}, // slab -> gateway
];

/** Flow captions: 2D overlay text pinned at exact projected coordinates
 *  (stage space), so they stay crisp and are never occluded by the boxes. */
interface Caption {
  lines: string[];
  /** Projected anchor. */
  at: {x: number; y: number};
  dx: number;
  dy: number;
  align: 'left' | 'right';
}
const CAPTIONS: Caption[] = [
  {
    lines: ['Watch'],
    at: proj(WATCH_BEAMS[0].x, WATCH_BEAMS[0].y, 90), // left watch beam, upper half
    dx: -12,
    dy: -14,
    align: 'right',
  },
  {
    lines: ['Snapshots + deltas'],
    at: proj(387, 316, SNAP_TRACE.z), // the cache -> multiplexer bridge, midpoint
    dx: 18,
    dy: 22,
    align: 'right',
  },
  {
    lines: ['One WebSocket', 'deltas only'],
    // The only collision-free air near the hero beam: right of the slab's
    // corner, above the SWR box (checked against every projected face).
    at: proj(HERO_AT.x, HERO_AT.y, 335),
    dx: 134,
    dy: -30,
    align: 'left',
  },
];

/* ---- theme-token paints ----------------------------------------------------
 * Top faces are the card surface nudged toward foreground so they read on the
 * near-white light canvas too; walls reuse the face fill under a translucent
 * black overlay, which shades correctly in both themes.
 */
/* Faces mix the card surface toward a theme-aware tint: near-white foreground
 * in dark (the original look), the official Kubernetes blue in light so the
 * slabs read as tinted instrument panels instead of grey card stock. The
 * --arch-tint variable is flipped by sceneCss for both light-theme signals. */
const FACE_PLATFORM = 'color-mix(in oklch, var(--card), var(--arch-tint, var(--foreground)) 5%)';
const FACE_BOX = 'color-mix(in oklch, var(--card), var(--arch-tint, var(--foreground)) 8%)';
const FACE_CHIP = 'color-mix(in oklch, var(--card), var(--arch-tint, var(--foreground)) 6%)';
const EDGE = 'var(--border)';
const EDGE_ACCENT = 'color-mix(in oklch, var(--primary), transparent 45%)';
/** k8s-blue accent for the cluster base level. */
const EDGE_K8S = 'color-mix(in oklch, var(--border), var(--primary) 30%)';
/** Glow hierarchy: the gateway is the product (strongest, always on); the
 *  SPA slab is subtle; the base is the faintest; selection promotes any tier
 *  to the strong glow. */
const GLOW_STRONG = '0 0 26px color-mix(in oklch, var(--primary), transparent 45%)';
const GLOW_SOFT = '0 0 16px color-mix(in oklch, var(--primary), transparent 68%)';
const GLOW_FAINT = '0 0 10px color-mix(in oklch, var(--primary), transparent 78%)';

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

/** Scale the fixed stage to the wrapper width (never above 1: upscaled
 *  transforms blur text). */
function useFitScale(ref: React.RefObject<HTMLDivElement | null>): number {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setScale(Math.min(1, el.clientWidth / STAGE_W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return scale;
}

/* ---- scene-scoped keyframes (unique per variant) --------------------------- */
function sceneCss(v: Variant): string {
  return `
[data-theme="light"] .arch3d-stage-${v} { --arch-tint: var(--primary); }
@media (prefers-color-scheme: light) {
  html:not([data-theme]) .arch3d-stage-${v} { --arch-tint: var(--primary); }
}
@keyframes arch3d-rise-${v} {
  0%   { transform: translateY(0); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(var(--rise)); opacity: 0; }
}
@keyframes arch3d-run-${v} {
  0%   { transform: translateX(0); opacity: 0; }
  12%  { opacity: 1; }
  88%  { opacity: 1; }
  100% { transform: translateX(var(--travel)); opacity: 0; }
}
@keyframes arch3d-dot-${v} {
  0%, 100% { opacity: 0.5; box-shadow: 0 0 0 0 color-mix(in oklch, var(--live), transparent 60%); }
  50%      { opacity: 1;   box-shadow: 0 0 6px 1px color-mix(in oklch, var(--live), transparent 60%); }
}`;
}

/* ---- one extruded box: top face + front wall + right wall ------------------ */
function Extruded({
  geom,
  fill,
  edge,
  glow,
  frontShade,
  rightShade,
  entrance,
  topClassName,
  children,
  interact,
}: {
  geom: BoxGeom;
  fill: string;
  edge: string;
  /** Box-shadow string for the top face's edge glow. */
  glow?: string;
  frontShade: number;
  rightShade: number;
  entrance: CSSProperties;
  topClassName?: string;
  children?: ReactNode;
  /** Pointer-hover selection for non-focusable internals. */
  interact?: {onSelect: () => void};
}): ReactNode {
  const wall = (style: CSSProperties, shade: number): ReactNode => (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        background: fill,
        backfaceVisibility: 'hidden',
        border: `1px solid ${edge}`,
        pointerEvents: 'none',
        ...style,
      }}>
      <div style={{position: 'absolute', inset: 0, background: '#000', opacity: shade}} />
    </div>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: geom.x,
        top: geom.y,
        width: geom.w,
        height: geom.h,
        transformStyle: 'preserve-3d',
        ...entrance,
      }}>
      {/* Top face. */}
      <div
        onMouseEnter={interact?.onSelect}
        onClick={interact?.onSelect}
        className={topClassName}
        style={{
          position: 'absolute',
          inset: 0,
          background: fill,
          border: `1px solid ${edge}`,
          borderRadius: 3,
          boxShadow: glow,
          transition: 'box-shadow 200ms ease-out, border-color 200ms ease-out',
        }}>
        {children}
      </div>
      {/* Front wall: hangs from the top face's bottom edge down to the base. */}
      {wall(
        {
          left: 0,
          top: '100%',
          width: geom.w,
          height: geom.depth,
          transformOrigin: 'top',
          transform: 'rotateX(-90deg)',
        },
        frontShade,
      )}
      {/* Right wall: hangs from the right edge down to the base. */}
      {wall(
        {
          left: '100%',
          top: 0,
          width: geom.depth,
          height: geom.h,
          transformOrigin: 'left',
          transform: 'rotateY(90deg)',
        },
        rightShade,
      )}
    </div>
  );
}

/** Entrance for a box group: rests at translateZ(base+depth); rises in. */
function entranceStyle(geom: BoxGeom, settled: boolean, delay: number): CSSProperties {
  const z = geom.base + geom.depth;
  return {
    transform: settled ? `translateZ(${z}px)` : `translateZ(${z - 26}px)`,
    opacity: settled ? 1 : 0,
    transition:
      'transform 650ms cubic-bezier(0.16, 1, 0.3, 1), opacity 650ms ease-out',
    transitionDelay: `${delay}ms`,
  };
}

/** A quiet sentence-case label sitting flat on a top face (tilts with the canvas). */
function FaceLabel({
  title,
  sub,
  className,
}: {
  title: string;
  sub?: string;
  className?: string;
}): ReactNode {
  return (
    <div className={clsx('pointer-events-none absolute', className)}>
      <div className="text-[10px] font-medium text-foreground">{title}</div>
      {sub && (
        <div className="mt-0.5 text-[8.5px] leading-tight text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}

/** A flat glowing trace lying in-plane, with one packet running along it. */
function Trace({
  geom,
  variant,
  settled,
  animate,
  reduced,
  delaySec,
}: {
  geom: TraceGeom;
  variant: Variant;
  settled: boolean;
  animate: boolean;
  reduced: boolean;
  delaySec: number;
}): ReactNode {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: geom.x,
        top: geom.y - 3,
        width: geom.len,
        height: 6,
        borderRadius: 3,
        transformOrigin: '0 50%',
        transform: `translateZ(${geom.z}px) rotateZ(${geom.angle}deg)`,
        background:
          'linear-gradient(to right, color-mix(in oklch, var(--primary), transparent 60%), color-mix(in oklch, var(--primary), transparent 28%))',
        boxShadow: '0 0 10px color-mix(in oklch, var(--primary), transparent 65%)',
        overflow: 'hidden',
        opacity: settled ? 1 : 0,
        transition: 'opacity 500ms ease-out 1150ms',
        pointerEvents: 'none',
      }}>
      {!reduced && (
        <div
          style={
            {
              position: 'absolute',
              left: -16,
              top: 0,
              width: 16,
              height: 6,
              borderRadius: 3,
              background: 'color-mix(in oklch, var(--primary), white 40%)',
              boxShadow: '0 0 8px color-mix(in oklch, var(--primary), transparent 30%)',
              '--travel': `${geom.len + 32}px`,
              animation: `arch3d-run-${variant} 2.4s ease-in-out infinite`,
              animationDelay: `${delaySec}s`,
              animationPlayState: animate ? 'running' : 'paused',
            } as CSSProperties
          }
        />
      )}
    </div>
  );
}

/** A vertical beam standing up via rotateX(90deg) with transform-origin top,
 *  growing from height 0 on entrance; packets are bright segments rising
 *  along its height. `hero` is the bright WebSocket beam; otherwise the
 *  modest watch style. */
function VBeam({
  geom,
  hero,
  variant,
  grown,
  animate,
  reduced,
  packetDelaySec,
}: {
  geom: BeamGeom;
  hero?: boolean;
  variant: Variant;
  grown: boolean;
  animate: boolean;
  reduced: boolean;
  packetDelaySec?: number;
}): ReactNode {
  const w = hero ? 10 : 6;
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: geom.x - w / 2,
        top: geom.y,
        width: w,
        height: reduced || grown ? geom.h : 0,
        transformOrigin: 'top',
        transform: `translateZ(${geom.z0}px) rotateX(90deg)`,
        transition: 'height 550ms ease-out 1150ms',
        overflow: 'hidden',
        borderRadius: w / 2,
        background: hero
          ? 'linear-gradient(to bottom, color-mix(in oklch, var(--primary), transparent 35%), color-mix(in oklch, var(--primary), transparent 5%))'
          : 'linear-gradient(to bottom, color-mix(in oklch, var(--primary), transparent 62%), color-mix(in oklch, var(--primary), transparent 30%))',
        boxShadow: hero
          ? '0 0 22px 2px color-mix(in oklch, var(--primary), transparent 25%)'
          : '0 0 12px color-mix(in oklch, var(--primary), transparent 60%)',
        pointerEvents: 'none',
      }}>
      {!reduced &&
        (hero ? [0, 1, 2] : [0]).map((n) => (
          <div
            key={n}
            style={
              {
                position: 'absolute',
                left: 1,
                top: hero ? -20 : -14,
                width: w - 2,
                height: hero ? 20 : 14,
                borderRadius: (w - 2) / 2,
                background: 'color-mix(in oklch, var(--primary), white 55%)',
                boxShadow: hero
                  ? '0 0 10px 2px color-mix(in oklch, var(--primary), transparent 25%)'
                  : '0 0 8px 1px color-mix(in oklch, var(--primary), transparent 40%)',
                '--rise': `${geom.h + (hero ? 40 : 28)}px`,
                animation: `arch3d-rise-${variant} ${hero ? 2.1 : 2.6}s ease-in-out infinite`,
                animationDelay: `${(packetDelaySec ?? 0) - n * 0.7}s`,
                animationPlayState: animate ? 'running' : 'paused',
              } as CSSProperties
            }
          />
        ))}
    </div>
  );
}

/* ---- tier button (mobile stacked list) ------------------------------------- */
function TierButton({
  tier,
  selected,
  onSelect,
  className,
}: {
  tier: Tier;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}): ReactNode {
  return (
    <button
      type="button"
      onMouseEnter={onSelect}
      onFocus={onSelect}
      onClick={onSelect}
      aria-pressed={selected}
      className={clsx(
        'rounded-lg border bg-card px-3 py-2 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        tier.emphasized && 'ring-1 ring-primary/30',
        selected ? 'border-primary/50' : 'border-border hover:border-primary/40',
        className,
      )}>
      <span className="flex items-baseline gap-2 overflow-hidden">
        <span className="whitespace-nowrap text-[13px] font-medium text-foreground">
          {tier.name}
        </span>
        {tier.tag && (
          <span className="truncate text-2xs text-muted-foreground">{tier.tag}</span>
        )}
      </span>
      <span className="mt-0.5 block truncate text-2xs text-muted-foreground">
        {tier.annotations.join(' · ')}
      </span>
    </button>
  );
}

function Explainer({
  tier,
  compact,
  className,
}: {
  tier: Tier;
  compact?: boolean;
  className?: string;
}): ReactNode {
  return (
    <div
      aria-live="polite"
      className={clsx(
        'rounded-lg border border-border bg-card/50',
        compact ? 'min-h-24 p-3 sm:p-4' : 'min-h-28 p-4 sm:min-h-24 sm:p-5',
        className,
      )}>
      <span className="text-xs font-semibold text-primary">{tier.name}</span>
      <p
        className={clsx(
          'mt-2 leading-relaxed text-muted-foreground',
          compact ? 'text-[13px]' : 'text-sm',
        )}>
        {tier.blurb}
      </p>
    </div>
  );
}

/* ---- the 3D scene ----------------------------------------------------------- */
function Scene({
  variant,
  selectedId,
  onSelect,
  settled,
  animate,
  reduced,
}: {
  variant: Variant;
  selectedId: string;
  onSelect: (id: string) => void;
  settled: boolean;
  animate: boolean;
  reduced: boolean;
}): ReactNode {
  const wrapRef = useRef<HTMLDivElement>(null);
  const scale = useFitScale(wrapRef);
  const grown = settled; // beams grow after boxes rise (via transition delay)
  const selectGateway = (): void => onSelect('gateway');
  const selectApiservers = (): void => onSelect('apiservers');

  /** Shared classes for the four real tier buttons (tilted top faces). */
  const tierBtn = (id: string): string =>
    clsx(
      'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
      selectedId === id && 'is-selected',
    );

  return (
    <div ref={wrapRef} className="hidden w-full md:block" style={{height: STAGE_H * scale}}>
      <div
        className={`arch3d-stage-${variant}`}
        style={{
          width: STAGE_W,
          height: STAGE_H,
          margin: '0 auto',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}>
        <div style={{position: 'absolute', inset: 0}}>
          <div
            style={{
              position: 'absolute',
              left: CANVAS_LEFT,
              top: CANVAS_TOP,
              width: CANVAS_W,
              height: CANVAS_H,
              transformStyle: 'preserve-3d',
              transform: TILT,
            }}>
            {/* ---- tier 1: the cluster base (widest, thinnest slab) ---- */}
            <Extruded
              geom={BASE}
              fill={FACE_PLATFORM}
              edge={selectedId === 'apiservers' ? EDGE_ACCENT : EDGE_K8S}
              glow={selectedId === 'apiservers' ? GLOW_STRONG : GLOW_FAINT}
              frontShade={0.2}
              rightShade={0.34}
              entrance={entranceStyle(BASE, settled, 0)}
              topClassName="bg-dotgrid">
              <button
                type="button"
                aria-pressed={selectedId === 'apiservers'}
                aria-label="Your clusters' apiservers"
                onMouseEnter={selectApiservers}
                onFocus={selectApiservers}
                onClick={selectApiservers}
                className={clsx(
                  'absolute inset-0 rounded-[3px] bg-transparent text-left',
                  tierBtn('apiservers'),
                )}>
                <span className="absolute bottom-3 left-4">
                  <span className="block text-[11px] font-medium text-foreground">
                    Your clusters&apos; apiservers
                  </span>
                  <span className="mt-0.5 block text-[9px] text-muted-foreground">
                    multi-cluster · RBAC upstream
                  </span>
                </span>
              </button>
            </Extruded>

            {/* Drop shadows under the floating levels (altitude legibility). */}
            {SHADOWS.map((s) => (
              <div
                key={s.z}
                aria-hidden
                style={{
                  position: 'absolute',
                  left: s.x,
                  top: s.y,
                  width: s.w,
                  height: s.h,
                  transform: `translateZ(${s.z}px)`,
                  background:
                    'radial-gradient(ellipse closest-side, rgb(0 0 0 / 0.16), transparent 78%)',
                  opacity: settled ? 1 : 0,
                  transition: `opacity 700ms ease-out ${s.delay}ms`,
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* ---- apiserver chips in a row on the base ---- */}
            {CHIPS.map((chip, i) => (
              <Extruded
                key={CHIP_NAMES[i]}
                geom={chip}
                fill={FACE_CHIP}
                edge={selectedId === 'apiservers' ? EDGE_ACCENT : EDGE_K8S}
                frontShade={0.24}
                rightShade={0.38}
                entrance={entranceStyle(chip, settled, 90 + i * 90)}
                interact={{onSelect: selectApiservers}}>
                <FaceLabel title={CHIP_NAMES[i]} className="left-3 top-1/2 -translate-y-1/2" />
              </Extruded>
            ))}

            {/* ---- tier 2: the Go gateway platform ---- */}
            <Extruded
              geom={PLATFORM}
              fill={FACE_PLATFORM}
              edge={selectedId === 'gateway' ? EDGE_ACCENT : EDGE}
              glow={GLOW_STRONG}
              frontShade={0.2}
              rightShade={0.34}
              entrance={entranceStyle(PLATFORM, settled, 360)}
              topClassName="bg-dotgrid">
              <button
                type="button"
                aria-pressed={selectedId === 'gateway'}
                onMouseEnter={selectGateway}
                onFocus={selectGateway}
                onClick={selectGateway}
                className={clsx(
                  'absolute inset-0 rounded-[3px] bg-transparent text-left',
                  tierBtn('gateway'),
                )}>
                <span className="absolute bottom-3 left-6">
                  <span className="block text-[11px] font-medium text-foreground">Go gateway</span>
                  <span className="mt-0.5 block text-[9px] leading-snug text-muted-foreground">
                    one static binary
                    <br />
                    your credentials only
                  </span>
                </span>
              </button>
            </Extruded>

            {/* ---- gateway internals (front band + right flank) ---- */}
            <Extruded
              geom={AUTH}
              fill={FACE_BOX}
              edge={selectedId === 'gateway' ? EDGE_ACCENT : EDGE}
              frontShade={0.22}
              rightShade={0.36}
              entrance={entranceStyle(AUTH, settled, 450)}
              interact={{onSelect: selectGateway}}>
              <FaceLabel title="Auth proxy" sub="your credentials" className="left-3 top-3" />
            </Extruded>

            <Extruded
              geom={CACHE}
              fill={FACE_BOX}
              edge={selectedId === 'cache' ? EDGE_ACCENT : EDGE}
              glow={selectedId === 'cache' ? GLOW_STRONG : undefined}
              frontShade={0.22}
              rightShade={0.36}
              entrance={entranceStyle(CACHE, settled, 540)}>
              <button
                type="button"
                aria-pressed={selectedId === 'cache'}
                onMouseEnter={() => onSelect('cache')}
                onFocus={() => onSelect('cache')}
                onClick={() => onSelect('cache')}
                className={clsx(
                  'absolute inset-0 rounded-[3px] bg-transparent',
                  tierBtn('cache'),
                )}
                aria-label="In-process informer cache">
                <FaceLabel
                  title="Informer cache"
                  sub="warm, per cluster"
                  className="left-3 top-3 text-left"
                />
              </button>
            </Extruded>

            <Extruded
              geom={MUX}
              fill={FACE_BOX}
              edge={selectedId === 'gateway' ? EDGE_ACCENT : EDGE}
              frontShade={0.22}
              rightShade={0.36}
              entrance={entranceStyle(MUX, settled, 630)}
              interact={{onSelect: selectGateway}}>
              <FaceLabel title="Multiplexer" sub="one /ws" className="right-3 top-2.5 text-right" />
              {/* The glowing pad where the hero beam leaves the face. */}
              <span
                aria-hidden
                className="pointer-events-none absolute rounded-full"
                style={{
                  left: HERO.x - MUX.x - 13,
                  top: HERO.y - MUX.y - 13,
                  width: 26,
                  height: 26,
                  background:
                    'radial-gradient(circle, color-mix(in oklch, var(--primary), transparent 25%), transparent 70%)',
                }}
              />
              {/* The one live-green signal: the watch stream is connected. */}
              <span
                aria-hidden
                className="absolute right-3 top-10 flex items-center gap-1.5"
                style={{pointerEvents: 'none'}}>
                <span
                  className="size-1.5 rounded-full bg-live"
                  style={
                    reduced
                      ? undefined
                      : {
                          animation: `arch3d-dot-${variant} 2.2s ease-in-out infinite`,
                          animationPlayState: animate ? 'running' : 'paused',
                        }
                  }
                />
                <span className="text-[8px] font-medium text-live">watch connected</span>
              </span>
            </Extruded>

            <Extruded
              geom={SWR}
              fill={FACE_BOX}
              edge={selectedId === 'gateway' ? EDGE_ACCENT : EDGE}
              frontShade={0.22}
              rightShade={0.36}
              entrance={entranceStyle(SWR, settled, 720)}
              interact={{onSelect: selectGateway}}>
              <FaceLabel
                title="SWR memoizers"
                sub="verdicts · catalog · topology"
                className="left-3 top-3"
              />
            </Extruded>

            {/* ---- watch beams: each chip rises into the gateway underside,
                     the middle one directly beneath the informer cache ---- */}
            {WATCH_BEAMS.map((b, i) => (
              <VBeam
                key={b.x}
                geom={b}
                variant={variant}
                grown={grown}
                animate={animate}
                reduced={reduced}
                packetDelaySec={i * 0.85}
              />
            ))}
            {/* ---- snapshots + deltas: cache -> multiplexer ---- */}
            <Trace
              geom={SNAP_TRACE}
              variant={variant}
              settled={settled}
              animate={animate}
              reduced={reduced}
              delaySec={0.4}
            />
            {/* ---- the hero WebSocket beam: multiplexer -> browser slab ---- */}
            <VBeam
              geom={HERO}
              hero
              variant={variant}
              grown={grown}
              animate={animate}
              reduced={reduced}
            />

            {/* ---- tier 4: the browser SPA slab ---- */}
            <Extruded
              geom={SLAB}
              fill={FACE_PLATFORM}
              edge={selectedId === 'browser' ? EDGE_ACCENT : EDGE}
              glow={selectedId === 'browser' ? GLOW_STRONG : GLOW_SOFT}
              frontShade={0.18}
              rightShade={0.3}
              entrance={entranceStyle(SLAB, settled, 810)}
              topClassName="bg-dotgrid">
              <button
                type="button"
                aria-pressed={selectedId === 'browser'}
                onMouseEnter={() => onSelect('browser')}
                onFocus={() => onSelect('browser')}
                onClick={() => onSelect('browser')}
                className={clsx(
                  'absolute inset-0 rounded-[3px] bg-transparent text-left',
                  tierBtn('browser'),
                )}
                aria-label="Browser SPA">
                <span className="absolute bottom-2.5 left-3.5">
                  <span className="block text-[10px] font-medium text-foreground">Browser SPA</span>
                  <span className="mt-0.5 block text-[8.5px] text-muted-foreground">
                    only visible rows in the DOM
                  </span>
                </span>
              </button>
            </Extruded>

            <Extruded
              geom={STORE}
              fill={FACE_BOX}
              edge={selectedId === 'browser' ? EDGE_ACCENT : EDGE}
              frontShade={0.2}
              rightShade={0.34}
              entrance={entranceStyle(STORE, settled, 900)}
              interact={{onSelect: () => onSelect('browser')}}>
              <FaceLabel title="Normalized store" className="left-2.5 top-2.5" />
            </Extruded>
            <Extruded
              geom={VTABLE}
              fill={FACE_BOX}
              edge={selectedId === 'browser' ? EDGE_ACCENT : EDGE}
              frontShade={0.2}
              rightShade={0.34}
              entrance={entranceStyle(VTABLE, settled, 990)}
              interact={{onSelect: () => onSelect('browser')}}>
              <FaceLabel title="Virtualized table" className="left-2.5 top-2.5" />
            </Extruded>
          </div>

          {/* ---- 2D caption overlay, pinned at exact projected coordinates ---- */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{opacity: settled ? 1 : 0, transition: 'opacity 500ms ease-out 1350ms'}}>
            {CAPTIONS.map((c) => (
              <div
                key={c.lines[0]}
                className={clsx(
                  'absolute -translate-y-1/2 whitespace-nowrap text-2xs font-medium leading-snug text-muted-foreground',
                  c.align === 'right' && '-translate-x-full text-right',
                )}
                style={{
                  left: c.at.x + c.dx,
                  top: c.at.y + c.dy,
                  textShadow: '0 0 8px var(--background), 0 0 3px var(--background)',
                }}>
                {c.lines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArchitectureDiagram({variant}: {variant: 'landing' | 'full'}): ReactNode {
  const [selectedId, setSelectedId] = useState('gateway');
  const reduced = usePrefersReducedMotion();
  const [figureRef, inView] = useInView<HTMLElement>({once: false, threshold: 0.2});
  const animate = inView && !reduced;

  const [assembled, setAssembled] = useState(false);
  useEffect(() => {
    if (inView) setAssembled(true);
  }, [inView]);
  const settled = reduced || assembled;

  const selected = TIERS.find((t) => t.id === selectedId) ?? TIERS[1];
  const maxW = variant === 'full' ? 'max-w-[880px]' : 'max-w-[660px]';

  return (
    <div className="flex flex-col gap-6">
      <figure ref={figureRef} className="m-0 w-full">
        <figcaption className="sr-only">
          Clustrail data plane: your clusters&apos; API servers feed dynamic shared informers
          inside the Go gateway (one static binary), which multiplexes snapshots and deltas over
          a single WebSocket up to the browser SPA. The gateway proxies with your own
          credentials, so Kubernetes enforces RBAC upstream.
        </figcaption>

        <style>{sceneCss(variant)}</style>

        <div className={clsx('mx-auto w-full', maxW)}>
          <Scene
            variant={variant}
            selectedId={selectedId}
            onSelect={setSelectedId}
            settled={settled}
            animate={animate}
            reduced={reduced}
          />
        </div>

        {/* Below md the 3D canvas hides and this flat list is the interface. */}
        <div className="mx-auto flex w-full max-w-md flex-col gap-2 md:hidden">
          {TIERS.map((tier) => (
            <TierButton
              key={tier.id}
              tier={tier}
              selected={selectedId === tier.id}
              onSelect={() => setSelectedId(tier.id)}
              className="w-full"
            />
          ))}
        </div>
      </figure>

      <Explainer
        tier={selected}
        compact={variant === 'landing'}
        className={clsx('mx-auto w-full', maxW)}
      />

      <p
        className={clsx(
          'mx-auto w-full text-xs leading-relaxed text-muted-foreground/80',
          maxW,
        )}>
        The one exception: metrics.k8s.io has no watch verb, so CPU/RAM is the single short-TTL
        poll.
      </p>
    </div>
  );
}
