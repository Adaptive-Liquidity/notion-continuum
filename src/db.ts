import pg from 'pg';
import { assertFixtureDatabase } from './runtime-profile.js';
import { createHash, randomUUID } from 'node:crypto';
export const sha = (s: string) => createHash('sha256').update(s).digest('hex');
export function canonical(x: unknown): string {
  if (x === null || typeof x === 'string' || typeof x === 'boolean')
    return JSON.stringify(x);
  if (typeof x === 'number') {
    if (!Number.isFinite(x)) throw Error('invalid JSON number');
    return JSON.stringify(x);
  }
  if (Array.isArray(x)) return '[' + x.map(canonical).join(',') + ']';
  if (x && typeof x === 'object')
    return (
      '{' +
      Object.keys(x)
        .sort()
        .map(
          (k) =>
            JSON.stringify(k) +
            ':' +
            canonical((x as Record<string, unknown>)[k]),
        )
        .join(',') +
      '}'
    );
  throw Error('invalid JSON value');
}
export function pool(
  user: string,
  database = process.env.CT_DATABASE ?? 'ct_test',
) {
  assertFixtureDatabase(database);
  const p = new pg.Pool({
    host: '127.0.0.1',
    port: 55432,
    user,
    database,
    max: 12,
    connectionTimeoutMillis: 2500,
  });
  p.on('error', (e) =>
    console.error('database pool idle error', {
      code: (e as { code?: string }).code ?? 'UNAVAILABLE',
    }),
  );
  return p;
}
export async function tx<T>(
  p: pg.Pool,
  fn: (c: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const c = await p.connect();
  try {
    await c.query('BEGIN');
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    c.release();
  }
}
export async function append(
  c: pg.PoolClient,
  tenant: string,
  kind: string,
  payload: unknown,
) {
  const h = (
    await c.query(
      'SELECT * FROM ct.evidence_heads WHERE tenant=$1 FOR UPDATE',
      [tenant],
    )
  ).rows[0];
  if (!h) throw Error('missing evidence head');
  const seq = Number(h.seq) + 1,
    text = canonical(payload),
    hash = sha(canonical({ tenant, seq, kind, payload: text, prev: h.hash }));
  if (!Number.isSafeInteger(seq)) throw Error('evidence sequence overflow');
  await c.query('INSERT INTO ct.evidence_events VALUES($1,$2,$3,$4,$5,$6)', [
    tenant,
    seq,
    kind,
    text,
    h.hash,
    hash,
  ]);
  await c.query('UPDATE ct.evidence_heads SET seq=$2,hash=$3 WHERE tenant=$1', [
    tenant,
    seq,
    hash,
  ]);
  return { seq, hash };
}
export async function eventOutbox(
  c: pg.PoolClient,
  o: { tenant: string; id: string },
  kind: string,
  payload: unknown,
) {
  await append(c, o.tenant, kind, payload);
  await c.query('INSERT INTO ct.outbox VALUES($1,$2,$3,$4,$5,false)', [
    o.tenant,
    randomUUID(),
    kind,
    o.id,
    payload,
  ]);
}
function present(value: unknown) {
  return value !== undefined && value !== null;
}
function placementParts(o: Record<string, any>) {
  const computerId = o.computer_id ?? o.computerId;
  const placement = o.placement_generation ?? o.placementGeneration;
  return {
    computerId,
    placement,
    hasComputer: present(computerId),
    hasPlacement: present(placement),
  };
}
function manifestParts(o: Record<string, any>) {
  const contextId = o.context_id ?? o.contextId;
  const contextVersion = o.context_version ?? o.contextVersion;
  const cognition = o.cognition_revision ?? o.cognitionRevision;
  return {
    contextId,
    contextVersion,
    cognition,
    hasContext: present(contextId),
    hasContextVersion: present(contextVersion),
    hasCognition: present(cognition),
  };
}
function placementPairValid(fields: ReturnType<typeof placementParts>) {
  const generation = Number(fields.placement);
  return (
    fields.hasComputer &&
    fields.hasPlacement &&
    typeof fields.computerId === 'string' &&
    fields.computerId.length > 0 &&
    Number.isSafeInteger(generation) &&
    generation > 0
  );
}
function manifestValid(fields: ReturnType<typeof manifestParts>) {
  if (fields.hasContext !== fields.hasContextVersion) return false;
  if (fields.hasContext) {
    const version = Number(fields.contextVersion);
    if (
      typeof fields.contextId !== 'string' ||
      !fields.contextId ||
      !Number.isSafeInteger(version) ||
      version < 1
    )
      return false;
  }
  if (fields.hasCognition) {
    const revision = Number(fields.cognition);
    if (!Number.isSafeInteger(revision) || revision < 1) return false;
  }
  return fields.hasContext || fields.hasCognition;
}
export function contractVersionOf(o: Record<string, any>): 1 | 2 | 3 {
  const placement = placementParts(o);
  const manifest = manifestParts(o);
  const explicit =
    o.contract_version !== undefined && o.contract_version !== null
      ? Number(o.contract_version)
      : o.contractVersion !== undefined && o.contractVersion !== null
        ? Number(o.contractVersion)
        : undefined;
  const hasPlacement = placement.hasComputer || placement.hasPlacement;
  const hasManifest =
    manifest.hasContext || manifest.hasContextVersion || manifest.hasCognition;
  if (explicit === undefined) {
    if (!hasPlacement && !hasManifest) return 1;
    if (hasPlacement && !hasManifest && placementPairValid(placement)) return 2;
    if (
      hasManifest &&
      manifestValid(manifest) &&
      (!hasPlacement || placementPairValid(placement))
    )
      return 3;
    throw Error('invalid contract binding');
  }
  if (explicit !== 1 && explicit !== 2 && explicit !== 3)
    throw Error('invalid contract version');
  if (explicit === 1 && (hasPlacement || hasManifest))
    throw Error('invalid contract binding');
  if (explicit === 2 && (!placementPairValid(placement) || hasManifest))
    throw Error('invalid contract binding');
  if (
    explicit === 3 &&
    (!manifestValid(manifest) ||
      (hasPlacement && !placementPairValid(placement)) ||
      (!placement.hasComputer && placement.hasPlacement) ||
      (placement.hasComputer && !placement.hasPlacement))
  )
    throw Error('invalid contract binding');
  return explicit;
}
export interface ActionBinding {
  tenant: string;
  id: string;
  principal: string;
  epoch: number;
  generation: number;
  fence: string;
  grantId: string;
  grantVersion: number;
  taskId: string;
  planVersion: number;
  provider: string;
  action: string;
  resource: string;
  params: unknown;
  idempotencyKey: string;
  cost: number;
  deadline: string;
  contractVersion: 1 | 2 | 3;
  computerId?: string;
  placementGeneration?: number;
  contextId?: string;
  contextVersion?: number;
  cognitionRevision?: number;
}
export function actionBinding(o: Record<string, any>): ActionBinding {
  const version = contractVersionOf(o);
  const binding = {
    tenant: o.tenant,
    id: o.id,
    principal: o.principal,
    epoch: Number(o.epoch),
    generation: Number(o.generation),
    fence: o.fence,
    grantId: o.grant_id,
    grantVersion: Number(o.grant_version),
    taskId: o.task_id,
    planVersion: Number(o.plan_version),
    provider: o.provider,
    action: o.action,
    resource: o.resource,
    params: o.params,
    idempotencyKey: o.idempotency_key,
    cost: Number(o.cost),
    deadline: new Date(o.deadline).toISOString(),
    contractVersion: 1 as 1 | 2 | 3,
  };
  if (version === 1) return binding;
  const placement = placementParts(o);
  if (version === 2)
    return {
      ...binding,
      contractVersion: 2 as const,
      computerId: placement.computerId,
      placementGeneration: Number(placement.placement),
    };
  const manifest = manifestParts(o);
  return {
    ...binding,
    contractVersion: 3 as const,
    ...(placement.hasComputer
      ? {
          computerId: placement.computerId,
          placementGeneration: Number(placement.placement),
        }
      : {}),
    ...(manifest.hasContext
      ? {
          contextId: manifest.contextId,
          contextVersion: Number(manifest.contextVersion),
        }
      : {}),
    ...(manifest.hasCognition
      ? { cognitionRevision: Number(manifest.cognition) }
      : {}),
  };
}
export function placementAdmission(
  computer:
    | { id: string; generation: number | string; state: string }
    | null
    | undefined,
  operation: Record<string, any>,
  claim: number | undefined,
): null | 'LEGACY_BINDING' | 'PLACEMENT_FENCE' {
  const fields = placementParts(operation);
  if (!computer) {
    if (fields.hasComputer || fields.hasPlacement || claim !== undefined)
      return 'PLACEMENT_FENCE';
    return null;
  }
  if (!fields.hasComputer || !fields.hasPlacement) return 'LEGACY_BINDING';
  const generation = Number(computer.generation);
  if (
    fields.computerId !== computer.id ||
    Number(fields.placement) !== generation ||
    computer.state !== 'RUNNING' ||
    claim !== generation
  )
    return 'PLACEMENT_FENCE';
  return null;
}
export function manifestAdmission(
  operation: Record<string, any>,
  head: {
    version: number | string;
    deleted: boolean;
    visibility: string;
    principal: string | null;
    quarantined?: boolean;
  } | null,
  boundVersion: { erased_at: unknown; expires: unknown } | null,
  visibleCognitionRevision: number | null,
  now: number,
): null | 'MANIFEST_UNAVAILABLE' | 'MANIFEST_STALE' | 'MANIFEST_SCOPE' {
  const version = contractVersionOf(operation);
  const manifest = manifestParts(operation);
  if (version !== 3) return null;
  if (manifest.hasContext) {
    if (!head || head.deleted || !boundVersion || boundVersion.erased_at)
      return 'MANIFEST_UNAVAILABLE';
    if (Number(head.version) !== Number(manifest.contextVersion))
      return 'MANIFEST_STALE';
    if (+new Date(boundVersion.expires as string) <= now)
      return 'MANIFEST_UNAVAILABLE';
    const allowed =
      head.visibility === 'TENANT' ||
      (head.visibility === 'PRIVATE' &&
        head.principal != null &&
        head.principal === operation.principal);
    if (!allowed) return 'MANIFEST_SCOPE';
  }
  if (manifest.hasCognition) {
    if (visibleCognitionRevision == null) return 'MANIFEST_UNAVAILABLE';
    if (Number(visibleCognitionRevision) !== Number(manifest.cognition))
      return 'MANIFEST_STALE';
  }
  return null;
}
export const bindingDigest = (o: Record<string, any>) =>
  sha(canonical(actionBinding(o)));
