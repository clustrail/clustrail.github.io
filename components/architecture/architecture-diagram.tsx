'use client';

/*
 * ArchitectureDiagram: an isometric "platform with buildings" scene built from
 * real extruded CSS boxes (the ctrlb technique).
 *
 * ONE tilted canvas: a fixed 640x460 div with transform-style: preserve-3d and
 * transform: rotateX(50deg) rotateZ(35deg), inside a perspective container,
 * scaled responsively by measuring the wrapper (transform: scale on a fixed
 * stage, so all 3D coordinates stay in one authored space).
 *
 * Every component is a TRUE extruded box, hand-built from three faces: an
 * absolutely positioned top-face div plus two wall divs - the front wall
 * (width W, height DEPTH, transform-origin top, rotateX(-90deg)) hanging from
 * the top face's bottom edge, and the right wall (width DEPTH, height H,
 * transform-origin left, rotateY(90deg)) hanging from its right edge. Walls
 * carry a translucent black overlay so shading works in both themes.
 *
 * Composition maps clustrail's real data plane:
 *   - BASE PLATFORM (the biggest slab): the Go gateway, one static binary.
 *   - ON it, four extruded internals: MULTIPLEXER, INFORMER CACHE (larger),
 *     SWR MEMOIZERS, AUTH PROXY.
 *   - FLOATING ABOVE at z=190: the BROWSER SPA slab with NORMALIZED STORE and
 *     VIRTUALIZED TABLE micro-boxes on top.
 *   - OFF the platform's far-left flank at ground level: three apiserver
 *     chips (cluster-a/b/c).
 *   - The hero beam (multiplexer -> browser slab) stands up via
 *     rotateX(90deg) with transform-origin top and grows from height 0 on
 *     entrance; packets are bright segments running along its height. Flat
 *     glowing traces carry watch (apiservers -> cache) and snapshots + deltas
 *     (cache -> multiplexer).
 *
 * Labels live ON the top faces (mono uppercase, tilted with the canvas - the
 * legible ctrlb look); beam labels are counter-rotated billboards
 * (rotateZ(-35deg) rotateX(-50deg)) so they face the camera.
 *
 * Interaction: four focusable tier buttons (browser slab, platform, cache
 * box, an invisible flat hit area over the apiserver column) drive the
 * aria-live explainer below the scene; the gateway's internal boxes hover-
 * select the gateway tier. Below md the 3D canvas hides (aria-hidden there is
 * moot - it is display:none) and a flat stacked tier-button list takes over.
 *
 * Reduced motion renders everything settled (no rise, beams at full height,
 * no packets); off-viewport pauses the packet loops.
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
const CANVAS_W = 640;
const CANVAS_H = 460;
/** The fixed stage the tilted scene renders into; scaled to fit the wrapper. */
const STAGE_W = 830;
const STAGE_H = 560;
const CANVAS_LEFT = (STAGE_W - CANVAS_W) / 2;
const CANVAS_TOP = 82;
const TILT = 'rotateX(50deg) rotateZ(35deg)';

/* The scene renders orthographically (no perspective property), so this
 * projection of a canvas-space point (x, y, altitude z) to stage-space screen
 * coordinates is EXACT - it is how the caption overlay is pinned to beams and
 * traces without ever fighting 3D occlusion. Computed at authoring time. */
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

/** The Go gateway: the base platform. Top face at z=30. */
const PLATFORM: BoxGeom = {x: 90, y: 90, w: 500, h: 360, base: 0, depth: 30};

/** Gateway internals standing on the platform (base = platform top). */
const CACHE: BoxGeom = {x: 130, y: 130, w: 190, h: 115, base: 30, depth: 30};
const MUX: BoxGeom = {x: 370, y: 130, w: 170, h: 115, base: 30, depth: 30};
const AUTH: BoxGeom = {x: 150, y: 290, w: 140, h: 100, base: 30, depth: 26};
const SWR: BoxGeom = {x: 370, y: 290, w: 140, h: 100, base: 30, depth: 26};

/** The browser SPA slab floating above the multiplexer (pushed toward the
 *  far edge so it never crowds the multiplexer's face). */
const SLAB: BoxGeom = {x: 300, y: 12, w: 290, h: 195, base: 166, depth: 24};
const STORE: BoxGeom = {x: 318, y: 32, w: 118, h: 66, base: 190, depth: 16};
const VTABLE: BoxGeom = {x: 448, y: 112, w: 126, h: 66, base: 190, depth: 16};

