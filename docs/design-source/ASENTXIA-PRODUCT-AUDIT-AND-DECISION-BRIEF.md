# Asentxia product audit and decision brief

Date: 2026-10-05. Status: recommendations and audit coverage; not an approved product specification or a fresh exhaustive audit of a deployed platform.

## 1. Intended outcome and evidence boundary

Create one coherent product experience for operating persistent autonomous principals: users can connect a computer, define work, grant bounded authority, inspect execution, resolve approvals and incidents, and recover with evidence. Machine interfaces carry agent execution; the human workspace administers, supervises, and intervenes. Limited engineering capacity favors one real vertical slice and shared primitives.

Reviewed in this turn: available plugin/skill capabilities, the existing Continuum2 audit and completion plan, the existing Refero report, the newly supplied Asentxia-Team-Handoff packet, and official guidance on excessive agency, telemetry, accessibility, and computational modeling. The earlier audit covered commit `2501f879a57982edb24e79c30f00f68ccae5a545` on branch `jules-3656268840441091436-cd11f14d`. Its reproduced findings are historical evidence at that commit, not an assertion that today's branch retains every defect. The newer handoff reports a local foundation increment `be39960` on `codex/phase1-isolated`; its source code and raw product test artifacts are not included in the archive. A fresh GitHub README lookup returned not found; the branch tip was not reverified.

No current signed-in product journey, live enforcement path, alert delivery channel, restoration drill, or incident response was exercised in this turn. No fresh screenshots or product tests were produced. This brief scopes those checks rather than claiming they have passed.

## 2. Recommended skill and plugin stack

| Resource | Use | Concrete output | Boundary |
|---|---|---|---|
| Software Architect: architecture-review | Map existing system, quality attributes, risk and ownership | Source-linked gap register and architecture decisions | Diagrams and scores do not prove implemented controls |
| Software Architect: frontend-mobile-architecture, API/event/data design | Connect UI objects to authoritative APIs, events and state | Screen-to-contract map; update/reconnect semantics | Avoid new services or micro-frontends without a real need |
| Superpowers: brainstorming | Decide primary user, product promise, interaction model and policy | Alternatives and reviewed design | Does not establish market demand |
| Superpowers: writing-plans, systematic-debugging, verification-before-completion | Convert reviewed design into bounded implementation and checks | Dependency-ordered work and executed evidence | Invoke at the appropriate implementation stage |
| Continuum Architecture, Identity/Cognition, Authority, Effects | Preserve principal boundaries and operation correctness | Grants, approvals, state transitions, dispatch and recovery contracts | Backend enforcement must precede UI assurance |
| Continuum Operations and Verification | Failure behavior, containment, restore, incidents and adversarial checks | Control and incident matrix with test oracles | A same-host restart is not general disaster recovery |
| Product Design: audit | Capture actual journeys before critiquing UX | Screenshot-linked flow findings and accessibility risks | Requires the real product/flow and fresh capture evidence |
| Refero | Research useful reference patterns and flows | Reference lock and justified design choices | Reference screenshots do not validate Asentxia behavior |
| Figma / Superdesign | Explore and specify candidate screens | Component/state library and interactive prototype | A prototype is not an integrated product |
| Playwright plus axe | Check implemented journeys, keyboard interaction and detectable accessibility errors | Reproducible browser checks | Automated checks need manual and assistive-technology review |
| OpenTelemetry plus Sentry | Correlate traces, metrics, logs and application errors | Operational visibility tied to operation IDs | Product policy incidents require domain events and enforcement, not error monitoring alone |
| Wolfram | Model queues, budgets, resource/cost sensitivity and notification scenarios | Assumption-labeled calculations using measured inputs | Cannot select the preferred brand/UX or prove untested security |
| Vercel | Preview and delivery if the existing frontend uses it | Real preview/deployment checks | Hosting does not solve dispatch authority or worker durability |

Use a small working set: architecture and domain skills first; Product Design/Refero/Figma for evidence and decisions; implementation/testing/telemetry for delivery. Visual Truth is optional for direct visual editing of a compatible React app, not a substitute for runtime verification. Navattic is useful after genuine workflows exist, to explain them accurately.

## 3. Product direction alternatives

