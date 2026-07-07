import type {ReactNode} from 'react';
import Link from 'next/link';
import {BrowserFrame, CtaButton, Pill, PixelTrail} from '@/components/primitives';
import {CopyButton} from '@/components/copy-button';

const INSTALL_CMD = 'curl -fsSL https://clustrail.github.io/install.sh | sh';

export default function Hero({latest}: {latest: string}): ReactNode {
  return (
    <section className="relative overflow-hidden pt-20 pb-20 sm:pt-28 sm:pb-28">
      {/* The signature: a giant pixelated trail arc behind the headline,
          echoing the swoosh mark. */}
      <PixelTrail className="pointer-events-none absolute left-1/2 top-[-160px] h-[820px] w-[820px] -translate-x-1/2 text-foreground opacity-[0.05]" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
        <Link href="/changelog" className="no-underline">
          <Pill>
            <span className="size-1.5 bg-acid" />
            {latest ? `${latest} is here` : 'Now available'}
          </Pill>
        </Link>

        <h1 className="mt-8 font-display text-[44px] font-semibold uppercase leading-[1.02] tracking-tight text-foreground sm:text-7xl lg:text-8xl">
          A Kubernetes UI <br className="hidden sm:block" />
          on steroids
        </h1>

        <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          One self-contained Go binary serves an embedded React app and acts as an authenticating
          gateway to your clusters. Watch-based and virtualized, so even huge clusters stay
          instant - and your own RBAC is enforced upstream.
        </p>

        <div className="mt-9 flex w-full max-w-md flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
          <CtaButton to="/#install" variant="white">
            Get started
          </CtaButton>
          <CtaButton to="/docs" variant="outline">
            Browse docs
          </CtaButton>
        </div>

        {/* The one-line install, straight under the CTAs. */}
        <div className="mt-6 flex h-12 w-full max-w-md items-center gap-2 rounded-md border border-input bg-black/20 pl-4 pr-1 text-sm sm:w-auto sm:max-w-none">
          <span className="select-none font-mono text-acid">$</span>
          <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-foreground">
            {INSTALL_CMD}
          </code>
          <CopyButton text={INSTALL_CMD} />
        </div>

        {/* The money shot: cluster overview in a flat hairline frame. */}
        <div className="relative mt-20 w-full max-w-5xl">
          <BrowserFrame
            src="/shots/overview.png"
            alt="The Clustrail cluster overview"
            url="localhost:8080/clusters/kind-clustrail/overview"
            priority
          />
        </div>
      </div>
    </section>
  );
}
