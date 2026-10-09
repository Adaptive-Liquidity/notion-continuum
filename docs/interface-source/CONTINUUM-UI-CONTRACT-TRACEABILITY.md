# Continuum UI contract traceability

Revision 1 • 2026-10-09 UTC • Review candidate. Each T-ID maps to acceptance A-ID. All acceptance execution statuses below are **NOT RUN**. These are concrete required assertions, not claims that the UI passed.

## Contract profiles applied to every row

Read model R-X means proposed GET `/api/continuum/v1/<resource>` from specification section 4, with authorized tenant/object scope, source version/time/completeness and per-action availability. SESSION applies only shared behavior; resource reads still use their own object permissions. Existing auth/desktop/billing flows retain their actual endpoints until an adapter is reviewed. C-X is a proposed reviewed human command, never an implemented route by inference.

Every row inherits: server session/enrollment authorization; tenant isolation/field redaction; no-store private reads; unknown schema/freshness fail closed; command idempotency/expected-version ledger before human mutations; no browser dispatch/reconcile/renewal or secrets; backend-only authority and effect truth. Non-mutating local controls change view state only. No additional reject/cancel/isolate/resume/compensate/delegation button is authorized.

Evidence profile E1: exact S1 qualification source/migrations/FINAL-SUMMARY/saved TAP records for current narrow core, inspected not rerun. E2: refreshed S5 frontend source for legacy behavior, not live capture. E3: new domain/read/command contract is a proposal with no execution evidence. Every control's observation must name source/time/version; intent, governance, controller, provider observation, integrity and telemetry are separate. C-X requires a durable command event plus authorized read-back; a command acceptance or HTTP 2xx is not result evidence.

## Complete interaction catalogue

### T-01 — Account sign-in/out; workspace selection

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Access private work / enrolled human + tenant |
| Authoritative read model | R-SESSION; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Authenticated human; existing auth flow, proposed C-WORKSPACE |
| Backend enforcement → result/observation | Verify server session and enrolled membership; clear old tenant cache; selected tenant observed |
| Evidence | E2 + E3; apply separated evidence profile above |
| Failure/recovery | Expired session preserves unsent intent only; no automatic submission |
| Maturity/availability | Existing auth reuse; Continuum enrollment integration pending; action availability derived server-side, not UI presence |
| Acceptance test A-01 | Two tenants and two browser tabs cannot leak old private data; expired session cannot approve |
| Execution status | NOT RUN |

### T-02 — Readiness prerequisite detail

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Reach a supported first result / readiness graph |
| Authoritative read model | R-READINESS; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Authorized tenant read; no setup mutation by implication |
| Backend enforcement → result/observation | Server dependency graph includes qualification; health alone cannot mark ready |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | Missing machine binding blocks dependent execution but not unrelated read-only work |
| Maturity/availability | Proposed projection; live identity PARTIAL; action availability derived server-side, not UI presence |
| Acceptance test A-02 | Missing identity, Computer or verifier shows exact dependent blocked steps and no ready badge |
| Execution status | NOT RUN |

### T-03 — Work Focus select/filter/search/expand

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Find urgent cause / task + incident references |
| Authoritative read model | R-FOCUS; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only |
| Backend enforcement → result/observation | Authorized deterministic projection; preserve separate status axes and exact distinct impact |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | Partial/offline snapshots disclose incompleteness |
| Maturity/availability | Proposed derived projection; action availability derived server-side, not UI presence |
| Acceptance test A-03 | Two causes affecting one task count one distinct task; unrelated same-provider incidents remain separate |
| Execution status | NOT RUN |

### T-04 — Focus refresh order/new critical notice

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Inspect without losing place / snapshot + selection |
| Authoritative read model | R-FOCUS; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only |
| Backend enforcement → result/observation | Stable order while focused; explicit refresh updates snapshot |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | New critical event announces without focus theft |
| Maturity/availability | Proposed view behavior; action availability derived server-side, not UI presence |
| Acceptance test A-04 | Late critical row never changes selected approval or keyboard focus; explicit refresh orders severity/impact/deadline/age/ID |
| Execution status | NOT RUN |

