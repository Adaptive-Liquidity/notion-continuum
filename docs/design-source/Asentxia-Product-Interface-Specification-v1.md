# Asentxia product interface specification v1
2026-10-06 • Ready for implementation review • Proposed design, not shipped functionality

## 1. Scope and authority
Continue the approved combined direction: Work inbox as home, board/list inside Projects, timeline inside task detail. Calm graphite/mint base; one unified Continuum product behind Asentxia login. Human oversight is a client of machine-native services, never the authority root or required execution path. Exact approval for external writes; no automatic permission expansion.

Source baseline inspected: 5b349bdb06e06821a3a7a7a942329a9ac506babd. Preserve current Node HTTP/static client and /workspace, /auth/*, /v1/* API routes. This specification does not supersede current source enums, migrations, recovery gates or another branch's verified results. October 2 source-of-truth REVIEW pack is grounding, not assumed approval of every draft feature.

Three implementation classes: E = existing inspected API, still needs real verification; N = needed for milestone but missing API/data; F = future integration/profile. Only E controls can be wired without new contracts. N requires backend contract review and acceptance; F is designed conceptually, not active in this milestone. No mock success in the production interface.

## 2. Navigation and shell
Primary navigation: Work, Projects, Agents, Approvals, Evidence, Recovery, Settings. Use the same objects from every entry point. A task opens one detail view with Overview, Request and Activity; do not create inconsistent copies of operation status. Agent detail has Overview and Authority now, State/Cognition/Continuity as future capability sections. Settings has Account, Integrations, Developer access, Usage limits and Support as actual availability permits.

Default Work groups Needs attention above active tasks. Navigation counts must come from actual accessible data, disclose partial/recent windows, and must not be invented. Account menu exposes sign out. Visible global pause message is separate from task and operation state. Do not offer normal users a dispatch-resume control.

Proposed client URLs remain under /workspace (for example query parameters view/task/project). Browser Back and direct linking must preserve selected object without inventing server routes. Invalid or inaccessible object uses generic unavailable message. Restore saved filters only within the current account; clear account-sensitive state on logout.

## 3. Screen specification
### Entry and first-use setup
Goal: sign in and understand the first useful action.
E: sign-in/logout, current account bootstrap, snapshot loading. With no projects, primary Create project. Next step Record a task. Explain that recording a task does not prove agent execution. N: authoritative readiness checklist for permitted GitHub repository, principal authority, broker/worker and dispatch. Never infer provider readiness from an HTTP health check. Progress indicates configuration, not end-to-end verification.
Session expired: preserve nonsecret unsent text in memory where feasible, offer Sign in again, reload authoritative state before mutation. Access removal: generic denial, no tenant/object metadata.

### Work
Goal: see what needs action and what is happening.
Layout: sidebar 216–240px; central flexible inbox; optional 400–480px detail inspector. On smaller desktop collapse inspector into dedicated detail view. At 390px stack list/detail rather than compressing both.
Rows: task description, project, VERA display name, actual task status; operation rows separately show action title, operation status and deadline. N: reliable task-operation linkage and attention counts. Until linked by identifiers, do not claim an operation belongs to a task based on title similarity. No merged task/operation array that silently equates their lifecycles.
Primary Record task (E) opens project selector and description. Submit success says Task recorded, not Agent started. Source creates task status ACTIVE; use source semantics and do not relabel it Planned without an explicit mapping. Board status mapping remains N.
Approvals and uncertainty appear as actionable attention entries linking to the same operation. No Approved task bucket: approval belongs to an operation, not task completion.

### Projects
Goal: organize work and inspect one project's tasks.
E: create project, display recent accessible projects, filter snapshot tasks by project_id. Create form name required, trimmed, 1–200 characters. Task description required, trimmed, 1–2000 characters.
Project detail: title, task list, Record task, selection into task detail. Board view is N until source task lifecycle and mutations support exact columns; list is the available default. No drag/drop that changes state without API support. Editing/archiving/project goals and project-specific agent assignment are F/N contracts, not local-only fake edits. Explain recent-window limit if more data cannot be fetched.

### Task detail
Goal: understand task inputs, identity, execution and result.
Overview: exact description, stable task reference, project, principal, actual task status and created time. N: output references and task-operation relationship. Request tab contains only operations actually linked by durable ID. Activity shows only correlated recorded events; do not assemble a fictional execution story from unrelated events.
Timeline entries separate proposal, authorization decision, dispatch observation, provider result and recovery event. Empty timeline says No linked events available, not No activity occurred. E: record creation visible through evidence when linkage exists in event body. N: authoritative joins and pagination.
Stop/cancel are omitted until cancellation contract exists. Suspension is on Agent/Authority. Already-sent external effects can remain unresolved after intervention.

### Agents
Goal: know who is acting, with what authority, independent of replaceable components.
E: one personal VERA display name, persistent principal ID, status and epoch; readable explanation Persistent identity; model and runtime are separate components. E: scoped grant list, expiry and revoke, suspend principal. No create-agent or restart-agent control in this inspected API.
Suspend confirmation shows exact principal and known scope, notes that already-sent effects are not undone; button Suspend agent. Success requires server recorded result and refreshed status. Source has no resume endpoint: do not offer reversible toggle.
Authority grant detail: resource, status, expiry, stable reference. Scope/action ceilings/issuer/policy need N data before asserting them. Revoke confirmation shows exact grant; success depends on durable response. No grant editor or issuance without supported endpoint.
F: State (owned memory/source/version/retention), Cognition (provider/model/binding changes), Continuity (runtime/checkpoint/handoff history), Capabilities (optional versioned procedures). Hide unavailable controls from routine view; contextual availability explanations are sufficient. Do not imply all portfolio engines are integrated.

### Approvals
Goal: make one informed exact decision.
E: display AWAITING_APPROVAL operations from snapshot; choose operation inspector. Preview title, body, draft, repository owner/name, head/base refs and available immutable IDs/SHAs. Display full body, not truncated approval bytes. Technical details expandable and copyable. Explain action is draft PR on an existing controlled branch, not permission to change/publish arbitrary files.
E: approve exact stored params_digest with expires_at within operation deadline and maximum 15 minutes. Source uses client date proposal; server remains authoritative. N: server_time and authoritative effective expiry/eligibility fields preferred before robust countdown. UI time is guidance, never authority. Backend rejection renders stale/expired/revoked explanation from supported codes.
Request fields read-only. Editing requires separately versioned re-proposal; no approval digest reuse. Button Approve exact request. After success refresh; distinguish approved from sent/confirmed. Global pause stays visible and unchanged.
N: Reject request is absent in inspected backend; remove concept button until a supported existing-state transition is reviewed. Never invent fifteenth state, new enum member or transition for visual convenience.
N: authoritative eligibility/reason, granted approval metadata and dispatch details beyond snapshot. Avoid false complete receipts.

### Evidence
Goal: inspect recorded decisions and actual outcomes.
E: recent up to100 envelopes, event type/time/sequence, body under Details. Human summaries only for known event schema versions; unknown event renders exact type and expandable raw record. Sequence and timestamp do not establish independent verification or signature validity.
Filter locally only within returned recent window; label Recent records, up to100. N: server pagination, task/operation joins, integrity verification status and export protocol. A downloadable recent-data JSON may only claim exported visible records, not complete audit history; implement only if authorized scope and provenance retained.
Distinguish agent narration, local assertion, provider observation, confirmed effect and independently verified result when those fields actually exist. No green Verified badge inferred from event presence.

### Recovery
Goal: own unresolved work and see what is safe to do next.
E: filter UNCERTAIN/RECONCILING operations; operation ID, title, state, deadline. Message Outcome unconfirmed. This action must not be repeated. Snapshot lacks actual observation schedule/attempt ownership, so show Not available rather than fabricate next check.
N: recovery queue with durable incident/owner/acknowledgement, last trusted observation, next scheduled check, budget exhaustion/escalation, current policy/generation fence and explicit safe actions. UI refresh is a read, not a provider retry command. No Resume dispatch, Retry send or Mark successful control.
Future restore view distinguishes operator permissions from normal owner. Resume gate requires actual backend authority and reconciliation, never a checkbox alone. Compensation only for supported profiles as separately approved new operation.

### Settings
Account E: personal workspace identity, sign out. Avoid confusing workspace tenant ID with VERA ID.
Integrations N: permitted GitHub installation/repository binding and connection state; no current API in candidate. Onboarding connection must show requested scope and actual readiness. Credentials remain server-only; UI has metadata, expiration and revoke/rotation status, never stored secret values.
Developer access N: separate workload identities with tenant/principal/task/execution scope, audience, expiry and revoke, not human session cookie reuse. Do not create tokens until broker contract exists.
Usage N: limits and authoritative consumption/remaining/reset metadata. Current source constants differ from later plan limits; resolve against adopted profile and publish one version. Do not duplicate guessed limits in client code. No dollar-cost display without measured billing source.
Support N: actual support path, current degraded dependency and incident reference. No fictional response-time promise. F: organization/membership, Computers, billing, deployment/data custody/retention. Public website remains separate workstream.

## 4. Exact inspected endpoint/control bindings
| Control | Existing request | Result/UI rule |
|---|---|---|
| Sign in | GET /auth/login | Actual WorkOS flow; no simulated signed-in state |
| Sign out | POST /auth/logout | Clear private view and follow actual logout |
| Load/refresh | GET /v1/workspace | Recent snapshot; no full-history claim |
| Create project | POST /v1/projects {name} | 201 project_id; refresh and announce |
| Record task | POST /v1/tasks {project_id,description} | 201 task_id; recorded, not execution proof |
| Submit operation | POST /v1/operations, exact current contract | 202 decision; wire only validated machine/advanced profile, not generic task execution |
| Approve | POST /v1/operations/{operation_id}/approve {expires_at,params_digest} | Current server result; refresh; no guessed success |
| Suspend VERA | POST /v1/interventions {action:'principal.suspend'} | recorded; refresh status and evidence |
| Revoke grant | POST /v1/interventions {action:'grant.revoke',authority_id} | recorded; refresh exact grant |

No inspected endpoints for reject, cancel, resume, edit/archive, task-board moves, integrations onboarding, notification delivery, memory, model configuration or pagination. These need proposed versioned contracts before implementation. Existing snapshot omits task_id from operation listing and rich lifecycle/approval/recovery facts; do not synthesize joins or metadata.

## 5. Common states and command semantics
| Condition | User-facing behavior | Safety/result rule |
|---|---|---|
| Loading | Stable shell, readable Loading message | Never show stale previous-account content |
| Empty | Explain absence and one supported next action | Do not fill with demo data in production |
| Invalid input | Field-specific instruction, focus first invalid field | Preserve user text; enforce server rules |
| Submitting | Disable duplicate local command, announce pending | Does not prove backend idempotency |
| Lost write response | Result unconfirmed; refresh/reconcile by known identity | No automatic write replay; creates lacking idempotency need backend contract |
| Read failure | Last loaded timestamp/stale indication; Retry loading | Read retry never resends an effect |
| Rate/capacity limit | Explain actual limit and known wait information | No invented reset time or tight polling |
| Session expiry | Sign in again; reload current authority | Do not replay queued client writes automatically |
| Access denied | Generic unavailable state | No tenant metadata or hidden object leak |
| Stale request | Request changed or no longer eligible; reload | No stale digest approval |
| Dispatch paused | Distinct global notice | Approval does not enable execution |
| Uncertain outcome | Remains unconfirmed; original reference retained | Never equate timeout with failed/no effect |

Read refresh: manual initially; event subscription or bounded refresh requires a workload/endpoint contract. No aggressive polling against the60/min API limit. Cross-tab duplicate prevention remains a backend responsibility. Domain errors must be mapped from inspected actual codes, not invented API enums. 503 may follow ambiguous command response; client cannot infer no commit.

## 6. Proposed visual system
Graphite page #10191D; elevated surface #1A292F; primary text #E8EEEF; secondary text #A6B8BD; mint accent #85DBC3; subtle separators #334449. Amber attention color must be selected and measured before implementation. These reuse candidate colors; final contrast, font licensing and brand assets still require review.
System sans-serif; base16px, secondary14px, section20px, page32px; mono only IDs/raw data. Spacing4/8/12/16/24/32. Radius6–8px, no heavy shadows, no hero animation in operational UI. Selected row and focus clearly separate. One principal action per view. Status always includes words/icons, not color alone.
Use real icon library/source assets; no fabricated brand mark or decorative terminal. Existing wordmark text acceptable until final vector identity is selected. The generated concept is a visual target, not exact text/behavior authority.

## 7. Mobile and accessibility
Desktop: sidebar and list/inspector where usable. Tablet: collapsible navigation, list/detail separate when width insufficient. Mobile390px: header/account, accessible navigation menu, full-width list, dedicated detail with Back. Preserve selection/filter/scroll; hide no mandatory approval fields.
Controls aim for comfortable44px touch targets. Semantic buttons/links, form labels, validation association, focus-visible and predictable tab order. Dialog focus trap/return, Escape where safe. After page navigation focus heading; after command preserve relevant focus and announce outcome. Respect reduced motion; no flashing. Check200% zoom, keyboard-only and screen-reader paths and measured text/UI contrast. No compliance badge from static mocks.

## 8. Future full-product architecture
| Full capability | Future home | Gate before activation |
|---|---|---|
| Logical Computers/containment | Computers; Agent Environment | Actual lifecycle, provider, tenancy/limits and containment evidence |
| Memory/state | Agent State; project Resources | Ownership/provenance/admission/retention/export contracts |
| Model/provider substitution | Agent Cognition | Compatible binding and explicit change/evaluation evidence |
| Runtime handoff/checkpoint/restore | Agent Continuity; Recovery | Durable fences/current authority/outstanding effects and executed recovery |
| Teams/delegation/collectives | Settings Organization; project Coordination | Membership, bounded grants, private/shared state isolation |
| Billing/entitlements | Settings Billing | Real catalog/customer/subscription identity and release decision |
| Optional skills/federation/economics | Contextual profile surfaces | Approved contracts, actual capabilities and maturity evidence |

These are complete placement plans, not permission to build integrations ahead of the current personal-workspace milestone.

## 9. Acceptance ledger for implementation
D01 shell navigation/Back/deep-link works with generic inaccessible-object handling.
D02 no production fixture data; unavailable API never reports success.
D03 real sign-in/logout/session expiry with private state cleared.
D04 project/task validation, real response and recorded-only wording.
D05 task-operation association uses durable IDs or is explicitly unavailable.
D06 exact approval content equals canonical stored request; no mutable fields.
D07 stale/revoked/expired/paused cases show truth and cause no unauthorized send.
D08 uncertain write response never triggers automatic replay.
D09 evidence distinguishes recent/local/provider/verified states without inferred badges.
D10 suspension/revocation has explicit affected scope, recorded result and no false undo claim.
D11 Recovery shows real observations/owner/escalation only after backend support.
D12 supported errors, loading/empty/read failure and capacity states verified.
D13 keyboard, focus, screen reader,390px mobile and200% zoom reviewed.
D14 live provider/denial/duplicate/crash/restore acceptance remains required outside visual QA.
D15 every implemented control mapped to actual endpoint, authority and result; every unimplemented profile has no active misleading CTA.
D16 coverage matrix U01–U36 maintained with implementation/evidence references.

## 10. Concrete handoff instruction
Continue from the current repository, reconcile its HEAD against inspected5b349bd, preserve local changes and migrations. Use approved combined visual direction. Implement supported E surfaces first, specify and review N data/contracts before wiring, leave F profiles deferred. Preserve actual source lifecycle enum/table and authoritative policy. Do not adopt illustrative concept status labels as wire states. No framework rewrite required. Deliver screen/state screenshots from the actual running interface and meaningful journey/authority/recovery verification; report concrete blockers. Do not call fixture rendering or compilation production readiness.
