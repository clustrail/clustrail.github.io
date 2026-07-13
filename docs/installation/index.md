---
id: index
title: Installation
sidebar_label: Overview
---

Clustrail ships as a single static binary, a multi-arch container image, and a Helm chart.
Pick the channel that matches where you want it to run.

| Channel | Best for | Guide |
| --- | --- | --- |
| Install script | macOS and Linux desktops, CI | [Local install](local.md#install-script) |
| Homebrew | macOS and Linux desktops | [Local install](local.md#homebrew) |
| Manual download | Windows, air-gapped hosts, pinned versions | [Local install](local.md#manual-download) |
| Docker | Trying it out without installing anything | [Docker](docker.md) |
| Helm chart | Running in-cluster for a team | [In-cluster](in-cluster.md) |

## Artifacts

Every release publishes:

- **Binaries** for Linux (amd64, arm64), macOS (amd64, arm64), and Windows (amd64), as tar.gz/zip archives with a `checksums.txt`.
- A **container image** at `ghcr.io/clustrail/clustrail`, multi-arch (amd64 and arm64), built on a distroless base that runs as a non-root user.
- A **Helm chart** as an OCI artifact at `ghcr.io/clustrail/charts/clustrail`.

Release notes for each version are on the [changelog](/changelog).

## Requirements

- A kubeconfig with access to at least one cluster (desktop), or a ServiceAccount (in-cluster).
- A modern browser.
- No other runtime dependencies: no Node.js, no database, no agents inside the clusters.

Clustrail is lightweight by design: it idles well under 100 MB of memory for a typical cluster, and the UI loads fast on any connection.
