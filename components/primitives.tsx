import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from 'next/link';

/* Shared building blocks for the site. Keep every visual consistent by
   composing these rather than re-styling from scratch. */

/**
 * The one CTA shape, matching the app's buttons: 10px radius, sentence-case
 * medium label. `primary` is Kubernetes blue, `outline` the quiet sibling.
 */
export function CtaButton({
  to,
  href,
  variant = 'primary',
  children,
  className,
}: {
  to?: string;
  href?: string;
  variant?: 'primary' | 'outline';
  children: ReactNode;
  className?: string;
}): ReactNode {
  const classes = clsx(
    'inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-medium',
    'no-underline transition-colors',
    variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
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

/** Small pill badge - e.g. the version tag in the hero. */
export function Pill({children}: {children: ReactNode}): ReactNode {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-input bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
      {children}
    </span>
  );
}

/** Brand gradient text (blue -> foreground). Use sparingly on key words. */
export function GradientText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <span
      className={clsx(
        'bg-gradient-to-br from-link via-primary to-primary bg-clip-text text-transparent',
        className,
      )}>
      {children}
    </span>
  );
}

/** The two-tone brand wordmark, reused in navbar/footer/ghost. */
export function Wordmark({
  className,
  tone = 'brand',
}: {
  className?: string;
  /** `brand` is the two-tone lockup; `ghost` is single-color for watermarks. */
  tone?: 'brand' | 'ghost';
}): ReactNode {
  return (
    <span className={clsx('font-semibold tracking-tight', className)}>
      {tone === 'brand' ? (
        <>
          <span className="text-link">Clus</span>
          <span className="text-foreground">trail</span>
        </>
      ) : (
        'Clustrail'
      )}
    </span>
  );
}

/**
 * Section heading block: a quiet sentence-case eyebrow + title + optional
 * lede. Apple-style hierarchy: the eyebrow is the only colored element and
 * carries no letterspacing, brackets, or index numbers.
 */
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
      <span className="text-sm font-semibold text-primary">{kicker}</span>
      <h2 className="mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {lede && (
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{lede}</p>
      )}
    </div>
  );
}

/**
 * Flat frame around a product screenshot: hairline border, a slim address
 * strip, and status pips echoing the app's connection indicator.
 * `src` is a /public path.
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
  /* Screenshots under /shots are committed at 3200x2000 alongside
     downscaled -1600w/-2400w siblings (see scripts/downscale-shots.mjs).
     Deriving srcSet from that convention lets the browser pick a variant
     that fits the layout instead of always paying for the 3200px master.
     Non-shots images have no variants, so they fall back to a plain src. */
  const shot = /^\/shots\/[^/]+\.png$/.test(src);
  const base = shot ? src.replace(/\.png$/, '') : null;
  const srcSet = base
    ? `${base}-1600w.png 1600w, ${base}-2400w.png 2400w, ${src} 3200w`
    : undefined;

  return (
    <div
      className={clsx('overflow-hidden rounded-xl border border-border bg-card', className)}>
      <div className="flex items-center gap-3 border-b border-border bg-background/80 px-4 py-2.5">
        <span className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="size-2 rounded-full bg-live/80" />
        </span>
        <span className="min-w-0 truncate text-xs text-muted-foreground">{url}</span>
      </div>
      <img
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? '(max-width: 768px) 100vw, 1100px' : undefined}
        width={3200}
        height={2000}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className="block h-auto w-full"
      />
    </div>
  );
}
