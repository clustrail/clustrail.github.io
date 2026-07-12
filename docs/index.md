---
id: index
title: What is Clustrail?
sidebar_label: What is Clustrail?
slug: /
---

Clustrail is **a Kubernetes UI on steroids**: a fast, lightweight web dashboard for one or many clusters, served from a single self-contained binary.

You download one file, run `clustrail serve`, and open your browser.
There is no separate web server, no database, no sidecars, and no agents to install in your clusters.

## How it works

Clustrail runs next to you (on your laptop, a jump host, or inside a cluster) and acts as an **authenticating gateway** to the Kubernetes API servers you already have access to.

Three design decisions define the product:

- **Watch-based, never polling.**
  Clustrail subscribes to the Kubernetes watch API and maintains a live in-memory view of your clusters.
  The browser receives only deltas over a single WebSocket, so lists update instantly without refresh loops or periodic re-fetching.
- **Virtualized rendering.**
  Tables render only the rows you can see.
  A namespace with 10,000 Pods scrolls as smoothly as one with ten.
- **Your RBAC, enforced upstream.**
  Clustrail never holds privileges beyond the credentials it is given.
  Every request is proxied to the real API server with your identity, so Kubernetes itself decides what you can see and do.
  If you cannot list Secrets with `kubectl`, you cannot list them in Clustrail either.

## What you get

- A cluster **Overview** with node health, capacity, workload status, and problem pods.
- A **resource browser** covering workloads, networking, storage, configuration, RBAC, and custom resources, all live.
- A **split-pane workspace**: open any object next to the list with describe-style details, live YAML editing, events, logs, and an in-browser terminal.
- A **global log viewer** that streams and merges logs from many pods at once.
- A live **events timeline**, a **topology graph**, and CPU/RAM **metrics** views.
- **Node operations** (cordon, uncordon, drain) and common workload actions (scale, restart, delete).
- **Helm release** visibility with rollback and uninstall.
- **Multi-cluster** support with instant context switching, plus optional runtime cluster management.
- Flexible **authentication**: anonymous local use, a shared in-cluster ServiceAccount, per-user tokens, and OpenID Connect single sign-on, including per-cluster OIDC providers.

## Where it runs

The same binary serves two common setups:

- **Desktop**: run it locally against the contexts in your kubeconfig, like a faster `kubectl` with a UI.
  See the [Quickstart](quickstart.md).
- **In-cluster**: deploy it once with the [Helm chart](installation/in-cluster.md) and share one URL with your team, with authentication modes to match your security model.

Clustrail is free to install and use, and it is open source under the AGPL-3.0-only license.
The source code lives at [github.com/clustrail/clustrail](https://github.com/clustrail/clustrail), alongside the binary, container image, and Helm chart releases.
Contributions are welcome; see the [contributing guide](https://github.com/clustrail/clustrail/blob/main/CONTRIBUTING.md) to get started.

## Next steps

- [Quickstart](quickstart.md): install and open your first cluster in under a minute.
- [Installation](installation/index.md): every install channel, including Docker and Helm.
- [Configuration](configuration.md): flags, environment variables, and the config file.
- [Authentication](authentication/index.md): pick the identity mode for your deployment.
- [Features](features/index.md): a tour of everything in the UI.
