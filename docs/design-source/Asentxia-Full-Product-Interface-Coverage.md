# Asentxia full product interface coverage review
2026-10-06 • Design requirements and gap analysis • Not a production certification

## Decision
Approve the combined task-first direction as the navigation and visual foundation. Do not approve it as a complete interface specification yet. The current concept shows Work plus an approval inspector. Projects and task Activity are intended patterns, not captured working screens. Agents, Evidence, Recovery and Settings have labels but no complete designed journeys. Essential state/memory, identity, authority, integration, lifecycle and operational journeys are missing.

## Grounding and precedence
Reviewed the supplied Asentxia_Source_of_Truth_2026-10-02_REVIEW pack: START_HERE; private chapters 00–06 and 08; recovered v1 DCA_ARCHITECTURE; existing placement candidate; exact 5b349bd candidate index/app/style and release report; displayed combined concept. Pack is a private review candidate, not an approved supersession. Its canonical seven responsibility names provide the semantic map; draft contracts provide requirements, not shipped features. Current owner scope controls implementation: personal, task-first, Node/static client retained, exact external-write approvals, controlled existing-branch PR; Computers, teams, branch publication, billing, website integration and public launch deferred.

This is document/code/design coverage analysis, not a captured live UI audit. Local preview is blocked in the cloud browser. No live product, runtime or provider claim was reproduced. Updated code/tests reported in another workstream are outside this inspected commit. Source enums remain versioned; no inferred state-count or new wire state.

## Unified product model
Asentxia is the institution; Continuum is the substrate/product; VERA is the persistent principal; Regency provides governance. Human interface supervises and administers direct machine-native APIs. It is not an execution dependency or the source of authority. One coherent product with contextual views; no separate dashboards per legacy portfolio name.

Daily path: Work → project/task → exact request or activity → confirmed result or Recovery.
Setup path: personal account → project → permitted integration → persistent agent → scoped mandate → task.
Intervention path: affected agent/request → current scope → suspend/revoke → recorded result → unresolved-effects handling.

## Complete capability-to-interface matrix
Status refers to inspected concept/source coverage, not implementation readiness. M = current milestone requirement; F = full-product requirement deferred from milestone; C = conditional profile, not universal requirement.