### T-05 — Task list/detail/activity/output links

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Understand work / proposed task + operation refs |
| Authoritative read model | R-WORK; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only |
| Backend enforcement → result/observation | Domain business phase differs from scheduler/effect; output access checked |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | Missing/denied output uses generic response, no success substitution |
| Maturity/availability | Proposed registry/projection; action availability derived server-side, not UI presence |
| Acceptance test A-05 | REQUESTED operation with approval and HTTP 200 never labels task completed |
| Execution status | NOT RUN |

### T-06 — New task form

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Record bounded goal / proposed task/admission record |
| Authoritative read model | R-WORK; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Owner eligibility proposed; C-TASK-CREATE unavailable until reviewed |
| Backend enforcement → result/observation | Validate immutable inputs, principal, integration action bounds/deadline; durable command result |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | Lost response lookup; no second task or effect from resubmission |
| Maturity/availability | Proposed domain command; action availability derived server-side, not UI presence |
| Acceptance test A-06 | Duplicate key/body returns same task; changed body conflicts; record accepted is not execution success |
| Execution status | NOT RUN |

### T-07 — Projects list/detail/resources

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Organize work / proposed project |
| Authoritative read model | R-PROJECT; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only; create/edit/archive unavailable |
| Backend enforcement → result/observation | Tenant ownership and object versions; resources separately authorized |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | No board drag mutation or archive from local state |
| Maturity/availability | Proposed project contract; action availability derived server-side, not UI presence |
| Acceptance test A-07 | Filtered list and project list identify same tasks; archive/drag controls absent without commands |
| Execution status | NOT RUN |

### T-08 — Coordination/dependency inspector

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Know responsibility / task owner + dependency edges |
| Authoritative read model | R-PROJECT; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only |
| Backend enforcement → result/observation | Single accountable VERA; collaborators not delegated grants; versioned dependency relations |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | Cycles/conflicts exposed; unresolved dependency stays blocked |
| Maturity/availability | Proposed coordination read model; action availability derived server-side, not UI presence |
| Acceptance test A-08 | Display responsible owner, waiting-on and resource conflict without sharing cross-tenant identifiers |
| Execution status | NOT RUN |

### T-09 — Handoff management

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Transfer responsibility / proposed durable handoff |
| Authoritative read model | R-PROJECT; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Fresh owner proposed; C-HANDOFF unavailable until reviewed |
| Backend enforcement → result/observation | CAS source owner/task version; destination acceptance; retain operation principal/grant |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | Concurrent acceptance rejects; expiry never transfers authority |
| Maturity/availability | Deferred command, bounded design; action availability derived server-side, not UI presence |
| Acceptance test A-09 | Two competing handoffs cannot create two owners; old approval does not authorize new principal |
| Execution status | NOT RUN |

### T-10 — VERA overview/continuity/history

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Identify accountable actor / ct.principals |
| Authoritative read model | R-VERA; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only; create/suspend unavailable |
| Backend enforcement → result/observation | Epoch/generation/active from principal; join IDs without conflation |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | Unknown binding labelled unknown, no model-derived identity |
| Maturity/availability | Core implemented; console read pending; action availability derived server-side, not UI presence |
| Acceptance test A-10 | Model replacement leaves principal ID unchanged; human/model/machine/Computer IDs rendered separately |
| Execution status | NOT RUN |

### T-11 — Workload identity enrollment detail

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Inspect enrolled machine / ct.identities |
| Authoritative read model | R-IDENTITY; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only; enrollment/disable unavailable |
| Backend enforcement → result/observation | Independent issuer/subject/audience/kind mapping, active/version; redact secrets |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | Disabled/expired/revoked reasons shown only when known |
| Maturity/availability | P1 PARTIAL; operator enrollment source exists; action availability derived server-side, not UI presence |
| Acceptance test A-11 | Test issuer and fixture HMAC never advertised as production; JWT/key/cookie values absent from DOM/network/export |
| Execution status | NOT RUN |

