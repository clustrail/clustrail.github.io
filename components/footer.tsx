import type {ReactNode} from 'react';
import Link from 'next/link';
import {StatusLabel, Wordmark} from '@/components/primitives';

/**
 * Branded footer: a brand column plus three link columns, over a hairline
 * legal strip. The status line echoes the app's own connection vocabulary.
 * Rendered on every page.
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
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
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
              <span className="font-mono text-2xs font-semibold uppercase tracking-[0.2em] text-foreground/70">
                {col.title}
              </span>
              {col.links.map((link) => (
                <FooterAnchor key={link.label} link={link} />
              ))}
            </div>
          ))}
        </div>

        {/* Legal + status row */}
        <div className="mt-12 flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">© {year} Clustrail</span>
          <StatusLabel live>ALL_INFORMERS_SYNCED</StatusLabel>
        </div>
      </div>
    </footer>
  );
}
