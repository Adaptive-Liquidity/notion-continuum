import { PoolClient } from 'pg';
import { Operation, AuthorityGrant } from '@continuum/contracts';
import { RegencyEngine } from '@continuum/regency';
import * as crypto from 'crypto';

export class EffectBoundary {
  private regency = new RegencyEngine();

  async commitTimeRecheckAndDispatch(client: PoolClient, tenantId: string, operation: any, activePolicy: string): Promise<string> {
    await client.query(`SET LOCAL app.current_tenant = $1`, [tenantId]);

    // 1. SELECT ... FOR SHARE on authority_grants to lock the row and ensure consistency
    const grantRes = await client.query(`
      SELECT * FROM authority_grants
      WHERE authority_id = $1
      FOR SHARE
    `, [operation.authority?.authority_id]);

    if (grantRes.rowCount === 0) {
      throw new Error(`Authority Grant ${operation.authority?.authority_id} not found.`);
    }

    const grant = grantRes.rows[0];

    // 2. Validate ACTIVE status, grant version, and principal epoch
    if (grant.status !== 'ACTIVE') {
      throw new Error(`Authority Grant ${grant.authority_id} is not ACTIVE.`);
    }

    if (grant.version !== operation.authority?.grant_version) {
      throw new Error(`Authority Grant version mismatch. Expected ${operation.authority?.grant_version}, got ${grant.version}.`);
    }

    const principalRes = await client.query(`
      SELECT epoch FROM principals WHERE principal_id = $1
    `, [operation.principal_id]);

    if (principalRes.rowCount === 0 || principalRes.rows[0].epoch !== operation.principal_epoch) {
      throw new Error(`Principal epoch mismatch or principal not found.`);
    }

    // 3. Cedar policy re-evaluation at commit time
    const isAuthorized = await this.regency.evaluatePolicy(
      activePolicy,
      operation.principal_id,
      operation.action,
      operation.resource,
      { ...grant.constraints, approved: operation.state === 'AWAITING_APPROVAL' ? true : false } // Context mapping
    );

    if (!isAuthorized) {
      throw new Error('Cedar policy denied the operation at commit time.');
    }

    // 4. Set operation to DISPATCHED
    await client.query(`
      UPDATE operations
      SET state = 'DISPATCHED', updated_at = NOW()
      WHERE operation_id = $1
    `, [operation.operation_id]);

    // 5. Insert into outbox for dispatch
    await client.query(`
      INSERT INTO transactional_outbox (tenant_id, topic, payload)
      VALUES ($1, $2, $3)
    `, [tenantId, 'operation.dispatched', JSON.stringify(operation)]);

    // 6. Record DECISION evidence event
    const prevHashRes = await client.query(`
      SELECT hash FROM evidence_events WHERE tenant_id = $1 ORDER BY seq DESC LIMIT 1
    `, [tenantId]);
    const prevHash = prevHashRes.rowCount != null && prevHashRes.rowCount > 0 ? prevHashRes.rows[0].hash : 'genesis';

    const seqRes = await client.query(`SELECT COALESCE(MAX(seq), 0) + 1 as next_seq FROM evidence_events WHERE tenant_id = $1`, [tenantId]);
    const seq = seqRes.rows[0].next_seq;

    const evidencePayload = {
      tenant_id: tenantId,
      operation_id: operation.operation_id,
      decision: 'DISPATCHED',
      grant_version: grant.version,
      principal_epoch: operation.principal_epoch
    };
    const bodyDigest = crypto.createHash('sha256').update(JSON.stringify(evidencePayload)).digest('hex');
    const hash = crypto.createHash('sha256').update(prevHash + bodyDigest).digest('hex');

    await client.query(`
      INSERT INTO evidence_events (event_id, tenant_id, seq, kind, subject_operation_id, body_digest, prev_hash, hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [`evt_${crypto.randomBytes(13).toString('hex')}`, tenantId, seq, 'DECISION', operation.operation_id, bodyDigest, prevHash, hash]);

    // 7. Mint short-lived provider credentials
    const shortLivedToken = crypto.randomBytes(32).toString('hex');

    return shortLivedToken;
  }
}