### T-12 — Identity assignment form/detail

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Bind machine to exact work / ct.assignments |
| Authoritative read model | R-IDENTITY; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Fresh enrolled human owner; proposed C-ASSIGN -> POST /assignments |
| Backend enforcement → result/observation | Input identity,operation,expires; same tenant/principal/machine/digest, bounded deadline; durable assignment read |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | Stale/duplicate conflict returns existing command or refresh, no assumed success |
| Maturity/availability | Implemented seam; BFF/ledger pending; action availability derived server-side, not UI presence |
| Acceptance test A-12 | Human identity cannot be assigned as worker; wrong principal/digest denied and recorded assignment matches operation |
| Execution status | NOT RUN |

### T-13 — Renewal freshness status

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Know usable authority / issuance event + assignment |
| Authoritative read model | R-IDENTITY; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only; no browser renewal command |
| Backend enforcement → result/observation | <=90000 ms effective expiry with all authority/identity bounds; online identity version at send |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | Stale issuance cannot say currently renewable; blocked reason retains operation |
| Maturity/availability | P1 PARTIAL; metadata projection pending; action availability derived server-side, not UI presence |
| Acceptance test A-13 | Earlier identity/grant/assignment expiry shortens lifetime; disabled version rejects issued token before final send |
| Execution status | NOT RUN |

### T-14 — Cognition/model binding detail

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Understand replacement / proposed model binding revision |
| Authoritative read model | R-VERA; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only; model change unavailable |
| Backend enforcement → result/observation | Model/config compatibility separate from principal and authority |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | Provider outage shown as dependency; no uncertain-effect executor fallback |
| Maturity/availability | Deferred binding integration; action availability derived server-side, not UI presence |
| Acceptance test A-14 | Replacement never resets operation ID or claims new authority/equivalent memory behavior |
| Execution status | NOT RUN |

### T-15 — Context/state provenance detail

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Inspect admitted facts / ct.context_items + proposed provenance |
| Authoritative read model | R-CONTEXT; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Authorized context read; GET only; import/edit/delete unavailable |
| Backend enforcement → result/observation | Tenant/version/digest/nonquarantine checks; derived indexes non-authoritative |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | Corrupt/stale data quarantined/blocked; exact source retained |
| Maturity/availability | Narrow local checks; R4 PARTIAL; full memory deferred; action availability derived server-side, not UI presence |
| Acceptance test A-15 | Stale expected version/corrupt digest/cross-tenant recall rejected; summary text cannot authorize an operation |
| Execution status | NOT RUN |

### T-16 — Approval queue/exact preview/technical disclosure

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Review exact action / ct.operations + ct.approvals |
| Authoritative read model | R-OPERATION; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only |
| Backend enforcement → result/observation | Render complete immutable semantic binding and digest; preserve long fields |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | Changed version replaces eligibility with stale warning; preview not silently edited |
| Maturity/availability | Core implemented; human read pending; action availability derived server-side, not UI presence |
| Acceptance test A-16 | Long Unicode/multiline params remain reviewable; injected markup inert; displayed preview digest matches approved binding |
| Execution status | NOT RUN |

### T-17 — Approve exact action

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Authorize one proposal / approval command + ct.approvals |
| Authoritative read model | R-AUTHORITY; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Fresh enrolled human owner MFA; proposed C-APPROVE -> POST /approvals |
| Backend enforcement → result/observation | Input operation,digest,expires; REQUESTED/current grant/epoch/generation/fence; transaction event + read-back |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | Stale/expired/denied re-read; lost acknowledgement queries command, never auto-approves |
| Maturity/availability | P1 PARTIAL; BFF/ledger/history pending; action availability derived server-side, not UI presence |
| Acceptance test A-17 | MFA/auth_time boundary, changed digest/grant/fence and two tabs deny stale approval; approved label never means executed |
| Execution status | NOT RUN |

### T-18 — Approval invalidation/expiry status

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Know authorization remains usable / approval binding |
| Authoritative read model | R-AUTHORITY; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only; reject/cancel/edit/re-propose unavailable |
| Backend enforcement → result/observation | Separate historical approval from current eligibility; server time/versions |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | New operation requires separate review; no refresh extends scope |
| Maturity/availability | Proposed eligibility projection; action availability derived server-side, not UI presence |
| Acceptance test A-18 | Clock skew cannot extend expiry; revoke/epoch/version change blocks action while retaining decision history |
| Execution status | NOT RUN |

