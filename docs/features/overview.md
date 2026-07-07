---
id: overview
title: Cluster overview
sidebar_label: Cluster overview
---

The Overview is each cluster's landing page: the state of the cluster on one screen.

![The cluster overview](/shots/overview.png)

## What is on it

- **Stat tiles**: node count, cluster CPU and memory meters, and counts of Pods, Deployments, Services, and Namespaces.
  Every tile links to the corresponding list.
- **Node status**: each node's readiness at a glance.
- **Workload health**: how many workloads are healthy, progressing, or degraded.
- **Recent events**: the newest cluster events, with a link to the full [events timeline](events.md).

Everything on the page is fed by the same live watch stream as the rest of the UI, so a pod going into CrashLoopBackOff shows up here the moment it happens.

The CPU and memory meters come from `metrics.k8s.io` and require [metrics-server](metrics.md#requirements); without it the tiles degrade to an explicit "Metrics unavailable" state while everything else keeps working.

## Fleet overview

When you open several clusters as a [fleet](../clusters.md#fleet-views), the overview becomes per-cluster summary cards side by side.
Each card is loaded independently, so one unreachable cluster shows an error card while the others stay live.
