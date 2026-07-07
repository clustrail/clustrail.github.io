---
id: logs
title: Log viewer
sidebar_label: Logs
---

The Logs page is a multi-pod streaming log explorer: follow one pod, a workload, or every pod in a namespace, merged into one live stream.

![The log viewer](/shots/logs.png)

## Choosing sources

Three mutually exclusive source modes:

- **All workloads**: stream every pod in the selected namespaces.
- **Workloads picker**: a searchable multi-select of Deployments, StatefulSets, DaemonSets, and Jobs across namespaces.
- **Pod name pattern**: a regex matched against pod names.

A **max sources** cap (default 200) keeps a broad selection from turning into thousands of concurrent streams; raise or lower it as needed.
New pods that match your selection are picked up automatically as they appear.

## Working the stream

- **Source and container filter**: narrow the merged stream to specific pods/containers, each with a status dot.
- **Level filter**: log levels (trace through fatal) are auto-detected from the lines, and each level can be toggled.
- **Search** within the stream, with match stepping, a **regex** toggle, and a **filter-to-matches** mode that hides everything else.
- **Follow** tails the stream live; scrolling up pauses it, and the button pulses while following.
- **Wrap** and **timestamps** toggles, **Clear**, and **Reconnect**.
- **Download** saves the current stream contents to a file.
- A status indicator shows shown/total line counts and the connection state.

## Per-pod logs

The same viewer is available as a **Logs** tab on any pod's detail pane, and as a dockable pane, so you can keep a log stream open at the bottom while browsing other resources.

Log access uses your credentials: you can stream exactly the pods whose `pods/log` your RBAC allows, and nothing else.
