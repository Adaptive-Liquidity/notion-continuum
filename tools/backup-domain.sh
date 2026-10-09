#!/bin/bash
set -euo pipefail
umask 077
cd "$(dirname "$0")/.."
source tools/local-fixture-env.sh
export PGHOST=127.0.0.1 PGPORT=55432 PGUSER=localtest
mkdir -p .local
# NO activation control/fence copied. A restored instance has zero control rows => fail closed.
[ "$(realpath "$(psql -d ct_test -Atc 'SHOW data_directory')")" = "$PWD/.local/pgdata" ] || { echo 'Refusing non-owned fixture backup';exit 2; }
pg_dump -d "${CT_DATABASE:-ct_test}" --format=custom --schema=ct --exclude-table-data=ct.control --file="${1:-.local/domain-backup.dump}"
