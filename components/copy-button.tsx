'use client';

import {useState, type ReactNode} from 'react';
import clsx from 'clsx';
import {Check, Copy} from 'lucide-react';

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
        'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md',
        'text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground',
        className,
      )}>
      {copied ? <Check className="size-4 text-acid" /> : <Copy className="size-4" />}
    </button>
  );
}
