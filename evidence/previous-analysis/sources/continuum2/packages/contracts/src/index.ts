import { z } from "zod";

const Id = (p: string) => z.string().regex(new RegExp(`^${p}_[0-9A-HJKMNP-TV-Z]{26}$`));
export const Ts = z.string().datetime();

export const Principal = z.object({
  v: z.literal(1),
  principal_id: Id("prn"),
  tenant_id: Id("ten"),
  display_name: z.string(),
  owner_user_id: z.string(), // WorkOS user (accountable human)
  status: z.enum(["ACTIVE", "SUSPENDED", "RETIRED"]),
  epoch: z.number().int().nonnegative(), // bump on suspend/rotate -> fences old creds/ops
  credential_ids: z.array(z.string()), // rotating; identity != credential
  created_at: Ts,
});

export const AuthorityGrant = z.object({
  v: z.literal(1),
  authority_id: Id("grt"),
  tenant_id: Id("ten"),
  principal_id: Id("prn"),
  staxion_id: Id("stx").optional(),
  provider: z.string(), // "github"
  actions: z.array(z.string()), // ["issues.read","branch.create","pull_request.create"]
  resource: z.string(), // "github:repo/acme/widgets"
  constraints: z.record(z.unknown()), // e.g. { branch_prefix: "continuum/", max_ops_per_hour: 20 }
  requires_approval: z.boolean().default(false),
  policy_version: z.string(), // Cedar policy-set hash
  status: z.enum(["ACTIVE", "REVOKED", "EXPIRED"]),
  version: z.number().int(), // bumped on any change -> commit-time fence
  issued_at: Ts,
  expires_at: Ts,
  revoked_at: Ts.optional(),
});

export const OperationState = z.enum([
  "REQUESTED", "PLANNED", "AWAITING_APPROVAL", "AUTHORIZED", "DENIED",
  "DISPATCHED", "EXECUTING", "COMMITTED", "FAILED", "UNCERTAIN",
  "RECONCILING", "COMPENSATED", "EXPIRED", "CANCELLED",
]);

export const Operation = z.object({
  v: z.literal(1),
  operation_id: Id("op"),
  tenant_id: Id("ten"),
  staxion_id: Id("stx"),
  principal_id: Id("prn"),
  principal_epoch: z.number().int(),
  task_id: Id("tsk"),
  execution_id: Id("exe").optional(),
  provider: z.string(),
  action: z.string(),
  resource: z.string(),
  params_digest: z.string(), // sha256 of canonical params (params stored separately)
  idempotency_key: z.string(), // unique per (tenant, provider)
  natural_key: z.string().optional(), // e.g. branch "continuum/op_..." for non-idempotent providers
  authority: z.object({ authority_id: Id("grt"), grant_version: z.number().int(), decision_id: z.string() }).optional(),
  state: OperationState,
  deadline: Ts,
  attempt: z.number().int(),
  consequential: z.boolean(), // crosses VM boundary / provider effect
  created_at: Ts,
  updated_at: Ts,
});

export const Receipt = z.object({ // written by EB only
  v: z.literal(1),
  receipt_id: Id("rcp"),
  tenant_id: Id("ten"),
  operation_id: Id("op"),
  outcome: z.enum(["COMMITTED", "FAILED", "UNCERTAIN"]),
  provider_request_id: z.string().optional(),
  provider_object_ref: z.string().optional(), // e.g. PR URL
  observed_via: z.enum(["response", "reconcile_readback"]),
  at: Ts,
});

export const Checkpoint = z.object({
  v: z.literal(1),
  checkpoint_id: Id("chk"),
  tenant_id: Id("ten"),
  staxion_id: Id("stx"),
  kind: z.enum(["COORDINATOR", "COMPUTER"]), // DB workflow state vs Runloop snapshot / workspace tarball
  task_id: Id("tsk").optional(),
  object_ref: z.string().optional(),
  at: Ts,
});

export const EvidenceEvent = z.object({ // append-only; UNIQUE(tenant_id, seq)
  v: z.literal(1),
  event_id: Id("evt"),
  tenant_id: Id("ten"),
  seq: z.number().int(),
  kind: z.enum(["DECISION", "EFFECT", "RECEIPT", "APPROVAL", "REVOCATION", "RECOVERY", "ALERT", "EGRESS_DENIED"]),
  subject: z.object({ principal_id: Id("prn").optional(), operation_id: Id("op").optional(), authority_id: Id("grt").optional() }),
  body_digest: z.string(),
  prev_hash: z.string(),
  hash: z.string(), // hash = sha256(prev_hash || canonical(event))
  at: Ts,
});

export const EvidenceCheckpoint = z.object({ // signed (KMS Ed25519), externally anchored
  tenant_id: Id("ten"),
  upto_seq: z.number().int(),
  head_hash: z.string(),
  signature: z.string(),
  key_id: z.string(),
  anchor: z.object({ type: z.enum(["rfc3161", "rekor", "object_lock"]), ref: z.string() }).optional(),
});

// Provider contract
export interface Provider {
  prepare(op: z.infer<typeof Operation>): Promise<{ effect: unknown; natural_key?: string }>;
  execute(effect: unknown, cred: { token: string; expires_at: string }): Promise<z.infer<typeof Receipt>>;
  reconcile(op: z.infer<typeof Operation>): Promise<"COMMITTED" | "ABSENT" | "UNDETERMINED">;
  supportsIdempotencyKeys: boolean;
}
