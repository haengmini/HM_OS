#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${HM_OS_ENV_FILE:-$ROOT/config/hm-os.env}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
fi

: "${HM_OS_OWNER_LOGIN:=ihyeongmin00@gmail.com}"
: "${HM_OS_TAILNET_HOSTNAME:=hm-os-server.taila8b4a0.ts.net}"
: "${HM_OS_DATA_DIR:=/opt/data/hm-os-data}"
: "${HM_OS_FILES_ROOT:=/opt/data}"
: "${HM_OS_TERMINAL_CWD:=/opt/data}"
: "${HM_OS_COOKIE_SECURE:=true}"
: "${PORT:=8767}"

export HM_OS_OWNER_LOGIN HM_OS_TAILNET_HOSTNAME HM_OS_DATA_DIR
export HM_OS_FILES_ROOT HM_OS_TERMINAL_CWD HM_OS_COOKIE_SECURE PORT

mkdir -p "$HM_OS_DATA_DIR"
chmod 700 "$HM_OS_DATA_DIR"

exec node "$ROOT/apps/api/dist/server.js"
