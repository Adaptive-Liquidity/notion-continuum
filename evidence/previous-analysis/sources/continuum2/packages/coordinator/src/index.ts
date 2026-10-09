import { PoolClient } from 'pg';
import { EffectBoundary } from '@continuum/effect-boundary';

export type TransactionContext<T> = { client: T };
export type WorkflowContext = { invoke: (target: any) => any };

export class CoordinatorEngine {
  private effectBoundary = new EffectBoundary();

  static async startOperation(ctx: TransactionContext<PoolClient>, tenantId: string, operation: any) {
    await ctx.client.query(`SET LOCAL app.current_tenant = $1`, [tenantId]);
    await ctx.client.query(`
      INSERT INTO operations (
        operation_id, tenant_id, staxion_id, principal_id, principal_epoch, task_id, provider, action, resource, params_digest, idempotency_key, state, deadline, consequential
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      operation.operation_id, tenantId, operation.staxion_id, operation.principal_id, operation.principal_epoch, operation.task_id, operation.provider, operation.action, operation.resource, operation.params_digest, operation.idempotency_key, operation.state, operation.deadline, operation.consequential
    ]);
  }

  static async executeOperationWorkflow(ctx: WorkflowContext, tenantId: string, operation: any, activePolicy: string) {
    // Phase 1: DBOS transaction to recheck auth and transition to DISPATCHED
    const providerToken = await ctx.invoke(CoordinatorEngine).commitDispatch(tenantId, operation, activePolicy);

    // Phase 2: Call the provider using the minted token
    return providerToken;
  }

  static async commitDispatch(ctx: TransactionContext<PoolClient>, tenantId: string, operation: any, activePolicy: string) {
     const effectBoundary = new EffectBoundary();
     return await effectBoundary.commitTimeRecheckAndDispatch(ctx.client, tenantId, operation, activePolicy);
  }
}
