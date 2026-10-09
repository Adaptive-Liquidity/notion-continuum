# Execution prompt — Final Continuum interface reconciliation and build

Act as Principal Software Architect, Principal Product Engineer, Principal Frontend Engineer and adversarial safety reviewer for Asentxia/Continuum.

Use `00_READ_ME_FIRST.md` as the routing/precedence document. **Treat the exact latest source bundles under `latest-source-material/` as authoritative evidence over prior summaries.** Read `02_LATEST_MATERIAL_VERIFICATION.md`, then the extracted production-qualification result/gates and architecture synthesis before inspecting current frontend code.

## Objective

Turn the approved **Focus Desk** direction into the final production-grade Continuum operating-console specification and implementation plan, aligned with the newest PostgreSQL/Effect Controller/VERA/Computer/identity/renewal/recovery architecture and latest production-qualification evidence.

Do not reopen broad architecture ideation unless current source or executed evidence falsifies a core assumption. Do not redesign Focus Desk merely for aesthetics.

## Required reconciliation

For every screen, control, status and interaction, map:

`user goal -> durable product object -> authoritative read model -> required role/authority -> human API/command -> backend enforcement -> result/observation -> evidence -> failure/recovery -> maturity/availability -> acceptance test`

Explicitly reconcile:

- Work/tasks/projects and bounded multi-agent ownership/dependencies/handoffs;
- human account, VERA, enrolled workload identity, model and Computer as separate objects;
- machine identity version/freshness, assignment and short-lived renewal without exposing credentials;
- Computer logical ID vs placement/generation/checkpoint/recovery/fence state;
- exact immutable approvals, owner freshness/MFA eligibility and approval invalidation;
- grants, policy versions/epochs, revocation, limits and reservations;
- state/context/memory provenance and non-authoritative derived indexes;
- effect lifecycle, UNKNOWN, reconciliation and provider verification;
- evidence vs observations vs logs/telemetry;
- integrations and qualification/maturity state;
- notifications/incidents/delivery lifecycle and common-cause grouping;
- usage/budget/limits freshness;
- human takeover/manual computer control vs agent-governed execution;
- onboarding/readiness;
- mobile, keyboard, zoom, reduced-motion and accessibility states.

## Latest implementation facts that must change older UI assumptions

The newest production-qualification source now contains:

- pinned asymmetric issuer/JWKS/audience identity verification;
- separately enrolled human and machine identity mappings;
- owner governance, exact approval, assignment and revocation paths;
- Ed25519 one-operation production capability issuance;
- per-operation renewal with a maximum 90-second lifetime, further bounded by current authority/identity/assignment expiry;
- public-key controller verification plus online identity ID/version checks at admission/final send;
- a real immutable public GitHub read adapter with authoritative second-endpoint read-back.

These are real implementation facts, but **P1 and P2 remain PARTIAL** because live staging IdP/workload identity and protected provider mutations are not qualified. P3-P5 are NOT RUN. Never present them as fully production-qualified.

## Required changes from the principal-engineering UI audit

Use `03_PRINCIPAL_ENGINEERING_UI_AUDIT_ADDENDUM.md` as mandatory changes, especially:

1. explicit human / VERA / workload identity / model / Computer separation;
2. preserve detailed Computer/recovery states and placement generation;
3. explicit manual-takeover vs governed-agent-execution boundary;
4. workload identity enrollment/assignment/renewal/freshness status surface without secrets;
5. trusted feature availability/maturity contract;
6. bounded multi-agent coordination inside Work/Projects;
7. dependency-aware/common-cause Focus grouping.

## Implementation rules

- Keep Next.js/React/TypeScript unless current code provides a concrete engineering reason not to.
- Reuse working auth/computer/billing/design-system code selectively; do not treat existing UI state helpers as architectural truth.
- Do not collapse restore failure, recovery failure, cleanup-needed, deletion or fencing into generic “stopped.”
- Browser actions must go through reviewed human-facing APIs; do not expose trusted worker/controller `/dispatch`, `/reconcile` or capability-minting seams directly.
- Do not invent reject/cancel/isolate/resume/compensate controls without corresponding reviewed backend commands.
- Do not show “success” from request acceptance, model output, HTTP 2xx, local log, cryptographic receipt or evidence-chain validity alone.
- Do not surface fixture HMAC compatibility or test-issued identity as a production feature.
- Keep live identity, protected provider write, VM isolation, HA/DR, scheduler and independent-security-review truth exactly as latest gates support.
- Never read `.env`, private keys or secret values merely to discover configuration references.

## Deliverables

1. `CONTINUUM-PRODUCTION-INTERFACE-SPEC.md`
2. `CONTINUUM-UI-CONTRACT-TRACEABILITY.md`
3. `CONTINUUM-UI-GAP-REGISTER.md`
4. `CONTINUUM-FRONTEND-IMPLEMENTATION-PLAN.md`
5. Updated frontend implementation in `floks-pc` only after the spec/plan are internally consistent and approved by the execution workflow.
6. Browser/accessibility/end-to-end evidence when runnable staging is available.
7. `OWNER-ACTION-CHECKLIST.md` containing only external configuration/actions that cannot be completed without owner-controlled accounts/connections; do not block unrelated engineering on these items.

For every gate report one of: `PASS`, `PARTIAL`, `FAIL`, `NOT RUN`. Never promote `PARTIAL` to `PASS` because the UI looks complete.
