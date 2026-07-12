import type {ReactNode} from 'react';
import {CtaButton, Wordmark} from '@/components/primitives';

export default function FinalCta(): ReactNode {
  return (
    <section className="relative overflow-hidden border-t border-border/60 pt-24 sm:pt-32">
      {/* Brand glow behind the closer. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(50,108,229,0.15),transparent)]"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <h2 className="text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          Ready to explore your clusters?
        </h2>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          One binary, your kubeconfig, and a browser tab. No agents to install, nothing to store,
          nothing to trust but the API server.
        </p>
        <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <CtaButton to="/#install" variant="primary">
            Get started
          </CtaButton>
          <CtaButton to="/docs" variant="outline">
            Browse docs
          </CtaButton>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Open source under AGPL-3.0.{' '}
          <a
            href="https://github.com/clustrail/clustrail"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link transition-colors hover:underline">
            View the source on GitHub
          </a>
        </p>
      </div>

      {/* Giant ghost wordmark, edge-faded. */}
      <div className="pointer-events-none relative mt-20 select-none" aria-hidden>
        <div className="mask-fade-x flex justify-center overflow-hidden">
          <Wordmark
            tone="ghost"
            className="text-[17vw] leading-none tracking-tighter text-foreground opacity-[0.05]"
          />
        </div>
      </div>
    </section>
  );
}
