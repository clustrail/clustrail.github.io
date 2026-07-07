---
id: index
title: Features
sidebar_label: Tour
---

A tour of what is in the UI.
Everything below is live: lists, details, events, and statuses update as the cluster changes, with no refresh button anywhere.

## The shell

Every page shares one shell:

- A collapsible **sidebar** with the cluster's views and resource groups.
- A **top bar** with the cluster switcher, namespace filter, search (command palette), active port-forwards, connection status, and theme toggle.
- A **workspace**: detail panes open beside the content (right inspector) or in a bottom dock, as tabs you can rearrange, eject, split, and maximize.
- **Breadcrumbs** and deep-linkable URLs everywhere; the namespace filter and view options live in the URL, so links you share open exactly what you see.

## The pages

| Page | What it does |
| --- | --- |
| [Overview](overview.md) | Cluster health at a glance: nodes, capacity, workloads, problems, recent events. |
| [Resource browser](resource-browser.md) | Live, virtualized tables for every resource type, including CRDs. |
| [Workspace and detail panes](workspace.md) | Details, live YAML editing, per-object events, logs, and an in-browser terminal. |
| [Logs](logs.md) | A multi-pod streaming log explorer with filtering, search, and download. |
| [Events](events.md) | A live timeline or table of cluster events with type/reason/kind filters. |
| [Topology](topology.md) | An interactive graph of how workloads, services, and config connect. |
| [Metrics](metrics.md) | CPU and memory usage for the cluster, nodes, and the busiest pods. |
| [Nodes](nodes.md) | Node details plus cordon, uncordon, and streaming drain. |
| [Helm](helm.md) | Browse releases, diff revisions, roll back, upgrade, uninstall, and install charts. |
| [Command palette](command-palette.md) | Keyboard-first navigation and cross-cluster object search. |
| [Settings](settings.md) | Preferences, your session, and cluster management. |

## Keyboard shortcuts

Press <kbd>?</kbd> anywhere for the full cheatsheet.
The essentials:

| Keys | Action |
| --- | --- |
| <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>K</kbd> | Command palette |
| <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>B</kbd> | Toggle sidebar |
| <kbd>j</kbd> / <kbd>k</kbd> | Move down / up a table |
| <kbd>Enter</kbd> | Open the focused row |
| <kbd>x</kbd> or <kbd>Space</kbd> | Select the focused row |
| <kbd>.</kbd> | Open the row's action menu |
| <kbd>c</kbd> / <kbd>y</kbd> | Copy name / namespace+name |
| <kbd>Alt</kbd>+<kbd>W</kbd> | Close the active pane |
| <kbd>Alt</kbd>+<kbd>[</kbd> / <kbd>Alt</kbd>+<kbd>]</kbd> | Previous / next pane tab |
| <kbd>Alt</kbd>+<kbd>M</kbd> | Maximize / restore the panel |

## RBAC awareness

Actions you are not allowed to perform are not hidden; they render disabled with a tooltip explaining the denial, based on a live access review.
Forbidden lists show a clear permission message instead of an empty table.
Clustrail itself never grants or blocks anything; the cluster decides.
