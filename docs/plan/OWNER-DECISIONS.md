# Owner decision record

Recorded for the current roadmap on 2026-10-12. This document records the owner's
existing scope; it does not approve implementation proposals or deployment.

## D01 — approved architecture, integration still unqualified

The owner supplied this authorization in the product-planning conversation:

> D01 proposal is approved, reuse NEXUS for bounded execution and adapt AEON for
> governed memory, with Continuum retaining authority and enforcement.

The owner then accepted the scoped plan record and directed correction of the draft
that had incorrectly reopened D01. Missing access to that conversation in a new
agent is a provenance gap, not a withdrawal of the owner's decision.

- NEXUS is the bounded execution direction. Evaluation pin:
  `e1c3d3c75d58f609c617e7a87cb05e84ea437d64`.
- AEON-IQ is the governed derived-memory candidate. Evaluation pin:
  `d5866e85edb3a7f7ea7186854655981ca73760f4`.
- Continuum keeps identities, grants, exact approvals, admitted facts, objectives,
  evidence and effect enforcement. PostgreSQL/ContextService own canonical admission.
- Expose restricted adapters, not the existing donor public/proxy/management servers.
  Workers and Focus Desk do not acquire donor management access or provider secrets.
- Extraction proposes facts; it does not admit them. A computation token is not an
  effect grant. ENG-013, ENG-014, ENG-019 and ENG-021 acceptance remains mandatory.
- The separate exec/filesystem/application workspace is not NEXUS WASM isolation.
- Donor tests are evaluation evidence, not Continuum integration qualification.
  A fallback requires evidence and a separately approved scoped proposal.
- D05 still governs donor copying, licensing, disclosure and supported packaging.
  D01 does not authorize copying donor trees, paid resources, merge or production.

## D02 — approved autonomous work, no effect-authority delegation in v1

Agents can plan and work inside permissions received from the trusted authority.
They cannot create, expand or transfer effect authority. Additional permission is
requested from that authority. Permissions remain scoped, expiring and revocable.
Preserve existing exact approvals and final-send checks. This adds no manual approval
for every harmless step and removes none already required by the contracts.
Child grants, delegation DAGs/chains and authority-passing policy engines remain
unauthorized. Preserve their future acceptance requirements without implementing them.

## D03 — approved durable identity and separate histories

VERA identity, durable work and governed memory persist across model/placement
replacement. Keep tenant, organization, workspace, VERA, workload, logical Computer
and physical placement distinct. Principal epoch, enrollment version and placement
generation are separate counters. Old placements are fenced; consequential work
needs fresh authority. One tenant is the first profile, with isolation for later
customers. This does not authorize managed hosts or a second Computer per VERA.

## D04 — approved unified Regency governance

Regency lives in Focus Desk and authoritative PostgreSQL governance records. The
Effect Controller separately enforces consequential actions. No competing governance
database or second primary interface. A role, membership or mandate is not an effect
grant or approval.

## Open decisions

D05–D12 remain unapproved in the scopes cataloged in CURRENT-PLAN.md. ENG-026's
mandate/eligibility/notice choices, the fixture-versus-live model milestone and the
future live-database procedure also remain open. A documentation merge does not
settle them. Record later owner decisions here with date, exact scope, evidence
reference and affected tasks. A newer file or an agent recommendation is not approval.

Production BLOCKED; scheduler HELD; canary NO-GO. Merges, releases and live gate
activation require their own authorization and evidence.
