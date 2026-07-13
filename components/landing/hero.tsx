import type {CSSProperties, ReactNode} from 'react';
import Link from 'next/link';
import {CtaButton, GradientText, Pill} from '@/components/primitives';
import {RevealSection} from '@/components/landing/reveal-section';
import {TypedInstall} from '@/components/landing/typed-install';

/**
 * 01 HERO. Staged entrance: headline, subhead, CTAs, install line and the
 * quantified strip each fade+rise in turn (increasing --reveal-delay).
 * The section flips to in-view the moment it mounts (it is at the top), so the
 * sequence plays on load. The install line under the CTAs types itself in.
 */
export default function Hero({latest}: {latest: string}): ReactNode {
  return (
    <RevealSection
      className="relative overflow-hidden border-b border-border pt-20 pb-16 sm:pt-28 sm:pb-20"
      threshold={0}>
      {/* Dotted-grid backdrop faded toward the edges, under an ambient brand glow. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-dotgrid [mask-image:radial-gradient(ellipse_60%_55%_at_50%_35%,#000,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[500px] max-w-3xl bg-[radial-gradient(ellipse_55%_50%_at_50%_45%,rgba(50,108,229,0.16),transparent)] blur-2xl"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
        <Link href="/changelog" className="reveal no-underline">
          <Pill>
            <span className="relative flex size-1.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-live" />
            </span>
            {latest ? `${latest} is here` : 'Now available'}
          </Pill>
        </Link>

        <h1
          className="reveal mt-8 text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          style={{'--reveal-delay': '0ms'} as CSSProperties}>
          A Kubernetes UI <br className="hidden sm:block" />
          <GradientText>on steroids.</GradientText>
        </h1>

        <p
          className="reveal mt-7 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base"
          style={{'--reveal-delay': '80ms'} as CSSProperties}>
          One self-contained Go binary serves an embedded React app and acts as an authenticating
          gateway to your clusters. Watch-based and virtualized, so even huge clusters stay
          instant - and your own RBAC is enforced upstream.
        </p>

        <div
          className="reveal mt-9 flex w-full max-w-md flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center"
          style={{'--reveal-delay': '160ms'} as CSSProperties}>
          <CtaButton to="/#install" variant="primary">
            Get started
          </CtaButton>
          <CtaButton to="/architecture" variant="outline">
            Explore architecture
          </CtaButton>
        </div>

        <div
          className="reveal mt-6 w-full max-w-md sm:w-auto sm:max-w-none"
          style={{'--reveal-delay': '240ms'} as CSSProperties}>
          <TypedInstall />
        </div>

        {/* Quantified strip: real measured numbers, one quiet line. */}
        <p
          className="reveal mt-12 text-sm text-muted-foreground"
          style={{'--reveal-delay': '320ms'} as CSSProperties}>
          &lt; 8 ms watch deltas · 49 MB idle · one static binary
        </p>
      </div>
    </RevealSection>
  );
}
