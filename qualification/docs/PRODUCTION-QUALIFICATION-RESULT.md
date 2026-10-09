# CONTINUUM — Production Qualification: Identity & Safe Provider

**Production: BLOCKED. Final scheduler: HELD. Canary: NO-GO.** The accepted local safety core is preserved. No broad architecture design was reopened; no cloud resource, Access application, legacy patch, GitHub branch or consequential production execution was deployed.

## 1. Outcome

Built and exercised the next two implementation boundaries:

- Pinned issuer/JWKS/audience/algorithm verification, registered user/machine identity, human governance/approval/assignment/revocation APIs and independently signed one-operation capability renewal.
- Public-key-only controller verification, plus online identity ID/version checks so disabling a machine invalidates its already-issued capability before new effect admission.
- A real, fixed **read-only GitHub commit adapter/verifier**. Public commit/tree were read from GitHub, not an emulator. Timeouts/lost acknowledgement/read-back outage were deliberately injected at the client boundary around real reads.
- **20 new test groups passed:** 14 identity/authority/API checks and six real-provider checks. **21 accepted-core regression groups passed:** seven PostgreSQL and 14 controller checks. No tests in those final suites failed or were skipped.

**Important limit:** identity credentials came from a locally generated test issuer/key; no real user/M2M sign-in was completed. The real provider action was an unauthenticated public GET, not a protected mutation. Both production gates remain **PARTIAL**, not PASS.

