---
id: in-cluster
title: In-cluster (Helm)
sidebar_label: In-cluster (Helm)
---

Deploy Clustrail inside a cluster and share one URL with your team.
The Helm chart is published as an OCI artifact, so no repository needs to be added.

## Install

```sh
helm install clustrail oci://ghcr.io/clustrail/charts/clustrail
```

Pin a chart version for anything durable:

```sh
helm install clustrail oci://ghcr.io/clustrail/charts/clustrail --version 0.1.0
```

The service defaults to `ClusterIP`, so reach the UI with a port-forward first:

```sh
kubectl port-forward svc/clustrail 8080:8080
# open http://localhost:8080
```

For real deployments, enable the Ingress (`ingress.enabled`, `ingress.hosts`, `ingress.tls`) or change `service.type`.

The pod is hardened by default: it runs the distroless non-root image with a read-only root filesystem, and its probes hit `GET /api/healthz`.

## Identity and RBAC: read this first

Clustrail is an authenticating gateway.
The Kubernetes API server enforces RBAC using whatever identity Clustrail presents, so the chart's defaults matter:

- In-cluster, the default identity is the pod's **ServiceAccount** (`identity-mode: auto` resolves to `shared-sa` inside a pod).
- `rbac.create` (default `true`) binds a read-mostly ClusterRole to that ServiceAccount.

This default is the batteries-included choice for **single-tenant** and homelab use: everyone who can reach the UI reads the cluster as that one ServiceAccount.

It is the **wrong** choice for multi-tenant clusters, because every viewer would inherit that cluster-wide read regardless of their own permissions.
For a shared deployment where users must keep their own RBAC, disable the bundled role and pick a per-user mode:

```yaml
rbac:
  create: false

config:
  identity-mode: per-user
  oidc:
    issuer: https://your-issuer.example.com
    client-id: clustrail
    redirect-url: https://clustrail.example.com/api/auth/callback
```

See [Authentication](../authentication/index.md) for the full decision guide, including OIDC single sign-on, trusted reverse-proxy headers, and the middle-ground `allow-user-tokens` option for shared-SA deployments.

## Configuration

Everything under the chart's `config` value is rendered into a ConfigMap and passed to the server via `--config`.
Its schema is exactly the server's [configuration file](../configuration.md), for example:

```yaml
config:
  identity-mode: shared-sa
  allow-user-tokens: true
```

Secrets (like an OIDC client secret) should not go into `config`.
Mount them and reference them by file path (`oidc.client-secret-file`) or inject them as `CLUSTRAIL_*` environment variables instead.

## Key chart values

| Value | Default | Description |
| --- | --- | --- |
| `image.repository` | `ghcr.io/clustrail/clustrail` | Image repository. |
| `image.tag` | chart `appVersion` | Image tag override. |
| `replicaCount` | `1` | Number of replicas. |
| `service.type` / `service.port` | `ClusterIP` / `8080` | Service exposure. |
| `ingress.enabled` | `false` | Create an Ingress (`ingress.hosts`, `ingress.tls`). |
| `serviceAccount.create` | `true` | Create the pod ServiceAccount. |
| `rbac.create` | `true` | Create the read-mostly ClusterRole and binding (see above). |
| `config` | `{}` | Server config, rendered to a ConfigMap and passed via `--config`. |
| `resources` | 50m/64Mi requests, 500m/256Mi limits | Container resources. |

## Upgrade and uninstall

```sh
helm upgrade clustrail oci://ghcr.io/clustrail/charts/clustrail
helm uninstall clustrail
```

Clustrail keeps no server-side state beyond in-memory caches, so upgrades and reinstalls are safe at any time.