### T-19 — Grant detail/policy/limits/reservations

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Understand current scope / ct.grants + principal + policy ref |
| Authoritative read model | R-AUTHORITY; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only |
| Backend enforcement → result/observation | Exact action/resource/version/expires/revoked/reserved; policy unknown if not implemented |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | Stale budget or policy is not available balance/permission |
| Maturity/availability | R3/R9 PARTIAL; policy extension pending; action availability derived server-side, not UI presence |
| Acceptance test A-19 | Reservation differs from spend; absent policy version displays unknown, never invented epoch |
| Execution status | NOT RUN |

### T-20 — Create bounded grant

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Set permitted scope / ct.grants |
| Authoritative read model | R-AUTHORITY; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Fresh enrolled human owner MFA; proposed C-GRANT -> POST /grants |
| Backend enforcement → result/observation | Exact keys id,principal,action,resource,expires,maxCost,budget; <=48h; approval_required true |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | Invalid bounds rejected; no wildcard or generalized write promotion |
| Maturity/availability | Seam implemented; protected mutation unavailable; action availability derived server-side, not UI presence |
| Acceptance test A-20 | Expiry >48h, negative/unsafe integer cost, budget<maxCost and unsupported selector cannot enable action |
| Execution status | NOT RUN |

### T-21 — Revoke grant

| Required mapping | Contract |
|---|---|
| User goal → durable product object | End future admission / versioned grant revoke |
| Authoritative read model | R-AUTHORITY; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Fresh enrolled human owner MFA; proposed C-REVOKE -> POST /revoke |
| Backend enforcement → result/observation | Input grant; durable revocation/version and event; subsequent admission denied |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | In-flight/UNKNOWN remain visible; no recall promise |
| Maturity/availability | P1 PARTIAL; durable command lookup pending; action availability derived server-side, not UI presence |
| Acceptance test A-21 | Concurrent revoke/send preserves documented ordering; revocation badge only after persisted result, no all-effects-stopped claim |
| Execution status | NOT RUN |

### T-22 — Operation lifecycle detail

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Know external result / ct.operations + observation |
| Authoritative read model | R-OPERATION; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only |
| Backend enforcement → result/observation | Exact seven enums and transitions; controller alone writes effect result |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | Timeout/lost ack -> UNKNOWN; no generic retry or alternative executor |
| Maturity/availability | P2 PARTIAL; read proof narrow; action availability derived server-side, not UI presence |
| Acceptance test A-22 | UNKNOWN cannot acquire resend control; HTTP 2xx/model/log/hash receipt cannot turn it COMMITTED |
| Execution status | NOT RUN |

### T-23 — Pinned GitHub read observation

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Verify intended read / exact commit/tree observation |
| Authoritative read model | R-OPERATION; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; no direct controller or arbitrary URL control |
| Backend enforcement → result/observation | Fixed commit/tree plus independent second endpoint match; supported COMMITTED interpretation |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | Verifier outage/mismatch remains UNKNOWN; later fresh read may satisfy intended read |
| Maturity/availability | Narrow public-read PASS; P2 PARTIAL; action availability derived server-side, not UI presence |
| Acceptance test A-23 | Tiny timeout followed by successful read-back says verified intended read, never first request executed or write succeeded |
| Execution status | NOT RUN |

### T-24 — Evidence filters/pagination/detail

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Assess provenance / evidence events + provider observations |
| Authoritative read model | R-EVIDENCE; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Authorized tenant read; GET only |
| Backend enforcement → result/observation | Sequence/lineage/transaction links; integrity distinguished from external truth |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | Truncation/chain gap/missing observation visibly unconfirmed |
| Maturity/availability | R5 PARTIAL; projection/pagination pending; action availability derived server-side, not UI presence |
| Acceptance test A-24 | Valid chain with missing/mismatched provider observation has no verified-success badge |
| Execution status | NOT RUN |

