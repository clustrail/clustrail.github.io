import type {ReactNode} from 'react';
import {Wordmark} from '@site/src/components/site/primitives';

export default function FinalCta(): ReactNode {
  return (
    <section className="relative overflow-hidden border-t border-border/60 py-24 sm:py-32">
      {/* Brand glow behind the CTA. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(50,108,229,0.18),transparent)]"
      />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Ready to explore your clusters?
        </h2>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          One binary, your kubeconfig, and a browser tab. No agents to install, nothing to
          store, nothing to trust but the API server.
        </p>
      </div>

      {/* Giant ghost wordmark, edge-faded. */}
      <div
        aria-hidden
        className="mask-fade-x pointer-events-none mt-20 flex select-none justify-center overflow-hidden">
        <Wordmark className="text-[18vw] font-semibold leading-none tracking-tighter opacity-[0.06]" />
      </div>
    </section>
  );
}
