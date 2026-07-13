'use client';

/*
 * The hero install line, which TYPES itself in on load. The full command is
 * rendered in SSR markup (and stays put for no-JS and reduced-motion viewers);
 * only when JS has hydrated AND motion is allowed do we rewind to zero and
 * reveal the characters ~18ms apart, then leave a blinking block caret. The
 * command text is never hidden permanently.
 */
import {useEffect, useRef, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import {CopyButton} from '@/components/copy-button';

const CMD = 'curl -fsSL https://clustrail.io/install.sh | sh';
const STEP_MS = 18;

export function TypedInstall({className}: {className?: string}): ReactNode {
  // Start (and hydrate) with the full command so SSR and the no-JS/reduced-
  // motion paths show it whole; the effect below may rewind and type it in.
  const [shown, setShown] = useState(CMD.length);
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setShown(0);
    setTyping(true);
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= CMD.length) {
        if (timer.current) clearInterval(timer.current);
        setTyping(false);
      }
    }, STEP_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  return (
    <div
      className={clsx(
        'flex h-11 w-full max-w-md items-center gap-2 rounded-lg border border-input bg-card/60 pl-4 pr-1 text-sm backdrop-blur sm:w-auto sm:max-w-none',
        className,
      )}>
      <span className="select-none font-mono text-link">$</span>
      <code className="flex min-w-0 flex-1 items-center overflow-hidden font-mono text-[13px] text-foreground">
        <span className="truncate">{CMD.slice(0, shown)}</span>
        {/* Steady caret while typing, blinking block once idle. */}
        <span
          aria-hidden
          className={clsx(
            'ml-0.5 inline-block h-[1.05em] w-[0.5ch] shrink-0 bg-foreground/70',
            typing ? '' : 'animate-caret',
          )}
        />
      </code>
      <CopyButton text={CMD} />
    </div>
  );
}
