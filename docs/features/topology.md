---
id: topology
title: Topology graph
sidebar_label: Topology
---

The Topology page draws how the cluster's objects relate: which Deployment owns which ReplicaSet and Pods, which Service routes to them, what config they mount, and where they run.

![The topology graph](/shots/topology.png)

## Relations

Edges are typed and carry an on-canvas legend:

- **Owns**: ownership chains (Deployment to ReplicaSet to Pod, CronJob to Job, ...).
- **Selects pods**: label selectors.
- **Routes to**: Service and Ingress traffic paths.
- **Uses config**: ConfigMap and Secret mounts and references.
- **Scales**: HorizontalPodAutoscaler targets.
- **Runs on**: pod placement on nodes.

Node badges track live status, so a crashing pod is visibly unhealthy on the graph as it happens.

## Working the graph

- **Group by** switches the layout: none, by Namespace, by Node, or by App.
- **Search** (press <kbd>/</kbd>) with previous/next stepping flies the viewport to each match.
- Pan, zoom, and a minimap for large graphs.
- Clicking a graph node opens the object's [detail pane](workspace.md); the pane's Overview also shows a focused mini-graph of that object's immediate relations.

The graph honors your RBAC: resource types you cannot list are simply omitted rather than failing the whole view.
Topology is per-cluster; in a fleet view you pick which cluster's graph to look at.
