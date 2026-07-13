import type {ReactNode} from 'react';
import {CtaButton, StatusLabel} from '@/components/primitives';

export default function NotFound(): ReactNode {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
      <StatusLabel>Status 404</StatusLabel>
      <h1 className="mt-6 font-mono text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        404 <span className="text-muted-foreground/40">/</span>{' '}
        <span className="text-link">NOT_FOUND</span>
      </h1>
      <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        No resource matches that path. If a link on the site brought you here, please report it.
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
