---
id: clusters
title: Clusters
sidebar_label: Clusters
---

Clustrail is multi-cluster by design.
Every view is scoped to a cluster, switching is instant, and clusters can come from four sources at once.

## Cluster sources

| Source | Where it comes from | Badge in Settings |
| --- | --- | --- |
| Kubeconfig | Every context in your kubeconfig (`KUBECONFIG` or `~/.kube/config`, or `--kubeconfig`). | Kubeconfig |
| In-cluster | The pod's own cluster, when running inside Kubernetes. | In-cluster |
| Config-declared | Entries in the config file's `clusters` list, typically with [per-cluster OIDC](authentication/cluster-oidc.md). | Config |
| Added at runtime | Clusters added from the UI (see below). | Added |

## Switching and browsing

- The **cluster switcher** in the top bar lists every cluster; switching preserves your current view, swapping only the cluster.
- The **Contexts** page (`/contexts`, also "All contexts" in the command palette) shows every context with its cluster, user, and default namespace.
- The **command palette** can switch clusters and search objects across **all clusters** at once.

## Fleet views

Select two or more clusters on the Contexts page and choose **Open fleet** to get a cross-cluster aggregated view:

- **Resources** mode shows one merged, live table of any resource type across the selected clusters, with a Cluster column.
- **Overview** mode shows per-cluster summary cards side by side, each isolated so one unreachable cluster never blanks the rest.

## Adding clusters at runtime

By default the cluster list is fixed at startup.
Start the server with runtime cluster management enabled to manage it from the UI:

```sh
clustrail serve --enable-dynamic-clusters
```

**Settings > Clusters** then gains an **Add cluster** button with two tabs:

- **Kubeconfig**: paste a kubeconfig (optionally choosing one context).
- **Server &amp; token**: an API server URL, a bearer token, and optionally a CA bundle.

Added clusters can be removed from the same screen.

### Where they are stored

Runtime-added clusters persist to Clustrail's **own managed kubeconfig**, by default `clusters.yaml` in the user config directory (e.g. `~/.config/clustrail/clusters.yaml`, or `~/Library/Application Support/clustrail/clusters.yaml` on macOS), created with owner-only permissions.
Your `~/.kube/config` is **never modified**.
Override the location with `--managed-kubeconfig`.

### Why it is off by default

Adding a cluster means storing a credential on the server's disk.
On a personal machine that is exactly what you want; on a shared deployment the operator should make that call deliberately, which is why it is a startup flag rather than a UI toggle.

## Cluster IDs in URLs

Cluster names are sanitized into stable URL-safe IDs (lower-case letters, digits, and dashes, plus a short hash when needed).
Bookmarks and shared links stay valid as long as the context exists.
