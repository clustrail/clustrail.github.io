---
id: quickstart
title: Quickstart
sidebar_label: Quickstart
---

Get Clustrail running against your existing clusters in under a minute.
This page covers the desktop workflow; for running it inside a cluster see [In-cluster installation](installation/in-cluster.md).

## 1. Install

On macOS or Linux, the install script detects your platform, verifies the release checksum, and installs the binary to `/usr/local/bin`:

```sh
curl -fsSL https://clustrail.github.io/install.sh | sh
```

Prefer Homebrew?

```sh
brew install clustrail/tap/clustrail
```

All channels, including Docker, Windows, and manual downloads, are covered in [Installation](installation/index.md).

## 2. Serve

```sh
clustrail serve
```

That is the whole setup.
Clustrail reads the same kubeconfig your `kubectl` uses (the `KUBECONFIG` environment variable, falling back to `~/.kube/config`) and serves the UI at [http://localhost:8080](http://localhost:8080).

Common variations:

```sh
# Listen on a different port.
clustrail serve --addr :9090

# Use a specific kubeconfig file.
clustrail serve --kubeconfig ~/work/kubeconfig.yaml

# Allow adding and removing clusters from the UI at runtime.
clustrail serve --enable-dynamic-clusters
```

## 3. Explore

Open [http://localhost:8080](http://localhost:8080).
You land on the **Overview** of your current kubeconfig context: node health, capacity, workload status, and recent problems.

From there:

- Switch clusters with the **cluster switcher** in the top bar; every context in your kubeconfig is available.
- Browse resources from the sidebar; every list is live and updates as the cluster changes.
- Click any row to open it in a **side pane** with details, live YAML, events, and (for Pods) logs and a terminal.
- Press <kbd>Cmd</kbd>+<kbd>K</kbd> (or <kbd>Ctrl</kbd>+<kbd>K</kbd>) to open the **command palette** and jump to any resource or page.

## Notes on access

Clustrail talks to your clusters with the same credentials your kubeconfig contains, and the API server enforces your RBAC on every request.
Nothing is installed into the clusters, and there is no separate account to create.

When you are done, stop the server with <kbd>Ctrl</kbd>+<kbd>C</kbd>.
There is no background service; nothing keeps running.

## Next steps

- [Configuration](configuration.md): the config file, flags, and environment variables.
- [Clusters](clusters.md): kubeconfig contexts, config-declared clusters, and runtime cluster management.
- [Features](features/index.md): a tour of everything in the UI.
