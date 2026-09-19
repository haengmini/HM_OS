#!/usr/bin/env bash
set -euo pipefail

TAILSCALE_BIN="${TAILSCALE_BIN:-/opt/data/bin/tailscaled}"
SOCKET="${TAILSCALE_SOCKET:-/opt/data/home/.local/run/tailscale/tailscaled.sock}"
STATE="${TAILSCALE_STATE:-/opt/data/home/.local/share/tailscale/tailscaled.state}"
SOCKS5="${TAILSCALE_SOCKS5:-127.0.0.1:1055}"

mkdir -p "$(dirname "$SOCKET")" "$(dirname "$STATE")"
exec "$TAILSCALE_BIN" \
  --tun=userspace-networking \
  --socket="$SOCKET" \
  --state="$STATE" \
  --socks5-server="$SOCKS5"