| ID | Capability / user need | Interface home | Current coverage | Stage / completion check |
|---|---|---|---|---|
| U01 | Login, logout, expired session, private account bootstrap | Entry / account menu | Basic source; no complete design | M: real login, expired session recovery, preserved unsent form, no cross-account leak |
| U02 | First-use setup and readiness | Work first-run checklist | Missing | M: explain project, agent and connection prerequisites; no premature success |
| U03 | Create/edit/archive project and inspect its work | Projects / project detail | Proposed board only; source create/list | M: milestone supports only actual APIs; full editing/archive requires contracts |
| U04 | Create task, identify project/owner, inspect task | Work / task detail | Source create/list; concept inbox | M: distinguish recorded task from accepted execution; show supported next action |
| U05 | Agent task admission, inputs, output references, bounds | Task detail / new-task flow | Missing | M: show validated input and current narrow action profile; no arbitrary autonomy promise |
| U06 | Persistent VERA identity and lifecycle/history | Agents / identity tab | Source principal only; nav label | M: identity distinct from current model/process; suspension history. Multi-agent creation F |
| U07 | Cognition provider/model configuration and substitution | Agent / Cognition | Missing | F: show binding/version, compatibility and change record; no equivalence guarantee |
| U08 | Mandate/objective and current allowed actions | Agent / Authority | Partial source grants; no design | M: explain exact GitHub scope; richer mandate editing F |
| U09 | Grants, resource ceilings, expiry, revocation | Agent / Authority; integration permissions | Source revoke/list; no complete design | M: named issuer/scope/expiry and durable revoke result; issuance only where supported |
| U10 | Policy/approval rules and decision explanation | Settings / Governance; request inspector | Exact approval concept | M: no automatic writes by default; policy revision and decision visible |
| U11 | Exact action preview and immutable request binding | Approvals / task Request | Proposed human-readable preview | M: title/body/draft, resource, actor, refs and technical SHAs/IDs, expiry; no approve mutable edited payload |
| U12 | Stale, expired, rejected, revoked approval | Same request inspector | Missing | M: explain why blocked; refresh/re-propose only through supported transition; rejection needs backend |
| U13 | Queued, active, blocked, terminal task/operation states | Work / task Activity | Partial proposed labels | M: versioned human labels; task state separate from effect state and global pause |
| U14 | Cancel, stop, pause with honest limits | Task / agent / Recovery | Source suspend; no complete flow | M: supported suspension/revocation; cancellation only after contract exists; sent effects may persist |
| U15 | Uncertain external outcome and reconciliation | Recovery / affected task | Concept warning only | M: known facts, original operation ID, last observation, next check, owner; never blind retry |
| U16 | Recovery ownership, acknowledgement and escalation | Recovery / account notification preferences | Missing | M: accountable owner and durable escalation; external delivery channel requires actual implementation |
| U17 | Execution/evidence timeline and confirmed provider result | Task Activity / Evidence | Source raw events; proposed timeline | M: observation vs confirmed outcome vs agent narration; no fabricated links or signed-proof claim |
| U18 | Evidence search/filter/export and integrity status | Evidence / event detail | Source recent100 only | M: disclose truncation, current filters only if backed; full pagination/export F with contracts |
| U19 | Owned memory/state, sources, provenance, retention | Agent / State; project Resources | Missing | F: owner/source/version, admitted vs derived data, invalidate/delete/export under retention rules |
| U20 | Context admission and cross-agent private/shared separation | Agent / State / context detail | Missing | F: inspect admitted sources, restrictions and derivation; never reveal unauthorized memory |
| U21 | Tools/providers/integrations and scoped connection | Settings / Integrations; project Resources | Missing end-user flow | M: approved GitHub installation/repository readiness; general catalog F |
| U22 | Server-only credentials, rotation, connection failures | Integration detail / account Security | Backend gates; design missing | M: status and expiry metadata; never credential values in UI/logs; no browser-held provider secret |
| U23 | Machine API access and distinct workload identities | Settings / Developer access | Missing | M if machine intake included: credential subject/scope/expiry/revoke; no reuse of human cookies |
| U24 | Budgets, quotas, overload and deadline visibility | Task detail; Settings / Usage | Source bounds; design missing | M: meaningful capacity/expiry errors. F: measured usage/cost; no invented estimates as charges |
| U25 | Logical Computer lifecycle, runtime binding and containment | Future Computers; Agent / Environment | Explicitly deferred | F: resource ID distinct from VM, placement, status, isolation/egress/limits and verified profile |
| U26 | Checkpoints, restore, runtime handoff and continuity history | Agent / Continuity; Recovery | Missing | F: restore generation/readiness and outstanding effects; control resume cannot bypass restore gate |
| U27 | Teams, memberships, roles, delegation | Future Settings / Organization; Agent / Authority | Deferred | F: private/shared projects, bounded delegation, membership revoke; principal identities remain distinct |
| U28 | Collective coordination, ownership and shared reservations | Project / Coordination | Deferred / undefined design | F: separate owners, task handoff and conflicts; organization/consortium profiles conditional |
| U29 | Deployment region, custody, retention, sovereignty limits | Settings / Deployment & data | Missing | F: real declared profile and provider dependencies; no universal sovereignty badge |
| U30 | Incident health, pause, safe resumption and support | Recovery; Settings / Support | Missing | M: actual paused state and error paths; F: verified health/runbooks/backup information |
| U31 | Subscription, usage charges, cancellation and export | Future Settings / Billing | Deferred | F: reuse actual commercial decisions, quote and invoice sources; no new pricing assumption |
| U32 | Skill/procedure lifecycle and invalidation | Agent / Capabilities, contextual detail | Optional draft only | C: versioned bounded procedure, permissions, provenance and invalidation; not mandatory marketplace |
| U33 | Compensation for supported providers | Recovery / operation detail | Not designed or supported narrow PR scope | C: separately authorized effect; never claim database rollback undoes provider effect |
| U34 | Provider network/federation/discovery | Future integration/profile surfaces | Research/codename | C: only after contracts and evidence; CTP not an approved norm |
| U35 | Product maturity and feature availability | Relevant feature empty state/help | Concept label only | M/F: distinguish design, available, configured, paused, unverified and unsupported; avoid dead promotional controls |
| U36 | Accessibility/responsive operation and resilient navigation | All screens | Source labels/focus; no full verification | M: keyboard, screen reader, zoom, mobile, contrast, reduced motion and errors checked |

## Recommended navigation
Keep Work, Projects, Agents, Approvals, Evidence, Recovery and Settings for the initial coherent design. Work defaults to Needs attention then active work, not an analytics dashboard. Project board and list are views of the same tasks; Activity and Request are task detail tabs.

Agents contains Overview, Authority, State, Cognition and Continuity as contextual sections as those features become available. Do not make all of them top-level navigation. Settings contains account/security, integrations, developer access, meaningful usage limits and support; organization, billing and deployment controls enter later. Add Computers as a primary object only with the actual integration phase. Public website routes in canon do not prohibit authenticated utility views; these are separate route owners.