### T-25 — Evidence export

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Retain permitted evidence / proposed export manifest |
| Authoritative read model | R-EVIDENCE; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant field permissions; C-EXPORT unavailable until reviewed |
| Backend enforcement → result/observation | Server redaction, cursor/snapshot, completeness and source manifest; audited export |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | Denied or partial export disclosed; no credentials in artifact |
| Maturity/availability | Deferred export contract; action availability derived server-side, not UI presence |
| Acceptance test A-25 | Cross-tenant/private fields excluded; partial archive includes completeness marker and original observation provenance |
| Execution status | NOT RUN |

### T-26 — Computer list/detail/raw lifecycle

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Know actual environment / logical Computer + placement |
| Authoritative read model | R-COMPUTER; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Authorized human read; GET only |
| Backend enforcement → result/observation | Keep all 15 raw states, separate health/checkpoint/job/generation/fence; provider ref redacted |
| Evidence | E2 + E3; apply separated evidence profile above |
| Failure/recovery | restore_failed/recovery_failed/cleanup_needed/error/deleting/deleted are specific |
| Maturity/availability | Legacy source exists; P3 NOT RUN; new projection pending; action availability derived server-side, not UI presence |
| Acceptance test A-26 | Each raw state has distinct accessible text; generation unknown cannot become workspaceRevision; future enum disables actions |
| Execution status | NOT RUN |

### T-27 — Computer pause/resume/restart/wake

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Change supported legacy environment / lifecycle job |
| Authoritative read model | R-COMPUTER; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Human ownership; legacy adapter only after review; C-LIFECYCLE not enabled by this spec |
| Backend enforcement → result/observation | ComputerService legal transitions and server action eligibility; persisted job/state then provider observation |
| Evidence | E2 + E3; apply separated evidence profile above |
| Failure/recovery | Failed wake/rebuild/recovery retains exact state; no effect resume implied |
| Maturity/availability | Legacy seams present; qualification pending; action availability derived server-side, not UI presence |
| Acceptance test A-27 | Lifecycle 202 never says recovered; changed generation/state rejects stale action; recovery failure cannot display stopped |
| Execution status | NOT RUN |

### T-28 — Checkpoint/recovery/fence inspector

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Understand continuity / checkpoint + artifact + placement fence |
| Authoritative read model | R-COMPUTER; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Authorized human read; GET only; restore/delete/isolate unavailable |
| Backend enforcement → result/observation | Manifest/digest/base image/revision and old generation fence verified independently |
| Evidence | E2 + E3; apply separated evidence profile above |
| Failure/recovery | Restore/fence failure blocks admission; cleanup obligations retained |
| Maturity/availability | P3/R6 NOT RUN; action availability derived server-side, not UI presence |
| Acceptance test A-28 | Ready checkpoint with failed restore stays restore_failed; old-generation requests denied before new admission |
| Execution status | NOT RUN |

### T-29 — Manual session view/frame/viewport

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Observe safely / human desktop session |
| Authoritative read model | R-COMPUTER; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Human owner via reviewed legacy desktop open/screen/close; final session contract pending |
| Backend enforcement → result/observation | No provider credentials; observed frame time/dimensions, lease/mode; viewing cannot send input |
| Evidence | E2 + E3; apply separated evidence profile above |
| Failure/recovery | Stale/disconnected frame clearly labelled; lease governs close, not tab lifetime |
| Maturity/availability | Legacy source exists; boundary qualification pending; action availability derived server-side, not UI presence |
| Acceptance test A-29 | Viewing cannot act; expired/revoked/missing lease fails closed across instances; screenshot not persisted by default |
| Execution status | NOT RUN |

### T-30 — Manual take control/hand back/input

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Intervene as human / proposed durable control lease |
| Authoritative read model | R-COMPUTER; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Human owner; C-TAKEOVER/C-HANDBACK only after fencing review; legacy take_control/hand_back/act audited |
| Backend enforcement → result/observation | Exclusive human/agent mode fence, generation/expiry, authoritative action result; manual not verified agent effect |
| Evidence | E2 + E3; apply separated evidence profile above |
| Failure/recovery | Input error displayed; tab/lease loss disables input; hand back does not resume agent |
| Maturity/availability | Final safety contract missing; unavailable for governed deployment; action availability derived server-side, not UI presence |
| Acceptance test A-30 | Two tabs cannot own control; missing session row denies; privileged browser unreachable by agent; Tab/Escape usable locally |
| Execution status | NOT RUN |

