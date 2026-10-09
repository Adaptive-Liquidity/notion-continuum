#!/bin/bash
set -euo pipefail
umask 077
cd "$(dirname "$0")/.."
export PGHOST=127.0.0.1 PGPORT=55432 PGUSER=localtest
mkdir -p .local
# NO activation control/fence copied. A restored instance has zero control rows => fail closed.
pg_dump -d "${CT_DATABASE:-ct_test}" --format=custom --schema=ct --exclude-table-data=ct.control --file="${1:-.local/domain-backup.dump}"
