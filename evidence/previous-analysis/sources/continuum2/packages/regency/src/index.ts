import { PoolClient } from 'pg';
import { AuthorityGrant } from '@continuum/contracts';
import * as cedar from '@cedar-policy/cedar-wasm';

export class RegencyEngine {
  async evaluatePolicy(policy: string, principal: string, action: string, resource: string, context: Record<string, any> = {}): Promise<boolean> {
    const response = cedar.isAuthorized({
      principal: `User::"${principal}"`,
      action: `Action::"${action}"`,
      resource: `Resource::"${resource}"`,
      context,
      entities: [],
      policies: policy,
    } as any);

    return (response as any).decision === 'Allow';
  }

  async revokeGrant(client: PoolClient, tenantId: string, authorityId: string): Promise<void> {
    await client.query(`SET LOCAL app.current_tenant = $1`, [tenantId]);

    // Fence: Revoke and bump version
    const res = await client.query(`
      UPDATE authority_grants
      SET
        status = 'REVOKED',
        revoked_at = NOW(),
        version = version + 1
      WHERE authority_id = $2 AND status = 'ACTIVE'
      RETURNING *
    `, [authorityId]);

    if (res.rowCount === 0) {
      throw new Error(`Authority Grant ${authorityId} not found or not active.`);
    }
  }
}
