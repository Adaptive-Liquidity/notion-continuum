# Continuum UI gap register

Revision 1 • 2026-10-09 UTC • Source inspection, not a live app audit.

## Findings and engineering disposition

Open is a work-item disposition, not a production gate status. P0 blocks enabling the affected consequential/control feature; it does not block read-only console engineering. P1 blocks calling the affected product journey complete. P2 is deferred breadth. Source refs S1–S6 are defined in the specification. No observed source issue below is presented as a newly executed exploit.

| Gap | Priority | Finding and authoritative evidence | Closure / acceptance | Build task | Owner dependency |
|---|---|---|---|---|---|
| G01 | P0 | Human/machine/model/VERA/Computer labels and bindings need explicit separation; S1 migration 005 and S6 audit | R-SESSION/VERA/IDENTITY/COMPUTER; A01/10–14 | B01/B02/B04 | Live P1 config only for qualification |
| G02 | P0 | S1 identity-api POST-only seams have no trusted console reads, eligibility projection or command lookup | Reviewed BFF, versioned read envelopes, CSRF/session binding, ledger; A06/12/17–21/39 | B01/B02/B05 | Live IdP later; local integration unblocked |
| G03 | P0 | Approval upsert in authority-service is not immutable decision history or human-command idempotency | Add command ledger + append approval decision history around frozen effect binding; no automatic retry; A17/18/21 | B05 | None for engineering |
| G04 | P0 | Workload enrollment/version and renewal exist; UI metadata and production integration absent | Redacted projections, no browser renew, <=90 s bounded lifetime; A11–13 | B04 | Issuer/workload/key-custody stage |
| G05 | P0 | UNKNOWN cannot be resent; independently authorized observation after grant/identity revoke remains missing in S1 result/security review | Read-only trusted observation contract, source-qualified verifier, retain unresolved state; A22/23/31 | B06 | Protected oracle later |
| G06 | P0 | S5 dashboard.ts collapses restore_failed/cleanup_needed/deleting/deleted/error into stopped; owner payload omits rich truth | Preserve raw 15-state union and separate axes in final read model; A26–28 | B07 | None for source fix |
| G07 | P0 | Legacy Computer type has workspaceRevision, not final placement generation/fence mapping | Explicit logical ID/placement alias/generation/old-host fence read contract; never synthetic generation; A26/28 | B07 | Disposable VM for physical proof |
| G08 | P0 | desktop-access.ts accepts missing session row; ComputerScreen sendActions ignores response; global key listener captures Tab/Escape | Durable fail-closed control lease, result checks, scoped focus capture/local escape; A29/30/40 | B08 | VM/browser isolation qualification |
| G09 | P0 | take_control/hand_back token rotation alone is not governed-agent/manual exclusion; privileged browser reachability unproven | Exclusive execution-mode fence, durable owner session and isolation; hand-back != agent resume; A30 | B08 | Managed VM network/IAM stage |
| G10 | P1 | Availability presently cannot be inferred from UI helpers/provider capabilities | Server feature/eligibility contract; configuration, entitlement, health, qualification separate; A02/33/37/39 | B01/B02 | None for contract work |
| G11 | P1 | Task/project/multi-agent domain reads and handoff CAS not demonstrated in latest ct schema | Explicit tenant registry, single responsible VERA, dependencies/conflicts; read-only until domain commands reviewed; A05–09 | B03 | None for bounded design |
| G12 | P1 | Focus common-cause projection lacks deterministic causal contract | Authorized root IDs, unique affected counts, severity/impact/deadline/age/ID order + focused snapshot freeze; A03/04 | B03 | None |
| G13 | P1 | Evidence list/export/search/pagination and redaction are not supplied by a current human read API | Linked evidence hierarchy, authorized cursor snapshot, export gated; A24/25 | B06 | Retention/anchor config for full qualification |
| G14 | P1 | Full memory provenance/retention/index invalidation beyond ct.context_items is unqualified; repo memory locks apply | Read current narrow metadata only; no gated engine import; A15 | B04 | Optional retention/storage policy later |
| G15 | P1 | Incident acknowledgement, notification preferences/delivery state require durable APIs | Outbox/inbox dedup and separate incident/delivery models; no messages sent during design; A31/32/34 | B09 | Owner channels only if enabled |
| G16 | P1 | Reservations tested locally; real billing/token/cost enforcement/freshness unqualified | Units/source/freshness; reserved vs spent vs estimated; no new pricing; A19/35/36 | B09 | Meter/billing connections for live checks |
| G17 | P1 | Browser/mobile/keyboard/zoom/reduced-motion evidence not captured for final console | Actual authenticated target plus evidence at specified viewports and keyboard/screen reader; A38–40 | B10 | Staging URL/test accounts |
| G18 | P1 | Live Notion qualification page inaccessible; exact attachment v2 differs from older saved routing copy | Use exact verified source; do not infer live-only updates | B00 | Optional page access; does not block engineering |
| G19 | P2 | General policy/delegation/procedure/model-change/archive/memory-export/compensation controls lack reviewed commands | Read-only or unsupported; add separate contracts/acceptance before enabling | B04/B09 | Feature-specific only |
| G20 | P1 | Superdesign CLI automatic review rejected telemetry to untrusted PostHog, payload unknown | No retry/workaround; complete documents independently; canvas integration not claimed | Outside build critical path | No new tool permission needed; user approval already recorded, automatic review still applies |

