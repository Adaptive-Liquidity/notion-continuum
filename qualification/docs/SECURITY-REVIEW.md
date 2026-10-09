# Security findings — implementation self-review, NOT independent review

Independent review: NOT RUN. npm dependency audit returned exit 0 / no known production-package advisories in its current registry snapshot. That is not a code audit or production security certificate.

| Finding | Priority | Disposition and release consequence |
| --- | --- | --- |
| Shared HMAC issuer/verifier boundary would let any holder of the shared secret mint scope | High | Separate Ed25519 issuer key from public-only controller verification; tampering/widening/key-role tests pass locally. HMAC baseline fixture compatibility still exists and MUST NOT be selected by production listeners. Staging configuration/key custody pending |
| Disabling an enrollment must invalidate an already-issued capability, not merely prevent renewal | High | Added enrolled identity ID/version to the signed token, live DB identity/fence check at final admission and send; disabled-identity old-token test denies. Already-admitted in-flight semantics unchanged |
| Actual issuer/audience/user-vs-machine/MFA semantics are not live-qualified | High | Pinned HTTPS JWKS/issuer/audience/algorithm verifier and DB-enrolled roles; real WorkOS claims/workload identity still untested. Production authorization remains blocked. Do not weaken MFA or infer owner role from token/email claims |
| Static capability in scheduling history cannot sustain 24-hour work and may expand credential exposure | High | Added fresh-per-operation renewal client and secret-free job-reference activity seam. Existing baseline workers/history formats have NOT been converted/deployed. Production adoption, custody and real renewal soak are NOT RUN |
| Broad shared scheduler role/cross-task metadata access remains inappropriate for an ordinary untrusted multi-tenant worker | High | Scoped assignments and controller issuance deny unrelated machine/tenant IDs; full per-placement identity/task assignment and worker runtime isolation are not yet deployed/proven. Do not hand the fixture ct_scheduler login to agents |
| Public GitHub GET proves neither protected credential isolation nor mutation idempotency retention | High qualification limit | Declared explicit read-only contract. Raw real responses retained. Protected effect/no-bypass/stale write-key tests NOT RUN; no write-provider PASS inferred |
| Observing UNKNOWN after grant/identity revocation needs a separately authorized read-only recovery path | Medium | Normal renewal fails closed when authority expires/revokes. A trusted recovery/operator observation capability contract and API are still required; do not restore the old write grant just to reconcile |
| Admission bodies need additional abuse/connection protections at deployment boundary | Medium | Unknown fields, bounded body and bearer checks implemented. Production TLS, idle/header timeouts, rate limiting, secret custody and gateway policy remain required |
| Evidence chain is not an independent external anchor | Medium | Local integrity/atomicity regressions pass. External archive/retention/redaction plus administrator tamper review remain unqualified |
| Production recovery/fencing and cloud network identity not exercised | High | No cloud resource configured, primary killed, region promoted or legacy patch deployed. P3/P4/DR and canary stay NOT RUN |

No finding is called independently cleared. Resolved locally means only the exercised implementation threat/path passed; deployment and the broader release gate remain PARTIAL.
