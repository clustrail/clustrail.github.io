---
id: settings
title: Settings
sidebar_label: Settings
---

The Settings page (the gear in the sidebar) has three sections.

## Preferences

UI behavior, stored in your browser:

- **Compact table rows**: the default table density.
- **Confirm before replacing panes**: ask before a shared link replaces your open workspace panes.

Theme (light, dark, or system) is switched from the top bar or the command palette.

## Session

Who you are, and how you signed in:

- Shows your current **login method** and **identity**.
- In `per-user` mode: **Sign out**.
- In `shared-sa` mode with user tokens enabled: a personal **sign-in** form (SSO and/or bearer token) to switch from the shared identity to your own, and **Switch back to shared access** to revert.

See [Authentication](../authentication/index.md) for what these modes mean.

## Clusters

Every cluster Clustrail serves, each with:

- A **source badge**: Kubeconfig, Config, In-cluster, or Added.
- A **Current** marker and an **Open** button.
- For [per-cluster OIDC](../authentication/cluster-oidc.md) clusters: a **Signed in** or **Sign-in required** badge with per-cluster **Sign in** / **Sign out**.

When the server runs with `--enable-dynamic-clusters`, this section also manages the cluster list itself: an **Add cluster** dialog (paste a kubeconfig, or enter a server URL and token) and **Remove** on clusters that were added at runtime.
See [Clusters](../clusters.md#adding-clusters-at-runtime) for how and where these are stored.