| Direction | Strength | Trade-off | Recommendation |
|---|---|---|---|
| Operational workspace | Makes work, authority, exceptions and recovery understandable together | Requires real backend state and intervention semantics | Lead with this |
| Developer infrastructure console | Excellent for integration, contracts and technical evaluation | Steeper onboarding for ordinary operators | Progressive technical depth within the workspace |
| Agent organization/fleet command center | Supports future multi-principal governance | Large scope, administration burden and risk of simulated completeness | Extend after a working individual-principal path |

Recommended product promise: operate an agent in a controlled environment, understand what it can do, see what actually happened, and resolve interruptions safely. Do not default to chat as the authoritative record of work or use a 3D architecture scene as the operational home.

Recommended initial audience, aligned with the newer handoff: developers and small engineering teams delegating bounded GitHub work. First-use home guides connection, computer setup, authority and the first task. Returning-user home prioritizes Needs attention, active work, principal/computer health, recent outcomes, and usage. A user should see the next required decision without reconstructing it from a log. Developers can open payloads, schemas, traces and receipts in a contextual inspector.

## 4. Everyday look and feel

Use restrained premium surfaces, clear typography, compact but readable lists, consistent spacing, keyboard navigation, search, and contextual detail panels. Provide light/dark options where useful. Reserve red for critical conditions, amber for pending/uncertain conditions, and explicit text/icons for every state; never communicate status only through color.

Keep cinematics on the public site and optional onboarding. In the daily workspace, animation should explain a transition, preserve spatial context, or acknowledge an action. Respect reduced motion. Tables and timelines must remain legible under high event volume. Empty/loading/stale/disconnected/denied states are first-class designs.

## 5. Candidate information architecture

These are functional areas, not a requirement to build eleven equal top-level tabs. The initial navigation can be Overview, Work, Agents & Computers, Access, Evidence, and Settings, with related views grouped underneath.

| Area | Contents and mechanics | Critical secondary states |
|---|---|---|
| Overview | Needs attention, active work, health, next action, usage | Stale data, partial outage, first-use empty state |
| Agents/principals | Identity, status, state references, cognition bindings, authority summary | Suspended, expiring credentials, missing environment |
| Staxions/computers | Provisioning, connection, resource/lifecycle controls | Provision failure, offline, resume failure, retention warning |
| Work | Tasks, logical operations, attempts, outcomes and owner | Waiting approval, blocked, uncertain, reconciling, cancelled |
| Approvals | Exact proposed action, resource, digest, impact, expiry and decision | Changed payload, stale permission, already dispatched |
| Authority | Grants, mandates, policy versions, revocation and delegation | Expired/invalid grant, conflict, privilege escalation denial |
| Integrations | Provider connection, resource scope and credential health | Provider outage, permission loss, incompatible version |
| Evidence | Decisions, attempts, receipts, recovery and verification scope | Missing, incomplete, delayed or invalid evidence |
| Incidents/notifications | Deduplicated incidents, severity, owner, response and escalation | Delivery failure, unowned, acknowledged but unresolved |
| Usage/billing | Resource use, budget, quota and commercial terms | Hard limit, approaching limit, entitlement/billing mismatch |
| Organization/settings | Members, roles, data lifecycle, export, notification routing and security | Cross-tenant denial, owner removal, unsafe settings change |

Preserve canon: Asentxia institution; DCA architecture; Continuum substrate; VERA principal; Staxions customer-facing computers; The Regency governance. Supporting lineages require actual integration evidence. Describe each feature as implemented, partial, proposed, or unsupported at the reviewed release.

## 6. Recommended default operating policy

Candidate default: bounded autonomy under explicit grants, with approval for designated high-impact effects. Begin onboarding in inspect-only mode until an authorized owner selects resources and grants a bounded mandate. Read operations still require authorization and a defined data-egress policy.

