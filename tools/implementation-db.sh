#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
export PGHOST=127.0.0.1 PGPORT=55432 PGUSER=localtest
bash tools/local-db.sh
actual=$(psql -d postgres -Atc 'SHOW data_directory')
[ "$(realpath "$actual")" = "$PWD/.local/pgdata" ] || { echo 'Refusing other database cluster';exit 2; }
if [ "${1:-}" = reset ];then
 [ "${CT_RESET_LOCAL_FIXTURE:-}" = yes ] || { echo 'Explicit local-fixture reset flag required';exit 2; }
 psql -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname IN('ct_test','ct_restore') AND pid<>pg_backend_pid()" >/dev/null
 dropdb --if-exists ct_restore;dropdb --if-exists ct_test
 bash tools/local-db.sh
fi
for m in 005-identity-authority.sql 006-product-computers.sql 007-context-artifacts.sql 008-recovery-controls.sql 010-resource-controls.sql;do
 [ -f "migrations/$m" ] || continue
 case "$m" in 005*) table=identities;;006*) table=tasks;;007*) table=context_versions;;008*) table=recovery_runs;;010*) table=resource_limits;;esac
 if [ "$(psql -d ct_test -Atc "SELECT to_regclass('ct.$table') IS NOT NULL")" != t ];then
  psql -v ON_ERROR_STOP=1 -d ct_test -f "migrations/$m" > "implementation/evidence/MIGRATION-${m%.sql}.log" 2>&1
 fi
done

psql -v ON_ERROR_STOP=1 -d ct_test -f migrations/009-runtime-trigger-permissions.sql > implementation/evidence/MIGRATION-009-runtime-trigger-permissions.log 2>&1
