# Asentxia Continuum — canonical local product

One coherent backend plus one authenticated Focus Desk console. **Locally implemented/tested; not production-ready.** PostgreSQL domain truth, VERA/identity/governance, independent Effect Controller, real scheduler adapters, computers/context/artifacts/evidence/recovery/resource controls and the new frontend are in this repository.

**P1 PARTIAL · P2 PARTIAL · P3/P4/P5 NOT RUN · scheduler HELD · production BLOCKED · canary NO-GO · independent review NOT RUN.**

## Start here
- `docs/DELIVERY.md` — exact current results, source pins, delivery limitations and disposition.
- `docs/ARCHITECTURE.md` / `docs/REPOSITORY-STRUCTURE.md` — preserved boundaries and actual source layout.
- `docs/reconciliation/CANONICAL-TRACEABILITY.md` / `CANONICAL-GAP-REGISTER.md` — all 40 approved interactions and honest remaining gaps.
- `docs/reconciliation/OPERATOR-UI-CAPABILITY-MAPPING.md` — every useful old capability mapped before retirement.
- `qualification/PRODUCTION-GATES.json` — unchanged live qualification ledger.
- `OWNER-ACTION-CHECKLIST.md` — the ONE short external checklist.
- `docs/REMAINING-STAGING-SEQUENCE.md` — later ordered staging/integration, not deployment authorization.

## Local prerequisites
Linux; **Node 24 backend**, separately installed **Node 22 frontend**; PostgreSQL 17 tools/server; Python, OpenSSL, Chromium; disposable local UID/network-namespace privileges for the existing containment tests. Set `CT_PG_BIN` and `CT_NODE22_BIN` to approved installed toolchain bin directories; set `CT_CHROMIUM_PATH` if needed. The recorded environment used Node 24.14.1/22.23.3 and PostgreSQL 17.10. Frontend: Next.js 16.4.0, React 19.1.9, TypeScript 5.9.3; patched framework choice is explicitly recorded in the single delta. Fonts are licensed/self-hosted.

```bash
export CT_PG_BIN=/path/to/postgresql17/bin
export CT_NODE22_BIN=/path/to/node22/bin
export PATH="$CT_PG_BIN:$PATH"  # current node stays Node 24
npm ci --ignore-scripts
CT_RESET_LOCAL_FIXTURE=yes CT_RESET_CONSOLE_FIXTURE=yes npm run test:canonical
# Optional fixed public GET tests — no provider credentials/mutations:
CT_RESET_LOCAL_FIXTURE=yes CT_RESET_CONSOLE_FIXTURE=yes CT_RUN_PUBLIC_READ_FIXTURE=yes npm run test:canonical
npm run qualification-check  # expected exit 1, release blocked
npm run release-check        # expected exit 1, release blocked
```

Reset flags affect only named owned disposable databases after a data-directory check. Never point test harnesses at staging/production or copy local trust authentication into staging. Native local HA/PITR is not cloud/region qualification. The reference scheduler smoke is not 24 hours.

## Run the local console
```bash
npm run dev:console
```
The wrapper prepares the named disposable local console DB, builds and launches the Next console/API. Only explicit **LOCAL TEST** sign-in appears. The generated short-lived test key/token stays server-side; no .env secrets needed. Ctrl-C stops owned app fixtures. Real AuthKit and renewable machine identity remain separately configured/qualified. Do not transplant fixture mode into staging.

Work is the everyday landing page: deterministic Needs attention, scoped records and contextual inspectors. Fixture owners can record tasks, approve exact actions, assign enrolled workers, create/revoke bounded grants, acknowledge incidents, mark notices read and export a partial authorized evidence page. These human commands never dispatch an effect. An independently scoped worker uses the controller; UNKNOWN has no Retry button. Read-only/unavailable profiles are explicit.

The former operator layout is only `internal/operator/ui` with a fixture-only server. It is not mounted/linked as a production console. Internal cancellation/context-release capabilities stay there deliberately; they were not silently removed or copied into the final UI.

## Evidence and boundaries
`canonical-evidence/final/SUMMARY.json` and raw logs are current. Import/intermediate/failed attempts and baseline manifests are historical, not substitute current verification. `docs/M1-SAFETY-CONTRACTS.md` bytes remain frozen. A clean dependency audit or axe result is not security/accessibility certification. Unavailable features are not fake implementations.

Stop owned fixtures after use: `pg_ctl -D .local/pgdata -m fast stop` (only after verifying ownership). Dependencies, .next/dist/cache, databases/WAL/dumps, fixture credentials/private keys and machine-specific paths are excluded from the source handoff. Repository licence/commercial terms remain owner decisions; font licences are included. No merge, production deployment or shadow/canary is authorized by this build.
