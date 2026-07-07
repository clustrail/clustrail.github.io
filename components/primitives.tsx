import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from 'next/link';

/* Shared building blocks for the site. Keep every visual consistent by
   composing these rather than re-styling from scratch. */

/**
 * The one CTA shape: squared-off (6px), uppercase display-font label with
 * astral-style letterspacing. `acid` is the loudest tier, `white` the hero
 * tier, `outline` the quiet sibling.
 */
export function CtaButton({
  to,
  href,
  variant = 'acid',
  children,
  className,
}: {
  to?: string;
  href?: string;
  variant?: 'acid' | 'white' | 'outline';
  children: ReactNode;
  className?: string;
}): ReactNode {
  const classes = clsx(
    'inline-flex h-12 items-center justify-center rounded-md px-6',
    'font-display text-[13px] font-medium uppercase tracking-[0.1em]',
    'no-underline transition-colors',
    variant === 'acid' && 'bg-acid text-acid-foreground hover:bg-acid/85',
    variant === 'white' && 'bg-foreground text-canvas hover:bg-foreground/85',
    variant === 'outline' && 'border border-input text-foreground hover:bg-white/5',
    className,
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {children}
    </a>
  ) : (
    <Link href={to!} className={classes}>
      {children}
    </Link>
  );
}

/** Small squared badge in mono - e.g. the version tag in the hero. */
export function Pill({children}: {children: ReactNode}): ReactNode {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 font-mono text-xs text-muted-foreground">
      {children}
    </span>
  );
}

/** The wordmark, reused in navbar/footer/hero: squared display caps. */
export function Wordmark({className}: {className?: string}): ReactNode {
  return (
    <span className={clsx('font-display font-semibold uppercase tracking-[0.04em]', className)}>
      clustrail
    </span>
  );
}

/** Section heading block: acid kicker + display title + optional lede. */
export function SectionHeader({
  kicker,
  title,
  lede,
  align = 'center',
}: {
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: 'center' | 'left';
}): ReactNode {
  return (
    <div
      className={clsx(
        'flex flex-col',
        align === 'center' ? 'items-center text-center' : 'items-start',
      )}>
      <span className="font-display text-xs font-medium uppercase tracking-[0.25em] text-acid">
        {kicker}
      </span>
      <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {lede && (
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{lede}</p>
      )}
    </div>
  );
}

/**
 * Astral-style Bayer-dither strip: a stepped run of pixel squares whose
 * density decays along the run. Colored via currentColor - place with a
 * text-* class (usually text-acid). Density steps are three checkerboard
 * patterns at 50% / 25% / 6%.
 */
export function DitherStrip({
  id,
  className,
  flip = false,
}: {
  /** Unique per instance - SVG pattern ids are document-global. */
  id: string;
  className?: string;
  flip?: boolean;
}): ReactNode {
  return (
    <svg
      viewBox="0 0 288 48"
      aria-hidden
      className={className}
      style={flip ? {transform: 'scaleX(-1)'} : undefined}>
      <defs>
        <pattern id={`${id}-d50`} width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="currentColor" />
          <rect x="6" y="6" width="6" height="6" fill="currentColor" />
        </pattern>
        <pattern id={`${id}-d25`} width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="currentColor" />
        </pattern>
        <pattern id={`${id}-d06`} width="24" height="24" patternUnits="userSpaceOnUse">
          <rect x="6" y="6" width="6" height="6" fill="currentColor" />
        </pattern>
      </defs>
      {/* Stepped silhouette: tall solid block, then thinner, sparser runs. */}
      <rect x="0" y="0" width="96" height="48" fill={`url(#${id}-d50)`} />
      <rect x="96" y="12" width="96" height="36" fill={`url(#${id}-d25)`} />
      <rect x="192" y="24" width="96" height="24" fill={`url(#${id}-d06)`} />
    </svg>
  );
}

/**
 * The hero signature: a giant pixelated trail arc, echoing the swoosh logo
 * (clustrail = a trail around the cluster). A dithered ring segment that
 * fades out along its tail. Colored via currentColor.
 */
export function PixelTrail({className}: {className?: string}): ReactNode {
  return (
    <svg viewBox="0 0 900 900" aria-hidden className={className} fill="none">
      <defs>
        <pattern id="pxtrail-checker" width="28" height="28" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="currentColor" />
          <rect x="14" y="14" width="14" height="14" fill="currentColor" />
        </pattern>
        <linearGradient id="pxtrail-fade" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0.1" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.9" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id="pxtrail-mask">
          <rect width="900" height="900" fill="url(#pxtrail-fade)" />
        </mask>
      </defs>
      <path
        d="M 143 723 A 370 370 0 1 1 758 664"
        stroke="url(#pxtrail-checker)"
        strokeWidth="110"
        mask="url(#pxtrail-mask)"
      />
    </svg>
  );
}

/**
 * Flat astral-style frame around a product screenshot: hairline border,
 * squared 12px corners, and a slim mono address strip. `src` is a /public
 * path.
 */
export function BrowserFrame({
  src,
  alt,
  url = 'localhost:8080',
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  url?: string;
  className?: string;
  priority?: boolean;
}): ReactNode {
  return (
    <div
      className={clsx('overflow-hidden rounded-xl border border-border bg-card', className)}>
      <div className="flex items-center gap-3 border-b border-border bg-black/20 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2 rounded-[1px] bg-muted-foreground/40" />
          <span className="size-2 rounded-[1px] bg-muted-foreground/40" />
          <span className="size-2 rounded-[1px] bg-acid/70" />
        </span>
        <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">{url}</span>
      </div>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className="block h-auto w-full"
      />
    </div>
  );
}
