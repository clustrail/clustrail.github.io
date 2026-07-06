#!/bin/sh
# Clustrail installer.
#
#   curl -fsSL https://clustrail.github.io/install.sh | sh
#
# Detects OS/arch, downloads the matching release archive from GitHub,
# verifies its sha256 against the release checksums, and installs the
# `clustrail` binary.
#
# Environment overrides:
#   CLUSTRAIL_VERSION  install a specific version (e.g. v0.1.0); default: latest
#   BINDIR             install directory; default: /usr/local/bin
set -eu

REPO="clustrail/clustrail.github.io"
BINDIR="${BINDIR:-/usr/local/bin}"

log() { printf 'clustrail: %s\n' "$*" >&2; }
fail() { log "error: $*"; exit 1; }

command -v curl >/dev/null 2>&1 || fail "curl is required"
command -v tar >/dev/null 2>&1 || fail "tar is required"

# --- platform ---------------------------------------------------------------
os=$(uname -s)
case "$os" in
  Linux) os=linux ;;
  Darwin) os=darwin ;;
  *) fail "unsupported OS: $os (download Windows builds from https://github.com/${REPO}/releases)" ;;
esac

arch=$(uname -m)
case "$arch" in
  x86_64 | amd64) arch=amd64 ;;
  aarch64 | arm64) arch=arm64 ;;
  *) fail "unsupported architecture: $arch" ;;
esac

# --- version ----------------------------------------------------------------
tag="${CLUSTRAIL_VERSION:-}"
if [ -z "$tag" ]; then
  tag=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" |
    grep -m1 '"tag_name"' | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/')
  [ -n "$tag" ] || fail "could not resolve the latest release tag"
fi
case "$tag" in v*) ;; *) tag="v${tag}" ;; esac
version=${tag#v}

archive="clustrail_${version}_${os}_${arch}.tar.gz"
base="https://github.com/${REPO}/releases/download/${tag}"

# --- download + verify ------------------------------------------------------
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT INT TERM

log "downloading clustrail ${tag} (${os}/${arch})"
curl -fsSL -o "${tmp}/${archive}" "${base}/${archive}" ||
  fail "download failed: ${base}/${archive}"
curl -fsSL -o "${tmp}/checksums.txt" "${base}/checksums.txt" ||
  fail "download failed: ${base}/checksums.txt"

expected=$(grep " ${archive}\$" "${tmp}/checksums.txt" | cut -d' ' -f1)
[ -n "$expected" ] || fail "no checksum for ${archive} in checksums.txt"

if command -v sha256sum >/dev/null 2>&1; then
  actual=$(sha256sum "${tmp}/${archive}" | cut -d' ' -f1)
else
  actual=$(shasum -a 256 "${tmp}/${archive}" | cut -d' ' -f1)
fi
[ "$actual" = "$expected" ] || fail "checksum mismatch for ${archive}"
log "checksum verified"

# --- install ----------------------------------------------------------------
tar -xzf "${tmp}/${archive}" -C "$tmp" clustrail

if [ -w "$BINDIR" ]; then
  install -m 0755 "${tmp}/clustrail" "${BINDIR}/clustrail"
else
  log "escalating with sudo to write to ${BINDIR}"
  sudo install -m 0755 "${tmp}/clustrail" "${BINDIR}/clustrail"
fi

log "installed ${BINDIR}/clustrail ($("${BINDIR}/clustrail" version 2>/dev/null || echo "$tag"))"