Evidence and Recovery are cross-project views with links back to the same task/operation. Avoid duplicating state or introducing conflicting action controls. The Regency is the governance engine/product relationship; this design does not silently rename this entire interface Regency Console or merge it with historical Control Room.

## Required journeys before calling the interface complete
1. New account → accurate readiness → project → task; incomplete setup offers actionable guidance.
2. Authorized task → prepared exact request → readable preview → valid approval → queued state → provider-confirmed outcome and evidence.
3. Expired/revoked/stale request → typed explanation → no external send → supported next step.
4. Timeout/lost reply → outcome unconfirmed → retained original operation → observation/reconciliation → confirmed outcome or owned unresolved incident.
5. Agent suspension or grant revocation → scope review → recorded intervention → truthful treatment of queued versus already-sent effects.
6. Integration unavailable/expired → blocked admission or dispatch → safe reconnect without new broad grants or secret exposure.
7. Fleet/workspace capacity or deadline exceeded → actionable bound → no invisible retry loop.
8. Session expiry/access removal → safe sign-in or generic denial without leaking private resource details.
9. Future state import/admission → source/owner/provenance → use → invalidation/retention/export.
10. Future cognition/runtime replacement → same principal identity → explicit version/binding → recorded continuity and remaining obligations.
11. Future organization/delegation → bounded scope → change/revoke → separation preserved.
12. Future backup/restore → dispatch disabled → reconcile current authority and external effects → authorized safe resumption.
13. Future computer provisioning → declared environment limits → attach to agent → stop/delete with accurate state retention/effect rules.
14. Future billing onboarding/change/cancellation → real terms and entitlements → actual commercial result, no second unintended subscription.

These future journeys define coverage, not authorization to implement all profiles in this milestone.

## Interaction/state specification needed
Each implemented page needs loading, empty, success, validation, unavailable, permission-denied, session-expired, stale-update and narrow-screen states. Commands need in-progress duplicate suppression and durable result feedback; a disabled button alone is not duplicate prevention. Do not show confirmed failure for timeout. Distinguish recording a task, approving a request, enabling dispatch and observing an external result.

On mobile, show inbox then a separate detail view with Back, preserve filters/selection and scroll. Keep approval action and exact content accessible without a permanently narrow two-column inspector. Keyboard focus should follow navigation and dialogs; errors must identify fields, updates must be announced without continuous noise. Badge meaning must not depend only on color. No screenshot alone certifies accessibility.

## Corrections to approved concept before build
- Remove artificial Approved task bucket or define it as an operation view; approval is not task completion.
- Keep request fields read-only or invalidate approval through explicit re-proposal if changed.
- Expand technical details with canonical identity and revision fields; human preview must equal approved bytes.
- Reject button is proposed; candidate has no reject UI/backend path. Implement an authorized transition or omit it until supported.
- Notification, board drag-and-drop, new-agent/model/memory controls and archival are not implicitly working because concept shows them.
- Global dispatch pause remains independent of approval. Normal user approval must never enable recovery resume.
- Use verified server deadlines/time; expire gracefully and preserve request details.
- Do not expose internal rollout notes in routine user flow; explain actual availability or pause reason.
- No generic retry on possible external sends; no arbitrary file publication in existing-branch PR phase.

## Seven-responsibility coverage conclusion
Environment: missing, intentionally future integration. State: missing memory/retention/restore surfaces. Authority: partial approval/revoke, lacks mandates/policy lifecycle. Execution: partial task concept, lifecycle/cancellation limits incomplete. Evidence: partial raw events, needs truthful outcomes and linked queries. Coordination: project organization present, multi-principal coordination future. Cognition Boundary: missing explicit model/provider bindings. Cross-cutting identity, effect control, maturity and resource limits need contextual visibility.

## Portfolio discipline
NEXUS, AEON-IQ, Genesis and gateway lineages map to capabilities only after actual product integration evidence; they do not each need a launchable app tile. Research papers, company portfolio, launch campaigns and The Cage remain separate contexts. No marketplace, blockchain settlement, universal model support or self-improvement capability is added merely from names in the source pack.

## Acceptance and sequencing
First specify current milestone screens and all failure states; map each control to an actual endpoint, permission, immutable identity and result. Second complete backend/live-provider/recovery gates and a captured accessible browser walkthrough. Third introduce environment/state/cognition/team/commercial surfaces only with supported contracts and evidence. No production completeness claim until each required enabled-profile row has real acceptance evidence. Full product breadth is profile-dependent; no finite archive proves every possible future capability.

Recommended next deliverable: full interface specification for all seven current navigation areas, with milestone versus future-profile boundaries, mobile states, endpoint/authority bindings and journey acceptance checklist. Keep approved visual direction and current backend; no framework rewrite is required by these findings.
