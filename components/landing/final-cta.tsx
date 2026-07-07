import type {ReactNode} from 'react';
import {CtaButton, Wordmark} from '@/components/primitives';

export default function FinalCta(): ReactNode {
  return (
    <section className="relative overflow-hidden border-t border-border/60 pt-24 sm:pt-32">
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <h2 className="font-display text-4xl font-semibold uppercase leading-[1.05] tracking-tight text-foreground sm:text-5xl">
          Supercharge your
          <br />
          cluster ops
        </h2>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          One binary, your kubeconfig, and a browser tab. No agents to install, nothing to store,
          nothing to trust but the API server.
        </p>
        <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <CtaButton to="/#install" variant="acid">
            Get started
          </CtaButton>
          <CtaButton to="/docs" variant="outline">
            Browse docs
          </CtaButton>
        </div>
      </div>

      {/* Giant ghost wordmark, edge-faded, astral-footer style. */}
      <div className="pointer-events-none relative mt-20 select-none" aria-hidden>
        <div className="mask-fade-x flex justify-center overflow-hidden">
          <Wordmark className="text-[17vw] leading-none tracking-tighter text-foreground opacity-[0.06]" />
        </div>
      </div>
    </section>
  );
}
