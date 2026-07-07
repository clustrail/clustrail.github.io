---
id: nodes
title: Node operations
sidebar_label: Nodes
---

Beyond browsing node details, Clustrail performs the three day-two node operations directly from the UI.

## Cordon and uncordon

**Cordon** marks a node unschedulable so no new pods land on it; **uncordon** reverses it.
Both are available on the node's detail pane, its row menu, and as a bulk action across selected nodes.
A cordoned node is visibly badged in the Nodes list.

## Drain

**Drain** evicts the pods from a node so it can be maintained or removed, the same semantics as `kubectl drain`:

1. The node is cordoned first.
2. Pods are evicted through the Eviction API, so **PodDisruptionBudgets are respected**; an eviction a PDB forbids is reported, not forced.
3. DaemonSet pods and mirror pods are skipped, as they must be.

Drain runs as a **streaming pane**: you watch each pod cordoned, evicting, evicted, skipped, or failed line by line, ending in a summary of evicted/skipped/failed counts.
The pane cannot be closed mid-drain by accident.

## Individual evictions

Any pod's row menu offers **Evict**, which uses the same PDB-respecting Eviction API for a single pod, useful for nudging one workload off a node without draining it.

All node operations run with your credentials and require the corresponding RBAC (patching nodes, creating evictions); without it the buttons are disabled with the reason shown.
