import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useReleases} from '@site/src/lib/releases';
import {CHANGELOG} from '@site/src/data/changelog';
import {allKnownTags, latestTag} from '@site/src/lib/version';

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

function ReleaseEntry({
  tag,
  notes,
  date,
  prerelease,
  latest,
}: {
  tag: string;
  notes: string[] | undefined;
  date: string | undefined;
  prerelease: boolean;
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
        {prerelease && (
          <span className="rounded-full border border-border px-2 py-0.5 text-2xs font-medium text-muted-foreground">
            Pre-release
          </span>
        )}
        <span className="text-sm text-muted-foreground">{formatDate(date)}</span>
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
  const {releases} = useReleases();

  // The committed changelog is the source of truth for which versions exist,
  // their notes, and their dates; the releases API is only a best-effort fallback
  // for a version not yet curated (its date/prerelease flag). Nothing shown here
  // depends on the API having returned a given release at build time - which races
  // with the release publish - so the site is correct the moment this commit
  // deploys.
  const byTag = new Map(releases.map((r) => [r.tag, r]));
  const tags = allKnownTags(releases);
  const newest = latestTag(releases);

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
              tags.map((tag) => {
                const entry = CHANGELOG[tag];
                const release = byTag.get(tag);
                return (
                  <ReleaseEntry
                    key={tag}
                    tag={tag}
                    notes={entry?.notes}
                    date={entry?.date ?? release?.publishedAt}
                    prerelease={Boolean(release?.prerelease)}
                    latest={tag === newest}
                  />
                );
              })
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
