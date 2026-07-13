import {CHANGELOG} from '@/data/changelog';
import {fetchReleases, type Release} from '@/lib/releases';
import {latestTag, versionKey} from '@/lib/version';

/**
 * The update manifest the clustrail binary polls (anonymously, roughly every
 * six hours) to learn whether a newer version exists. `force-static` makes the
 * static export emit this as a plain file at /updates/manifest.json, built from
 * the same sources as the rest of the site: the committed changelog (the
 * source of truth) plus the best-effort GitHub Releases fetch.
 *
 * The `stable` channel version is derived with the exact same rule as the
 * site's version badge (lib/version.ts latestTag), so the manifest and the
 * badge can never disagree. The `nightly` channel additionally considers
 * prerelease tags (the scheduled nightly builds), using full semver
 * precedence.
 *
 * The {tag}/{version}/{os}/{arch}/{ext} tokens in archiveUrlTemplate and
 * checksumsUrl are LITERAL placeholders expanded by the binary, never here.
 */
export const dynamic = 'force-static';

const REPO = 'clustrail/clustrail';

interface Channel {
  version: string;
  date: string;
  notes: string[];
  releaseUrl: string;
  archiveUrlTemplate: string;
  checksumsUrl: string;
}

/** The prerelease part of a tag ('' for a stable release). */
function prereleasePart(tag: string): string {
  const dash = tag.indexOf('-');
  return dash === -1 ? '' : tag.slice(dash + 1);
}

/**
 * Newest-first comparison with FULL semver precedence, including prerelease
 * identifiers (1.2.0-rc.1 < 1.2.0; rc.2 > rc.1; numeric identifiers compare
 * numerically and rank below alphanumeric ones). lib/version.ts versionKey
 * deliberately ignores the prerelease part for the site's stable-only pick,
 * so this extends it locally rather than changing its behavior.
 */
function comparePrecedenceDesc(a: string, b: string): number {
  const av = versionKey(a);
  const bv = versionKey(b);
  for (let i = 0; i < 3; i++) {
    if (av[i] !== bv[i]) return bv[i] - av[i];
  }
  const ap = prereleasePart(a);
  const bp = prereleasePart(b);
  // A release has higher precedence than any prerelease of the same core.
  if (ap === '' && bp === '') return 0;
  if (ap === '') return -1;
  if (bp === '') return 1;
  const as = ap.split('.');
  const bs = bp.split('.');
  for (let i = 0; i < Math.max(as.length, bs.length); i++) {
    const x = as[i];
    const y = bs[i];
    // A larger set of identifiers has higher precedence when all the
    // preceding identifiers are equal.
    if (x === undefined) return 1;
    if (y === undefined) return -1;
    const xNum = /^\d+$/.test(x);
    const yNum = /^\d+$/.test(y);
    if (xNum && yNum) {
      const d = parseInt(y, 10) - parseInt(x, 10);
      if (d !== 0) return d;
    } else if (xNum !== yNum) {
      // Numeric identifiers always have lower precedence than alphanumeric.
      return xNum ? 1 : -1;
    } else if (x !== y) {
      return x < y ? 1 : -1;
    }
  }
  return 0;
}

/** Best-effort notes from a GitHub release body: non-empty lines, bullets stripped. */
function notesFromBody(body: string): string[] {
  return body
    .split('\n')
    .map((line) => line.replace(/^\s*[-*]\s+/, '').trim())
    .filter(Boolean);
}

function channelFor(tag: string, releases: Release[]): Channel {
  const entry = CHANGELOG[tag];
  const release = releases.find((r) => r.tag === tag);
  return {
    version: tag,
    date: entry?.date ?? release?.publishedAt ?? '',
    notes: entry?.notes ?? (release?.body ? notesFromBody(release.body) : []),
    releaseUrl: `https://github.com/${REPO}/releases/tag/${tag}`,
    archiveUrlTemplate: `https://github.com/${REPO}/releases/download/{tag}/clustrail_{version}_{os}_{arch}.{ext}`,
    checksumsUrl: `https://github.com/${REPO}/releases/download/{tag}/checksums.txt`,
  };
}

export async function GET(): Promise<Response> {
  // fetchReleases degrades to [] on any failure, so an unreachable GitHub API
  // still yields a correct manifest from the committed changelog alone.
  const releases = await fetchReleases();

  // stable: identical rule to the site's badge (curated ∪ API, prereleases
  // skipped), so the two can never disagree within one build.
  const stableTag = latestTag(releases);

  // nightly: the newest known tag INCLUDING prereleases (the scheduled
  // -nightly.YYYYMMDD builds, plus any release candidates), by full semver
  // precedence; identical to stable when nothing newer exists.
  const allTags = Array.from(
    new Set([...Object.keys(CHANGELOG), ...releases.map((r) => r.tag)]),
  ).sort(comparePrecedenceDesc);
  const nightlyTag =
    allTags.find((t) => comparePrecedenceDesc(t, stableTag) < 0) ?? stableTag;

  const stable = channelFor(stableTag, releases);
  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    channels: {
      stable,
      nightly: nightlyTag === stableTag ? stable : channelFor(nightlyTag, releases),
    },
  };

  return new Response(JSON.stringify(manifest, null, 2) + '\n', {
    headers: {'content-type': 'application/json'},
  });
}
