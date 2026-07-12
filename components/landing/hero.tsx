import type {ReactNode} from 'react';
import Link from 'next/link';
import {BrowserFrame, CtaButton, GradientText, Pill} from '@/components/primitives';
import {CopyButton} from '@/components/copy-button';

const INSTALL_CMD = 'curl -fsSL https://clustrail.io/install.sh | sh';

export default function Hero({latest}: {latest: string}): ReactNode {
  return (
    <section className="relative overflow-hidden pt-20 pb-20 sm:pt-28 sm:pb-28">
      {/* Dotted-grid backdrop, faded toward the edges - the app's own empty-state
          texture - under an ambient brand glow. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-dotgrid [mask-image:radial-gradient(ellipse_60%_55%_at_50%_35%,#000,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[500px] max-w-3xl bg-[radial-gradient(ellipse_55%_50%_at_50%_45%,rgba(50,108,229,0.16),transparent)] blur-2xl"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
        <Link href="/changelog" className="no-underline">
          <Pill>
            <span className="relative flex size-1.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-live" />
            </span>
            {latest ? `${latest} is here` : 'Now available'}
          </Pill>
        </Link>

        <h1 className="mt-8 text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          A Kubernetes UI <br className="hidden sm:block" />
          <GradientText>on steroids.</GradientText>
        </h1>

        <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          One self-contained Go binary serves an embedded React app and acts as an authenticating
          gateway to your clusters. Watch-based and virtualized, so even huge clusters stay
          instant - and your own RBAC is enforced upstream.
        </p>

        <div className="mt-9 flex w-full max-w-md flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
          <CtaButton to="/#install" variant="primary">
            Get started
          </CtaButton>
          <CtaButton to="/docs" variant="outline">
            Browse docs
          </CtaButton>
        </div>

        {/* The one-line install, straight under the CTAs. */}
        <div className="mt-6 flex h-11 w-full max-w-md items-center gap-2 rounded-lg border border-input bg-card/60 pl-4 pr-1 text-sm backdrop-blur sm:w-auto sm:max-w-none">
          <span className="select-none font-mono text-link">$</span>
          <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-foreground">
            {INSTALL_CMD}
          </code>
          <CopyButton text={INSTALL_CMD} />
        </div>

        {/* The money shot: cluster overview floating on a soft brand glow. */}
        <div className="relative mt-20 w-full max-w-5xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-16 -top-10 bottom-0 bg-[radial-gradient(ellipse_55%_60%_at_50%_45%,rgba(50,108,229,0.22),transparent)] blur-3xl"
          />
          <BrowserFrame
            src="/shots/overview.png"
            alt="The Clustrail cluster overview"
            url="localhost:8080/clusters/kind-clustrail/overview"
            priority
            className="relative"
          />
        </div>
      </div>
    </section>
  );
}