### T-31 — Recovery UNKNOWN detail/observation status

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Own uncertain effect / operation + incident |
| Authoritative read model | R-INCIDENT; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only; no browser reconcile seam |
| Backend enforcement → result/observation | Original immutable ID, last provider observation, owner, next trusted check and unavailable reason |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | Post-revocation observation remains blocked until independent path; never reinstate write grant |
| Maturity/availability | Core reconciliation internal; human observation contract missing; action availability derived server-side, not UI presence |
| Acceptance test A-31 | Revoked grant plus lost verifier remains owned UNKNOWN, without retry/resume/regrant control |
| Execution status | NOT RUN |

### T-32 — Incident acknowledgement/ownership

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Record response / proposed incident decision |
| Authoritative read model | R-INCIDENT; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Authorized human command proposed C-ACK; unavailable until reviewed |
| Backend enforcement → result/observation | CAS incident version/owner; durable ack record, independent resolution basis |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | Ack timeout lookup; ack never resolves uncertain effect |
| Maturity/availability | Proposed incident API; action availability derived server-side, not UI presence |
| Acceptance test A-32 | Acknowledged incident with UNKNOWN operation stays unresolved and still linked from Work |
| Execution status | NOT RUN |

### T-33 — Integrations detail/setup status

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Know usable provider / adapter + connection metadata |
| Authoritative read model | R-INTEGRATION; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only; reconnect setup only reviewed provider flow |
| Backend enforcement → result/observation | Exact resource/action, version, scope, health, qualification; server credentials only |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | Expired connection groups affected tasks; refresh does not broaden grant |
| Maturity/availability | Read adapter implemented; connection UI integration pending; action availability derived server-side, not UI presence |
| Acceptance test A-33 | Public read PASS never enables protected write; unauthorized configuration hidden; setup metadata contains no credential values |
| Execution status | NOT RUN |

### T-34 — Notifications inbox/delivery detail/preferences

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Know alert reached owner / notification + delivery attempts |
| Authoritative read model | R-NOTIFICATION; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; C-MARK-READ/C-PREFERENCES unavailable until reviewed |
| Backend enforcement → result/observation | Outbox/inbox dedup, channel attempts/status, separate incident status |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | Delivery failed/unknown retains critical in-app condition; retry bounded internal |
| Maturity/availability | Proposed durable delivery API; action availability derived server-side, not UI presence |
| Acceptance test A-34 | Duplicate events produce one incident group; delivered/read notification does not resolve cause; channel failure visible |
| Execution status | NOT RUN |

### T-35 — Usage/budget/limit detail

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Understand enforced capacity / grant reservation + proposed meter |
| Authoritative read model | R-USAGE; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant read; GET only; limit edits unavailable |
| Backend enforcement → result/observation | Source/unit/period/freshness; measured/estimated/reserved distinct; enforcement server-side |
| Evidence | E1 + E3; apply separated evidence profile above |
| Failure/recovery | Stale meter labelled stale; exhausted vs queued vs denied separate |
| Maturity/availability | R9 PARTIAL; real money/token enforcement unqualified; action availability derived server-side, not UI presence |
| Acceptance test A-35 | Stale usage never shows zero spend/free capacity; concurrency rejection has reason, no invisible retry storm |
| Execution status | NOT RUN |

### T-36 — Billing portal/account terms

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Manage existing subscription / provider subscription/invoice |
| Authoritative read model | R-USAGE; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Existing authorized billing workflow; no new commercial commands |
| Backend enforcement → result/observation | Reuse reviewed catalog/portal/webhook truth; subscription not effect authority |
| Evidence | E2 + E3; apply separated evidence profile above |
| Failure/recovery | Payment pending/error/cancelled independent of in-flight effects |
| Maturity/availability | Legacy billing reuse; no Continuum commercial readiness inferred; action availability derived server-side, not UI presence |
| Acceptance test A-36 | Duplicate portal purchase cannot create second subscription; invoice source and entitlement do not imply grant |
| Execution status | NOT RUN |

