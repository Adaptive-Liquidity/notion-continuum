# Start here: Continuum completion

One maintained repository plan replaces scattered private revisions as the current
task map: [CURRENT-PLAN.md](CURRENT-PLAN.md). Owner scope lives in
[OWNER-DECISIONS.md](OWNER-DECISIONS.md). No task number implies execution order.

1. Read `AGENTS.md` and `docs/AGENT-START.md`. Verify folder, remote, branch, commit,
   worktrees and dirty state. Preserve existing files. Fetch main explicitly using
   `git fetch origin refs/heads/main:refs/remotes/origin/main` before selecting work.
2. Compare the plan snapshot with actual merged code and main checks. Read the
   relevant catalog entry, owner decisions and task proposal. A partial slice is
   not the whole feature. Next product slice is ENG-026 work admission. Its six
   choices were accepted for that task only on 2026-10-12; see OWNER-DECISIONS.md.
   No donor integration starts automatically from reading a plan.
3. Use the frozen safety/recovery contracts and applicable versioned extensions.
   Read `docs/ARCHITECTURE.md`, `docs/interface/PRODUCT-CONTRACT.md`,
   `docs/interface/FOCUS-DESK-DESIGN.md` and relevant gap/traceability entries.
   Current implementation shows what exists; normative contracts constrain changes.
4. Find the private local environment guide through
   `git config --get continuum.environmentGuide`. This local setting is shared by
   linked Git worktrees, but not transferred to other clones/cloud machines. Treat
   its value as a file path to read, not an executable command. If missing, obtain
   the guide from owner-provided Project context or a local agent. Do not search
   broadly through personal folders or infer a database from an old chat.
5. Read `docs/TESTING.md` and `docs/LOCAL-TEST-LAUNCHER.md`. Local agents use the
   reviewed private shared-test entry point; hosted agents use workflow-provisioned
   fixtures. A cloud agent cannot assume access to a local filesystem, WSL, private
   guide or ignored Cursor rule. Verify that access before promising local tests.
6. Propose one dependency-ready scoped task; obtain any missing design/owner decision.
   Implement only authorized scope in a fresh branch/worktree. Validate review claims
   against current code, preserve regressions and test exact source. The plan does
   not authorize unlimited parallel tasks or spending.
7. Update implemented/tested status in the task PR with source identity and evidence.
   Before owner merge, say awaiting merge. After observing the merge and main checks,
   record merged status in the next scoped update. Never label an open PR merged.
   Do not repeat successful checks or paid bot reviews without a concrete reason.

## Cursor Project coordinator

Connect the correct source repository and give the Project these three repository
documents. Establish the current main identity, scoped owner decisions and accessible
runtime/context. Keep a per-task handover naming the branch, worktree, tested source,
remaining issues and verified environment-guide locator. Linked worktrees inherit
the Git locator; a new clone requires its own authorized setup or supplied context.

Delegate small independent scopes; serialize shared local testing through its lease.
Keep one clear integration/merge order. Owner merges remain separate. If an earlier
task is held, propose independent ready work rather than silently discarding a gate.
Save durable status in the repository plan, not only in Project chat memory.

Cloud coordination does not by itself connect a PC or copy private context. Before
delegating local tests, use a read-only discovery check: the local agent must find
the guide and shared command through the configured locator, report the correct
runtime/source and distinguish verified access from missing inputs. Do not publish
private archives just to provide cloud context.

## Boundaries

PostgreSQL domain truth, separate Effect Controller enforcement, exact immutable
approvals, tenant isolation, placement freshness and observation-only UNKNOWN stay.
No merge, deployment, visibility/licensing change, unapproved paid resource, shadow
or canary without owner authorization. Production BLOCKED, scheduler HELD, canary
NO-GO. Gate ledgers change only with independently scoped qualification evidence.
