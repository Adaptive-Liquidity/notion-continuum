# Asentxia / Continuum — Frontend/UI/UX execution handoff v2

Date: 2026-10-08
Purpose: give the implementing agent one coherent packet containing the **latest supplied Continuum architecture, accepted safety-core baseline, production-qualification extension, validation evidence and approved Focus Desk UI direction**.

## Immediate decision

Keep **Focus Desk** as the primary product direction. Do not redesign from scratch.

The task is to reconcile that UI with the latest exact Continuum contracts/evidence, close the remaining interface/mechanics gaps, produce the final implementation-ready interface specification, and only then implement the authenticated operating console.

## Source-of-truth precedence

When sources conflict, use this order:

1. **Latest exact production qualification package**
   - `latest-source-material/CONTINUUM-PRODUCTION-QUALIFICATION-HANDOFF.zip`
   - zero-friction extracts in `latest-extracted/production-qualification/`
2. **Latest target architecture**
   - `CONTINUUM-FINAL-ARCHITECTURE-SYNTHESIS.md`
3. **Accepted target-validation implementation baseline**
   - `latest-source-material/CONTINUUM-TARGET-VALIDATION-IMPLEMENTATION.zip`
   - extracts in `latest-extracted/target-validation/`
4. **Validation/source evidence supporting the architecture work**
   - `latest-source-material/CONTINUUM-VALIDATION-EVIDENCE.zip`
5. **Current approved UI direction**
   - `ASENTXIA-CONTINUUM-FOCUS-DESK-DESIGN-BASELINE.md`
6. **Principal-engineering UI reconciliation requirements**
   - `03_PRINCIPAL_ENGINEERING_UI_AUDIT_ADDENDUM.md`
7. **Coverage/gap requirements**
   - `Asentxia-Full-Product-Interface-Coverage.md`
   - `ASENTXIA-PRODUCT-AUDIT-AND-DECISION-BRIEF.md`
8. **Historical interface/spec context only**
   - `Asentxia-Product-Interface-Specification-v1.md`
   - `Asentxia_Master_Source_of_Truth_2026-10-02_REVIEW.md`
   - `Asentxia-Product-Design-and-Development-Handoff.pdf`

`02_LATEST_MATERIAL_VERIFICATION.md` records the exact hashes and explains what is genuinely newer.

Do **not** silently promote historical `/v1/*` routes, old enum names, old storage topology, simulated provider behavior, old scheduler assumptions or old UI controls into the current architecture.

## Critical latest qualification facts

The latest production qualification adds real implementation beyond the accepted baseline:

- identity/JWKS/audience verification;
- registered human/machine identity;
- owner governance/approval/assignment/revocation APIs;
- short-lived one-operation capability renewal;
- public-key-only controller verification with online machine identity freshness;
- real read-only GitHub commit/tree adapter and read-back verification.

But production is still **BLOCKED**, final scheduler **HELD**, canary **NO-GO**. P1 and P2 are **PARTIAL**; P3-P5 are **NOT RUN**. The real provider proof is immutable public GET, not a protected external mutation.

## Notion and repository navigation

Read `05_NOTION_AND_REPOSITORY_LINKS.md`.

If Notion cannot be fetched, the exact latest user-supplied packets in this handoff take precedence over guessing. Do not request or paste secrets into chat/reports.

## Required output sequence

1. Read `02_LATEST_MATERIAL_VERIFICATION.md`.
2. Read the latest production-qualification extracts and architecture synthesis.
3. Inspect the accepted target-validation baseline and safety contracts as needed.
4. Reconcile current `floks-pc` code against those contracts and the Focus Desk baseline.
5. Amend the UI/spec using `03_PRINCIPAL_ENGINEERING_UI_AUDIT_ADDENDUM.md`.
6. Produce the final implementation-ready interface specification with real read/command contracts and maturity labels.
7. Produce a screen/API/authority/evidence/acceptance traceability matrix.
8. Implement only controls backed by reviewed APIs/contracts; explicitly label unsupported/deferred capabilities.
9. Add responsive, accessibility, stale/offline/degraded/denied/uncertain/recovery states.
10. Run browser/end-to-end/accessibility verification against a real signed-in environment when available.

## Non-negotiable product rules

- Human account != VERA principal != workload/machine identity != model != Computer.
- PostgreSQL owns domain truth; the selected scheduler owns workflow progression; providers own external-world truth.
- Approval is authorization, not execution success.
- `UNKNOWN` is first-class and never gets a generic retry/resend action.
- Verified success requires the supported authoritative observation contract.
- Revocation blocks subsequent admissions; it does not guarantee recall of already-sent effects.
- A logical Computer is not synonymous with its current VM placement; generation/fencing/recovery matter.
- Human manual computer takeover is distinct from governed agent execution.
- Browser/UI never receives provider-wide credentials, controller signing material or machine capability issuance authority.
- The scheduler choice remains internal and HELD until qualification resolves it.
- “Designed” != “available” != “qualified.” Every control needs a trusted availability/maturity state.
- Do not turn the product into a generic analytics dashboard or chat UI.
