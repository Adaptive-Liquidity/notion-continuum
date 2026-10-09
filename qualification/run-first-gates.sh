#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
[ "${CT_RESET_LOCAL_FIXTURE:-}" = yes ] || { echo 'Explicit local-fixture reset required'; exit 2; }
export PGHOST=127.0.0.1 PGPORT=55432 PGUSER=localtest
bash tools/local-db.sh
for db in ct_restore ct_test; do dropdb --if-exists "$db"; done
bash tools/local-db.sh
psql -v ON_ERROR_STOP=1 -d ct_test -f migrations/005-identity-authority.sql > qualification/evidence/IDENTITY-MIGRATION.log
psql -v ON_ERROR_STOP=1 -d ct_test -f migrations/006-product-computers.sql >> qualification/evidence/MIGRATION-006.log
npm ci > qualification/evidence/NPM-REPRODUCE.log 2>&1
npm run build > qualification/evidence/BUILD-REPRODUCE.log 2>&1
node --test --test-concurrency=1 dist/tests/foundation.test.js > qualification/evidence/BASELINE-FOUNDATION.tap 2>&1
bash tools/backup-domain.sh
createdb ct_restore
pg_restore --exit-on-error -d ct_restore .local/domain-backup.dump > qualification/evidence/RESTORE-REGRESSION.log 2>&1
node --test --test-concurrency=1 dist/tests/controller.test.js > qualification/evidence/BASELINE-CONTROLLER.tap 2>&1
node --test --test-concurrency=1 dist/tests/production-identity.test.js > qualification/evidence/IDENTITY-TESTS.tap 2>&1
node --test --test-concurrency=1 dist/tests/real-provider.test.js > qualification/evidence/REAL-PROVIDER-TESTS.tap 2>&1
printf 'Baseline regressions and first qualification implementation tests passed. Production gates remain PARTIAL/NOT RUN.\n'
