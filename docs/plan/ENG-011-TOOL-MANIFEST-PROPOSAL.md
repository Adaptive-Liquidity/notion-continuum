# ENG-011 tool-manifest recommendation

Status: recommendation for review, written 2026-10-12 against `main`
`83626cd48a0f98d0afd7bc79e38185b4a2acb768` (merge of pull request #20).
Publishing this document does not approve the change, authorize implementation,
copy donor source, or move a ledger.

Production stays BLOCKED. The scheduler stays HELD. Canary stays NO-GO.

## What this is

ENG-011 requires versioned tool, model, and context manifests. Tool, model, or
context drift denies execution when the approval binding cares. An index
rebuild cannot create authority.

Pull request #14, merge `2cdf6aa`, landed context and cognition binding and
contract extension v3 (migration 017). A version 3 operation binds a context
item, a cognition revision, or both. When the proposal names a context item,
the server records the current head version. When a cognition row exists, the
server records the current maximum cognition revision. Admission denies a moved
context head or a greater cognition revision. An explicit cognition revision of
zero is rejected. Context is still not authority.

That is the model and context portion of ENG-011. It is not a tool manifest.
There is no tool-manifest table. `ct.artifact_manifests` and
`ct.computers.manifest_digest` are artifact and placement records. An
operation's `provider`, `action`, and `resource` are the effect binding, not a
versioned tool definition.

Model drift in the cognition revision and context drift in the context head
stay as they are. This recommendation covers only the missing tool binding.

## Smallest change

A later implementation pull request, after this recommendation is accepted,
adds contract extension v4 and migration `020-tool-manifest.sql`. It does not
edit `docs/M1-SAFETY-CONTRACTS.md`, migrations 001 through 019, or the bytes of
contract extensions v2 and v3. Historical version 1, 2, and 3 rows stay on
those versions. Their digests stay unchanged.

Version 4 is used only when a proposal names a tool. The caller supplies the
tool id and no revision. The server records the current maximum revision for
that tenant and tool. The id uses the existing identifier check. The approval
digest is the version 1 field set with `contractVersion: 4`, plus `computerId`
and `placementGeneration` when a Computer is bound, plus `contextId` and
`contextVersion` when a context item is bound, plus `cognitionRevision` when a
cognition revision is bound, plus `toolId` and `toolRevision`.

A version 4 row always has both tool fields. A Computer pair, a context pair,
and a cognition revision stay optional under the same presence rules as version
3. Version 4 does not require context or cognition. Version 1, 2, and 3 rows
have null tool columns. A later tool revision does not rewrite or deny an
operation that did not name a tool.

When a cognition row already exists, proposal still records the current maximum
cognition revision, as it does today. If that proposal also names a tool, the
operation is version 4 and the digest includes both. If it does not name a
tool, the operation stays version 1, 2, or 3 exactly as it would today.

`ct.tool_manifests` is append-only: `tenant`, `tool_id`, `revision`, and
`definition_digest`. The revision is a positive bigint. The digest uses the
same length-64 check as `ct.context_versions.digest`. The primary key is
`(tenant, tool_id, revision)`. The database assigns the next revision,
including on a direct insert. Revision 0 and a gap are rejected. Update and
delete are rejected. Row security and grants follow `ct.cognition_bindings`:
the governor appends, trusted readers select, and a tenant role can read only
its own rows. `ct_product_api` may insert the tool columns on a new operation
and may not append a manifest. The definition digest is the identity of the
definition. The definition bytes are not stored in this table. A changed
definition is a new revision. The operation digest pins `toolId` and
`toolRevision`, not a second copy of the definition digest. The revision row
is immutable, so the revision pins that digest.

`ct.append_tool_manifest` is granted to `ct_governor` only. It takes a
transaction advisory lock on the tenant and tool id, inserts the next revision,
and inserts or updates the index row in the same transaction. It does not lock
a context head, a cognition row, or a principal. A worker cannot append. A tool
revision is not a grant, an approval, a mandate, or permission to send.

`ct.tool_manifest_index` holds one derived row per tenant and tool: the current
revision and definition digest. `ct.rebuild_tool_manifest_index` is granted to
`ct_governor` only. It rewrites those rows from `MAX(revision)` in
`ct.tool_manifests`. It does not insert a manifest revision, a grant, an
approval, or an operation. Admission does not call it and does not repair the
index.

Admission keeps today's authority locks, then the bound context head when a
context item is bound, then the tool advisory lock and the index row when a
tool is bound. It reads the append-only maximum. A greater maximum is
`MANIFEST_STALE` and does not send. A missing manifest row, a cross-tenant id,
or an index row that disagrees with the append-only maximum is
`MANIFEST_UNAVAILABLE` and does not send. The index is not authority. Quarantine
and visibility rules are not copied onto tools.

A repeated proposal with the same operation id is idempotent only when the
complete version 4 digest matches. A different tool or revision is a conflict
and does not send. UNKNOWN reconciliation uses the stored digest and does not
send. Recovery imports a version 4 archive only with its original tool
revision. A missing tool revision stays blocked and is not stored as version 1,
2, or 3.

The same read-only operation projection that already returns a context id and a
cognition revision also returns the bound tool id and tool revision. That
pass-through is not a Focus Desk screen.

Files for that later pull request:

- `migrations/020-tool-manifest.sql`
- `docs/M1-CONTRACT-EXTENSION-v4.md`, written from this recommendation only
  after it is accepted
- `src/db.ts`, `src/product-service.ts`, `src/context-lock.ts`,
  `src/controller.ts`, `src/recovery.ts`, `src/evidence-export.ts`,
  `src/console/reads.ts`, and `src/console/contracts.ts`
- `tests/tool-manifest.test.ts`

`tests/manifest-binding.test.ts` stays the context and cognition regression.

## Acceptance tests

A later implementation is acceptable only when these hold on that commit:

1. Migration 020 leaves existing version 1, 2, and 3 digests, contract
   versions, and context and cognition columns unchanged. A tool column on a
   version 1, 2, or 3 row is rejected. Revision 0 is rejected. A direct insert
   that skips a revision is rejected. A direct insert that omits the revision
   receives the next revision. Update and delete of a manifest row are rejected.
2. A proposal that names a tool id stores that id, the current maximum
   revision, and contract version 4. The digest includes `toolId` and
   `toolRevision`. The same proposal returns the stored row. The same operation
   id with another tool, or after a newer revision exists, conflicts and does
   not send.
3. After a new revision is appended, pre-send admission of the bound operation
   returns `MANIFEST_STALE` and does not send. A missing row or a cross-tenant
   tool id returns `MANIFEST_UNAVAILABLE` and does not reveal another tenant's
   row. An operation that did not name a tool keeps its previous contract
   version, and a later tool revision does not deny it.
4. Appending a revision and rebuilding the index leaves grant, approval, and
   operation counts and digests unchanged. The rebuilt index matches the
   append-only maximum. An index row with no manifest row fails admission
   closed and creates no grant. Rebuild does not insert a manifest revision,
   grant, approval, or operation.
5. An approval of the version 4 digest does not admit a different tool
   revision. UNKNOWN reconciliation uses the stored digest and does not send.
6. Recovery of a version 4 archive without the referenced tool revision stays
   blocked and is not rewritten as an older contract version. Recovery with the
   original tool revision stores `UNKNOWN` and does not send.
7. Concurrent appends for one tool produce a gapless sequence. A tool append
   does not lock a context head or a cognition row. The existing
   context and cognition denial tests still pass.

## Out of scope

This recommendation does not implement the binding. It does not add migration
020, a version 4 contract file, or a tool table.

These stay out of the later slice as well:

- Editing the frozen M1 contract or rewriting stored version 1, 2, or 3
  digests.
- Executing a tool, calling an adapter, or treating a tool revision as effect
  authority.
- NEXUS, AEON-IQ, a model gateway, typed plans, and arbitrary tool requests.
  Those remain ENG-013, ENG-014, ENG-019, ENG-021, ENG-022, and ENG-023.
- Copying or distributing donor source. D05 still requires licensing and
  provenance evidence before any copy. No donor tree is an input.
- Provider credentials, a live send, and the D07 file-write adapter.
- A new event kind, a bus, or an ENG-012 consumer.
- Focus Desk screens, quarantine, and a visibility model for tools.
- Storing definition bytes, executable schemas, or donor source in PostgreSQL.
- Backfilling historical operations with a tool.
- Any change to `qualification/PRODUCTION-GATES.json` or
  `docs/RELEASE-GATES.json`.

D01–D04 and the recorded D05–D12 directions stay inside the limits in
[OWNER-DECISIONS.md](OWNER-DECISIONS.md). This text does not close a missing
input, select a scheduler, or approve a live gate. Implementation waits for a
separate acceptance of this recommendation.