The baseline remains <mention url="https://app.notion.com/p/778340f15431483499ff717cd48383c6">Target Validation & Implementation Results</mention>; its frozen safety semantics and deployment blocks still apply. [^https://app.notion.com/p/778340f15431483499ff717cd48383c6]

## 2. Live access inventory and dependency stop

Read-only live checks established:

| Service | Actually accessed | Limit |
| --- | --- | --- |
| GitHub | Connected account and public repository commit/tree, successful HTTPS API responses | MCP account access is not an OIDC credential or operation approval; no repository changed |
| Cloudflare | Existing account, Zero Trust organization and public JWKS | **Zero Access applications**; a reachable key endpoint is not an authenticated user/workload test |
| WorkOS | Current primary documentation and existing architecture references | No connected staging administration/issuer/client/workload credential supplied |
| Runloop/managed PostgreSQL/Temporal staging | No connected staging service identified | No authorized disposable VM/HA cluster/24-hour host/endpoint identified; not evidence those services do not exist for the owner |

Cloudflare organization `adaptiveliquidity.cloudflareaccess.com` returned two public keys. No Access application was created, no identity policy was changed and no WorkOS/Runloop/cloud database key was requested or guessed from workspace history. Raw connection/API responses are in `qualification/evidence`.

**Dependency stop:** live P1 cannot be closed without the approved real staging identity and enrollment configuration. P3–P5 are NOT RUN; provisioning/faulting cloud infrastructure or launching the 24-hour qualification was not substituted with local tests. The read-only provider check is the requested initial adapter preflight, not permission to skip identity/isolation gates for consequential execution.

## 3. Identity, authority and renewal implementation

### What changed

- `src/identity-provider.ts`: `jose` signature validation using pinned HTTPS issuer/JWKS, exact audience, allowed asymmetric algorithms, subject/expiry/issued-at validation and optional exact workload-claim bindings. Caller-controlled JWT key URLs are rejected. Token role/email/tenant fields do not become authority.
- `migrations/005-identity-authority.sql`: independently enrolled identity mappings and operation assignments; forced RLS; separate non-owner `ct_authority_api`/`ct_cap_issuer` roles and non-authority row-lock columns. Assignment must bind enrolled machine, tenant, principal and immutable operation digest.
- `src/authority-service.ts`, `src/identity-api.ts`: enrollment-derived tenant, human owner governance, exact-action approval, assignment and revocation; machine requests cannot grant themselves owner rights. Owner mutations require fresh independently authenticated MFA/session information.
- `src/production-capability.ts`: Ed25519 private signing key only at the trusted issuer; controller verification uses public JWKS only. Tokens bind one operation, issuer/audience, identity ID/version, principal epoch/generation, recovery fence and bounded expiry.
- `src/capability-renewal.ts`, `src/renewing-effect-activity.ts`: obtain fresh machine identity and a fresh capability for each operation; intended production scheduling arguments are task/operation references, not provider secrets or static long-lived tokens.
- `src/controller-server.ts`, `src/controller.ts`, `src/capability.ts`: asymmetric verifier path and online enrolled-identity freshness at admission/final send. Existing HMAC mode remains **fixture compatibility only**, not a production listener choice.

### Renewal contract exercised

Renewal selects the machine from verified issuer+subject+audience+kind and the operator-managed DB enrollment. It requires an assigned, digest-matching operation and current principal, grant, approval, deadline and deployment fence. Issued scope is one operation for **at most 90 seconds**, further bounded by every current identity/authority/assignment expiry. The worker supplies only the operation reference; it cannot choose tenant, epoch, scope or lifetime.

Minting a token does not reserve a future right to send. The controller rechecks current authority/identity immediately before SENDING. A disabled enrollment or changed version rejects the previously minted token. Already-admitted/in-flight actions retain the frozen honest revocation semantics: universal recall is not promised.

The WorkOS primary documentation requires access-token issuer/signature/audience verification, and distinguishes audience/resource configuration from client registration. Profile/MCP sign-in scopes are not a custom effect grant. The implementation follows that separation; actual WorkOS claims/MFA/workload binding are still to be qualified. [^https://workos.com/docs/authkit/mcp][^https://openid.net/specs/openid-connect-core-1_0.html]

### Still missing before live identity PASS

Approved issuer/resource audience and live user/machine identities; verified real MFA/session claim semantics; authenticated operation admission/bootstrap; platform renewable workload-identity source; separate HTTPS ingress and trusted key custody/rotation; actual deployment integration. The new secret-free activity seam is not wired into a production worker or 24-hour history. A separately authorized read-only recovery/observation path after grant/identity revocation is also still needed; do not reinstate a revoked write grant merely to reconcile UNKNOWN.

## 4. Safe real provider contract and limits

**Provider:** GitHub public REST API.

**Action:** `readCommit`, pinned to `Adaptive-Liquidity/Continuum`, commit `9ac4723b5390d22ed2d6aed9cf984cb0a32731ca`, expected tree `dcd778fa3a539de0132c2a7ec32c36aaf876f94d`.

`src/providers/github-readonly.ts` allows exactly that repository/commit selector, GET only, fixed HTTPS host, no redirects, no credential forwarding and no user-selected URL. The first endpoint obtains the Git commit object; a second repository-commit endpoint independently returns the expected commit/tree. GitHub documents the commit-object read endpoint. [^https://docs.github.com/en/rest/git/commits?apiVersion=2022-11-28#get-a-commit-object]

| Check | Result | Exact scope |
| --- | --- | --- |
| Actual read and matching second-endpoint verification | PASS | Pinned public immutable commit/tree; raw HTTP response metadata/body/hash retained |
| Client discards acknowledgement after a real response | PASS | Domain UNKNOWN, repeated dispatch does not send again, read-back completes intended read |
| Deliberately tiny real HTTP timeout | PASS | Domain UNKNOWN, no automatic resend, fresh verification read succeeds; no claim timed-out first request reached GitHub |
| Injected verifier outage/missing observation | PASS | UNKNOWN stays UNKNOWN until fresh authoritative read-back is available |
| Arbitrary URL/resource/action and stale capability refusal | PASS | No network request for rejected selector/expired capability |
| Changed-payload/domain-key binding | PASS | Immutable binding rejects changed selector |
| Provider stale mutation-idempotency retention/window | **NOT RUN** | GET has no mutation idempotency key/window; not passed by an expired JWT or immutable local digest check |
| Protected-write credential/no-bypass behavior | **NOT RUN** | Public GET requires no provider secret and can inherently be read by other Internet clients |

Seven successful real response records were preserved in the final run, with request IDs, ETags, dates, raw public bodies and response hashes. Failures are explicitly client-injected, not fabricated GitHub outages.

**COMMITTED here means the intended immutable read has been completed/verified**, potentially by the fresh verification read. It does not assert that the earlier timed-out request executed, that an external write committed, or that reads prove external exactly-once effects. This is a useful safe integration step, not a substitute for credentialled effect qualification.

## 5. Final production gate ledger

Every gate uses only **PASS / PARTIAL / FAIL / NOT RUN**. `qualification/PRODUCTION-GATES.json` is machine-readable; its enforcement command intentionally exits 1. There are **zero complete production-release gates passed**.

| Gate | Status | Remaining blocker |
| --- | --- | --- |
| P1 production identity/authority/renewal | PARTIAL | Live approved issuer/audience/user/machine credentials and enrollment/MFA/TLS/key custody integration |
| P2 real safe provider/effect verification | PARTIAL | Read-only contract tested; credentialled mutation oracle, stale provider key/retention and protected action still untested |
| P3 production VM/computer isolation | NOT RUN | Approved Runloop staging placement/budget; real egress, DNS/redirect/SSRF, tenant and generation tests |
| P4 PostgreSQL HA/backup/PITR | NOT RUN | Approved disposable cluster/WAL store/RPO/RTO and failover/restore authority |
| P5 production scheduler comparison | NOT RUN | P1–P4, persistent 24-hour stage, real identity renewal, incompatible version/host/service recovery and metrics |
| No-bypass | PARTIAL | Local UID/namespace regressions only; live protected endpoint/browser/VM policy not exercised |
| Fault/race | PARTIAL | Local controller regressions plus real-read client faults; production host/provider race battery missing |
| Authority correctness | PARTIAL | Implementation scope/approval/version/identity checks passed; real authentication/lifecycle pending |
| Memory isolation | PARTIAL | Local tenant/version/corruption regressions; full production ingestion/retrieval/poisoning/deletion pending |
| Evidence truth | PARTIAL | Transactional chain and real-read responses; protected-effect contract and independent anchors missing |
| Production computer destruction/recovery | NOT RUN | Actual host/VM destruction, durable manifest restore and old-host physical fence |
| DR | NOT RUN | HA/PITR, regional isolation and backup-window real-effect reconciliation |
| Compromised agent/worker | PARTIAL | Local isolation and scoped-assignment checks; real task/tenant machine custody and runtime attack tests missing |
| Resource/spend controls | PARTIAL | Local reservation/budget; actual token/money/quota/retry-storm control pending |
| Independent security review | NOT RUN | Independent reviewer/deployed configuration access not supplied |
| M6 shadow deployment | NOT RUN | Production gates and final scheduler first |
| M7 single-principal canary | NOT RUN | All relevant stage gates plus explicit owner approval |

No unresolved production failure is hidden as a PASS. Lack of a runnable authorized environment is recorded NOT RUN, not “the provider failed.” Narrow public-read tests can PASS without making P2 or the entire product PASS.

## 6. Final scheduler decision

**HELD. No production scheduler selected.** The provisional Temporal recommendation remains unchanged and unactivated. This phase did not launch or simulate a real 24-hour trial, production incompatible workflow deployment, HA failover or production latency/cost/engineering-effort benchmark.

After preceding gates: use this same domain/controller with both engines. Choose pg-boss if the actual required workload stays a small explicit state machine and is measurably simpler to own. Choose Temporal if durable waits/versioning/recovery otherwise require building a generic homegrown workflow engine. Neither received preference-based scores, a fake 24-hour pass or an invented cost advantage.

## 7. Security-review findings

**Independent review: NOT RUN.** `qualification/docs/SECURITY-REVIEW.md` records implementation self-review and explicit unresolved deployment risks. npm production dependency audit found no current known-package advisories; that does not certify code, cloud configuration or production security.

- Shared secret mint/verify risk: production-oriented path now separates signing key from public verification; old HMAC remains fixture-only.
- Already-issued token after machine disable: online identity ID/version checks added and tested; final send denies stale enrollment.
- Static token in long-running history: renewal client/secret-free activity seam delivered; production worker migration and real soak remain missing.
- Broad scheduler metadata role: must not be assigned to ordinary untrusted multi-tenant workers. Production task/placement identity and custody are not yet proven.
- Real IdP MFA/user-vs-machine semantics, trusted key custody, TLS/rate limits, external evidence anchors and offline recovery observation remain open.
- Public-read adapter cannot clear protected-write credentials, stale idempotency or effect no-bypass gates.

These findings are not represented as independently cleared.

## 8. Exact staging changes and next owner inputs

The detailed ordered plan is `qualification/docs/STAGING-CHANGE-PLAN.md`; disabled resource/config placeholders are in `qualification/infra/STAGING-INPUTS.json`.

1. Supply the **approved staging WorkOS/identity issuer, pinned JWKS and human resource audience**, machine issuer/audience/workload bindings and renewable platform identity source. Only protected operator administration enrolls subjects/roles.
2. Review/apply additive migration 005 in that stage; use separate authority/issuer/controller identities and custody. Configure controller **public verification only**, human governance and machine renewal behind HTTPS, real fresh MFA/session policy, immutable assignments and fresh per-operation issuance. Run actual identity/expiry/revoke/tenant cases.
3. Keep provider testing to the fixed public-read contract until a separately approved disposable credentialled action/oracle is available. Do not mutate production data to create test evidence.
4. Only then use an approved disposable managed VM and HA PostgreSQL staging cluster; configure real egress/IAM/placement identity and backup/WAL/fence. Execute controlled destruction/failover/PITR tests there, not against an unapproved live primary.
5. Provide a stable 24-hour staging host/endpoints and metric/budget envelope; run both schedulers and independent review. Preserve raw failures as well as successful evidence.
6. Only after gate closure, seek owner approval for M6 shadow/M7 canary and any legacy patch deployment.

**Minimum input needed to resume the next blocked gate:** the approved staging identity setup and renewable machine identity connection/configuration. Additional VM/database/reviewer resources are needed later in sequence. Credentials should be supplied through secure input or approved connections, not pasted into the report or repository.

## 9. Evidence and preservation

- Final logs: `qualification/evidence/IDENTITY-TESTS.tap`, `REAL-PROVIDER-TESTS.tap`, `BASELINE-FOUNDATION.tap`, `BASELINE-CONTROLLER.tap` and `FINAL-FIRST-GATES-RUN.log`.
- Raw live metadata/reads: connection inventory, Cloudflare account/organization/JWKS and `REAL-PROVIDER-REQUESTS.json`. No private key or live access token is included.
- Retained fixture failures: `qualification/evidence/attempts`; initial ZIP-extraction executable-bit loss and the unused `jose KeyLike` build import were corrected, then fixtures were recreated and tests rerun. They are not counted as production failures or quietly discarded.
- Frozen contract hash remains `02b04d213721067464686e7a14c9c7533e506d3c9854505d8eb0fca0864d86ae`.
- Accepted baseline ZIP hash remains `c2435fd62bd5999d1169079bb0f5d70e33a2859b269a440bb3b4ff6851268a7f`.
- Local database/fixture processes stopped after validation. No legacy patch, cloud identity application, VM, primary failover, M6 or M7 was deployed.

**Canary recommendation: NO-GO. Production remains BLOCKED. Continue at live identity qualification, not at architecture ideation or production execution.**
