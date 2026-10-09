# Principal Engineering UI Audit Addendum

Status: mandatory reconciliation changes to the Focus Desk baseline; not a redesign request.

## Verdict

- Focus Desk visual/product direction: **APPROVED**.
- Information architecture: **APPROVED WITH AMENDMENTS**.
- Semantic/state model: **STRONGLY ALIGNED**.
- Current design document as final implementation specification: **NOT YET APPROVED**.
- Current `floks-pc` frontend as the final Continuum console: **REUSE/EXTEND, NOT AS-IS**.
- Framework: **KEEP Next.js/React/TypeScript**.

## Required amendment 1 — explicit identity model

The UI must keep these distinct:

1. Human account / organization identity.
2. VERA durable accountable principal.
3. Renewable workload/machine identity assigned to a principal/workload.
4. Continuum Computer logical environment and its current physical placement/generation.

A model/provider/runtime session is not VERA identity. A human cookie is not a worker identity. A Computer is not the principal.

Required surfaces should expose IDs/status/assignment/freshness/epoch/generation as permitted, but never bearer tokens, refresh tokens, private keys or provider secrets.

## Required amendment 2 — precise Computer semantics

The current Staxions code contains detailed lifecycle/recovery states. The final console may provide friendly summary labels, but must preserve the actionable underlying condition.

Do not equate these with a normal stop:

- restore failure;
- recovery failure;
- cleanup required;
- deletion/deleting;
- provider error;
- generation/placement fencing problem.

Computer detail should support, as contracts become available:

- stable logical Computer ID;
- current provider/placement;
- placement generation;
- lifecycle state;
- isolation/network-policy profile and qualification/maturity;
- last authoritative health observation;
- checkpoint/artifact state;
- rebuild/recovery requirement;
- old-generation fenced status;
- bound VERA/workload identity references.

## Required amendment 3 — human manual takeover boundary

Existing `ComputerScreen`-style manual control can remain a product capability, but must be clearly modeled as a **human takeover/manual session**, separate from governed autonomous agent effects.

Required UX:

- explicit viewing/manual-control state;
- who currently controls the computer;
- start/end time and expiry where supported;
- auditable takeover event;
- clear hand-back transition;
- no implication that manual clicks are automatically verified autonomous operations;
- privileged browser/cookies must not become reachable by untrusted agent shell/code.

## Required amendment 4 — workload identity/renewal surface

Add a security/identity view capable of showing only safe metadata such as:

- enrolled machine/workload identity;
- assigned VERA/workload;
- status: active / disabled / revoked / expired / renewal blocked;
- authority/capability freshness;
- last successful renewal;
- next expiry when authoritative;
- current Computer generation binding if applicable.

Do not provide “expand authority” from renewal. Renewal preserves permitted identity/authority; it does not grant new scope.

## Required amendment 5 — trusted feature availability contract

Every product feature/control must derive availability from a trusted read model, not from frontend presence or optimistic assumptions.

At minimum support:

- Available
- Not configured
- Requires setup
- Temporarily unavailable/degraded
- Qualification pending
- Unsupported/deferred

The UI must not advertise protected GitHub writes because a public read adapter exists. It must not expose memory, delegation, compensation, recovery, browser write or provider features until their contracts and qualifications exist.

## Required amendment 6 — bounded multi-agent coordination

Do not add a “swarm console.” Add coordination contextually to Work/Projects:

- responsible VERA;
- assigned/collaborating principals;
- task dependencies;
- waiting-on / blocker relationships;
- handoff/delegation event where supported;
- shared-resource conflict/lock/reservation status;
- current accountable owner.

Coordination must never bypass each principal’s authority, tenant isolation or effect admission rules.

## Required amendment 7 — dependency-aware Focus system

The adaptive Focus/Needs Attention projection should group common-cause blockers so users act on the root condition, e.g. “3 tasks blocked — GitHub connection expired.”

Root causes may include:

- authority/approval;
- workload identity;
- Computer/environment;
- provider/integration;
- scheduler/progression;
- evidence/verification;
- resource/budget/deadline;
- recovery/uncertainty;
- workspace/security incident.

Preserve deterministic severity/impact/deadline/age ordering. Do not use an opaque model rank as the only authority. Freeze ordering while a user is inspecting it; surface new critical conditions without stealing keyboard focus.

## Required amendment 8 — state-axis separation

Never collapse these into one colored status:

- task/business phase;
- workflow progression;
- operation/effect state;
- approval eligibility/status;
- authority validity;
- Computer health;
- dependency health;
- verification state;
- incident/recovery state.

Friendly summary is allowed only if detail preserves the authoritative axes.

## Required amendment 9 — evidence hierarchy

Visually distinguish:

1. user/agent intent or proposal;
2. governance decision/admission evidence;
3. controller operation/effect record;
4. provider observation/read-back;
5. derived evidence package/hash lineage;
6. diagnostic telemetry/logs/traces.

No log, model narration or hash-chain integrity badge may substitute for external-world verification.

## Required amendment 10 — onboarding/readiness

The final onboarding model should be an authoritative sequence, not a generic checklist:

human sign-in -> workspace/tenant -> VERA -> Computer -> workload identity/binding -> integration -> bounded grant -> first task -> approval if required -> effect -> authoritative verification/evidence.

Show blocked prerequisites and maturity truth. Health endpoints alone do not prove readiness.

