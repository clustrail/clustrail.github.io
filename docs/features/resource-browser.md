---
id: resource-browser
title: Resource browser
sidebar_label: Resource browser
---

Every resource list in Clustrail is a live, virtualized table.
Rows appear, change, and disappear as the cluster changes; only the visible rows exist in the DOM, so a list of 10,000 Pods scrolls as smoothly as a list of ten.

![The Pods list](/shots/pods.png)

## Resource coverage

The sidebar groups the built-in types:

- **Workloads**: Pods, Deployments, ReplicaSets, StatefulSets, DaemonSets, Jobs, CronJobs, HorizontalPodAutoscalers.
- **Network**: Services, Ingresses, NetworkPolicies, EndpointSlices.
- **Config**: ConfigMaps, Secrets, ResourceQuotas, LimitRanges, PodDisruptionBudgets.
- **Storage**: PersistentVolumeClaims, PersistentVolumes, StorageClasses.
- **Access Control**: ServiceAccounts, Roles, RoleBindings, ClusterRoles, ClusterRoleBindings.
- **Cluster**: Nodes, Namespaces.

**Custom resources** are discovered automatically: any CRD-backed type the cluster serves appears under a Custom Resources section, grouped by API group, with columns built from the CRD's own printer columns.

Each list has curated columns; Pods, for example, show readiness, phase, restarts, node, IP, live CPU/memory meters, and age.

## Filtering and navigation

- The **namespace filter** in the top bar is a searchable multi-select: all namespaces, one, or any subset.
  It is remembered per cluster and encoded in the URL, so links share your exact view.
- The table toolbar has a **name/namespace filter**, a **Problems** toggle (only unhealthy rows, on health-bearing resources), and column-header **sorting**.
- **Columns** can be hidden and reordered; **density** toggles between comfortable and compact rows.
- **Saved views** store a named table layout (filters, columns, sort) per resource type and can be re-applied anytime.
- Full **keyboard navigation**: <kbd>j</kbd>/<kbd>k</kbd> to move, <kbd>Enter</kbd> to open, <kbd>x</kbd> to select, <kbd>.</kbd> for the action menu.

## Actions

Click a row to open its [detail pane](workspace.md).
The per-row menu offers the object's full action set: Edit, Delete, Scale, Restart, Logs, Exec, Port forward, node Cordon/Uncordon/Drain, PDB-respecting Evict for pods, and a **Copy as kubectl** submenu that puts the equivalent `kubectl` command on your clipboard.

Selecting multiple rows raises a **bulk action bar**: Delete, Restart (workloads), or Cordon/Uncordon (nodes) across the selection, executed sequentially with a single summary toast; rows that failed stay selected.

All actions are RBAC-gated by a live access review: anything your credentials cannot do renders disabled with the reason in a tooltip.
