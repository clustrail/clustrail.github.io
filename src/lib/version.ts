import {CHANGELOG} from '@site/src/data/changelog';
import type {Release} from '@site/src/lib/releases';

// Single source of truth for "what is the latest version" across the site (the
// hero badge and the changelog's "Latest" flag).
//
// The version is derived from the UNION of the curated changelog entries (which
// are committed in this repo) and the GitHub Releases fetched at build time, and
// never from the build-time API alone. That fetch races with the release
// pipeline: a deploy triggered by committing the changelog can build before the
// GitHub release is published, so the API would report the previous version. The
// curated data, being committed alongside the release, is always current in that
// deploy - so taking the newest tag from either source keeps the badge and the
// changelog consistent and correct regardless of deploy/publish timing.

/** Parse `vX.Y.Z` into a comparable tuple (pre-release suffix ignored). */
export function versionKey(tag: string): [number, number, number] {
  const parts = tag.replace(/^v/, '').split('-')[0].split('.');
  return [
    parseInt(parts[0], 10) || 0,
    parseInt(parts[1], 10) || 0,
    parseInt(parts[2], 10) || 0,
  ];
}

/** Newest-first tag comparison. */
export function compareDesc(a: string, b: string): number {
  const av = versionKey(a);
  const bv = versionKey(b);
  for (let i = 0; i < 3; i++) {
    if (av[i] !== bv[i]) return bv[i] - av[i];
  }
  return 0;
}

/** All known version tags (curated notes ∪ published releases), newest first. */
export function allKnownTags(releases: Release[]): string[] {
  return Array.from(
    new Set([...Object.keys(CHANGELOG), ...releases.map((r) => r.tag)]),
  ).sort(compareDesc);
}

/**
 * The newest stable version tag from either source, or '' when nothing is known.
 * Tags the API marks as pre-release are skipped for the "latest" pick; curated
 * entries are stable by convention.
 */
export function latestTag(releases: Release[]): string {
  const prerelease = new Set(
    releases.filter((r) => r.prerelease).map((r) => r.tag),
  );
  const tags = allKnownTags(releases);
  return tags.find((t) => !prerelease.has(t)) ?? tags[0] ?? '';
}