### T-37 — Deployment/data/support/maturity

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Assess limitations / trusted deployment + qualification record |
| Authoritative read model | R-DEPLOYMENT; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Tenant-authorized metadata GET; no scheduler/HA toggle |
| Backend enforcement → result/observation | Actual scope, retention, residency and tested RPO/RTO; exact gate statuses |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | Missing values unknown; unsupported features explain dependency |
| Maturity/availability | P3-P5/R10 NOT RUN; action availability derived server-side, not UI presence |
| Acceptance test A-37 | No HA/DR/security-certification badge or scheduler selector from design/default recommendation |
| Execution status | NOT RUN |

### T-38 — Shared navigation/back/disclosure/copy/pagination

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Inspect durable objects / authorized references and view state |
| Authoritative read model | R-SESSION; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Human read; GET only, local view actions |
| Backend enforcement → result/observation | Semantic links/buttons; copy only safe displayed IDs; cursor scoped to snapshot |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | Denied objects generic; stale cache cleared on account switch |
| Maturity/availability | UI proposed; action availability derived server-side, not UI presence |
| Acceptance test A-38 | Back restores selection/filter/scroll; keyboard and mobile navigation reach same exact detail without hidden fields |
| Execution status | NOT RUN |

### T-39 — Shared stale/offline/error/unknown-schema states

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Avoid acting on stale truth / versioned envelope |
| Authoritative read model | R-SESSION; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Read permission; mutations unavailable while eligibility stale |
| Backend enforcement → result/observation | Latest version wins; fresh_until/server_time; network acceptance never result |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | Reconnect revalidates; slow old responses ignored; no automatic resend |
| Maturity/availability | UI/read protocol proposed; action availability derived server-side, not UI presence |
| Acceptance test A-39 | Out-of-order response, disconnect after click and unknown enum yield no false success or unauthorized control |
| Execution status | NOT RUN |

### T-40 — Shared mobile/zoom/keyboard/reduced-motion states

| Required mapping | Contract |
|---|---|
| User goal → durable product object | Operate accessibly / same authorized objects |
| Authoritative read model | R-SESSION; authoritative owner and freshness per specification §§3–4 |
| Required role/authority → human API/command | Same authority and commands; presentation grants nothing |
| Backend enforcement → result/observation | WCAG 2.2 AA target; semantic controls, contrast, focus, reflow; no swipe approval |
| Evidence | E3; apply separated evidence profile above |
| Failure/recovery | Focus restoration; exact content reviewable at narrow width; local escape from remote capture |
| Maturity/availability | Accessibility target; checks NOT RUN; action availability derived server-side, not UI presence |
| Acceptance test A-40 | 320 CSS px/400% zoom/200% text, keyboard, screen reader and reduced motion preserve preview and action safety |
| Execution status | NOT RUN |

## Historical coverage reconciliation

U01–U36 from the coverage review are covered by T-01…T-40: account/readiness T01–02; projects/tasks T05–09; VERA/model/authority T10–21; uncertainty/evidence T22–25/31–32; memory/context T15; integrations/credentials T11–13/33; budgets T19/35; Computers/continuity T26–30; teams/coordination T08–09; deployment/support/billing T36–37; maturity/accessibility T37–40. This coverage does not enable historical milestone controls.

Conditional procedures/skills, federation/CTP, compensation and team/delegation management remain unsupported/deferred under T07–09/14–15/31/37. Each would need a separate durable object, authority API, qualification and acceptance extension before a control is added. Operator-only recovery/destruction is not silently promoted to human ownership. No marketplace or generic autonomy scope is included.

## Adversarial release assertions

A-11/13/17/21/22/28/30/31 are stop-ship for any enabled governed feature. Frontend hiding is never the enforcement test: issue direct unauthorized, stale, changed-body and cross-tenant requests and assert backend denial/no unauthorized provider sends. Capture actual signed-in staging evidence separately from contract fixtures. Fixture screenshots must carry their fixture label and cannot close a production gate.
