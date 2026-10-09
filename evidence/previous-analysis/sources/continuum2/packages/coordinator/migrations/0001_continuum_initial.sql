-- 0001_continuum_initial.sql
-- Core schemas for Continuum CP powered by DBOS / Node.
-- Incorporates RLS by tenant_id across all tables.

-- Enable UUID extension for some internal IDs, but we use ULIDs formatted as text
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 1. Identity & Credentials (VERA)
-- =====================================================================

CREATE TABLE IF NOT EXISTS principals (
  principal_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'SUSPENDED', 'RETIRED')),
  epoch INTEGER NOT NULL DEFAULT 0,
  credential_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_principals_tenant ON principals (tenant_id);

ALTER TABLE principals ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_principals ON principals
  USING (tenant_id = current_setting('app.current_tenant', true));

-- =====================================================================
-- 2. Authority Grants (Regency)
-- =====================================================================

CREATE TABLE IF NOT EXISTS authority_grants (
  authority_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  principal_id TEXT NOT NULL REFERENCES principals(principal_id) ON DELETE CASCADE,
  staxion_id TEXT,
  provider TEXT NOT NULL,
  actions TEXT[] NOT NULL,
  resource TEXT NOT NULL,
  constraints JSONB NOT NULL DEFAULT '{}',
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  policy_version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
  version INTEGER NOT NULL DEFAULT 1,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_grants_tenant ON authority_grants (tenant_id);
CREATE INDEX IF NOT EXISTS idx_grants_principal ON authority_grants (principal_id);

ALTER TABLE authority_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_grants ON authority_grants
  USING (tenant_id = current_setting('app.current_tenant', true));

-- =====================================================================
-- 3. Tasks and Operations (Coordinator)
-- =====================================================================

CREATE TABLE IF NOT EXISTS tasks (
  task_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  principal_id TEXT NOT NULL REFERENCES principals(principal_id),
  description TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tasks_tenant ON tasks (tenant_id);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_tasks ON tasks
  USING (tenant_id = current_setting('app.current_tenant', true));

CREATE TABLE IF NOT EXISTS operations (
  operation_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  staxion_id TEXT NOT NULL,
  principal_id TEXT NOT NULL REFERENCES principals(principal_id),
  principal_epoch INTEGER NOT NULL,
  task_id TEXT NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
  execution_id TEXT,
  provider TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  params_digest TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  natural_key TEXT,
  authority_id TEXT REFERENCES authority_grants(authority_id),
  grant_version INTEGER,
  decision_id TEXT,
  state TEXT NOT NULL CHECK (state IN ('REQUESTED', 'PLANNED', 'AWAITING_APPROVAL', 'AUTHORIZED', 'DENIED', 'DISPATCHED', 'EXECUTING', 'COMMITTED', 'FAILED', 'UNCERTAIN', 'RECONCILING', 'COMPENSATED', 'EXPIRED', 'CANCELLED')),
  deadline TIMESTAMPTZ NOT NULL,
  attempt INTEGER NOT NULL DEFAULT 0,
  consequential BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, provider, idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_ops_tenant ON operations (tenant_id);
CREATE INDEX IF NOT EXISTS idx_ops_task ON operations (task_id);

ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ops ON operations
  USING (tenant_id = current_setting('app.current_tenant', true));

CREATE TABLE IF NOT EXISTS receipts (
  receipt_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  operation_id TEXT NOT NULL REFERENCES operations(operation_id) ON DELETE CASCADE,
  outcome TEXT NOT NULL CHECK (outcome IN ('COMMITTED', 'FAILED', 'UNCERTAIN')),
  provider_request_id TEXT,
  provider_object_ref TEXT,
  observed_via TEXT NOT NULL CHECK (observed_via IN ('response', 'reconcile_readback')),
  at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_receipts_tenant ON receipts (tenant_id);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_receipts ON receipts
  USING (tenant_id = current_setting('app.current_tenant', true));

-- =====================================================================
-- 4. Evidence (Append-only Hash Chain)
-- =====================================================================

CREATE TABLE IF NOT EXISTS evidence_events (
  event_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('DECISION', 'EFFECT', 'RECEIPT', 'APPROVAL', 'REVOCATION', 'RECOVERY', 'ALERT', 'EGRESS_DENIED')),
  subject_principal_id TEXT,
  subject_operation_id TEXT,
  subject_authority_id TEXT,
  body_digest TEXT NOT NULL,
  prev_hash TEXT NOT NULL,
  hash TEXT NOT NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, seq)
);
CREATE INDEX IF NOT EXISTS idx_evidence_tenant_seq ON evidence_events (tenant_id, seq);

ALTER TABLE evidence_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_evidence ON evidence_events
  USING (tenant_id = current_setting('app.current_tenant', true));

-- =====================================================================
-- 5. Transactional Outbox
-- =====================================================================

CREATE TABLE IF NOT EXISTS transactional_outbox (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  payload JSONB NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_outbox_unpublished ON transactional_outbox (published, created_at);

ALTER TABLE transactional_outbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_outbox ON transactional_outbox
  USING (tenant_id = current_setting('app.current_tenant', true));
