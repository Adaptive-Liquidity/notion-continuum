import { PoolClient } from 'pg';
import { Principal } from '@continuum/contracts';
import { z } from 'zod';

export class VeraEngine {
  async rotateCredential(client: PoolClient, tenantId: string, principalId: string, newCredentialDigest: string): Promise<void> {
    await client.query(`SET LOCAL app.current_tenant = $1`, [tenantId]);

    // Fence: Update credential and bump epoch
    const res = await client.query(`
      UPDATE principals
      SET
        credential_ids = array_append(credential_ids, $1),
        epoch = epoch + 1
      WHERE principal_id = $2 AND status = 'ACTIVE'
      RETURNING *
    `, [newCredentialDigest, principalId]);

    if (res.rowCount === 0) {
      throw new Error(`Principal ${principalId} not found or not active.`);
    }
  }

  async suspendPrincipal(client: PoolClient, tenantId: string, principalId: string): Promise<void> {
    await client.query(`SET LOCAL app.current_tenant = $1`, [tenantId]);

    // Fence: Update status and bump epoch
    const res = await client.query(`
      UPDATE principals
      SET
        status = 'SUSPENDED',
        epoch = epoch + 1
      WHERE principal_id = $2
      RETURNING *
    `, [principalId]);

    if (res.rowCount === 0) {
      throw new Error(`Principal ${principalId} not found.`);
    }
  }

  async getPrincipal(client: PoolClient, tenantId: string, principalId: string): Promise<z.infer<typeof Principal>> {
    await client.query(`SET LOCAL app.current_tenant = $1`, [tenantId]);

    const res = await client.query(`
      SELECT * FROM principals WHERE principal_id = $1
    `, [principalId]);

    if (res.rowCount === 0) {
      throw new Error(`Principal ${principalId} not found.`);
    }

    const row = res.rows[0];
    return {
      v: 1,
      principal_id: row.principal_id,
      tenant_id: row.tenant_id,
      display_name: row.display_name,
      owner_user_id: row.owner_user_id,
      status: row.status,
      epoch: row.epoch,
      credential_ids: row.credential_ids,
      created_at: row.created_at.toISOString(),
    };
  }
}
