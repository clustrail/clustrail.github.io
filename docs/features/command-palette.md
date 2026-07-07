---
id: command-palette
title: Command palette
sidebar_label: Command palette
---

Press <kbd>Cmd</kbd>+<kbd>K</kbd> (macOS) or <kbd>Ctrl</kbd>+<kbd>K</kbd> to open the command palette, the fastest way to move around Clustrail.

## What it can do

- **Navigate**: jump to the Overview, Topology, Events, Logs, Metrics, Helm, any resource list (built-in or CRD), the Contexts page, or Settings.
- **Switch cluster** and **switch namespace** without touching the mouse.
- **Search live objects by name**: results come from the live watch cache, so they are instant and current.
  Each hit expands into an action panel: open details, edit YAML, view logs, exec, scale, port forward, restart, cordon/uncordon or drain a node, delete.
- **Search across all clusters**: a toggle widens object search from the current cluster to every cluster at once.
- **Create resource**: opens an empty manifest editor to apply a brand-new object.
- **Adjust the UI**: change theme, toggle the sidebar, and manage workspace panes (split or merge the dock, show or hide panels).

With no query, the palette shows your **recently used** commands first.

Object search respects your RBAC like everything else: it can only find what your credentials can list.
