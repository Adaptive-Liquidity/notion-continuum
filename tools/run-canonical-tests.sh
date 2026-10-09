#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
[ "${CT_RESET_LOCAL_FIXTURE:-}" = yes ] && [ "${CT_RESET_CONSOLE_FIXTURE:-}" = yes ] || { echo 'Explicit CT_RESET_LOCAL_FIXTURE=yes and CT_RESET_CONSOLE_FIXTURE=yes required for owned disposable fixtures.';exit 2; }
[ "$(node -p 'process.versions.node.split(".")[0]')" = 24 ] || { echo 'Run backend verification with Node 24; web wrapper uses separately installed Node 22.';exit 2; }
export PATH="${CT_PG_BIN:-/data/toolchains/pg17/bin}:$PATH" NEXT_TELEMETRY_DISABLED=1
export PGHOST=127.0.0.1 PGPORT=55432 PGUSER=localtest
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT=canonical-evidence/final
mkdir -p canonical-evidence/attempts
if [ -d "$OUT" ];then mv "$OUT" "canonical-evidence/attempts/final-$STAMP";fi
mkdir -p "$OUT/backend" "$OUT/frontend" "$OUT/baseline" "$OUT/browser"
trap 'printf "Verification stopped at line %s; exit %s. See retained raw evidence.\n" "$LINENO" "$?" > "$OUT/INCOMPLETE.txt"' ERR
sha256sum qualification/PRODUCTION-GATES.json docs/M1-SAFETY-CONTRACTS.md > "$OUT/FROZEN-INPUTS.sha256"
python3 tools/canonical-source-digest.py > "$OUT/TESTED-SOURCE.json"
printf 'Re-running all 121 accepted backend groups, native local HA/PITR and legacy guards.\n'
npm test > "$OUT/baseline/RUN.log" 2>&1
cp -a implementation/evidence/final "$OUT/baseline/suites"
cp -a implementation/evidence/dr-lab "$OUT/baseline/dr-lab"
cp implementation/evidence/FINAL-SUMMARY.json "$OUT/baseline/SUMMARY.json"
# Import evidence remains historical. Fresh results are isolated above.
git restore evidence implementation/evidence
printf 'Testing new canonical domain contracts from a fresh database.\n'
bash tools/setup-console-db.sh ct_console_test > "$OUT/backend/SETUP.log" 2>&1
CT_DATABASE=ct_console_test node --test --test-concurrency=1 --test-reporter=tap dist/tests/console-domain.test.js > "$OUT/backend/CONSOLE-DOMAIN.tap" 2>&1
node --test --test-concurrency=1 --test-reporter=tap dist/tests/console-semantics.test.js > "$OUT/backend/CONSOLE-SEMANTICS.tap" 2>&1
if [ "${CT_RUN_PUBLIC_READ_FIXTURE:-}" = yes ];then
 printf 'Verifying the existing fixed, unauthenticated GitHub public-read adapter; no provider mutation.\n'
 bash tools/setup-console-db.sh ct_provider_read_test > "$OUT/backend/PUBLIC-READ-SETUP.log" 2>&1
 CT_DATABASE=ct_provider_read_test node --test --test-concurrency=1 --test-reporter=tap dist/tests/real-provider.test.js > "$OUT/backend/REAL-PUBLIC-READ.tap" 2>&1
 cp qualification/evidence/REAL-PROVIDER-REQUESTS.json "$OUT/backend/REAL-PUBLIC-READ-RESPONSES.json"
 git restore qualification/evidence/REAL-PROVIDER-REQUESTS.json
else
 printf 'NOT RUN: fixed public-read checks require explicit CT_RUN_PUBLIC_READ_FIXTURE=yes.\n' > "$OUT/backend/REAL-PUBLIC-READ-NOT-RUN.txt"
fi
printf 'Checking and building the authenticated Focus Desk on Node 22.\n'
bash tools/web-node22.sh typecheck > "$OUT/frontend/TYPECHECK.log" 2>&1
bash tools/web-node22.sh test > "$OUT/frontend/UNIT-COMPONENT.log" 2>&1
bash tools/web-node22.sh build > "$OUT/frontend/PRODUCTION-BUILD.log" 2>&1
printf 'Exercising the optimized frontend, backend and 10,000-task fixtures in Chromium.\n'
bash tools/setup-console-db.sh ct_console_browser > "$OUT/backend/BROWSER-SETUP.log" 2>&1
if [ -d canonical-evidence/browser ];then cp -a canonical-evidence/browser "canonical-evidence/attempts/browser-$STAMP";fi
node --test --test-concurrency=1 --test-reporter=tap dist/tests/console-browser.test.js > "$OUT/frontend/BROWSER.tap" 2>&1
cp -a canonical-evidence/browser/. "$OUT/browser/"
npm audit --omit=dev --json > "$OUT/DEPENDENCY-AUDIT.json"
set +e
npm run qualification-check > "$OUT/QUALIFICATION-CHECK.log" 2>&1; Q=$?
npm run release-check > "$OUT/RELEASE-CHECK.log" 2>&1; R=$?
set -e
[ "$Q" = 1 ] && [ "$R" = 1 ] || { echo 'Expected qualification/release enforcement to remain blocked.';exit 1; }
sha256sum -c "$OUT/FROZEN-INPUTS.sha256" > "$OUT/FROZEN-INPUTS-UNCHANGED.log"
python3 tools/canonical-source-digest.py > "$OUT/SOURCE-AFTER.json"
cmp "$OUT/TESTED-SOURCE.json" "$OUT/SOURCE-AFTER.json"
python3 tools/summarize-canonical-evidence.py
printf 'Canonical local verification passed. Production BLOCKED; scheduler HELD; canary NO-GO.\n'