| Action class | Candidate default | Required constraint |
|---|---|---|
| Inspection/read | Allowed only inside a granted scope | Data sensitivity, tenant/resource bounds, rate and egress limits |
| Isolated local work | Allowed within a granted environment | Resource limits and external-egress restrictions |
| External writes | Require approval initially; permit automation for explicitly approved effect families | Exact scope, budget, resource, policy and retry/recovery semantics |
| Destructive changes, spending, credential access, authority expansion | Explicit approval or deny, according to owner policy | Stronger role, exact intent, expiry and blast-radius review |
| Requests outside authority | Deny and record | Escalate suspicious patterns without treating every denial as compromise |
| Authorization/policy state unavailable | Block new consequential dispatch | Surface degraded control state and retain safe inspection where permitted |
| Outcome uncertain after dispatch | Reconcile before retry | Preserve original operation identity; obtain authoritative evidence |

Do not let the agent self-grant, silently broaden access, or turn an approval queue state into approval. Bind human decisions to immutable intent/digest, actor, operation, resource, policy version and expiry. Revalidate relevant authority at outbound dispatch.

Pause, revoke, cancel, isolate, terminate, reconcile and resume are different commands. Specify which future actions each blocks, what happens to queued/in-flight work, and whether intervention confirmation is complete or partial. Already-sent external requests cannot universally be recalled. Automatic containment needs a predefined, auditable trigger and a tested control path; an alert is not containment.

## 7. Incident and notification matrix

Severity follows consequence, scope, confidence and required response. Suggested levels: informational, action-required, urgent, critical. Avoid noisy paging for normal policy operation.

| Event | System handling | User-facing response |
|---|---|---|
| Task failure before any effect | Persist known failure and diagnostics | Work item with safe next action; retry only under current authority |
| Timeout after possible effect | Persist uncertainty; reconcile by authoritative identifiers | “Outcome uncertain,” owner, last evidence and reconciliation progress |
| Normal out-of-scope request | Deny at enforcement boundary; record reason | Explain the denied action/resource without revealing sensitive policy data |
| Repeated denials or unusual provider/resource attempts | Correlate into an incident; apply predefined suspension rules if warranted | Severity based on scope/confidence; avoid labeling intent as malicious without evidence |
| Detected egress bypass or credential exposure | Contain within authorized scope; revoke/rotate as appropriate | Critical incident showing confirmed controls, residual exposure and owner |
| Approval required | Hold operation and persist decision context | Durable approval inbox; approved channels according to user settings |
| Provider/policy/worker outage | Surface degraded dependency and apply contract-specific dispatch restrictions | Affected work, freshness, owner and recovery status |
| Evidence append failure | If required for dispatch, abort admission/commit atomically | Show blocked work; do not report an unevidenced success |
| Budget/queue/resource threshold | Enforce hard limits; warn according to policy | Usage view plus actionable notification; no unapproved automatic spend |
| Notification delivery failure | Persist attempt, bounded retry, alternate configured channel and escalation | Incident remains visible in-app; delivery health is observable |
| Restore or resumption failure | Retain stopped/degraded state; preserve forensic data | Recovery checklist, failed prerequisite and authorized resumption path |

An incident must retain ID, tenant, principal/computer/task/operation references, detection time, event time, severity and rationale, owner, impact scope, evidence references, current enforcement state, next action, and acknowledgment/resolution history. Redact secrets and permission-check every detail view.

Separate notification delivery from incident lifecycle. Read or dismissed is not acknowledged; acknowledged is not resolved. Resolution must cite a verified corrective condition. Deduplicate by logical incident and causal relationship; escalation windows and suppression policies must be configured and tested. An incident may generate several deliveries without creating duplicate incidents.

## 8. End-to-end audit scope

Freeze a reviewed release set: repository/branch/commit for frontend, control plane, computer/provider adapter, policies, migrations and infrastructure; deployment URL and environment; enabled entitlements, feature flags, supported integrations and applicable user roles. Reconcile conflicting source documents before describing product coverage.

Audit each capability using this mapping:

`user goal → product object → authoritative API/state → authorization → backend enforcement → visible state → failure/incident → intervention → recovery → test evidence`

