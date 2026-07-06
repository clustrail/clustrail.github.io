import {useState, type ReactNode} from 'react';
import clsx from 'clsx';
import {Check, Copy} from 'lucide-react';

/* Shared building blocks for the landing sections. Keep every landing visual
   consistent by composing these rather than re-styling from scratch. */

/** Copy-to-clipboard hook with a 1.5s "copied" flash. */
export function useCopy(text: string): [boolean, () => void] {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return [copied, copy];
}

/** Ghost icon button that copies `text`. */
export function CopyButton({text, className}: {text: string; className?: string}): ReactNode {
  const [copied, copy] = useCopy(text);
  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy to clipboard"
      className={clsx(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-md',
        'text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        className,
      )}>
      {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
    </button>
  );
}

/** Small pill badge with a faint gradient ring - e.g. "New · v0.1.0". */
export function Pill({children}: {children: ReactNode}): ReactNode {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
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
        'bg-gradient-to-br from-primary via-primary to-foreground bg-clip-text text-transparent',
        className,
      )}>
      {children}
    </span>
  );
}

/** The two-tone wordmark, reused in hero/footer. */
export function Wordmark({className}: {className?: string}): ReactNode {
  return (
    <span className={className}>
      <span className="text-primary">Clus</span>
      <span className="text-muted-foreground">trail</span>
    </span>
  );
}

/** Section heading block: kicker + title + optional lede, centered by default. */
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
    <div className={clsx('flex flex-col', align === 'center' ? 'items-center text-center' : 'items-start')}>
      <span className="text-2xs font-semibold uppercase tracking-widest text-primary">{kicker}</span>
      <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {lede && (
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{lede}</p>
      )}
    </div>
  );
}

/**
 * macOS-style window chrome wrapping a product screenshot. Renders traffic
 * lights and a faux address bar, then the image. `src` is a /static path.
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
      className={clsx(
        'shot-frame overflow-hidden rounded-xl border border-border bg-card shadow-2xl',
        className,
      )}>
      <div className="flex items-center gap-2 border-b border-border bg-background/60 px-4 py-2.5">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <div className="ml-3 hidden min-w-0 flex-1 items-center rounded-md border border-border bg-canvas px-3 py-1 sm:flex">
          <span className="truncate font-mono text-xs text-muted-foreground">{url}</span>
        </div>
      </div>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
      />
    </div>
  );
}
