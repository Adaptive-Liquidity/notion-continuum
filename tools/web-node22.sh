#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
BIN=${CT_NODE22_BIN:-/data/toolchains/node22/bin}
[ -x "$BIN/node" ] || { echo 'Set CT_NODE22_BIN to an installed approved Node 22 bin directory.';exit 2; }
[ "$("$BIN/node" -p 'process.versions.node.split(".")[0]')" = 22 ] || { echo 'Frontend requires Node 22; backend remains Node 24.';exit 2; }
export PATH="$BIN:$PATH" NEXT_TELEMETRY_DISABLED=1
npm run "${1:-build}" --workspace web -- "${@:2}"
