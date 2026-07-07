---
id: index
title: Authentication and identity
sidebar_label: Overview
---

Clustrail is an authenticating gateway, not a privilege holder.
Every request to a cluster is made with a specific identity, and the Kubernetes API server enforces that identity's RBAC.
Clustrail adds no permission layer of its own: what you can see and do in the UI is exactly what your credentials allow.

The **identity mode** decides whose credentials those are.
Set it with `identity-mode` (flag `--identity-mode`, default `auto`).

## The four modes

### `local` (desktop)

The default outside a cluster.
Clustrail uses the credentials in your kubeconfig, exactly like `kubectl`.
There is no login screen and no user management; the process acts as you.

Use it when Clustrail runs on your own machine or a personal jump host.

### `shared-sa` (shared ServiceAccount)

The default inside a cluster.
Everyone who can reach the UI acts as one shared identity, the pod's ServiceAccount.
There is no login screen.

Use it for single-tenant clusters and homelabs where everyone with network access is equally trusted.
The [Helm chart](../installation/in-cluster.md#identity-and-rbac-read-this-first) can create a read-mostly ClusterRole for this ServiceAccount out of the box.

**With `allow-user-tokens: true`**, this mode gains an optional personal sign-in.
The shared ServiceAccount remains the default for everyone, but an individual user can open **Settings > Session** and sign in with their own bearer token (or SSO, if OIDC is configured).
From then on their requests carry their own identity and their own RBAC, and they can switch back to shared access at any time.

### `per-user`

Nobody gets a default identity.
The UI shows a login screen until the user authenticates, and every request they make is forwarded with their own credentials.

Users can sign in with:

- **A bearer token**: any token their cluster accepts (a ServiceAccount token, or a token from their identity provider).
- **Single sign-on**: one click, when [OIDC](oidc.md) is configured.
- **Transparently via a fronting proxy**: when [proxy authentication](proxy-auth.md) is configured, users who arrive through the trusted proxy are signed in automatically.

Use it for multi-tenant clusters where each user must keep their own permissions.

### `auto` (default)

Resolves to `shared-sa` when running inside a pod and `local` otherwise.
An explicit mode always wins, and a typo in the mode name is a hard startup error rather than a silent downgrade.

## Choosing a mode

| Deployment | Recommended mode |
| --- | --- |
| Your laptop | `local` (the default) |
| Homelab or single-tenant cluster | `shared-sa` (the default in-cluster) |
| Team cluster, everyone trusted equally | `shared-sa` |
| Team cluster, per-person permissions | `per-user` plus [OIDC](oidc.md) |
| Shared cluster, mostly read-only viewers with a few power users | `shared-sa` plus `allow-user-tokens: true` |
| Behind an SSO proxy (oauth2-proxy, Pomerium, ...) | `per-user` plus [proxy auth](proxy-auth.md) |

## Where credentials live

- Sign-in tokens are stored in secure, HTTP-only cookies scoped to the Clustrail origin.
  They are never placed in URLs and never written to logs.
- Secret values in the UI are masked by default and fetched only when you explicitly reveal them, subject to your RBAC.
- Clustrail keeps no database; signing out clears the session cookie.

## Related

- Individual clusters can also have their own OIDC provider, independent of the caller's login.
  See [Per-cluster OIDC](cluster-oidc.md).