/** Apiserver chips: a column off the platform's far-left flank, on the
 *  ground, extruded to the platform's height so the watch traces run flat. */
const CHIP_W = 120;
const CHIP_H = 54;
const CHIPS: BoxGeom[] = [150, 270, 390].map((cy) => ({
  x: -40,
  y: cy - CHIP_H / 2,
  w: CHIP_W,
  h: CHIP_H,
  base: 0,
  depth: 30,
}));
const CHIP_NAMES = ['cluster-a', 'cluster-b', 'cluster-c'];

/** The hero beam: multiplexer top center up toward the slab underside.
 *  Its top altitude is authored so the beam's projected top edge lands
 *  EXACTLY on the slab front wall's projected bottom edge at the beam's
 *  screen x - the beam reads as vanishing under the slab without relying on
 *  browser plane splitting (which drops overflow-clipped elements). */
const BEAM = (() => {
  const x = MUX.x + MUX.w / 2; // 455
  const y = MUX.y + MUX.h / 2; // 187.5
  const z0 = MUX.base + MUX.depth; // 60
  // Slab front wall bottom edge, projected.
  const p1 = proj(SLAB.x, SLAB.y + SLAB.h, SLAB.base);
  const p2 = proj(SLAB.x + SLAB.w, SLAB.y + SLAB.h, SLAB.base);
  const at = proj(x, y, 0);
  const t = (at.x - p1.x) / (p2.x - p1.x);
  const edgeY = p1.y + t * (p2.y - p1.y);
  const zTop = (at.y - edgeY) / SIN50; // screen-flush with the wall edge
  return {x, y, z0, h: Math.round(zTop - z0)};
})();

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
/** watch: each apiserver chip fans into the informer cache's left edge. */
const WATCH_TRACES: TraceGeom[] = [
  trace(78, 150, CACHE.x, 165, 31),
  trace(78, 270, CACHE.x, 190, 31),
  trace(78, 390, CACHE.x, 215, 31),
];
/** snapshots + deltas: cache top -> multiplexer top. */
const SHORT_TRACE: TraceGeom = trace(CACHE.x + CACHE.w, 187.5, MUX.x, 187.5, 60);

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
    lines: ['watch'],
    at: proj(104, 230, 31), // middle watch trace, midpoint
    dx: -10,
    dy: 12,
    align: 'right',
  },
  {
    lines: ['snapshots + deltas'],
    at: proj(345, 187.5, 60), // the cache -> multiplexer bridge, midpoint
    dx: -12,
    dy: 14,
    align: 'right',
  },
  {
    lines: ['one WebSocket', 'deltas only'],
    at: proj(BEAM.x, BEAM.y, BEAM.z0 + BEAM.h / 2), // hero beam, mid-height
    dx: 22,
    dy: -2,
    align: 'left',
  },
];
/** Overlay heading for the apiserver column. */
const CHIP_HEADING = proj(20, 112, 30);

/* ---- theme-token paints ----------------------------------------------------
 * Top faces are the card surface nudged toward foreground so they read on the
 * near-white light canvas too; walls reuse the face fill under a translucent
 * black overlay, which shades correctly in both themes.
 */
const FACE_PLATFORM = 'color-mix(in oklch, var(--card), var(--foreground) 4%)';
const FACE_BOX = 'color-mix(in oklch, var(--card), var(--foreground) 7%)';
const FACE_CHIP = 'color-mix(in oklch, var(--card), var(--foreground) 5%)';
const EDGE = 'var(--border)';
const EDGE_ACCENT = 'color-mix(in oklch, var(--primary), transparent 45%)';
const GLOW = '0 0 22px color-mix(in oklch, var(--primary), transparent 55%)';

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
  glow?: boolean;
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
          boxShadow: glow ? GLOW : undefined,
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

