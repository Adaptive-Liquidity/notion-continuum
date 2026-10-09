# Security self-review — NOT an independent review

Independent security review: NOT RUN. Production: BLOCKED. Canary: NO-GO.

## Findings corrected and evidence retained
- New product-role INSERT privilege was initially too broad: a rolled-back probe could initialize COMMITTED. Restricted operation INSERT to immutable binding columns and added initial-state guards; final negative regression rejects fabricated outcome columns. No provider was called by the probe. Raw finding/source hash retained in `attempts/PRODUCT-INSERT-PREFIX.json`.
- Recovery-specific trigger branches initially caused a runtime permission denial when ordinary controller transitions planned a recovery-table subquery. Split the branches into explicit conditional PL/pgSQL blocks; ordinary runtime roles need no broad recovery-table read permission. Failed reference trials/histories retained, fresh final paired trials pass.
- Raw exception messages could contain credential text. New effect uncertainty records keep classification only; logging regression checks message exclusion.
- Artifact upload rollback could otherwise lose storage accounting while remote bytes remained. Reserve immutable storage identity in a separate committed transaction before I/O; uncertainty retains budget, same-key recovery does not double reserve. Test includes lost acknowledgement and retry/verified deletion.
- Reviewed principal/resource/artifact lock ordering; principal locks precede quota/FK contention. Resource maxima remain governor-only. Agents cannot release budget based on their own completion assertion.
- Fixture key metadata omitted the public-key `use=sig` attribute in the first backend run; corrected fixture, not a weakened public verifier. Recovery deletion fixture originally omitted an assignment FK; corrected the fixture and reran on a fresh database. These setup failures are retained, not production failures.

## Tested local boundaries
Public-only capability verification; current enrolled identity/fence/approval on new effect admission; exact-action binding; no UNKNOWN resend/fallback; task cancellation at final admission; tenant-qualified data; private UID/network namespaces; no privileged credentials or SQL at the isolated agent; immutable artifacts/paths; persistent corruption quarantine; conditional anchor/fence models; HTTPS restricted operation-reference endpoint; CSRF/CSP/text-only rendering; quotas and bounded request retry/identity maps.

## Unresolved before release
Real issuer/MFA/workload semantics; secret custody and rotation; live TLS/ingress/rate-limit distribution; managed VM/IAM/egress/browser isolation; ordinary workflow-worker metadata/credential isolation; trustworthy live provider/oracle and idempotency retention; comprehensive provider-gap inventory; cloud conditional fencing/HA/region split-brain; object retention/backups/erasure; actual billing receipts; independent reviewer. A trusted controller, issuer, broker, DB administrator or operator compromise is not contained by untrusted-agent tests.

The resource service uses a mandatory trusted-platform receipt verifier seam. Recovery uses a mandatory independently enrolled cluster-operator/approval policy. Fixture callbacks are deliberately not production implementations of those trust sources.

An empty npm advisory report is a dependency observation, not code/cloud security clearance. All live production gates retain PARTIAL or NOT RUN. No canon promotion.
