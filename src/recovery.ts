import type pg from 'pg';
import { randomUUID } from 'node:crypto';
import {
  tx,
  canonical,
  sha,
  append,
  eventOutbox,
  bindingDigest,
} from './db.js';
import {
  rowFromBinding,
  verifyOperationArchive,
  type OperationArchive,
} from './evidence-export.js';
import { enrolled, identifier } from './service-auth.js';
import type { VerifiedIdentity } from './identity-provider.js';
import type { FenceStore } from './fence-store.js';
import type { ProviderObservation } from './provider-adapter.js';
export interface ReadOnlyVerifier {
  supports(o: Record<string, any>): boolean;
  lookup(o: Record<string, any>): Promise<ProviderObservation[]>;
}
export interface AuthorityRevocation {
  tenant: string;
  grant?: string;
  identity?: string;
  version: number;
}
export interface RecoveryPolicy {
  authorizeOperator(actor: VerifiedIdentity): Promise<void>;
  readAuthorityJournal(): Promise<{
    records: AuthorityRevocation[];
    digest: string;
  }>;
  verifyActivationApproval(
    reference: string,
    manifestDigest: string,
  ): Promise<void>;
  readOperationInventory(): Promise<{
    reference: string;
    operations: OperationArchive[];
    digest: string;
    complete: boolean;
  }>;
}
export class RecoveryService {
  constructor(
    private db: pg.Pool,
    private store: FenceStore,
    private verifier: ReadOnlyVerifier,
    private policy: RecoveryPolicy,
  ) {}
  async begin(actor: VerifiedIdentity) {
    await this.policy.authorizeOperator(actor);
    const i = await tx(this.db, (c) => enrolled(c, actor, true));
    const journal = await this.policy.readAuthorityJournal();
    if (sha(canonical(journal.records)) !== journal.digest)
      throw Error('authority journal corrupt');
    const previous = await this.store.read(),
      next = await this.store.advance(previous.revision, journal.digest),
      id = randomUUID();
    return tx(this.db, async (c) => {
      await c.query('SELECT * FROM ct.control WHERE singleton FOR UPDATE');
      await enrolled(c, actor, true);
      await c.query(
        'INSERT INTO ct.control(singleton,blocked,fence) VALUES(true,true,$1) ON CONFLICT(singleton) DO UPDATE SET blocked=true,fence=EXCLUDED.fence',
        [next.fence],
      );
      const tenants = (await c.query('SELECT id FROM ct.tenants ORDER BY id'))
        .rows;
      for (const t of tenants) {
        await c.query(
          "INSERT INTO ct.recovery_runs(tenant,id,old_fence,new_fence,external_revision,state,authority_digest,started_by) VALUES($1,$2,$3,$4,$5,'BLOCKED',$6,$7)",
          [
            t.id,
            id,
            previous.fence,
            next.fence,
            next.revision,
            journal.digest,
            i.id,
          ],
        );
        await append(c, t.id, 'RECOVERY_BLOCKED', {
          run: id,
          newFence: next.fence,
          independentRevision: next.revision,
          scope: 'cluster operator',
        });
      }
      return { id, tenant: i.tenant, fence: next.fence };
    });
  }
  private async locked(c: pg.PoolClient, a: VerifiedIdentity, run: string) {
    const ctrl = (
        await c.query('SELECT * FROM ct.control WHERE singleton FOR UPDATE')
      ).rows[0],
      i = await enrolled(c, a, true),
      r = (
        await c.query(
          'SELECT * FROM ct.recovery_runs WHERE tenant=$1 AND id=$2 FOR UPDATE',
          [i.tenant, run],
        )
      ).rows[0];
    const ext = await this.store.read();
    if (
      !ctrl?.blocked ||
      !r ||
      r.state === 'COMPLETE' ||
      ctrl.fence !== r.new_fence ||
      ext.fence !== r.new_fence ||
      !ext.blocked
    )
      throw Error('recovery fence/scope');
    return { i, r, ctrl, ext };
  }
  async markBackupGap(actor: VerifiedIdentity, run: string) {
    await this.policy.authorizeOperator(actor);
    return tx(this.db, async (c) => {
      const { i } = await this.locked(c, actor, run);
      const rows = (
        await c.query(
          "SELECT o.* FROM ct.operations o JOIN ct.recovery_runs r ON r.tenant=o.tenant AND r.id=$1 WHERE o.state IN('REQUESTED','RESERVED','SENDING') ORDER BY o.tenant,o.id FOR UPDATE OF o",
          [run],
        )
      ).rows;
      for (const o of rows) {
        await c.query(
          "UPDATE ct.operations SET state='UNKNOWN',version=version+1 WHERE tenant=$1 AND id=$2 AND version=$3",
          [o.tenant, o.id, o.version],
        );
        await eventOutbox(c, o, 'RECOVERY_BACKUP_GAP_UNKNOWN', {
          operation: o.id,
          priorState: o.state,
          neverResend: true,
        });
      }
      return rows.length;
    });
  }
  async applyAuthorityJournal(actor: VerifiedIdentity, run: string) {
    await this.policy.authorizeOperator(actor);
    const j = await this.policy.readAuthorityJournal();
    return tx(this.db, async (c) => {
      const { i, r, ext } = await this.locked(c, actor, run);
      if (
        j.digest !== sha(canonical(j.records)) ||
        j.digest !== r.authority_digest ||
        j.digest !== ext.authorityDigest
      )
        throw Error('independent journal changed/corrupt');
      for (const rec of j.records) {
        if (
          !(
            await c.query(
              'SELECT 1 FROM ct.recovery_runs WHERE tenant=$1 AND id=$2',
              [rec.tenant, run],
            )
          ).rowCount
        )
          throw Error('journal tenant outside recovery scope');
        if (
          !Number.isSafeInteger(rec.version) ||
          rec.version < 1 ||
          Boolean(rec.grant) === Boolean(rec.identity)
        )
          throw Error('invalid journal revocation');
        if (rec.grant)
          await c.query(
            'UPDATE ct.grants SET revoked=true,version=GREATEST(version+1,$3) WHERE tenant=$1 AND id=$2',
            [rec.tenant, identifier(rec.grant), rec.version],
          );
        else
          await c.query(
            'UPDATE ct.identities SET active=false,version=GREATEST(version+1,$3) WHERE tenant=$1 AND id=$2',
            [rec.tenant, identifier(rec.identity!), rec.version],
          );
      }
      await c.query(
        'UPDATE ct.recovery_runs SET authority_checked=true WHERE id=$1',
        [run],
      );
      await append(c, i.tenant, 'RECOVERY_AUTHORITY_REAPPLIED', {
        run,
        journalDigest: j.digest,
      });
      return j.records.length;
    });
  }
  async importInventory(actor: VerifiedIdentity, run: string) {
    await this.policy.authorizeOperator(actor);
    const inventory = await this.policy.readOperationInventory();
    if (
      !inventory.complete ||
      !inventory.reference ||
      sha(canonical(inventory.operations)) !== inventory.digest
    )
      throw Error('independent backup-gap inventory incomplete/corrupt');
    for (const o of inventory.operations) verifyOperationArchive(o);
    return tx(this.db, async (c) => {
      const { i } = await this.locked(c, actor, run);
      let imported = 0;
      for (const archive of inventory.operations) {
        const o = rowFromBinding(archive.binding);
        if (
          !(
            await c.query(
              'SELECT 1 FROM ct.recovery_runs WHERE id=$1 AND tenant=$2',
              [run, o.tenant],
            )
          ).rowCount
        )
          throw Error('inventory tenant outside run');
        const existing = (
          await c.query(
            'SELECT digest FROM ct.operations WHERE tenant=$1 AND id=$2',
            [o.tenant, o.id],
          )
        ).rows[0];
        if (existing) {
          if (existing.digest !== archive.digest)
            throw Error('recovered binding conflict');
          continue;
        }
        // Missing authority records are never fabricated or re-enabled to make a restore pass.
        if (
          !(
            await c.query(
              'SELECT 1 FROM ct.principals WHERE tenant=$1 AND id=$2',
              [o.tenant, o.principal],
            )
          ).rowCount ||
          !(
            await c.query('SELECT 1 FROM ct.grants WHERE tenant=$1 AND id=$2', [
              o.tenant,
              o.grant_id,
            ])
          ).rowCount
        )
          throw Error('missing historical authority record; stay blocked');
        await c.query(
          "INSERT INTO ct.operations(tenant,id,principal,grant_id,epoch,generation,fence,grant_version,task_id,plan_version,provider,action,resource,params,digest,idempotency_key,cost,deadline,state) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'UNKNOWN')",
          [
            o.tenant,
            o.id,
            o.principal,
            o.grant_id,
            o.epoch,
            o.generation,
            o.fence,
            o.grant_version,
            o.task_id,
            o.plan_version,
            o.provider,
            o.action,
            o.resource,
            o.params,
            archive.digest,
            o.idempotency_key,
            o.cost,
            o.deadline,
          ],
        );
        const task = (
          await c.query('SELECT * FROM ct.tasks WHERE tenant=$1 AND id=$2', [
            o.tenant,
            o.task_id,
          ])
        ).rows[0];
        if (
          task &&
          task.principal === o.principal &&
          task.plan_version === o.plan_version
        )
          await c.query(
            'INSERT INTO ct.task_operations VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
            [o.tenant, o.task_id, o.id],
          );
        await eventOutbox(
          c,
          { tenant: o.tenant, id: o.id },
          'RECOVERY_MISSING_OPERATION_IMPORTED',
          {
            operation: o.id,
            digest: archive.digest,
            sourceReference: inventory.reference,
            noWriteApprovalRestored: true,
          },
        );
        imported++;
      }
      await c.query(
        'UPDATE ct.recovery_runs SET inventory_checked=true,inventory_digest=$2 WHERE id=$1',
        [run, inventory.digest],
      );
      await append(c, i.tenant, 'RECOVERY_PRIOR_ANCHOR_ATTACHED', {
        run,
        reference: inventory.reference,
        digest: inventory.digest,
        restoredHistoryIsExplicitBranch: true,
      });
      return imported;
    });
  }
  async observe(actor: VerifiedIdentity, run: string, id: string) {
    await this.policy.authorizeOperator(actor);
    const o = await tx(this.db, async (c) => {
      const { i } = await this.locked(c, actor, run);
      return (
        await c.query('SELECT * FROM ct.operations WHERE tenant=$1 AND id=$2', [
          i.tenant,
          identifier(id),
        ])
      ).rows[0];
    });
    if (!o || o.digest !== bindingDigest(o) || !this.verifier.supports(o))
      throw Error('recovery read-only contract');
    let observations: ProviderObservation[] = [];
    try {
      observations = await this.verifier.lookup(o);
    } catch {
      /* UNKNOWN remains honest */
    }
    const match =
      observations.length === 1 &&
      observations[0].tenant === o.tenant &&
      observations[0].operation === o.id &&
      observations[0].digest === o.digest &&
      observations[0].idempotency_key === o.idempotency_key &&
      canonical(observations[0].payload) === canonical(o.params);
    return tx(this.db, async (c) => {
      const { i } = await this.locked(c, actor, run);
      const row = (
        await c.query(
          'SELECT * FROM ct.operations WHERE tenant=$1 AND id=$2 FOR UPDATE',
          [i.tenant, id],
        )
      ).rows[0];
      if (row.state === 'COMMITTED') return row;
      if (row.state !== 'UNKNOWN')
        throw Error('classify backup gap before observation');
      if (match) {
        await c.query(
          "UPDATE ct.operations SET state='COMMITTED',version=version+1,observation=$3 WHERE tenant=$1 AND id=$2 AND version=$4",
          [i.tenant, id, observations[0], row.version],
        );
        await eventOutbox(c, row, 'RECOVERY_VERIFIED', {
          operation: id,
          run,
          verification: 'independent provider read-back',
        });
        return { ...row, state: 'COMMITTED' };
      }
      await append(c, i.tenant, 'RECOVERY_OBSERVATION_UNRESOLVED', {
        run,
        operation: id,
        observations: observations.length,
      });
      return row;
    });
  }
  async manifest(actor: VerifiedIdentity, run: string) {
    await this.policy.authorizeOperator(actor);
    return tx(this.db, async (c) => {
      const { i, r } = await this.locked(c, actor, run);
      const ops = (
        await c.query(
          'SELECT o.tenant,o.id,o.digest,o.state FROM ct.operations o JOIN ct.recovery_runs r ON r.tenant=o.tenant AND r.id=$1 ORDER BY o.tenant,o.id',
          [run],
        )
      ).rows;
      return {
        scope: 'cluster',
        run,
        fence: r.new_fence,
        authorityDigest: r.authority_digest,
        inventoryDigest: r.inventory_digest,
        operations: ops,
      };
    });
  }
  async activate(
    actor: VerifiedIdentity,
    run: string,
    approvalReference: string,
  ) {
    await this.policy.authorizeOperator(actor);
    const m = await this.manifest(actor, run),
      digest = sha(canonical(m));
    await this.policy.verifyActivationApproval(approvalReference, digest);
    const r = await tx(this.db, async (c) => {
      const { i, r, ext } = await this.locked(c, actor, run);
      const currentOps = (
        await c.query(
          'SELECT o.tenant,o.id,o.digest,o.state FROM ct.operations o JOIN ct.recovery_runs r ON r.tenant=o.tenant AND r.id=$1 ORDER BY o.tenant,o.id',
          [run],
        )
      ).rows;
      if (
        !r.inventory_checked ||
        !r.inventory_digest ||
        (
          await c.query(
            'SELECT 1 FROM ct.recovery_runs WHERE id=$1 AND NOT authority_checked',
            [run],
          )
        ).rowCount ||
        sha(canonical({ ...m, operations: currentOps })) !== digest ||
        currentOps.some((o) =>
          ['UNKNOWN', 'REQUESTED', 'RESERVED', 'SENDING'].includes(o.state),
        )
      )
        throw Error('unresolved recovery inventory/authority');
      await c.query(
        'UPDATE ct.principals SET epoch=epoch+1 WHERE tenant IN(SELECT tenant FROM ct.recovery_runs WHERE id=$1)',
        [run],
      );
      await c.query(
        "UPDATE ct.recovery_runs SET inventory_checked=true,state='COMPLETE' WHERE id=$1",
        [run],
      );
      await c.query('UPDATE ct.control SET blocked=false WHERE singleton');
      await append(c, i.tenant, 'RECOVERY_ACTIVATION_REVIEWED', {
        run,
        manifestDigest: digest,
        approvalReference,
      });
      return ext;
    });
    // External store is the LAST activation step. Failure leaves it closed even if the DB committed.
    await this.store.activate(r.revision, digest);
    return { run, fence: r.fence, manifestDigest: digest };
  }
}