## Exact inherited production gate ledger

Copied from S1/qualification/PRODUCTION-GATES.json, not rerun or regraded. There are zero complete production-release gates passed. Overall production BLOCKED, scheduler HELD, canary NO-GO are decisions, not substitutes for gate status.

| Gate | Status | Scope / closure still required |
|---|---|---|
| P1 user/machine identity and authority | PARTIAL | 14 test-issuer implementation checks; real issuer, MFA/session/workload, TLS/key-custody deployment integration absent |
| P2 real safe provider/verification | PARTIAL | 6 real immutable public-read checks; protected mutation, stale mutation-idempotency window and protected isolation unqualified |
| P3 Computer/VM isolation | NOT RUN | Managed staging placement, egress/IAM, tenant/DNS/SSRF/redirect/generation tests |
| P4 PostgreSQL HA/backups/PITR | NOT RUN | Disposable HA/WAL environment, restore/failover/fence and actual RPO/RTO |
| P5 final scheduler/24-hour comparison | NOT RUN | P1–P4, stable stage, renewal, incompatible version recovery and cost/toil metrics |
| R1 no bypass | PARTIAL | Local UID/namespace and pinned transport only; live protected browser/provider/VM boundary missing |
| R2 fault/race | PARTIAL | Local controller + real-read client faults only; production partial-effects/races missing |
| R3 authority correctness | PARTIAL | Exact binding/enrollment/renewal checks; live identity and revoked recovery observation missing |
| R4 memory isolation | PARTIAL | Tenant/version/corruption local checks; real ingestion/retrieval/poisoning/retention pipeline missing |
| R5 evidence truth | PARTIAL | Local transactional chain and saved public-read responses; protected oracle/anchors/retention missing |
| R6 Computer destruction/recovery | NOT RUN | Actual destruction, manifest restore and physical old-generation fence |
| R7 production DR | NOT RUN | PITR/HA/region isolation and restored-window external reconciliation |
| R8 compromised agent/worker containment | PARTIAL | Local isolation/assignment checks; production scoped identity/custody/attack proof missing |
| R9 resource/spend controls | PARTIAL | Local reservations/budgets and zero-cost read; actual money/token/quota/storage/retry enforcement missing |
| R10 independent security review | NOT RUN | Independent reviewer with deployed code/config access |
| M6 shadow preparation/activation | NOT RUN | Production gates, final scheduler and approved stage mapping |
| M7 single-principal canary | NOT RUN | Applicable release gates plus explicit canary approval |

| Narrow recorded subcheck | Status | Limit |
|---|---|---|
| Pinned public GitHub commit lookup + second-endpoint verification | PASS | Exact immutable read only; no protected write/authenticated identity inference |
| Connection metadata inspection | PASS | GitHub profile, Cloudflare org/JWKS metadata only; no new resources |
| Provider stale mutation idempotency window | NOT RUN | GET cannot qualify mutation retention |

## Current-run verification ledger

| Gate | Status | Evidence |
|---|---|---|
| Source bundle + synthesis hash agreement | PASS | Recomputed four SHA-256 values match verification document |
| Source ordering and frontend pin | PASS | Exact v2 read before refreshed pinned frontend; Git tree SHA 87f4da5… |
| Saved suite-count agreement | PASS | Four TAP summaries agree with FINAL-SUMMARY: 14+6 new, 7+14 regression; inspected, not rerun |
| Document cross-reference/coverage validation | PASS | Validation artifact in this packet; 40 contracts, 40 acceptance IDs, all build/gap links resolved |
| Final spec/plan workflow approval | NOT RUN | Concrete packet now available for review; tool approval does not constitute review of this packet |
| Frontend implementation/typecheck/build | NOT RUN | No code changes made before workflow approval |
| Authenticated browser/E2E/accessibility | NOT RUN | Runnable authenticated Continuum stage unavailable to this run |
| Backend suites rerun in this run | NOT RUN | Saved evidence inspected only |
| Live Notion page verification | NOT RUN | Qualification page inaccessible; no invented update |
| Superdesign canvas generation | NOT RUN | Automatic approval-review rejection prevented CLI path |

No UI gate changes a production gate. If future tests fail, report FAIL with failure evidence; lack of environment is NOT RUN. A signed fixture or polished screenshot never upgrades PARTIAL.
