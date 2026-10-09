#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
[ "${CT_RESET_LOCAL_FIXTURE:-}" = yes ] || { echo 'Explicit CT_RESET_LOCAL_FIXTURE=yes required for owned disposable test databases.';exit 2; }
mkdir -p implementation/evidence/final implementation/evidence/attempts .local/temporal-bin
export PGHOST=127.0.0.1 PGPORT=55432 PGUSER=localtest
bash tools/implementation-db.sh reset > implementation/evidence/final/SETUP.log 2>&1
# No remote host accepted. Reset only fixed names under the verified local cluster.
psql -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='ct_recovery_test' AND pid<>pg_backend_pid()" >/dev/null
dropdb --if-exists ct_recovery_test
for d in .local/computer-fixtures .local/context-artifact-objects .local/private-restores .local/recovery-anchors .local/recovery-test-fence;do rm -rf "$d";done
if [ -d .local/dr-lab ];then
 for d in primary standby restored;do if pg_ctl -D ".local/dr-lab/$d" status >/dev/null 2>&1;then pg_ctl -D ".local/dr-lab/$d" -m immediate stop;fi;done
 mv .local/dr-lab ".local/dr-lab-retained-$(date +%s)"
fi
npm ci --ignore-scripts > implementation/evidence/final/DEPENDENCIES.log 2>&1
npm run build > implementation/evidence/final/BUILD.log 2>&1
run(){ local name=$1;shift;printf 'Running %s\n' "$name";node --test --test-reporter=tap --test-concurrency=1 "$@" > "implementation/evidence/final/$name.tap" 2>&1; }
run BASELINE-FOUNDATION dist/tests/foundation.test.js
bash tools/backup-domain.sh > implementation/evidence/final/LOGICAL-BACKUP.log 2>&1
createdb ct_restore;pg_restore --exit-on-error -d ct_restore .local/domain-backup.dump > implementation/evidence/final/LOGICAL-RESTORE.log 2>&1
[ "$(psql -d ct_restore -Atc 'SELECT count(*) FROM ct.control')" = 0 ]
printf 'restored activation rows = 0; dispatch remains blocked\n' > implementation/evidence/final/LOGICAL-RESTORE-STATUS.txt
psql -d ct_test -Atc 'SELECT count(*),max(seq) FROM ct.evidence_events' > .local/pre-final-crash.txt
pg_ctl -D .local/pgdata stop -m immediate > implementation/evidence/final/LOCAL-DATABASE-CRASH.log 2>&1
bash tools/local-db.sh >> implementation/evidence/final/LOCAL-DATABASE-CRASH.log 2>&1
psql -d ct_test -Atc 'SELECT count(*),max(seq) FROM ct.evidence_events' > .local/post-final-crash.txt
diff .local/pre-final-crash.txt .local/post-final-crash.txt >> implementation/evidence/final/LOCAL-DATABASE-CRASH.log
run BASELINE-CONTROLLER dist/tests/controller.test.js
run BASELINE-IDENTITY dist/tests/production-identity.test.js
run BASELINE-LEGACY dist/tests/legacy-hotfix.test.js
python3 tests/legacy-hotfix-probe.py > implementation/evidence/final/LEGACY-PYTHON.json
run BASELINE-RELEASE-LOCAL dist/tests/release-local.test.js
run PRODUCT-BACKEND dist/tests/product-backend.test.js
run COMPUTER-ISOLATION dist/tests/computer-isolation.test.js
CT_LOCAL_DR_LAB=yes python3 tools/local-ha-pitr-lab.py > implementation/evidence/final/HA-PITR-LAB.log 2>&1
psql -v ON_ERROR_STOP=1 -d ct_test -f migrations/003-scheduler-fixture.sql > implementation/evidence/final/SCHEDULER-SCHEMA.log
export CT_REFERENCE_DB_FILE="$PWD/.local/reference-temporal-final-$(date +%s).sqlite"
run REFERENCE-SCHEDULER dist/tests/reference-scheduler.test.js
run CONTEXT-ARTIFACT dist/tests/context-artifact.test.js
createdb ct_recovery_test
for m in 001-foundation.sql 002-lock-privileges.sql 004-monotonic-fences.sql 005-identity-authority.sql 006-product-computers.sql 007-context-artifacts.sql 008-recovery-controls.sql 009-runtime-trigger-permissions.sql 010-resource-controls.sql;do psql -v ON_ERROR_STOP=1 -d ct_recovery_test -f "migrations/$m" >> implementation/evidence/final/RECOVERY-SCHEMA.log 2>&1;done
CT_DATABASE=ct_recovery_test run EVIDENCE-RECOVERY dist/tests/evidence-recovery.test.js
run OPERATOR-DESK dist/tests/desk-frontend.test.js
run SECURITY-RESOURCE dist/tests/security-resource.test.js
run MIGRATION-PREPARATION dist/tests/migration-preparation.test.js
run STAGING-PREPARATION dist/tests/staging-preparation.test.js
run CONTROLLER-HTTPS dist/tests/controller-https.test.js
python3 - <<'PY'
from pathlib import Path
import re,json
s=[]
for p in sorted(Path('implementation/evidence/final').glob('*.tap')):
 t=p.read_text();values={k:int(re.search(r'^# '+k+r' (\d+)',t,re.M).group(1)) for k in ['tests','pass','fail','skipped']};s.append({'suite':p.stem,'evidence':str(p),'environment':'LOCAL_FIXTURE',**values})
x={'scope':'local/test-only; no live identity, VM, cloud DR or 24-hour gate passed','suites':s,'nodeGroups':sum(r['tests'] for r in s),'passed':sum(r['pass'] for r in s),'failed':sum(r['fail'] for r in s),'skipped':sum(r['skipped'] for r in s),'nativeDrCases':json.load(open('implementation/evidence/dr-lab/RESULT.json'))['cases'],'P1':'PARTIAL','liveIdentity':'NOT RUN','scheduler':'HELD','production':'BLOCKED','canary':'NO-GO'}
Path('implementation/evidence/FINAL-SUMMARY.json').write_text(json.dumps(x,indent=2)+'\n');print(f"{x['passed']}/{x['nodeGroups']} Node groups; {x['failed']} failures; {x['skipped']} skipped. All are local/test evidence.")
PY
printf 'Completed safe offline implementation validation. No production or canary executed.\n'
