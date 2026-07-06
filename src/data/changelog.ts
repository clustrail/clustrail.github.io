/**
 * Curated release notes, keyed by tag. This file is the SITE'S SOURCE OF TRUTH
 * for every release: its version, date, and human-readable summary. It is
 * committed alongside each release, so the site renders correctly the moment this
 * commit deploys - with no dependency on the GitHub Releases API being reachable
 * or up to date at build time.
 *
 * This is deliberate. The API fetch (the releases build plugin) runs during the
 * build and races with the release pipeline that publishes the GitHub release: a
 * deploy can build before the release exists, so the API would report the
 * previous version. Everything the site displays therefore comes from this file;
 * the API is only a best-effort fallback for a release that has no entry here yet,
 * and it can never override what is committed here. Cutting a release means adding
 * an entry below (date + notes) - that is what keeps the site correct.
 *
 * `date` is an ISO 8601 timestamp (rendered in UTC so SSR and hydration agree).
 */
export interface ChangelogEntry {
  date: string;
  notes: string[];
}

export const CHANGELOG: Record<string, ChangelogEntry> = {
  'v0.1.4': {
    date: '2026-07-06T21:15:36Z',
    notes: [
      'Per-cluster OIDC: declare a cluster in config with its own OpenID Connect provider, and each user signs in to that cluster directly. The verified id_token becomes that cluster\'s credential, so RBAC is still enforced by the API server.',
      'Sign in and out of an OIDC cluster from Settings > Clusters, which shows each cluster\'s source and whether you are signed in.',
      'Supports a private issuer CA, so an in-cluster provider like dex works out of the box.',
    ],
  },
  'v0.1.3': {
    date: '2026-07-06T19:25:53Z',
    notes: [
      'A full-size Settings page with Preferences, Session, and Clusters sections, replacing the old settings dialog.',
      'Runtime cluster management: add and remove clusters from the UI (paste a kubeconfig or enter a server and token). Added clusters are stored in a Clustrail-managed config, never your kubeconfig. Enable with --enable-dynamic-clusters.',
      'A fleet overview: a per-cluster live summary across the clusters you select, with node and pod counts and health at a glance.',
    ],
  },
  'v0.1.2': {
    date: '2026-07-06T17:30:29Z',
    notes: [
      'Cross-cluster Fleet views: list one resource type across several clusters at once, in a single live table with a Cluster column.',
      'Launch a fleet by multi-selecting contexts on the Contexts page and choosing "Open fleet".',
      'The single-cluster experience is unchanged.',
    ],
  },
  'v0.1.1': {
    date: '2026-07-06T15:26:39Z',
    notes: [
      'Fixed the pod Logs and Exec tabs appearing disabled on GKE (and other IAM- or webhook-authorized clusters) even when you had permission.',
      'Permission checks now use an authoritative SelfSubjectAccessReview, so action gating is correct on GKE and EKS alike.',
    ],
  },
  'v0.1.0': {
    date: '2026-07-06T10:41:01Z',
    notes: [
      'Initial release.',
      'A single self-contained Go binary that serves the embedded web UI and proxies to your clusters with your own credentials - RBAC is always enforced by the API server, never by Clustrail.',
      'Live and watch-based: deltas stream over one multiplexed WebSocket, so every view stays current in real time with no polling.',
      'Virtualized resource tables that stay fast on large clusters - a 10,000-row list never puts 10,000 nodes in the DOM.',
      'Broad resource coverage out of the box, from Pods through RBAC, via a generic resource registry.',
      'A master-detail workspace with live YAML, per-object events, streaming multi-pod logs, and an in-browser terminal (exec).',
      'A cluster Overview, a topology graph, an events timeline, and poll-based CPU/RAM metrics.',
      'Node cordon and drain, plus the common write actions.',
      'Multi-cluster context switching, with per-user, shared-service-account, and OIDC identity modes.',
    ],
  },
};
