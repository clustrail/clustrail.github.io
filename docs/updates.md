---
id: updates
title: Updates
sidebar_label: Updates
---

Clustrail can tell you when a new version is available, and can update itself in one click.
Both are designed to be private, verifiable, and easy to turn off.

## The update check

The `clustrail` binary periodically fetches a small static manifest from this site:

```
GET https://clustrail.io/updates/manifest.json
```

The check runs roughly every 6 hours while the server is running.
It is a single anonymous GET of a static file: no account, no identifier, no machine fingerprint, and no telemetry of any kind is sent.
The request carries nothing beyond what any HTTP fetch carries, and nothing about you, your machine, or your clusters.
It honors the standard proxy environment variables (`HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`), so it works behind a corporate proxy.

When a newer version exists for your channel, the UI shows an unobtrusive notice with the release notes.
Nothing is ever downloaded or installed without an explicit action from you.

## Disabling the check

Turn the check off entirely with any of the usual [configuration](configuration.md) mechanisms:

| Config key | Flag | Environment variable | Default |
| --- | --- | --- | --- |
| `disable-update-check` | `--disable-update-check` | `CLUSTRAIL_DISABLE_UPDATE_CHECK` | `false` |

With the check disabled, Clustrail never contacts clustrail.io (or any other host) on its own.

## Channels

Clustrail follows one of two release channels:

| Channel | Meaning |
| --- | --- |
| `stable` (default) | Final releases only, e.g. `v0.2.0`. |
| `nightly` | The scheduled prerelease builds cut from `main` every night there are new commits, e.g. `v0.2.1-nightly.20260714`, plus any release candidates. |

Select the channel with `--update-channel stable` or `--update-channel nightly` (config key `update-channel`).
The `nightly` channel falls back to the newest stable release when no newer prerelease exists, so it is never behind `stable`.
Nightly builds never move the `latest` container tag and are never offered to Homebrew; they exist for trying tomorrow's build today, not for production.

## One-click self-update

When an update is available, you can apply it directly from the UI (or with `clustrail update` from the terminal).
The update is deliberately conservative:

1. The release archive for your OS and architecture is downloaded from the official GitHub release.
2. Its SHA-256 digest is verified against the release's `checksums.txt` before anything is touched.
3. The new binary replaces the running one atomically, and the previous binary is kept next to it as `clustrail.old` for manual rollback.
4. On macOS and Linux the server restarts itself seamlessly; open browser tabs reconnect automatically.

On Windows the swap succeeds the same way, but the running process cannot restart itself: the update completes and you restart `clustrail` manually to run the new version.

If anything fails verification, the update aborts and the running binary is left untouched.
To roll back manually, replace the binary with the preserved `clustrail.old`.

### Homebrew installs

Self-update works on Homebrew installs too: it replaces the real binary that the `brew` symlink points at.
Homebrew reconciles on its next `brew upgrade clustrail`, which moves you to the newest formula version as usual.
If you prefer Homebrew to own the binary exclusively, simply use `brew upgrade` instead of the one-click update.

## Who may trigger a self-update

Replacing the server binary is a host-level action, so it is gated by identity mode:

- In **local identity mode** (the desktop default, where the UI and the binary belong to the same person), self-update is always allowed.
- In **shared deployments** (`shared-sa` or `per-user` mode), self-update requires **both** the `--allow-remote-update` flag on the server **and** an authenticated user in the browser.

Without `--allow-remote-update`, a shared server only ever shows the update notice; applying it is up to whoever operates the host.

## Air-gapped and mirrored environments

Point the update check at your own mirror of the manifest with `--update-manifest-url` (config key `update-manifest-url`):

```sh
clustrail serve --update-manifest-url https://mirror.internal/clustrail/manifest.json
```

The manifest is a single static JSON file, so mirroring it (and, if desired, the release archives its URLs point at) is enough for fully air-gapped update checks.
In environments with no reachable manifest at all, the check fails silently and never affects normal operation.

## Manual upgrades

You can always upgrade the way you installed:

```sh
# Install script (stable)
curl -fsSL https://clustrail.io/install.sh | sh

# Install script (a specific version, including prereleases)
curl -fsSL https://clustrail.io/install.sh | sh -s -- --version v0.2.0-rc.1

# Homebrew
brew upgrade clustrail

# Docker
docker pull ghcr.io/clustrail/clustrail:latest

# Helm (in-cluster)
helm upgrade clustrail oci://ghcr.io/clustrail/charts/clustrail
```

The [changelog](/changelog) lists every release with its notes.
