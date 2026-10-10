# Final-product reconciliation

Status: proposed target, owner decisions open, not canon. Production remains BLOCKED, the scheduler remains HELD, and canary remains NO-GO.

This note compares the 2026-10-10 proposed handoff with the working tree after the audited remediation commit. It does not copy the private reference archive, install the proposed Cursor rules, or replace `OWNER-ACTION-CHECKLIST.md`. Disclosure of the private archive is D05 and is not approved.

The handoff inspected `0d6c911`. Findings below were rechecked against the later tree.

## Finding map

| Finding | Disposition |
|---|---|
| H01–H03, M01–M04, L01–L02 | Fixed in the remediation commit, with local regressions. Hosted CI has not run on that commit. |
| AUD-01 malformed gate ledgers | Fixed. Empty, missing, and duplicate definitions now fail closed. The real ledgers still exit 1 as blocked, not as malformed. |
| AUD-02 recovery REQUESTED insert | Fixed by migration 013. The recovery role can no longer use the REQUESTED insert fast path. |
| AUD-03 local fence activation | Fixed. Local activation now requires a closed fence and a 64-character digest, matching the cloud adapter's precondition. |
| AUD-04 controller response bound | Fixed. The socket client has a byte cap and a deadline and does not send again. |
| AUD-05 unbounded provider/object reads | Fixed in the GitHub and S3 read paths by counting bytes before accepting the body. No live cloud call was made. |
| AUD-06 UTF-8 per chunk | Fixed. Request bodies are buffered and decoded once. Malformed UTF-8 is rejected. |
| AUD-07 token text redaction | Fixed for `github_pat_` and the `ghp_`/`gho_`/`ghu_`/`ghs_`/`ghr_` shapes. No real token was used. |
| AUD-08 stale assignment selection | Fixed. A failed machine refresh clears the previous selection. Covered by a component test, not a new browser journey. |
| AUD-09 lifecycle installs | Fixed in the legacy validation and first-gate installers: `npm ci --ignore-scripts`. |
| AUD-10 provider status collapse | Fixed for unknown Runloop statuses: they throw instead of being shown as starting. `running`, `shutdown`, and `provisioning` stay explicit. |
| AUD-11 AEON per-route credentials | Unverified. That service is not in this repository. Do not import it until D01 is approved. |
| AUD-12 owner decisions | Open. None of D01–D12 is treated as approved. |

## Does the architecture fit?

The current repository can be the authority and product core. PostgreSQL remains domain truth. The authority service, effect controller, and Focus Desk stay the single authority path, single effect sender, and single product UI. VERA remains a durable principal, not a model or a Computer. Computers remain logical placements with a generation fence. The scheduler still does not grant authority.

Regency, NEXUS, and AEON-IQ are not implemented here. They fit only as later, narrow additions:

- Regency administration belongs inside Focus Desk, using the same contracts. It must not add a second authority store or a second primary UI.
- NEXUS execution and AEON-IQ memory, if adopted, stay behind reviewed service boundaries. Their repositories are not merged into this tree. Canonical admitted facts stay in PostgreSQL; an AEON projection must not become a second writer.
- Delegation and self-issued authority stay unsupported. Frozen M1 behavior is unchanged.
- The proposed regency migration must not reuse `migrations/012-tenant-identity-fks.sql`. 012 is tenant identity integrity. 013 is the recovery import guard. The next schema migration is 014.

## Owner decisions

These are recommendations, not approvals. Tasks stay blocked until the owner decides.

| Decision | Recommendation | Blocks |
|---|---|---|
| D01 Named NEXUS and AEON adoption | Adopt only through narrow contracts, or build an equivalent that meets the same isolation rules. Do not merge donor trees. | Runtime and cognition integration |
| D02 Delegation and policy versions | Keep current v1, which rejects delegation. Approve any extension separately. | Mandates, suballocation, semantic-context versions |
| D03 Multi-Computer identity | Keep the current tenant and one generation fence until cardinality and retirement rules are chosen. | Organization membership and multi-Computer placement |
| D04 Regency packaging | One Focus Desk. No separate governance database. | Regency screens and any later admin deployment |
| D05 License and disclosure | Leave the repository's visibility and license unchanged. Keep the private archive outside Git. | Publishing the handoff or the archive |
| D06 Human and machine identity | Use the existing human bridge design plus a separate short-lived workload issuer. Do not treat a GitHub login as that issuer. | Live P1 |
| D07 Protected provider | Pick one disposable action with a real read-back. A public GitHub GET does not qualify it. | Live P2 |
| D08 Managed computers and HA | Approve accounts, regions, and RPO/RTO before any fault test. | Live P3 and P4 |
| D09 Scheduler choice | Keep both adapters until a real 24-hour comparison. | P5 and the scheduler decision |
| D10 Research acceptance targets | Pre-register thresholds before claiming autonomy results. | Advanced research gates |
| D11 Retention and commercial terms | Define residency, erasure, and billing before those features exist. | Metering, retention, optional economic work |
| D12 Review and cutover | Independent review, then a separate decision for merge, shadow, and canary. | Release and M6/M7 |

## Next implementation phase

The next work that does not need an owner decision is hosted verification of these commits. Feature work for Regency, NEXUS, AEON-IQ, delegation, or multi-Computer placement waits on D01–D03.

Hosted CI needs the commits pushed to `build/canonical-continuum` and a runner that is allowed to start. The workflow installs the fixture privilege helper. Until a check run exists for the exact pushed SHA, hosted CI stays NOT RUN.
