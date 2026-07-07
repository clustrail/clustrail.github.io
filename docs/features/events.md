---
id: events
title: Events timeline
sidebar_label: Events
---

The Events page is a live view of what the cluster is doing right now: scheduling decisions, image pulls, probe failures, evictions, scaling.

![The events timeline](/shots/events.png)

## Two views

- **Timeline**: events as a color-coded chronological feed, warnings standing out from normal activity.
- **Table**: the same stream as a sortable table; clicking a row opens the event object's detail pane.

Both views stream over the same live socket as everything else and honor the global namespace filter.
The view choice is in the URL, so a shared link opens the same presentation.

## Filters

- **Type**: all, Normal, or Warning.
- **Reason**: the reasons present in the current stream (FailedScheduling, BackOff, Killing, ...).
- **Kind**: the involved object's kind, again built from what is actually present.
- One click clears all filters.

## Events in context

The full timeline is for the cluster; for a single object, the **Events** tab of its [detail pane](workspace.md) shows just the events involving that object.
The [Overview](overview.md) page surfaces the newest events, linking here for the rest.
