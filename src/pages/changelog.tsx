import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useReleases, type Release} from '@site/src/lib/releases';
import {CHANGELOG} from '@site/src/data/changelog';

/** Format an ISO timestamp deterministically (UTC) so SSR and hydration match. */
function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function ReleaseEntry({release, latest}: {release: Release; latest: boolean}): ReactNode {
  const notes = CHANGELOG[release.tag];
  return (
    <article className="border-t border-border/60 py-8 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-mono text-xl font-semibold tracking-tight text-foreground">
          {release.tag}
        </h2>
        {latest && (
          <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-2xs font-medium text-primary">
            Latest
          </span>
        )}
        {release.prerelease && (
          <span className="rounded-full border border-border px-2 py-0.5 text-2xs font-medium text-muted-foreground">
            Pre-release
          </span>
        )}
        <span className="text-sm text-muted-foreground">{formatDate(release.publishedAt)}</span>
      </div>
      {notes?.length ? (
        <ul className="mt-4 ml-4 flex list-disc flex-col gap-2">
          {notes.map((note, i) => (
            <li key={i} className="text-[15px] leading-relaxed text-muted-foreground">
              {note}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default function Changelog(): ReactNode {
  const {releases, latest} = useReleases();
  return (
    <Layout
      title="Changelog"
      description="Every Clustrail release, newest first - with a short summary of what changed.">
      <main className="clustrail-landing bg-canvas">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <header>
            <span className="text-2xs font-semibold uppercase tracking-widest text-primary">
              Releases
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Changelog
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Every Clustrail release, newest first. Install the latest with{' '}
              <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">
                curl -fsSL https://clustrail.github.io/install.sh | sh
              </code>
              .
            </p>
          </header>

          <div className="mt-12">
            {releases.length === 0 ? (
              <p className="text-[15px] text-muted-foreground">
                No releases yet. Check back soon, or see{' '}
                <Link to="/#install" className="text-primary hover:underline">
                  the install options
                </Link>
                .
              </p>
            ) : (
              releases.map((release) => (
                <ReleaseEntry
                  key={release.tag}
                  release={release}
                  latest={latest?.tag === release.tag}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
