# Continuum — safe implementation and staging handoff

This is an additive offline continuation of the accepted safety core. It is NOT a production deployment, full end-to-end product-release claim, scheduler selection or canon promotion.

**P1 PARTIAL · all live identity tests NOT RUN · production BLOCKED · scheduler HELD · canary NO-GO.** Missing owner-controlled staging connections are deferred external prerequisites, not a stop on safe engineering.

Start with:
1. `implementation/docs/IMPLEMENTATION-RESULTS.md` — exact delivered scope, results and limitations.
2. `OWNER-ACTION-CHECKLIST.md` — the ONE external owner-action list.
3. `qualification/PRODUCTION-GATES.json` — honest live-release ledger.
4. `implementation/docs/STAGING-CHANGE-PLAN.md` and disabled `implementation/infra/*.json` — reviewed integration sequence; no deployment scripts activated.
5. `SHA256SUMS.txt` — current per-file manifest. Earlier `evidence/SOURCE-MANIFEST.json` and baseline/qualification records are historical source/evidence, not hashes of the changed implementation.

## Reproduce offline tests

Prerequisites: Linux, Node 24, PostgreSQL 17 CLI/server (local only), Python 3, OpenSSL, Chromium, and permission for disposable local UID/network-namespace tests. `CT_CHROMIUM_PATH` may specify the sandbox-local Chromium executable. Test identities/keys are generated fixtures; no WorkOS, cloud, provider or production secret is needed.

```bash
npm ci --ignore-scripts
CT_RESET_LOCAL_FIXTURE=yes npm test
npm run qualification-check # expected exit 1 while production remains blocked
```

The reset flag deliberately resets ONLY the fixed owned local fixture databases after checking the PostgreSQL data directory. Tests create loopback-only trust-auth databases and isolated local processes; NEVER copy that authentication setup into staging. The native failover/PITR lab uses fixed separate local ports, stops all lab clusters, and retains raw evidence. The real 24-hour trial remains disabled; smoke uses 5.5 seconds and test identity/provider.

After inspecting evidence, stop the owned disposable main cluster with `pg_ctl -D .local/pgdata -m fast stop`. Generated dependencies, database/backup/WAL files, fixture secrets, caches and private temporary keys are excluded from the handoff. Scripts retain executable permissions in this ZIP.

The frozen `docs/M1-SAFETY-CONTRACTS.md` is unchanged. The explicit recovery-only extension is `implementation/docs/RECOVERY-CONTRACT-v0.2.md`; ordinary runtime UNKNOWN never becomes sendable. No live gate becomes PASS because a fixture test is green.
