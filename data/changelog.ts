/**
 * Curated release notes, keyed by tag. changelog.json is the SITE'S SOURCE OF
 * TRUTH for every release: its version, date, and human-readable summary. It is
 * committed alongside each release, so the site renders correctly the moment this
 * commit deploys - with no dependency on the GitHub Releases API being reachable
 * or up to date at build time.
 *
 * This is deliberate. The API fetch (the releases build plugin) runs during the
 * build and races with the release pipeline that publishes the GitHub release: a
 * deploy can build before the release exists, so the API would report the
 * previous version. Everything the site displays therefore comes from
 * changelog.json; the API is only a best-effort fallback for a release that has
 * no entry there yet, and it can never override what is committed here. Cutting
 * a release means adding an entry to changelog.json (date + notes) - that is
 * what keeps the site correct.
 *
 * The data lives in changelog.json (rather than this file) so that non-TypeScript
 * consumers - notably the release gate script in the source repo, which verifies
 * a curated entry exists before tagging a stable release - can read the same
 * source of truth. This module remains the typed import surface for the site.
 *
 * `date` is an ISO 8601 timestamp (rendered in UTC so SSR and hydration agree).
 */
import changelogData from './changelog.json';

export interface ChangelogEntry {
  date: string;
  notes: string[];
}

export const CHANGELOG: Record<string, ChangelogEntry> =
  changelogData as Record<string, ChangelogEntry>;
