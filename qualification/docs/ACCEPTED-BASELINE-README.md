# Continuum — Target Validation Implementation v0.1

**LOCAL VALIDATION SLICE, NOT PRODUCTION READY OR CANON.** Implements the safety-critical foundation/controller and compares both schedulers. Do not deploy the local authentication, fixture issuer, provider emulator or test fault hooks.

Start with `docs/IMPLEMENTATION-RESULT.md`, then `docs/M1-SAFETY-CONTRACTS.md` and `docs/RELEASE-GATES.json`. The provisional architecture is not reopened. The complete target is **not** implemented: production identity/approval/renewal, provider adapters, VM policies, full memory/artifact services, HA/PITR/DR and canary remain blocked.

## What is included
- Frozen/hashes safety contracts; PostgreSQL migrations/roles/tenant constraints and state guards.
- Independent Effect Controller, HMAC operation-scoped capabilities, pinned fixture adapter, matching read-back and UNKNOWN handling.
- Real Temporal TypeScript SDK and pg-boss workers sharing that controller.
- Fault/race/tenant/evidence/containment/local recovery tests and raw final results.
- Reviewed emergency fail-closed legacy patches. Not applied to GitHub or production.
- Gate ledger, exact integration/migration map and source/file checksum manifests.

## Run locally
Use Linux, Node 24, Python 3.13, PostgreSQL 17 tools, sudo and supported Linux network namespaces. Dependency versions are pinned in `package-lock.json`. The fixture requires `sudo unshare --net` and `setpriv`; it fails rather than skipping containment if unavailable.

On Amazon Linux: install PostgreSQL 17 server/client/contrib and iproute. Then:

```sh
npm ci
CT_RESET_LOCAL_FIXTURE=yes npm test
npm run release-check  # EXPECTED NONZERO: production gates remain blocked
```

The test command explicitly resets **only** local fixture databases `ct_test` and `ct_restore` in its own PostgreSQL instance (`.local/pgdata`, loopback port 55432). Never point this at another environment. Local trust authentication is deliberately test-only. Secrets/configs/history/dumps stay under ignored `.local/`; evidence packages exclude them. Stop the fixture after tests:

```sh
pg_ctl -D .local/pgdata stop -m fast
```

The comparison kills whole worker/controller processes and crashes the local database. A pg-boss killed-job recovery can wait for its supervision pass; allow several minutes for the suite. Workload timer is 1.2 real seconds, **not a 24-hour soak**. Retained v1 code is replayed after deploying v2; native Temporal deployment pinning is not qualified.

## Legacy patches
`legacy-hotfixes/FAIL-CLOSED-SAFETY-HOTFIX.patch` is against the source pins in the previous inventory, with repository prefixes (`Continuum/`, `continuum2/`). Verify actual deployed revision and diff before applying in a review branch. These guards intentionally **stop** unsafe legacy effect execution; they are not backward-compatible feature preservation or a completed production migration. Both original sources and prior evidence are preserved.

## Release rule
A local green run never clears production. `npm run release-check` remains red until every mandatory gate has independently evidenced PASS_PRODUCTION. Do not change status strings to bypass missing tests. No final scheduler choice is made from the bounded experiment.
