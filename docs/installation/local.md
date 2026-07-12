---
id: local
title: Local install (macOS, Linux, Windows)
sidebar_label: Local (binary)
---

Install the `clustrail` binary on your machine and run it against the clusters in your kubeconfig.

## Install script

The recommended path on macOS and Linux:

```sh
curl -fsSL https://clustrail.io/install.sh | sh
```

The script:

1. Detects your OS and architecture (Linux/macOS, amd64/arm64).
2. Downloads the matching archive for the latest release.
3. Verifies its SHA-256 checksum against the release's `checksums.txt`.
4. Installs the binary to `/usr/local/bin` (using `sudo` only if that directory is not writable).

Two environment variables customize it:

```sh
# Install a specific version instead of the latest.
CLUSTRAIL_VERSION=v0.1.4 curl -fsSL https://clustrail.io/install.sh | sh

# Install somewhere else (no sudo needed for a user-writable dir).
BINDIR=$HOME/.local/bin curl -fsSL https://clustrail.io/install.sh | sh
```

## Homebrew

On macOS and Linux:

```sh
brew install clustrail/tap/clustrail
```

Upgrades follow your normal Homebrew flow (`brew upgrade clustrail`).

## Manual download

Download the archive for your platform from the [releases page](https://github.com/clustrail/clustrail/releases), verify the checksum, and put the binary on your `PATH`.

```sh
# Example: Linux amd64, replace VERSION with the release you want.
curl -fsSLO https://github.com/clustrail/clustrail/releases/download/vVERSION/clustrail_VERSION_linux_amd64.tar.gz
curl -fsSLO https://github.com/clustrail/clustrail/releases/download/vVERSION/checksums.txt
sha256sum -c checksums.txt --ignore-missing
tar -xzf clustrail_VERSION_linux_amd64.tar.gz clustrail
install -m 0755 clustrail /usr/local/bin/clustrail
```

### Windows

Download the `windows_amd64` zip from the [releases page](https://github.com/clustrail/clustrail/releases), extract `clustrail.exe`, and run it from a terminal:

```powershell
.\clustrail.exe serve
```

Clustrail reads `%USERPROFILE%\.kube\config` (or the `KUBECONFIG` environment variable), the same as `kubectl` on Windows.

## Verify

```sh
clustrail version
```

This prints the version, commit, and build date, and confirms the binary runs on your platform.

## Run

```sh
clustrail serve
```

Then open [http://localhost:8080](http://localhost:8080).
See the [Quickstart](../quickstart.md) for first steps and [Configuration](../configuration.md) for all options.

## Uninstall

The install is a single file plus an optional config directory:

```sh
# Script / manual installs.
sudo rm /usr/local/bin/clustrail

# Homebrew.
brew uninstall clustrail

# Optional: local preferences and the managed-clusters kubeconfig.
rm -rf ~/.config/clustrail
```

Nothing is installed inside your clusters, so there is nothing to clean up there.