| Audit area | Required coverage |
|---|---|
| Product truth | Inventory actual/partial/mock/missing capabilities; reconcile canonical naming and claims |
| Account/tenant | Signup/login/session, membership changes, roles, invitation, tenant switch and isolation |
| Onboarding | Connection, provisioning, initial policy, grants, pricing/entitlements and a successful first workflow |
| Identity/environment | Principal versus computer lifecycle, binding, persistence scope and credentials |
| Authority/approval | Scope/expiry/revocation, forged/stale approvals, payload drift and concurrent changes |
| Execution | Real provider effects, canonical payload, admission/dispatch/receipt and duplicate handling |
| Containment | Actual VM/egress attachment across launch/resume/restore; direct mutation and bypass attempts |
| Durable state | Transactions, concurrent writers, crash boundaries, uncertain results and reconciliation |
| Human controls | Pause/revoke/cancel/isolate/terminate/resume semantics and residual in-flight risk |
| Evidence | Completeness, ownership, append control, inspection, tampering and verification limitations |
| Alerts | Detection source, severity, durable incident, owner, delivery/ack/escalation and failure of delivery |
| UX/accessibility | Fresh screenshots per flow; keyboard, focus, screen reader, errors, reflow, motion and high-volume states |
| UI truth | Refresh/version behavior, ordering, optimistic states, reconnection, partial failure and stale timestamps |
| Operations/economics | Dependency/queue health, resource bounds, backups/restore, retention, export/deletion, budgets and billing |
| Adversarial verification | Injection through untrusted content, privilege escalation, secret exposure, cross-tenant access and unauthorized effects |

Required journey traces: allowed, denied, approval, expired/revoked, interrupted/uncertain, reconciled, duplicate, suspended, restored, and notification-delivery failure. Test through the actual computer/agent/control/provider path where authorized. Select provider sandboxes and reversible effects first; document authorization and residual risk for any external mutation.

The signed-in frontend needs fresh screenshot evidence and behavior checks. Backend tests must independently show that controls work when the browser is absent, disconnected, or malicious. Screenshots, generated demos, architecture diagrams and agent narration are not backend oracles.

## 9. Design-team handoff and build order

Deliverables:
1. Source-linked capability and maturity register, with owner and release.
2. Object model and state-transition/authority contracts.
3. Role/action matrix, default policy proposal and high-impact action taxonomy.
4. Screen/flow map with every empty, loading, denied, failed, stale and recovery state.
5. Incident/notification specification including detection, delivery, acknowledgment, escalation and resolution.
6. Component/token library with accessibility and responsive behavior.
7. Working prototype of one vertical journey with clearly labeled simulations.
8. Traceability matrix connecting requirements, screens, APIs, controls and verification artifacts.
9. Prioritized gap register and dependency-ordered implementation plan.
10. Executed acceptance results and deployment-specific remaining gaps.

First journey: account/tenant → contained computer → principal binding → narrow GitHub grant → task → exact approval → real effect/read-back → evidence → revocation denial → interrupted-outcome recovery. Existing continuity experiments and supporting repositories are evaluated as separate evidence until integrated.

Build order: authoritative state/contracts and enforcement; real execution/recovery; intervention and incident plumbing; operational UI; visual polish; expansion to additional providers and fleet governance. Prototype the UX early, but do not promote simulated controls as shipped capabilities.

Open product decisions: initial buyer/operator; operational workspace versus developer console emphasis; approval taxonomy; automatic containment thresholds; data lifecycle; notification channels/owners; first supported effect family; release maturity and commercial terms. These should become recorded decisions, not implicit choices made by a styling tool.

## 10. Primary resources and provenance

