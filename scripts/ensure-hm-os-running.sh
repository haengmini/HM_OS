#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PM2="$ROOT/node_modules/.bin/pm2"
TAILSCALE="${TAILSCALE_BIN:-/opt/data/bin/tailscale}"
SOCKET="${TAILSCALE_SOCKET:-/opt/data/home/.local/run/tailscale/tailscaled.sock}"
HEALTH_URL="${HM_OS_HEALTH_URL:-http://127.0.0.1:8767/healthz}"

mkdir -p /opt/data/logs/hm-os

start_stack() {
  if ! "$PM2" resurrect >/dev/null 2>&1; then
    "$PM2" start "$ROOT/ecosystem.config.cjs" >/dev/null
  fi
}

is_online() {
  local pid
  pid="$("$PM2" pid "$1" 2>/dev/null | tail -n 1)"
  [[ "$pid" =~ ^[1-9][0-9]*$ ]]
}

# `pm2 pid` starts the daemon if absent. If the saved process list
# wasn't restored, start/resurrect the checked-in stack.
if ! is_online hm-os-api || ! is_online hm-os-tailscaled; then
  start_stack
  sleep 3
fi

if ! curl --fail --silent --max-time 5 "$HEALTH_URL" >/dev/null; then
  "$PM2" restart hm-os-api --update-env >/dev/null
  sleep 2
fi

if ! "$TAILSCALE" --socket="$SOCKET" status --json >/dev/null 2>&1; then
  "$PM2" restart hm-os-tailscaled >/dev/null
  sleep 3
fi

# Tailscale Serve configuration is persistent, but verify it after a
# daemon recovery and restore it if needed. This remains tailnet-only;
# the script never invokes `tailscale funnel`.
if ! "$TAILSCALE" --socket="$SOCKET" serve status 2>/dev/null | grep -q '127.0.0.1:8767'; then
  "$TAILSCALE" --socket="$SOCKET" serve --bg http://127.0.0.1:8767 >/dev/null
fi

# Final assertions. Success intentionally prints nothing so the
# scheduler stays silent; a non-zero exit produces an alert.
curl --fail --silent --max-time 5 "$HEALTH_URL" >/dev/null
"$TAILSCALE" --socket="$SOCKET" status --json >/dev/null
"$TAILSCALE" --socket="$SOCKET" serve status | grep -q '127.0.0.1:8767'
