#!/bin/bash
# Destructive ONLY to this local project's explicitly named fixture databases.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ "${CT_RESET_LOCAL_FIXTURE:-}" != 'yes' ]; then echo 'Set CT_RESET_LOCAL_FIXTURE=yes to reset ct_test and ct_restore local fixtures.'; exit 2; fi
mkdir -p .local/temporal-bin evidence
export PGHOST=127.0.0.1 PGPORT=55432 PGUSER=localtest
./tools/local-db.sh
for d in ct_restore ct_test; do dropdb --if-exists "$d"; done
bash tools/implementation-db.sh
npm ci > evidence/reproduce-npm.log 2>&1
npm run build > evidence/reproduce-build.log 2>&1
node --test --test-concurrency=1 dist/tests/foundation.test.js > evidence/M2-foundation-tests.tap 2>&1
./tools/backup-domain.sh
createdb ct_restore
pg_restore --exit-on-error -d ct_restore .local/domain-backup.dump > evidence/M2-restore.log 2>&1
psql -d ct_restore -Atc 'SELECT count(*) FROM ct.control;' > evidence/restored-control-count.txt
test "$(cat evidence/restored-control-count.txt)" = '0'
psql -d ct_test -Atc 'SELECT count(*),max(seq) FROM ct.evidence_events' > .local/pre-crash-count.txt
pg_ctl -D .local/pgdata stop -m immediate > evidence/M2-database-crash.log 2>&1
./tools/local-db.sh >> evidence/M2-database-crash.log 2>&1
psql -d ct_test -Atc 'SELECT count(*),max(seq) FROM ct.evidence_events' > .local/post-crash-count.txt
diff .local/pre-crash-count.txt .local/post-crash-count.txt >> evidence/M2-database-crash.log
node --test --test-concurrency=1 dist/tests/controller.test.js > evidence/M3-controller-tests.tap 2>&1
psql -v ON_ERROR_STOP=1 -d ct_test -f migrations/003-scheduler-fixture.sql > evidence/M4-scheduler-migration.log
node dist/tests/scheduler-comparison.js > evidence/M4-scheduler-run.log 2>&1
python3 tests/legacy-hotfix-probe.py > evidence/legacy-python-guard-tests.json
node --test --test-concurrency=1 dist/tests/legacy-hotfix.test.js > evidence/legacy-typescript-guard-tests.tap 2>&1
node --test --test-concurrency=1 dist/tests/release-local.test.js > evidence/local-release-gates.tap 2>&1
printf 'All implemented LOCAL validation tests passed. Production release gates are not cleared.\n'
