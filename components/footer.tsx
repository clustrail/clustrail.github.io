import type {ReactNode} from 'react';
import Link from 'next/link';
import {Wordmark} from '@/components/primitives';

/**
 * Branded footer: lockup + tagline on the left, link columns on the right,
 * and a hairline-separated legal row. Rendered on every page.
 */

type FooterLink = {label: string; to?: string; href?: string};

const COLUMNS: Array<{title: string; links: FooterLink[]}> = [
  {
    title: 'Product',
    links: [
      {label: 'Install', to: '/#install'},
      {label: 'Features', to: '/docs/features'},
      {label: 'Changelog', to: '/changelog'},
    ],
  },
  {
    title: 'Docs',
    links: [
      {label: 'Quickstart', to: '/docs/quickstart'},
      {label: 'Installation', to: '/docs/installation'},
      {label: 'Configuration', to: '/docs/configuration'},
      {label: 'FAQ', to: '/docs/faq'},
    ],
  },
  {
    title: 'Support',
    links: [
      {label: 'GitHub', href: 'https://github.com/clustrail/clustrail'},
      {label: 'Report an issue', href: 'https://github.com/clustrail/clustrail/issues'},
      {label: 'Releases', href: 'https://github.com/clustrail/clustrail/releases'},
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
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          {/* Brand block */}
          <div className="flex max-w-xs flex-col items-start gap-3">
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <img src="/favicon.svg" alt="" width={24} height={24} draggable={false} />
              <Wordmark className="text-lg" />
            </Link>
            <p className="m-0 text-sm leading-relaxed text-muted-foreground">
              A Kubernetes UI on steroids. One binary, your kubeconfig, and a browser tab.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
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
        </div>

        {/* Legal row */}
        <div className="mt-12 flex flex-col gap-2 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">© {year} Clustrail</span>
          <span className="text-sm text-muted-foreground">
            Fast, lightweight, and RBAC-respecting.
          </span>
        </div>
      </div>
    </footer>
  );
}
