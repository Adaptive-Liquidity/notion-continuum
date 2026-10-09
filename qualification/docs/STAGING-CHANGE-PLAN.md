# Exact staging/deployment changes — PLAN ONLY, not applied

Dependency order is identity → safe provider → isolated managed computers → HA/PITR → 24-hour/version/ops trial → release/security review → M6/M7. No broad architecture reconsideration. `qualification/infra/STAGING-INPUTS.json` is deliberately disabled and unpopulated for unknown approved resources.

## 1. Identity/authority stage
1. Owner supplies approved WorkOS/staging issuer, pinned JWKS URI and resource audience for humans; machine issuer/audience, exact workload claims and renewable platform identity source. Do not assume Notion/GitHub connection credentials are reusable OIDC sessions.
2. Owner/admin enrolls immutable issuer+subject+audience+kind mappings in `ct.identities` through protected administration; no agent self-enrollment. Tenant/principal/owner role comes from those DB mappings, not body, email or token role.
3. Apply `migrations/005-identity-authority.sql` on a reviewed additive branch after 001/002/004. `ct_authority_api` and `ct_cap_issuer` are non-owner/non-BYPASSRLS, separate secrets and runtime processes. Tenant/worker roles get neither governance SQL nor signing root.
4. Authority issuer obtains an isolated Ed25519 signing key from approved key custody. Controller receives only public JWKS. Configure production listener with `PublicCapabilityVerifier`; never HMAC string/test mode. Publish key ID/rotation policy; no private key in a VM/job/history/repository.
5. Host separate authenticated human governance and machine renewal interfaces behind approved HTTPS/private ingress. Verify live issuer/audience and fresh human MFA/session claims, not forwarded identity headers. Add ingress timeouts/rate limits and environment access boundaries.
6. Enroll task/operation assignments. Owner approves exact digest/version; machine renewal issues one-operation tokens <=90 seconds bounded by current identity, grant, approval, assignment, operation deadline and deployment fence. Test disabled identities, expiry, tenant, forged role, approval races and post-mint revocation against actual IdP credentials.
7. Wire `createRenewingEffectActivity` and `RenewingCapabilityClient` to fresh platform identity for each operation. Production scheduler arguments contain only task/operation references. Never copy test capability literals or issuer keys into agent environments.
8. Required missing follow-ons: authenticated operation-admission entrypoint (fixtures currently create operations), approved identity bootstrap/rotation lifecycle, KMS custody, independently authorized read-only recovery observation path. Live integration remains PARTIAL until these are reviewed/exercised.

## 2. Safe provider stage
Current implemented/read-tested action is fixed public GitHub immutable commit lookup in Adaptive-Liquidity/Continuum. No credentials, mutations or billable cloud resources are used. Success, timeout, deliberately discarded client acknowledgement and read-back unavailability are tested around actual GET calls.

A fresh verification GET completes the intended read; it does NOT prove the first timed-out GET reached GitHub or a write committed. No provider mutation idempotency key/window exists. Pin commit/tree, strict exact selector, fixed HTTPS host, GET only, no redirects or arbitrary URL/key pass-through. Record raw public responses, request IDs and hashes.

Do not qualify consequential effects from this. Before write-provider testing, owner must designate an isolated disposable non-destructive namespace/action with a real authoritative oracle and bounded credential. Do not test writes on existing production data. No such action is activated here.

## 3. Managed computer stage (after P1/P2)
Owner provides approved Runloop account/staging devbox/placement and test budget. Configure actual per-placement identity, default-deny egress, controller/broker-only protected destinations, no SQL/provider secrets/browser cookies on arbitrary shell. Test IPv4/IPv6/DNS/redirect/metadata/SSRF/CDP, cross-tenant credentials and old-generation use. Destroy the disposable VM; reconstruct from verified object manifest; prove old host cannot use broker. No account/VM/policy was created or changed here.

## 4. PostgreSQL recovery stage (after isolation)
Owner provides an expressly disposable HA cluster, backup/WAL store, independent recovery fence and approved RPO/RTO. Install production TLS/auth/roles/replication/backups/PITR; verify WAL archiving/restore before primary kill. Restore with admission blocked and changed external fence; reconcile every possible remote-effect gap and revoked identity/grant before enabling. Test failover, stale-primary isolation and PITR to before revocation. This is not performed on a user's live primary without a specific approved staging target.

## 5. Scheduler and final gates
Use the same qualified domain/controller/provider adapter. Acquire real fresh identity after 24 hours; kill worker/host/service during wait, perform genuinely incompatible deployment with retained old work, exercise branches/partial effects, record hours/services/runbooks/recovery toil/cost/p95 representative workload. Select pg-boss only if the required state machine stays small and materially simpler; select Temporal if otherwise a generic homegrown engine is required. Existing bounded comparison is not a final decision.

After all remaining production gates and independent review pass, request owner approval for M6 shadow and M7 sole-principal canary. Legacy patches stay undeployed and consequential production execution stays disabled. Rollback must stop new effects, not restore old credentials or replay UNKNOWN.
