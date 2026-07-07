import type {ReactNode} from 'react';
import {CtaButton} from '@/components/primitives';

export default function NotFound(): ReactNode {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
      <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-link">
        404
      </span>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        This page does not exist. If a link on the site brought you here, please report it.
      </p>
      <div className="mt-8 flex gap-3">
        <CtaButton to="/" variant="primary">
          Back home
        </CtaButton>
        <CtaButton to="/docs" variant="outline">
          Browse docs
        </CtaButton>
      </div>
    </main>
  );
}
