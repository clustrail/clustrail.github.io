import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import Link from 'next/link';
import {CopyButton} from '@/components/copy-button';
import {CHANGELOG} from '@/data/changelog';
import {fetchReleases} from '@/lib/releases';
import {allKnownTags, latestTag} from '@/lib/version';

const INSTALL_CMD = 'curl -fsSL https://clustrail.io/install.sh | sh';

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'Every Clustrail release, newest first - with a short summary of what changed.',
  alternates: {
    canonical: '/changelog',
  },
};

/** Format an ISO timestamp deterministically (UTC). */
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
    <li className="relative pb-16 pl-10 last:pb-0">
      {/* Timeline node: the latest release pulses live, the rest are quiet
          hairline dots seated on the rail. */}
      <span className="absolute top-1 left-0 flex size-6 -translate-x-1/2 items-center justify-center">
        {latest ? (
          <span className="relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-60" />
            <span className="relative inline-flex size-3 rounded-full bg-live" />
          </span>
        ) : (
          <span className="size-2.5 rounded-full border border-border bg-canvas" />
        )}
      </span>

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-sm font-semibold tracking-tight text-foreground">
          {tag}
        </span>
        {latest && (
          <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-link">
            Latest
          </span>
        )}
        {prerelease && (
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Pre-release
          </span>
        )}
      </div>

      <time className="mt-2 block text-xs text-muted-foreground">{formatDate(date)}</time>

      {notes?.length ? (
        <ul className="mt-5 ml-4 flex list-disc flex-col gap-2.5 marker:text-muted-foreground/50">
          {notes.map((note, i) => (
            <li key={i} className="pl-1.5 text-[15px] leading-relaxed text-muted-foreground">
              {note}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default async function Changelog(): Promise<ReactNode> {
  const releases = await fetchReleases();

  // The committed changelog is the source of truth for which versions exist,
  // their notes, and their dates; the releases API is only a best-effort
  // fallback for a version not yet curated (its date/prerelease flag).
  // Nothing shown here depends on the API having returned a given release at
  // build time - which races with the release publish - so the site is
  // correct the moment this commit deploys.
  const byTag = new Map(releases.map((r) => [r.tag, r]));
  const tags = allKnownTags(releases);
  const newest = latestTag(releases);

  return (
    <main className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
      <header>
        <span className="text-sm font-semibold text-primary">Releases</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Changelog
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          Every Clustrail release, newest first. Install the latest with a single command.
        </p>

        {/* Install hint - matches the hero's one-line install. */}
        <div className="mt-6 flex h-11 w-full max-w-md items-center gap-2 rounded-lg border border-input bg-card/60 pr-1 pl-4 text-sm backdrop-blur sm:w-auto sm:max-w-none">
          <span className="select-none font-mono text-link">$</span>
          <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-foreground">
            {INSTALL_CMD}
          </code>
          <CopyButton text={INSTALL_CMD} />
        </div>
      </header>

      <div className="mt-16">
        {tags.length === 0 ? (
          <p className="text-[15px] text-muted-foreground">
            No releases yet. Check back soon, or see{' '}
            <Link href="/#install" className="text-link hover:underline">
              the install options
            </Link>
            .
          </p>
        ) : (
          <ol className="relative ml-3 border-l border-border">
            {tags.map((tag) => {
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
            })}
          </ol>
        )}
      </div>
    </main>
  );
}
