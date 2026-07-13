---
id: faq
title: FAQ
sidebar_label: FAQ
---

### Is Clustrail open source?

Yes.
Clustrail is licensed under AGPL-3.0-only, and the source code and issue tracker live at [github.com/clustrail/clustrail](https://github.com/clustrail/clustrail).

### What does it cost?

Nothing.
Install it and use it.

### Does it install anything into my clusters?

Not for desktop use.
Clustrail is a client of the Kubernetes API, like `kubectl`; point it at a kubeconfig and it works with zero cluster-side footprint.
The one optional cluster-side piece is deploying Clustrail itself [in-cluster](installation/in-cluster.md) to share with a team.

### Can it bypass my RBAC?

No, by design.
Clustrail forwards your credentials to the API server on every request, and the API server enforces your RBAC.
There is no privileged backend account reading the cluster on your behalf in per-user setups; if a request would be forbidden for `kubectl`, it is forbidden in Clustrail.
The one deliberate exception is the [shared-SA mode](authentication/index.md#shared-sa-shared-serviceaccount), where everyone intentionally shares the pod's ServiceAccount.

### Why is it so fast?

Two decisions:

- The backend **watches** the Kubernetes API and streams only deltas to the browser over one WebSocket; nothing polls, nothing re-lists.
- The frontend **virtualizes** everything; a table renders only the rows on screen no matter how long the list is.

### How much resource does it need?

Very little.
The backend typically idles well under 100 MB of RAM for a cluster, and the default in-cluster resources are 50m CPU / 64Mi memory requests.

### Does it need a database?

No.
Clustrail keeps no server-side state beyond in-memory caches rebuilt on startup.
Its only writes to disk are the optional [managed kubeconfig](clusters.md#where-they-are-stored) for runtime-added clusters.

### Which Kubernetes versions and distributions work?

Any conformant cluster.
Clustrail speaks the standard Kubernetes API and discovers what each cluster serves, so EKS, GKE, AKS, OpenShift, k3s, kind, minikube, Docker Desktop, and bare-metal clusters all work, including their CRDs.

### Why don't I see CPU/memory numbers?

Usage metrics require metrics-server in the cluster.
See [Metrics](features/metrics.md#requirements); the page tells you specifically whether it is missing, not ready, or forbidden.

### Why don't I see an "Add cluster" button?

Runtime cluster management is off by default; start the server with `--enable-dynamic-clusters`.
See [Clusters](clusters.md#adding-clusters-at-runtime).

### Can several people use one Clustrail?

Yes, that is what the in-cluster deployment is for.
Read [Authentication](authentication/index.md) first and pick the identity mode that matches how much the users trust each other.

### How do I upgrade?

Replace the binary (re-run the install script, `brew upgrade clustrail`), pull the new image tag, or `helm upgrade`.
There is no migration step because there is no stored state.

### How do I report a bug or ask for a feature?

Open an issue on the [issue tracker](https://github.com/clustrail/clustrail/issues).
