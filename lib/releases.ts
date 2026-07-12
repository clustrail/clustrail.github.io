// Build-time data source: the GitHub Releases published to the source repo by
// the release pipeline (goreleaser targets clustrail/clustrail).
//
// This is a BEST-EFFORT FALLBACK, not the source of truth. The site renders
// its version, dates, and notes from the committed changelog
// (data/changelog.ts); this fetch only supplies a date/prerelease flag for a
// release that has no curated entry yet, and it can never override committed
// data. That is deliberate: this fetch runs during `next build` and races
// with the release publish (a deploy can build before the GitHub release
// exists), so nothing the site must get right is allowed to depend on it. A
// failed fetch degrades to an empty list - the site is still fully correct
// from committed data.

const REPO = 'clustrail/clustrail';

/** One published release, projected from the GitHub Releases API at build time. */
export interface Release {
  tag: string;
  name: string;
  body: string;
  url: string;
  publishedAt: string;
  prerelease: boolean;
}

interface GithubRelease {
  tag_name: string;
  name: string | null;
  body: string | null;
  html_url: string;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
}

/**
 * Fetch the published releases, newest first, or an empty list on any
 * failure. Runs in server components at build time only (the whole site is
 * statically exported), so every page bakes in the same snapshot.
 */
export async function fetchReleases(): Promise<Release[]> {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'clustrail-site-build',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`, {
      headers,
      // One fetch per build: every page that asks gets the cached snapshot.
      cache: 'force-cache',
    });
    if (!res.ok) {
      throw new Error(`GitHub API responded ${res.status}`);
    }
    const raw = (await res.json()) as GithubRelease[];
    return raw
      .filter((r) => !r.draft)
      .map((r) => ({
        tag: r.tag_name,
        name: r.name || r.tag_name,
        body: r.body || '',
        url: r.html_url,
        publishedAt: r.published_at,
        prerelease: Boolean(r.prerelease),
      }));
  } catch (err) {
    console.warn(
      `[releases] could not load releases, using an empty list: ${(err as Error).message}`,
    );
    return [];
  }
}
