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
function placementParts(o: Record<string, any>) {
  const computerId = o.computer_id ?? o.computerId;
  const placement = o.placement_generation ?? o.placementGeneration;
  return {
    computerId,
    placement,
    hasComputer: computerId !== undefined && computerId !== null,
    hasPlacement: placement !== undefined && placement !== null,
  };
}
export function contractVersionOf(o: Record<string, any>): 1 | 2 {
  const fields = placementParts(o);
  const explicit =
    o.contract_version !== undefined && o.contract_version !== null
      ? Number(o.contract_version)
      : o.contractVersion !== undefined && o.contractVersion !== null
        ? Number(o.contractVersion)
        : undefined;
  if (explicit === undefined) {
    if (!fields.hasComputer && !fields.hasPlacement) return 1;
    if (fields.hasComputer && fields.hasPlacement) return 2;
    throw Error('invalid contract binding');
  }
  if (explicit !== 1 && explicit !== 2) throw Error('invalid contract version');
  if (explicit === 1 && (fields.hasComputer || fields.hasPlacement))
    throw Error('invalid contract binding');
  if (explicit === 2 && (!fields.hasComputer || !fields.hasPlacement))
    throw Error('invalid contract binding');
  if (explicit === 2) {
    const generation = Number(fields.placement);
    if (
      typeof fields.computerId !== 'string' ||
      !fields.computerId ||
      !Number.isSafeInteger(generation) ||
      generation < 1
    )
      throw Error('invalid contract binding');
  }
  return explicit;
}
export function actionBinding(o: Record<string, any>) {
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
    contractVersion: 1 as 1 | 2,
  };
  if (version === 1) return binding;
  const fields = placementParts(o);
  return {
    ...binding,
    contractVersion: 2 as const,
    computerId: fields.computerId,
    placementGeneration: Number(fields.placement),
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
  const version = contractVersionOf(operation);
  if (!computer) {
    if (version !== 1 || claim !== undefined) return 'PLACEMENT_FENCE';
    return null;
  }
  if (version !== 2) return 'LEGACY_BINDING';
  const fields = placementParts(operation);
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
export const bindingDigest = (o: Record<string, any>) =>
  sha(canonical(actionBinding(o)));
