---
id: metrics
title: Metrics
sidebar_label: Metrics
---

The Metrics page shows CPU and memory usage for the cluster, its nodes, and its busiest pods.

![The metrics view](/shots/metrics.png)

## What is on it

- **Cluster trends**: live charts of cluster-wide CPU and memory utilization over time, built up while the page is open.
- **Nodes**: each node's usage against its allocatable capacity.
- **Top pods**: the busiest pods by CPU, with usage measured against their requests.

Node and pod names link straight to their detail panes.
Usage also appears inline elsewhere: the [Overview](overview.md) tiles and the CPU/memory meters in the Pods list come from the same source.

## Requirements

Metrics come from the standard `metrics.k8s.io` API, which is served by [metrics-server](https://github.com/kubernetes-sigs/metrics-server) (preinstalled on many managed clusters, an addon elsewhere).

Without it, Clustrail says so honestly: an explicit "Metrics unavailable" state distinguishes metrics-server not installed, not ready yet, and access forbidden, and the rest of the UI is unaffected.

## A note on freshness

Kubernetes serves usage metrics as periodic point-in-time readings, not a stream, so this is the one view Clustrail refreshes on a short cadence rather than over the watch socket.
Expect readings to move at the pace metrics-server produces them (roughly every 15 seconds on default setups).
