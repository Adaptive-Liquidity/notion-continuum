import type pg from 'pg';

export async function lockContextHead(
  c: pg.PoolClient,
  tenant: string,
  id: string,
  lockOwner = true,
) {
  const peek = (
    await c.query(
      'SELECT principal FROM ct.context_heads WHERE tenant=$1 AND id=$2',
      [tenant, id],
    )
  ).rows[0];
  if (!peek) return null;
  if (lockOwner && peek.principal) {
    const principal = (
      await c.query(
        'SELECT id FROM ct.principals WHERE tenant=$1 AND id=$2 FOR UPDATE',
        [tenant, peek.principal],
      )
    ).rows[0];
    if (!principal) throw Error('context principal changed');
  }
  const head = (
    await c.query(
      'SELECT * FROM ct.context_heads WHERE tenant=$1 AND id=$2 FOR UPDATE',
      [tenant, id],
    )
  ).rows[0];
  if (!head || (head.principal ?? null) !== (peek.principal ?? null))
    throw Error('context principal changed');
  return head;
}

export async function lockBoundManifest(
  c: pg.PoolClient,
  operation: Record<string, any>,
) {
  const head = operation.context_id
    ? await lockContextHead(c, operation.tenant, operation.context_id, false)
    : null;
  const version =
    operation.context_id && head
      ? ((
          await c.query(
            'SELECT erased_at,expires FROM ct.context_versions WHERE tenant=$1 AND id=$2 AND version=$3',
            [operation.tenant, operation.context_id, operation.context_version],
          )
        ).rows[0] ?? null)
      : null;
  let cognition: number | null = null;
  if (operation.cognition_revision != null) {
    const row = (
      await c.query(
        'SELECT MAX(revision) AS r FROM ct.cognition_bindings WHERE tenant=$1 AND principal=$2',
        [operation.tenant, operation.principal],
      )
    ).rows[0];
    cognition = row?.r == null ? null : Number(row.r);
  }
  return { head, version, cognition };
}
