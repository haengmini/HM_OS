#!/usr/bin/env bash
set -euo pipefail

TAILSCALE_BIN="${TAILSCALE_BIN:-/opt/data/bin/tailscale}"
TAILSCALE_SOCKET="${TAILSCALE_SOCKET:-/opt/data/home/.local/run/tailscale/tailscaled.sock}"
TARGET="${HM_OS_SERVE_TARGET:-http://127.0.0.1:8767}"

"$TAILSCALE_BIN" --socket="$TAILSCALE_SOCKET" serve --bg "$TARGET"
"$TAILSCALE_BIN" --socket="$TAILSCALE_SOCKET" serve status
