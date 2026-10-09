# Canonical repository structure

```text
src/                    accepted domain/controller/identity/provider/computer/context/recovery services
  console/              human read projections, validated contracts, atomic commands, coordination, fixture/staging seams
migrations/             additive PostgreSQL migrations 001–011; scheduler-owned fixture separate
scheduler/              real Temporal/pg-boss adapters; reference-only fresh-authority activities and qualification harness
web/                    ONE primary Next.js / React / TypeScript Focus Desk console
  app/                  guarded pages, AuthKit callback, same-origin BFF
  components/           Work/inspector, exact approval, task/grant/assignment, accessible controls
  lib/server/           private identity/session/domain bridge (never browser secrets)
  public/fonts/         licensed self-hosted Geist and JetBrains Mono
  tests/                shared runtime, client freshness, receipt and component tests
internal/operator/      clearly labelled dev/test-only former operator UI; not a second production interface
tests/                  accepted backend regressions, new domain and integrated Chromium tests
tools/                  owned local fixtures, fresh verification, source fingerprint, disabled staging preparation
qualification/          unchanged honest production ledger and original qualification material
implementation/         accepted backend preparation/runbooks and historical evidence; no primary UI here
.artifacts/canonical/     fresh import/final evidence and retained failed/intermediate attempts
  final/                current complete verification; authoritative fresh source digest and SUMMARY.json
docs/                   architecture, security self-review, delivery, staging sequence and source reconciliation
  interface-source/     exact approved specification/40 contracts/gaps/plan
  design-source/        approved Focus Desk direction/context
  reconciliation/       one delta, old-UI mapping, updated 40-contract traceability and gap register
OWNER-ACTION-CHECKLIST.md  ONE external-action checklist
```

No handoff ZIPs, node_modules, generated databases/WAL/dumps, private key directories or .env credentials are product source. Historical fail-closed legacy patches are preserved as inactive source/evidence, not deployed senders. Current code is not a multi-repository/dual-UI product.
