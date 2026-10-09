# Owner action checklist

2026-10-09 UTC • Only account-controlled external actions. No credentials, private keys or raw tokens should be sent in chat or reports. Use approved secure configuration and account administration. These items block their relevant live qualification only; contract, read-only UI and local test engineering can continue.

| ID | External action | Safe completion evidence | Unlocks |
|---|---|---|---|
| O01 | Grant access to the approved staging IdP administration/connection; configure pinned issuer/JWKS/resource audience and separate human/workload applications | Issuer/audience metadata, enrolled opaque IDs, approved callback/ingress locations; no credential values | Live P1; final human sign-in and MFA behavior |
| O02 | Enroll actual human owner and machine subjects with verified workload claim binding and renewable platform identity source | Human/machine mapping IDs/kinds/tenant/principal, claim semantics, authorized renewal configuration | Live owner/worker tests, identity version and expiry proof |
| O03 | Configure separate staging authority API, issuer and controller identities, HTTPS ingress, signing-key custody/rotation and controller public verification | Role/custody metadata and public key IDs; no private material; deployment connection | P1 deployment and real renewal integration |
| O04 | Provide a dedicated disposable protected provider resource and approved bounded mutation/read-back oracle, permissions and budget through account configuration | Test resource alias, action ceiling, verification selector, retention/idempotency contract and protected connection | Protected portion of P2, no-bypass and revocation observation checks |
| O05 | Provide authorized disposable managed VM placement, network/IAM administration, isolation profile and destruction-test budget | Placement alias, approved egress/destination policy, workload identity source and spend ceiling | P3/R1/R6/R8 and manual-control isolation proof |
| O06 | Provide disposable PostgreSQL HA/backup/WAL environment, restore/failover permissions, recovery custody and agreed RPO/RTO | Cluster/store aliases, disposable scope, retention/RPO/RTO limits and permitted fault window | P4/R7; no production primary faulting implied |
| O07 | Provide stable 24-hour staging host/endpoints and account connections for both scheduler candidates, with cost/metric ceiling | Stage aliases, connection readiness, approved envelope and persistence duration | P5 after P1–P4; no default scheduler declared winner |
| O08 | Arrange an independent reviewer and grant least-privilege access to deployed trust-boundary code/configuration and retained evidence | Reviewer access/engagement and reviewed scope; an independent report when complete | R10; self-review cannot substitute |
| O09 | Provide authenticated staging URL and separate authorized test human/tenant accounts for browser qualification | URL plus secure sign-in handoff; no passwords or tokens in artifact | Final browser/E2E/accessibility evidence |
| O10 | If external notifications are enabled, connect approved owner-controlled channels and recipient scope in staging | Channel readiness and opaque recipient IDs; delivery metadata, no webhook secrets | Live notification delivery tests only |
| O11 | If live usage/billing/export profiles are enabled, connect their staging accounts/storage and set external retention/custody limits | Meter units/source/period, test invoice/store aliases, approved retention/redaction policy | Actual money/token metering and export/retention qualification |

Optional: grant access to the linked Notion qualification page if live-only updates must be reconciled. The exact verified packet already supports engineering; missing Notion access is not a reason to pause it.

M6/M7 deployment authorization remains a later explicit release decision after applicable gates. This checklist does not request new production resources, change subscriptions, enable canary, or treat owner configuration as proof that a gate passed.
