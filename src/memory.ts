import type pg from "pg";
import { sha } from "./db.js";
// Memory cannot supply policy/authority; this returns data only through a tenant-reader role.
export async function readContext(
  db: pg.Pool,
  id: string,
  expectedVersion: number,
) {
  const o = (await db.query("SELECT * FROM ct.context_items WHERE id=$1", [id]))
    .rows[0];
  if (
    !o ||
    o.quarantined ||
    o.version !== expectedVersion ||
    sha(o.payload) !== o.digest
  )
    throw Error("context missing/stale/corrupt");
  return { id: o.id, version: o.version, payload: o.payload, digest: o.digest };
}
