import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {BrowserFrame, CopyButton, GradientText, Pill} from '@site/src/components/site/primitives';
import {useReleases} from '@site/src/lib/releases';
import {latestTag} from '@site/src/lib/version';

const INSTALL_CMD = 'curl -fsSL https://clustrail.github.io/install.sh | sh';

export default function Hero(): ReactNode {
  const {releases} = useReleases();
  // The latest version comes from the committed changelog (falling back to the
  // API), never from the API alone - so the badge is correct on the release
  // commit's deploy regardless of when the GitHub release is published.
  const latest = latestTag(releases);
  return (
    <section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28">
      {/* Dotted-grid backdrop, faded out toward the edges so it never touches the page seams. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-dotgrid [mask-image:radial-gradient(ellipse_60%_55%_at_50%_35%,#000,transparent)] [-webkit-mask-image:radial-gradient(ellipse_60%_55%_at_50%_35%,#000,transparent)]"
      />
      {/* Ambient brand glow high in the hero, behind the copy. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 mx-auto h-[500px] max-w-3xl bg-[radial-gradient(ellipse_55%_50%_at_50%_45%,rgba(50,108,229,0.18),transparent)] blur-2xl"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
        <Link to="/changelog" className="no-underline hover:no-underline">
          <Pill>
            <span className="size-1.5 rounded-full bg-primary" />
            {latest ? `${latest} is here` : 'Now available'}
          </Pill>
        </Link>

        <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
          A Kubernetes UI
          <br />
          <GradientText>on steroids.</GradientText>
        </h1>

        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          One self-contained Go binary serves an embedded React app and acts as an authenticating
          gateway to your clusters. Watch-based and virtualized, so even huge clusters stay instant -
          and your own RBAC is enforced upstream.
        </p>

        <div className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
          <Link
            to="#install"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground no-underline transition-colors hover:bg-primary/90 hover:text-primary-foreground">
            Install Clustrail
          </Link>

          <div className="flex h-10 w-full max-w-full items-center gap-2 rounded-md border border-border bg-card pl-3 pr-1 text-sm sm:w-auto">
            <span className="select-none font-mono text-primary">$</span>
            <code className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
              {INSTALL_CMD}
            </code>
            <CopyButton text={INSTALL_CMD} />
          </div>
        </div>

        {/* The money shot: cluster overview floating on a soft brand glow. */}
        <div className="relative mt-16 w-full max-w-5xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-16 -top-10 bottom-0 -z-0 bg-[radial-gradient(ellipse_55%_60%_at_50%_45%,rgba(50,108,229,0.30),transparent)] blur-3xl"
          />
          <BrowserFrame
            src="/shots/overview.png"
            alt="The Clustrail cluster overview"
            priority
            className="relative"
          />
        </div>
      </div>
    </section>
  );
}
