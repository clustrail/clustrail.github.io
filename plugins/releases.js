// Build-time data source: the GitHub Releases published to this repo by the
// release pipeline (goreleaser targets clustrail/clustrail.github.io).
//
// This is a BEST-EFFORT FALLBACK, not the source of truth. The site renders its
// version, dates, and notes from the committed changelog (src/data/changelog.ts);
// this fetch only supplies a date/prerelease flag for a release that has no
// curated entry yet, and it can never override committed data. That is
// deliberate: this fetch runs during `docusaurus build` and races with the
// release publish (a deploy can build before the GitHub release exists), so
// nothing the site must get right is allowed to depend on it. A failed fetch
// degrades to an empty list - the site is still fully correct from committed data.
//
// CommonJS: the package has no "type": "module", so plugins load via require().

const REPO = 'clustrail/clustrail.github.io';

async function fetchReleases() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'clustrail-site-build',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/releases?per_page=100`,
    {headers},
  );
  if (!res.ok) {
    throw new Error(`GitHub API responded ${res.status}`);
  }
  const raw = await res.json();
  const releases = raw
    .filter((r) => !r.draft)
    .map((r) => ({
      tag: r.tag_name,
      name: r.name || r.tag_name,
      body: r.body || '',
      url: r.html_url,
      publishedAt: r.published_at,
      prerelease: Boolean(r.prerelease),
    }));
  // Newest-first is GitHub's default order; the latest stable is the first
  // non-prerelease, falling back to the newest of any kind.
  const latest = releases.find((r) => !r.prerelease) || releases[0] || null;
  return {releases, latest};
}

module.exports = function releasesPlugin() {
  return {
    name: 'clustrail-releases',
    async loadContent() {
      try {
        return await fetchReleases();
      } catch (err) {
        console.warn(
          `[clustrail-releases] could not load releases, using an empty list: ${err.message}`,
        );
        return {releases: [], latest: null};
      }
    },
    async contentLoaded({content, actions}) {
      actions.setGlobalData(content);
    },
  };
};