- Prior audit: `CONTINUUM2-END-TO-END-AUDIT-2026-10-05.md`, at the immutable commit above.
- Prior ordered release checks: `ASENTXIA-COMPLETION-PLAN-2026-10-05.md`, proposed AC01–AC32.
- Prior reference research: `ASENTXIA-REFERO-TOP-10-REPORT.md`; useful design hypotheses, not current UX measurements.
- [OWASP Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/): permissions/functionality/autonomy risks and control design.
- [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/): telemetry instrumentation, distinct from domain authorization/evidence.
- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): programmatic status announcements without unnecessary focus changes.
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing): automated axe integration and explicit manual-testing limitations.
- [Wolfram QueueingNetworkProcess](https://reference.wolfram.com/language/ref/QueueingNetworkProcess.html): queue models requiring explicit assumptions and measured/calibrated inputs.

No fresh pass/fail scores are assigned to the current deployed product. Recommended UX direction, policy defaults, incident severity and ICP remain proposals to validate with real tasks and implementation evidence.

## 11. New handoff reconciliation and executed document checks

The newly supplied packet is the latest planning baseline for this brief. It supersedes describing all current work solely as the original scaffold; it does not supersede the original audit's immutable observations or independently prove that every affected finding is fixed.

| Layer | Supplied status | Treatment |
|---|---|---|
| Original source | `2501f879`, 29 audited findings | Historical independently reproduced audit at that commit |
| Local foundation | `be39960`, `codex/phase1-isolated`, local only | Source-reported typecheck/build/schema export and nine bounded tests; not rerun here |
| Target product | 13 specifications, 15 screens, thin-slice OpenAPI, four diagrams | Intended design and contracts; not live capabilities |
| Release acceptance | AC01–AC32, every `release_pass` value `NO` | No complete release pass is established by the packet |

Document checks executed in this turn:
- 33 manifest entries checked with SHA-256; zero missing/mismatched entries.
- Standalone 00-START-HERE matches the archived copy byte-for-byte.
- Both archived original audit/plan sources match the earlier reviewed copies byte-for-byte.
- JSON files parsed and target OpenAPI YAML parsed.
- All 167 local OpenAPI references resolve; ten operation IDs are unique.
- Inventory counts: 13 editable specifications, 15 screen IDs, 29 findings, 32 acceptance rows and 32 traceability rows.
- Acceptance-ID and traceability-ID sets match; all acceptance `release_pass` fields are `NO`.

These are structural/document checks, not a full external OpenAPI certification, proof of source authenticity, or implementation test. Self-contained archive hashes can detect internal mismatch; they do not establish who authored the archive. No native PostgreSQL, live provider, real VM, source increment, UI journey or alert delivery was exercised by these checks.

### What to retain from the packet

Retain its narrow customer hypothesis and controlled repository scope, separate human/machine surfaces, typed intent and immutable approval binding, distinction between coordinator and computer recovery, conservative uncertainty semantics, dual enforcement planes, reused Staxions integration, TypeScript modular control plane, and explicit release gates. Its graphite/cobalt/light visual direction and UI01–UI15 state requirements are a usable starting point for prototypes.

Avoid recreating those documents under new names. Extend their screen/contract/acceptance mapping and decision register. The new handoff already identifies its omitted lifecycle/alert/billing/read-model endpoints; those omissions are known backlog, not evidence that the packet incorrectly claims a full API.

### Decisions and implementation contracts still needed

| Priority | Gap to close | Resolving output |
|---|---|---|
| 1 | Source increment and competing contract/migration families | Transfer/review pinned source, semantic diff, native migrations/roles/concurrency tests |
| 1 | Real enforcement path | Provider/broker/worker/VM/auth traces with allowed, denied, uncertain and intervention outcomes |
| 1 | Human controls/read models beyond the ten target operations | UI01–UI15 endpoint and command dependency map; authoritative result and permission contract for every control |
| 1 | Incident lifecycle and delivery detail | Detection taxonomy; severity/owner/dedup; incident versus delivery state machines; ack/escalation/resolution APIs and actual tests |
| 1 | Default operating profile | Explicit initial approval rules, resource/expiry/budget defaults, supported effect families and egress policy; server-enforced template, not only UI defaults |
| 2 | Visual system beyond basic palette | Semantic status/border/interaction/disabled tokens and component variants; contrast and manual accessibility checks |
| 2 | Customer comprehension | Prototype tasks from the packet, actual participant results, interpretation of uncertainty/approval/revoke, and integration effort |
| 2 | Commercial/operational policy | Approved entitlements, total cost, data lifecycle, incident ownership, channels, region and restore objectives |

Suggested first-release policy proposal: inspect-only before a mandate exists; then guarded repository work with explicit grant bounds and exact approval for external publish/PR effects. No automatic merge or protected-branch write. Non-idempotent uncertainty holds for reconciliation. Broader preauthorized autonomy is a later, separately tested owner-selected profile. This is a recommendation, not an approval recorded in the packet.

The next full audit should combine this packet with the exact `be39960` source, the selected current Staxions revision/deployment, native test resources, and the actual signed-in product flows. The packet gives the audit its coverage and expected behavior; runnable source and observed traces provide the evidence.
