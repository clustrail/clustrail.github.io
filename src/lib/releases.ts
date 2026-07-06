import {usePluginData} from '@docusaurus/useGlobalData';

/** One published release, projected from the GitHub Releases API at build time. */
export interface Release {
  tag: string;
  name: string;
  body: string;
  url: string;
  publishedAt: string;
  prerelease: boolean;
}

export interface ReleasesData {
  releases: Release[];
  latest: Release | null;
}

const EMPTY: ReleasesData = {releases: [], latest: null};

/**
 * The releases loaded by the `clustrail-releases` build plugin. Returns an empty
 * set if the plugin found none (e.g. the API was unreachable at build time).
 */
export function useReleases(): ReleasesData {
  return (usePluginData('clustrail-releases') as ReleasesData | undefined) ?? EMPTY;
}
