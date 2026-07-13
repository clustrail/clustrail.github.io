import type {ReactNode} from 'react';
import Link from 'next/link';
import {CtaButton, Wordmark} from '@/components/primitives';

/**
 * The single closing band, rendered on every page: the open-source CTA row,
 * the four-column link grid, a quiet legal strip with the live status line,
 * and the giant ghost wordmark as the final visual - edge-faded and clipped
 * by the layout's boxed frame.
 */

type FooterLink = {label: string; to?: string; href?: string};

const GITHUB_URL = 'https://github.com/clustrail/clustrail';

const COLUMNS: Array<{title: string; links: FooterLink[]}> = [
  {
    title: 'Product',
    links: [
      {label: 'Architecture', to: '/architecture'},
      {label: 'Docs', to: '/docs'},
      {label: 'Changelog', to: '/changelog'},
      {label: 'Install', to: '/#install'},
    ],
  },
  {
    title: 'Project',
    links: [
      {label: 'GitHub', href: GITHUB_URL},
      {label: 'Issues', href: `${GITHUB_URL}/issues`},
      {label: 'Releases', href: `${GITHUB_URL}/releases`},
      {label: 'License AGPL-3.0', href: `${GITHUB_URL}/blob/main/LICENSE`},
    ],
  },
  {
    title: 'Resources',
    links: [
      {label: 'Quickstart', to: '/docs/quickstart'},
      {label: 'Configuration', to: '/docs/configuration'},
      {label: 'FAQ', to: '/docs/faq'},
      {label: 'Updates', to: '/docs/updates'},
    ],
  },
];

function FooterAnchor({link}: {link: FooterLink}): ReactNode {
  const className =
    'text-sm text-muted-foreground no-underline transition-colors hover:text-foreground';
  return link.href ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
      {link.label}
    </a>
  ) : (
    <Link href={link.to!} className={className}>
      {link.label}
    </Link>
  );
}

export default function Footer(): ReactNode {
  const year = new Date().getFullYear();
  return (
    <footer className="overflow-hidden border-t border-border bg-background">
      {/* Open-source CTA row. */}
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
              Open source, all the way down.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Clustrail is licensed under AGPL-3.0-only. One binary, your kubeconfig, and a
              browser tab.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <CtaButton href={GITHUB_URL} variant="primary">
              Read the source
            </CtaButton>
            <CtaButton href={`${GITHUB_URL}/stargazers`} variant="outline">
              Star on GitHub
            </CtaButton>
          </div>
        </div>
      </div>

      {/* Link grid. */}
      <div className="border-t border-border/60">
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-16">
            {/* Brand column */}
            <div className="col-span-2 flex max-w-xs flex-col items-start gap-3 sm:col-span-3 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 no-underline">
                <img src="/favicon.svg" alt="" width={24} height={24} draggable={false} />
                <Wordmark className="text-lg" />
              </Link>
              <p className="m-0 text-sm leading-relaxed text-muted-foreground">
                A Kubernetes UI on steroids. One binary, your kubeconfig, and a browser tab.
              </p>
            </div>

            {/* Link columns */}
            {COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-foreground">{col.title}</span>
                {col.links.map((link) => (
                  <FooterAnchor key={link.label} link={link} />
                ))}
              </div>
            ))}
          </div>

          {/* Legal + status strip. */}
          <div className="mt-12 flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">© {year} Clustrail</span>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="relative flex size-1.5" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-live" />
              </span>
              All systems operational
            </span>
          </div>
        </div>
      </div>

      {/* Giant ghost wordmark, edge-faded, the final visual. */}
      <div className="pointer-events-none relative mt-4 select-none" aria-hidden>
        <div className="mask-fade-x flex justify-center overflow-hidden">
          <Wordmark
            tone="ghost"
            className="text-[17vw] leading-none tracking-tighter text-foreground opacity-[0.05]"
          />
        </div>
      </div>
    </footer>
  );
}
