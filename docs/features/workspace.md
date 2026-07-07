---
id: workspace
title: Workspace and detail panes
sidebar_label: Workspace
---

Selecting any object opens it in a pane beside the list, IDE-style, so you never lose the context you came from.

![A pod detail pane next to the list](/shots/detail.png)

## Panes and docking

- Details open in the **right inspector**; streaming tools (logs, exec) can also live in a **bottom dock**.
- Panes are **tabs**: keep several objects open, drag tabs between zones, eject a tab into its own pane, split or merge the dock, and maximize any panel.
- <kbd>Alt</kbd>+<kbd>W</kbd> closes the active pane; <kbd>Alt</kbd>+<kbd>[</kbd> and <kbd>Alt</kbd>+<kbd>]</kbd> cycle tabs; <kbd>Alt</kbd>+<kbd>M</kbd> maximizes.

## Detail tabs

Every object gets **Overview**, **YAML**, and **Events** tabs; Pods add **Logs** and **Exec**.

The **Overview** tab shows the object's key fields, kind-specific detail (pod containers and conditions, service endpoints, ingress rules, HPA targets, node info), and its **related objects**, both as a list and a mini relationship graph.

**Secrets are masked.**
Secret values render hidden by default and are fetched only when you press Reveal, which itself is shown only when your RBAC allows reading the secret.
Environment variables that reference secrets display the reference, never the value.

## Live YAML editing

The **YAML** tab shows the object's manifest, updating live while you read.
Press **Edit** to change it:

- The editor validates YAML as you type, with inline squiggles, gutter markers, and a status footer; **Apply is blocked while the document is invalid**, with the reason shown.
- **Diff** toggles a side-by-side comparison of your draft against the current server version, so you can see exactly what will change before applying.
- **Revert** discards the draft; **Apply** (<kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>S</kbd>) submits it.
- If the object changes on the server while you edit, your draft is preserved and the diff shows the drift.

You can also create new objects from scratch: **Create resource** in the command palette opens an empty manifest editor and applies it to the cluster.

## Actions in the pane

The pane toolbar carries the object's write actions, matched to its kind:

- **Scale** for Deployments, ReplicaSets, and StatefulSets.
- **Restart** (rolling) for Deployments, StatefulSets, and DaemonSets.
- **Port forward** for Pods and Services: pick the port, get a copyable `127.0.0.1:PORT` address, stop it anytime.
  Active forwards across the app are listed in the top-bar indicator.
- **Cordon / Uncordon / Drain** for Nodes (see [Nodes](nodes.md)).
- **Edit** and **Delete** everywhere, with destructive confirmation.

## Exec: a terminal in the browser

The **Exec** tab attaches a real terminal to a pod container: pick the container, run your shell, <kbd>Ctrl</kbd>+<kbd>C</kbd> works, and a Reconnect button restores a dropped session.
Exec runs with your credentials, so it requires the `pods/exec` permission in that namespace.
