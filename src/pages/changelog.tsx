import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useReleases, type Release} from '@site/src/lib/releases';
import {CHANGELOG} from '@site/src/data/changelog';

/** Format an ISO timestamp deterministically (UTC) so SSR and hydration match. */
function formatDate(iso: string | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Parse `vX.Y.Z` into a comparable tuple (pre-release suffix ignored). */
function versionKey(tag: string): [number, number, number] {
  const parts = tag.replace(/^v/, '').split('-')[0].split('.');
  return [
    parseInt(parts[0], 10) || 0,
    parseInt(parts[1], 10) || 0,
    parseInt(parts[2], 10) || 0,
  ];
}

/** Newest-first tag comparison. */
function compareDesc(a: string, b: string): number {
  const av = versionKey(a);
  const bv = versionKey(b);
  for (let i = 0; i < 3; i++) {
    if (av[i] !== bv[i]) return bv[i] - av[i];
  }
  return 0;
}

function ReleaseEntry({
  tag,
  notes,
  release,
  latest,
}: {
  tag: string;
  notes: string[] | undefined;
  release: Release | undefined;
  latest: boolean;
}): ReactNode {
  return (
    <article className="border-t border-border/60 py-8 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-mono text-xl font-semibold tracking-tight text-foreground">
          {tag}
        </h2>
        {latest && (
          <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-2xs font-medium text-primary">
            Latest
          </span>
        )}
        {release?.prerelease && (
          <span className="rounded-full border border-border px-2 py-0.5 text-2xs font-medium text-muted-foreground">
            Pre-release
          </span>
        )}
        <span className="text-sm text-muted-foreground">
          {formatDate(release?.publishedAt)}
        </span>
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

  // The curated notes are the source of truth for which versions to show; the
  // releases API only enriches them with dates and the "latest" flag. This makes
  // a version appear as soon as it is committed here - never gated on the API
  // having returned it at build time (which races with the release publish).
  const byTag = new Map(releases.map((r) => [r.tag, r]));
  const tags = Array.from(
    new Set([...Object.keys(CHANGELOG), ...releases.map((r) => r.tag)]),
  ).sort(compareDesc);
  const latestTag = latest?.tag ?? tags[0];

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
            {tags.length === 0 ? (
              <p className="text-[15px] text-muted-foreground">
                No releases yet. Check back soon, or see{' '}
                <Link to="/#install" className="text-primary hover:underline">
                  the install options
                </Link>
                .
              </p>
            ) : (
              tags.map((tag) => (
                <ReleaseEntry
                  key={tag}
                  tag={tag}
                  notes={CHANGELOG[tag]}
                  release={byTag.get(tag)}
                  latest={tag === latestTag}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
