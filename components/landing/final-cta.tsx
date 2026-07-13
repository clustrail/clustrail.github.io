import type {ReactNode} from 'react';
import {CtaButton, StatusLabel, Wordmark} from '@/components/primitives';
import {RevealSection} from '@/components/landing/reveal-section';

/**
 * 09 CLOSER. The last word: AGPL line, two GitHub CTAs, and the giant ghost
 * wordmark fading out at both edges.
 */
const REPO = 'https://github.com/clustrail/clustrail';

export default function FinalCta(): ReactNode {
  return (
    <RevealSection className="relative overflow-hidden border-t border-border/60 pt-24 sm:pt-32">
      {/* Brand glow behind the closer. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(50,108,229,0.15),transparent)]"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <StatusLabel className="reveal">AGPL-3.0-only</StatusLabel>
        <h2 className="reveal mt-4 text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          Ready to explore your clusters?
        </h2>
        <p className="reveal mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          One binary, your kubeconfig, and a browser tab. No agents to install, nothing to store,
          nothing to trust but the API server. Open source, all the way down.
        </p>
        <div className="reveal mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <CtaButton href={REPO} variant="primary">
            Read the source
          </CtaButton>
          <CtaButton href={`${REPO}/stargazers`} variant="outline">
            Star on GitHub
          </CtaButton>
        </div>
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
    </RevealSection>
  );
}
