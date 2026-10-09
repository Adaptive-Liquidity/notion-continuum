import type pg from 'pg';
import { tx, canonical, bindingDigest, append, eventOutbox } from './db.js';
import type { VerifiedIdentity } from './identity-provider.js';
import { reserveResources } from './resource-controls.js';
import {
  enrolled,
  samePrincipal,
  identifier,
  activeControl,
} from './service-auth.js';
export interface TaskInput {
  id: string;
  principal: string;
  objective: string;
  deadline: string;
}
export interface OperationInput {
  id: string;
  task: string;
  grant: string;
  provider: string;
  action: string;
  resource: string;
  params: unknown;
  cost: number;
  deadline: string;
}
export class ProductService {
  constructor(
    private db: pg.Pool,
    private fence: string,
  ) {}
  private unit<T>(
    c: pg.PoolClient | undefined,
    fn: (c: pg.PoolClient) => Promise<T>,
  ) {
    return c ? fn(c) : tx(this.db, fn);
  }
  async createTask(
    actor: VerifiedIdentity,
    x: TaskInput,
    client?: pg.PoolClient,
  ) {
    return this.unit(client, async (c) => {
      await activeControl(c, this.fence);
      const i = await enrolled(c, actor);
      samePrincipal(i, x.principal);
      identifier(x.id);
      identifier(x.principal);
      const p = (
        await c.query(
          'SELECT * FROM ct.principals WHERE tenant=$1 AND id=$2 FOR UPDATE',
          [i.tenant, x.principal],
        )
      ).rows[0];
      const now = +(await c.query('SELECT clock_timestamp() t')).rows[0].t;
      const deadline = new Date(x.deadline);
      if (
        !p?.active ||
        typeof x.objective !== 'string' ||
        !x.objective.trim() ||
        x.objective.length > 8000 ||
        !Number.isFinite(+deadline) ||
        +deadline <= now ||
        +deadline > now + 172800000 ||
        actor.expires <= now
      )
        throw Error('invalid task');
      const old = (
        await c.query('SELECT * FROM ct.tasks WHERE tenant=$1 AND id=$2', [
          i.tenant,
          x.id,
        ])
      ).rows[0];
      if (old) {
        if (
          old.principal !== x.principal ||
          old.objective !== x.objective ||
          +old.deadline !== +deadline
        )
          throw Error('task identity conflict');
        return { id: old.id, reused: true };
      }
      await reserveResources(c, i.tenant, 'task', x.id, p.id, {
        units: 1,
        jobs: 1,
        bytes: 0,
      });
      await c.query(
        'INSERT INTO ct.tasks(tenant,id,principal,objective,deadline,created_by) VALUES($1,$2,$3,$4,$5,$6)',
        [i.tenant, x.id, x.principal, x.objective, deadline, i.id],
      );
      await append(c, i.tenant, 'TASK_CREATED', {
        task: x.id,
        principal: x.principal,
        identity: i.id,
        deadline: deadline.toISOString(),
      });
      return { id: x.id, reused: false };
    });
  }
  async propose(actor: VerifiedIdentity, x: OperationInput) {
    return tx(this.db, async (c) => {
      await activeControl(c, this.fence);
      const i = await enrolled(c, actor);
      identifier(x.id);
      identifier(x.task);
      identifier(x.grant);
      const initial = (
        await c.query('SELECT * FROM ct.tasks WHERE tenant=$1 AND id=$2', [
          i.tenant,
          x.task,
        ])
      ).rows[0];
      if (!initial) throw Error('task scope');
      samePrincipal(i, initial.principal);
      const p = (
        await c.query(
          'SELECT * FROM ct.principals WHERE tenant=$1 AND id=$2 FOR UPDATE',
          [i.tenant, initial.principal],
        )
      ).rows[0];
      const t = (
        await c.query(
          'SELECT * FROM ct.tasks WHERE tenant=$1 AND id=$2 FOR UPDATE',
          [i.tenant, x.task],
        )
      ).rows[0];
      const g = (
        await c.query(
          'SELECT * FROM ct.grants WHERE tenant=$1 AND id=$2 FOR UPDATE',
          [i.tenant, x.grant],
        )
      ).rows[0];
      if (
        (
          await c.query(
            "SELECT 1 FROM ct.task_operations m JOIN ct.operations o ON o.tenant=m.tenant AND o.id=m.operation WHERE m.tenant=$1 AND m.task=$2 AND o.state='UNKNOWN'",
            [i.tenant, t.id],
          )
        ).rowCount
      )
        throw Error(
          'task blocked on unresolved effect; no substitute operation',
        );
      const now = +(await c.query('SELECT clock_timestamp() t')).rows[0].t,
        deadline = new Date(x.deadline);
      if (
        !p?.active ||
        t.status !== 'PLANNED' ||
        !g ||
        g.revoked ||
        g.principal !== p.id ||
        g.action !== x.action ||
        g.resource !== x.resource ||
        +g.expires <= now ||
        !Number.isSafeInteger(x.cost) ||
        x.cost < 0 ||
        x.cost > Number(g.max_cost) ||
        !Number.isFinite(+deadline) ||
        +deadline <= now ||
        +deadline > Math.min(+g.expires, +t.deadline) ||
        actor.expires <= now ||
        !['fixture', 'github-readonly'].includes(x.provider) ||
        Buffer.byteLength(canonical(x.params)) > 16384
      )
        throw Error('proposal outside current grant/task');
      const o = {
        tenant: i.tenant,
        id: x.id,
        principal: p.id,
        grant_id: g.id,
        epoch: p.epoch,
        generation: p.generation,
        fence: this.fence,
        grant_version: g.version,
        task_id: t.id,
        plan_version: t.plan_version,
        provider: x.provider,
        action: x.action,
        resource: x.resource,
        params: x.params,
        idempotency_key: x.id,
        cost: x.cost,
        deadline,
      };
      const digest = bindingDigest(o);
      const old = (
        await c.query('SELECT * FROM ct.operations WHERE tenant=$1 AND id=$2', [
          i.tenant,
          x.id,
        ])
      ).rows[0];
      if (old) {
        if (old.digest !== digest) throw Error('operation identity conflict');
        return { id: old.id, digest, reused: true, state: old.state };
      }
      await c.query(
        'INSERT INTO ct.operations(tenant,id,principal,grant_id,epoch,generation,fence,grant_version,task_id,plan_version,provider,action,resource,params,digest,idempotency_key,cost,deadline) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)',
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
          digest,
          o.idempotency_key,
          o.cost,
          o.deadline,
        ],
      );
      await c.query('INSERT INTO ct.task_operations VALUES($1,$2,$3)', [
        i.tenant,
        t.id,
        o.id,
      ]);
      await eventOutbox(c, o, 'OPERATION_PROPOSED', {
        id: o.id,
        task: t.id,
        digest,
        identity: i.id,
        requiresIndependentApproval: true,
      });
      return { id: o.id, digest, state: 'REQUESTED', reused: false };
    });
  }
  async status(actor: VerifiedIdentity, task: string) {
    return tx(this.db, async (c) => {
      const i = await enrolled(c, actor),
        t = (
          await c.query('SELECT * FROM ct.tasks WHERE tenant=$1 AND id=$2', [
            i.tenant,
            identifier(task),
          ])
        ).rows[0];
      if (!t) throw Error('task scope');
      samePrincipal(i, t.principal);
      const operations = (
        await c.query(
          'SELECT o.id,o.digest,o.provider,o.action,o.resource,o.params,o.cost,o.deadline,o.state,o.version,a.expires AS approval_expires FROM ct.task_operations m JOIN ct.operations o ON o.tenant=m.tenant AND o.id=m.operation LEFT JOIN ct.approvals a ON a.tenant=o.tenant AND a.operation=o.id AND a.digest=o.digest AND a.grant_version=o.grant_version WHERE m.tenant=$1 AND m.task=$2 ORDER BY o.id',
          [i.tenant, t.id],
        )
      ).rows;
      const states = operations.map((o) => o.state);
      const phase =
        t.status === 'CANCELLED'
          ? 'CANCELLED'
          : states.some((s) =>
                ['UNKNOWN', 'DENIED', 'FAILED_KNOWN_NO_EFFECT'].includes(s),
              )
            ? 'BLOCKED'
            : states.length > 0 && states.every((s) => s === 'COMMITTED')
              ? 'VERIFIED_COMPLETE'
              : operations.some(
                    (o) =>
                      o.state === 'REQUESTED' &&
                      (!o.approval_expires ||
                        +o.approval_expires <= Date.now()),
                  )
                ? 'AWAITING_APPROVAL'
                : states.some((s) => ['RESERVED', 'SENDING'].includes(s))
                  ? 'RUNNING'
                  : 'PLANNED';
      return {
        id: t.id,
        principal: t.principal,
        objective: t.objective,
        revision: Number(t.revision),
        phase,
        operations,
      };
    });
  }
  async list(actor: VerifiedIdentity) {
    return tx(this.db, async (c) => {
      const i = await enrolled(c, actor);
      return (
        await c.query(
          'SELECT id,principal,objective,status,revision FROM ct.tasks WHERE tenant=$1 AND ($2::text IS NULL OR principal=$2) ORDER BY id LIMIT 100',
          [i.tenant, i.kind === 'machine' ? i.principal : null],
        )
      ).rows;
    });
  }
  async cancel(actor: VerifiedIdentity, task: string, revision: number) {
    return tx(this.db, async (c) => {
      await c.query('SELECT * FROM ct.control WHERE singleton FOR SHARE');
      const i = await enrolled(c, actor, true);
      const t = (
        await c.query('SELECT * FROM ct.tasks WHERE tenant=$1 AND id=$2', [
          i.tenant,
          identifier(task),
        ])
      ).rows[0];
      if (!t) throw Error('task scope');
      await c.query(
        'SELECT * FROM ct.principals WHERE tenant=$1 AND id=$2 FOR UPDATE',
        [i.tenant, t.principal],
      );
      const changed = await c.query(
        "UPDATE ct.tasks SET status='CANCELLED',revision=revision+1 WHERE tenant=$1 AND id=$2 AND revision=$3 AND status='PLANNED' RETURNING revision",
        [i.tenant, t.id, revision],
      );
      if (!changed.rowCount) throw Error('task CAS conflict');
      await append(c, i.tenant, 'TASK_CANCELLED', {
        task: t.id,
        ownerIdentity: i.id,
        alreadyInFlightMayFinish: true,
      });
      return {
        id: t.id,
        revision: Number(changed.rows[0].revision),
        status: 'CANCELLED',
      };
    });
  }
  async disableMachine(actor: VerifiedIdentity, id: string) {
    return tx(this.db, async (c) => {
      await c.query('SELECT * FROM ct.control WHERE singleton FOR SHARE');
      const i = await enrolled(c, actor, true);
      const r = await c.query(
        "UPDATE ct.identities SET active=false,version=version+1 WHERE tenant=$1 AND id=$2 AND kind='machine' AND active RETURNING id,version",
        [i.tenant, identifier(id)],
      );
      if (!r.rowCount) throw Error('machine scope');
      await append(c, i.tenant, 'MACHINE_DISABLED', {
        identity: id,
        version: Number(r.rows[0].version),
        ownerIdentity: i.id,
      });
      return { id, disabled: true };
    });
  }
}
