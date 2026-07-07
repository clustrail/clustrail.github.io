---
id: helm
title: Helm
sidebar_label: Helm
---

Clustrail reads and manages Helm releases directly from their in-cluster records; the `helm` CLI is not required, and everything runs with your credentials.

## Releases

The **Releases** page lists every installed release with its status, namespace, and chart version, scoped by a namespace filter.
Selecting one opens:

- The release header: chart, chart version, app version.
- A **revision history** strip across the top.
- **Manifest** and **Values** views of any revision; a release installed with defaults says "No user-supplied values" instead of showing an empty document.
- **Diff vs revision N**: compare what actually changed between any two revisions of the release.

## Actions

- **Upgrade**: pick a chart version and edit the values, then apply.
- **Roll back**: any prior revision offers one-click rollback with confirmation.
- **Uninstall**: with a "Keep release history" option so the record survives for auditing.

## Charts

The **Charts** page searches [Artifact Hub](https://artifacthub.io) for charts to install:

- Search results show each chart's logo, official/verified badges, stars, repository, and description.
- The install form takes a release name, target namespace (with "create namespace if missing"), a **version selector**, and a **values editor** pre-filled with the chart's default `values.yaml`.
- Install runs with your credentials and lands you on the release when it completes.

If Artifact Hub is unreachable (air-gapped environments), chart discovery reports itself unavailable while release management keeps working.