/** A mono uppercase label sitting flat on a top face (tilts with the canvas). */
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
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
        {title}
      </div>
      {sub && (
        <div className="mt-0.5 font-mono text-[8.5px] leading-tight text-muted-foreground">
          {sub}
        </div>
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
        transition: 'opacity 500ms ease-out 900ms',
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
        <span className="whitespace-nowrap font-mono text-[13px] font-medium text-foreground">
          {tier.name}
        </span>
        {tier.tag && (
          <span className="truncate font-mono text-2xs text-muted-foreground">{tier.tag}</span>
        )}
      </span>
      <span className="mt-0.5 block truncate font-mono text-2xs text-muted-foreground">
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
      <span className="font-mono text-2xs font-medium uppercase tracking-[0.16em] text-link">
        {tier.name}
      </span>
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

  /** Shared classes for the four real tier buttons (tilted top faces). */
  const tierBtn = (id: string): string =>
    clsx(
      'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
      selectedId === id && 'is-selected',
    );

  return (
    <div ref={wrapRef} className="hidden w-full md:block" style={{height: STAGE_H * scale}}>
      <div
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
            {/* ---- base platform: the Go gateway ---- */}
            <Extruded
              geom={PLATFORM}
              fill={FACE_PLATFORM}
              edge={selectedId === 'gateway' ? EDGE_ACCENT : EDGE}
              glow={selectedId === 'gateway'}
              frontShade={0.2}
              rightShade={0.34}
              entrance={entranceStyle(PLATFORM, settled, 0)}
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
                <span className="absolute bottom-3 left-4">
                  <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">
                    Go gateway
                  </span>
                  <span className="mt-0.5 block font-mono text-[9px] text-muted-foreground">
                    one static binary · your credentials only
                  </span>
                </span>
              </button>
            </Extruded>

            {/* ---- gateway internals ---- */}
            <Extruded
              geom={CACHE}
              fill={FACE_BOX}
              edge={selectedId === 'cache' ? EDGE_ACCENT : EDGE}
              glow={selectedId === 'cache'}
              frontShade={0.22}
              rightShade={0.36}
              entrance={entranceStyle(CACHE, settled, 260)}>
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
              entrance={entranceStyle(MUX, settled, 340)}
              interact={{onSelect: selectGateway}}>
              <FaceLabel title="Multiplexer" sub="one /ws" className="right-3 top-2.5 text-right" />
              {/* The glowing pad where the hero beam leaves the face. */}
              <span
                aria-hidden
                className="pointer-events-none absolute rounded-full"
                style={{
                  left: BEAM.x - MUX.x - 13,
                  top: BEAM.y - MUX.y - 13,
                  width: 26,
                  height: 26,
                  background:
                    'radial-gradient(circle, color-mix(in oklch, var(--primary), transparent 25%), transparent 70%)',
                }}
              />
              {/* The one live-green signal: the watch stream is connected. */}
              <span
                aria-hidden
                className="absolute bottom-2.5 left-3 flex items-center gap-1.5"
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
                <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-live">
                  watch_connected
                </span>
              </span>
            </Extruded>

            <Extruded
              geom={AUTH}
              fill={FACE_BOX}
              edge={selectedId === 'gateway' ? EDGE_ACCENT : EDGE}
              frontShade={0.22}
              rightShade={0.36}
              entrance={entranceStyle(AUTH, settled, 420)}
              interact={{onSelect: selectGateway}}>
              <FaceLabel title="Auth proxy" sub="your credentials" className="left-3 top-3" />
            </Extruded>

            <Extruded
              geom={SWR}
              fill={FACE_BOX}
              edge={selectedId === 'gateway' ? EDGE_ACCENT : EDGE}
              frontShade={0.22}
              rightShade={0.36}
              entrance={entranceStyle(SWR, settled, 500)}
              interact={{onSelect: selectGateway}}>
              <FaceLabel
                title="SWR memoizers"
                sub="verdicts · catalog · topology"
                className="left-3 top-3"
              />
            </Extruded>

            {/* ---- apiserver chips (ground level, far-left flank) ---- */}
            {CHIPS.map((chip, i) => (
              <Extruded
                key={CHIP_NAMES[i]}
                geom={chip}
                fill={FACE_CHIP}
                edge={selectedId === 'apiservers' ? EDGE_ACCENT : EDGE}
                glow={selectedId === 'apiservers'}
                frontShade={0.24}
                rightShade={0.38}
                entrance={entranceStyle(chip, settled, 320 + i * 80)}
                interact={{onSelect: () => onSelect('apiservers')}}>
                <FaceLabel title={CHIP_NAMES[i]} className="left-3 top-1/2 -translate-y-1/2" />
              </Extruded>
            ))}
            {/* Invisible flat hit area: the one focusable apiservers button. */}
            <button
              type="button"
              aria-pressed={selectedId === 'apiservers'}
              aria-label="Your clusters' apiservers"
              onMouseEnter={() => onSelect('apiservers')}
              onFocus={() => onSelect('apiservers')}
              onClick={() => onSelect('apiservers')}
              className={clsx('absolute rounded-md border-0 bg-transparent', tierBtn('apiservers'))}
              style={{
                left: CHIPS[0].x - 8,
                top: CHIPS[0].y - 8,
                width: CHIP_W + 16,
                height: CHIPS[2].y + CHIP_H - CHIPS[0].y + 16,
                transform: 'translateZ(31px)',
              }}
            />

            {/* ---- watch traces: apiservers fan into the informer cache ---- */}
            {WATCH_TRACES.map((t, i) => (
              <Trace
                key={t.angle}
                geom={t}
                variant={variant}
                settled={settled}
                animate={animate}
                reduced={reduced}
                delaySec={i * 0.8}
              />
            ))}
            {/* ---- snapshots + deltas: cache -> multiplexer ---- */}
            <Trace
              geom={SHORT_TRACE}
              variant={variant}
              settled={settled}
              animate={animate}
              reduced={reduced}
              delaySec={0.4}
            />

            {/* ---- the hero beam: multiplexer -> browser slab ---- */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                left: BEAM.x - 5,
                top: BEAM.y,
                width: 10,
                height: reduced || grown ? BEAM.h : 0,
                transformOrigin: 'top',
                transform: `translateZ(${BEAM.z0}px) rotateX(90deg)`,
                transition: 'height 550ms ease-out 950ms',
                overflow: 'hidden',
                borderRadius: 5,
                background:
                  'linear-gradient(to bottom, color-mix(in oklch, var(--primary), transparent 35%), color-mix(in oklch, var(--primary), transparent 5%))',
                boxShadow: '0 0 22px 2px color-mix(in oklch, var(--primary), transparent 25%)',
                pointerEvents: 'none',
              }}>
              {!reduced &&
                [0, 1, 2].map((n) => (
                  <div
                    key={n}
                    style={
                      {
                        position: 'absolute',
                        left: 1,
                        top: -20,
                        width: 8,
                        height: 20,
                        borderRadius: 4,
                        background: 'color-mix(in oklch, var(--primary), white 55%)',
                        boxShadow:
                          '0 0 10px 2px color-mix(in oklch, var(--primary), transparent 25%)',
                        '--rise': `${BEAM.h + 40}px`,
                        animation: `arch3d-rise-${variant} 2.1s ease-in-out infinite`,
                        animationDelay: `${-n * 0.7}s`,
                        animationPlayState: animate ? 'running' : 'paused',
                      } as CSSProperties
                    }
                  />
                ))}
            </div>
            {/* ---- the browser SPA slab ---- */}
            <Extruded
              geom={SLAB}
              fill={FACE_PLATFORM}
              edge={selectedId === 'browser' ? EDGE_ACCENT : EDGE}
              glow={selectedId === 'browser'}
              frontShade={0.18}
              rightShade={0.3}
              entrance={entranceStyle(SLAB, settled, 680)}
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
                  <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground">
                    Browser SPA
                  </span>
                  <span className="mt-0.5 block font-mono text-[8.5px] text-muted-foreground">
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
              entrance={entranceStyle(STORE, settled, 840)}
              interact={{onSelect: () => onSelect('browser')}}>
              <FaceLabel title="Normalized store" className="left-2.5 top-2.5" />
            </Extruded>
            <Extruded
              geom={VTABLE}
              fill={FACE_BOX}
              edge={selectedId === 'browser' ? EDGE_ACCENT : EDGE}
              frontShade={0.2}
              rightShade={0.34}
              entrance={entranceStyle(VTABLE, settled, 920)}
              interact={{onSelect: () => onSelect('browser')}}>
              <FaceLabel title="Virtualized table" className="left-2.5 top-2.5" />
            </Extruded>
          </div>

          {/* ---- 2D caption overlay, pinned at exact projected coordinates ---- */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{opacity: settled ? 1 : 0, transition: 'opacity 500ms ease-out 1100ms'}}>
            {CAPTIONS.map((c) => (
              <div
                key={c.lines[0]}
                className={clsx(
                  'absolute -translate-y-1/2 whitespace-nowrap font-mono text-2xs leading-snug text-muted-foreground',
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
            <div
              className="absolute -translate-y-full font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
              style={{
                left: CHIP_HEADING.x - 30,
                top: CHIP_HEADING.y - 8,
                textShadow: '0 0 8px var(--background)',
              }}>
              your clusters&apos; apiservers
            </div>
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
          'mx-auto w-full font-mono text-2xs leading-relaxed text-muted-foreground/80',
          maxW,
        )}>
        The one exception: metrics.k8s.io has no watch verb, so CPU/RAM is the single short-TTL
        poll.
      </p>
    </div>
  );
}
