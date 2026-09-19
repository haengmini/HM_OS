#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_URL="${HM_OS_HEALTH_URL:-http://127.0.0.1:8767/healthz}"
TAILSCALE_BIN="${TAILSCALE_BIN:-/opt/data/bin/tailscale}"
TAILSCALE_SOCKET="${TAILSCALE_SOCKET:-/opt/data/home/.local/run/tailscale/tailscaled.sock}"

health="$(curl --fail --silent --show-error --max-time 5 "$API_URL")"
node -e '
const body = JSON.parse(process.argv[1]);
if (body.status !== "ok" || body.service !== "hm-os-api") process.exit(1);
' "$health"

"$TAILSCALE_BIN" --socket="$TAILSCALE_SOCKET" status --json >/dev/null

printf 'HM OS healthy: API=%s, Tailscale=connected\n' "$API_URL"
