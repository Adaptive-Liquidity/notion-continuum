'use client';
import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import type { ConsoleItem, HumanCommand } from '@continuum/contracts';
import { read, command, type ClientEnvelope } from '@/lib/api';
import {
  ResponseOrder,
  freshLifetime,
  canMutate,
  stableOrder,
  changedRows,
} from '@/lib/client-state';
import { Badge } from './Primitives';
import { ReviewPanel } from './ReviewPanel';
import { CreationForm } from './CreationForms';
const nav = [
  ['work', 'Work'],
  ['projects', 'Projects'],
  ['governance', 'Governance'],
  ['agents', 'Agents / VERA'],
  ['computers', 'Computers'],
  ['approvals', 'Approvals'],
  ['authority', 'Authority'],
  ['context', 'State / Context'],
  ['evidence', 'Evidence'],
  ['recovery', 'Recovery'],
  ['integrations', 'Integrations'],
  ['incidents', 'Incidents'],
  ['notifications', 'Notifications'],
  ['usage', 'Usage / Limits'],
  ['security', 'Security'],
  ['settings', 'Settings'],
  ['setup', 'Onboarding / Setup'],
];
const titles = Object.fromEntries(nav),
  descriptions: Record<string, string> = {
    work: 'Decisions, blockers and results—grounded in durable state.',
    approvals:
      'Review exact actions. Permission, execution and verification stay separate.',
    recovery:
      'Keep uncertainty visible. Observe before deciding; never resend blindly.',
    agents:
      'Persistent accountable principals, independent of models and computers.',
    computers:
      'Logical environments, observed placement and explicit recovery obligations.',
    governance:
      'Mandates, roles and membership. None of these authorize an effect.',
    context: 'Attributable context is data, never permission.',
    evidence:
      'Inspect provenance and integrity without mistaking logs for provider truth.',
  };
export function ConsoleApp({
  section,
  mode,
}: {
  section: string;
  mode: 'LOCAL_FIXTURE' | 'STAGING';
}) {
  const router = useRouter(),
    params = useSearchParams(),
    selected = params.get('selected') ?? '',
    query = params.get('q') ?? '';
  const [view, setView] = useState<'focus' | 'work'>('focus'),
    [draftQ, setDraftQ] = useState(query),
    [data, setData] = useState<ClientEnvelope | null>(null),
    [rows, setRows] = useState<ConsoleItem[]>([]),
    [detail, setDetail] = useState<{
      item: ConsoleItem;
      envelope: ClientEnvelope;
      at: number;
      ttl: number;
    } | null>(null),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [online, setOnline] = useState(true),
    [stale, setStale] = useState(false),
    [newCount, setNewCount] = useState(0),
    [creating, setCreating] = useState<'task' | 'grant' | null>(null),
    [loading, setLoading] = useState(true);
  const order = useRef(new ResponseOrder()),
    detailOrder = useRef(0),
    sessionId = useRef(''),
    received = useRef(0),
    ttl = useRef(0),
    frozen = useRef(false),
    pending = useRef<ConsoleItem[]>([]),
    rowsRef = useRef<ConsoleItem[]>([]),
    identityInvalid = useRef(false);
  const resource = section === 'work' ? view : section;
  const load = useCallback(
    async (cursor?: string) => {
      const ticket = order.current.issue();
      try {
        const next = await read(resource, {
          ...(query ? { q: query } : {}),
          ...(cursor ? { cursor } : {}),
        });
        if (!order.current.accept(ticket, next.projection_version)) return;
        if (sessionId.current && sessionId.current !== next.session?.identity) {
          setDetail(null);
          setRows([]);
          rowsRef.current = [];
          detailOrder.current++;
          setCreating(null);
          setNotice('Account changed. Private cached data cleared.');
        }
        sessionId.current = next.session?.identity ?? '';
        identityInvalid.current = false;
        received.current = performance.now();
        ttl.current = freshLifetime(next.server_time, next.fresh_until);
        setData(next);
        setStale(false);
        setError('');
        pending.current = next.items;
        const count = rowsRef.current.length
          ? changedRows(rowsRef.current, next.items)
          : 0;
        setNewCount(frozen.current ? count : 0);
        const result = stableOrder(rowsRef.current, next.items, frozen.current);
        rowsRef.current = result;
        setRows(result);
        setLoading(false);
      } catch (e) {
        if (!order.current.current(ticket)) return;
        setLoading(false);
        const code = e instanceof Error ? e.message : 'READ_UNAVAILABLE';
        setError(code);
        setStale(true);
        if (code === 'SESSION_EXPIRED') {
          identityInvalid.current = true;
          setRows([]);
          rowsRef.current = [];
          setDetail(null);
          setData(null);
        }
      }
    },
    [resource, query],
  );
  useEffect(() => {
    order.current.invalidate();
    rowsRef.current = [];
    setRows([]);
    setData(null);
    setDetail(null);
    setLoading(true);
    frozen.current = Boolean(selected);
    load();
    const interval = setInterval(() => {
      if (!document.hidden && navigator.onLine) load();
    }, 10000);
    return () => {
      clearInterval(interval);
      order.current.invalidate();
      detailOrder.current++;
    };
  }, [load]);
  useEffect(() => {
    const timer = setInterval(
      () => setStale(performance.now() - received.current >= ttl.current),
      500,
    );
    const connection = () => {
        setOnline(navigator.onLine);
        if (!navigator.onLine) setStale(true);
        else load();
      },
      visible = () => {
        if (document.hidden) setStale(true);
        else {
          order.current.invalidate();
          detailOrder.current++;
          identityInvalid.current = true;
          setDetail(null);
          setRows([]);
          rowsRef.current = [];
          setStale(true);
          load();
        }
      },
      channel = new BroadcastChannel('continuum-session');
    channel.onmessage = () => {
      identityInvalid.current = true;
      order.current.invalidate();
      detailOrder.current++;
      setData(null);
      setRows([]);
      setDetail(null);
      sessionId.current = '';
      setCreating(null);
      setError('SESSION_CHANGED');
      setStale(true);
    };
    window.addEventListener('online', connection);
    window.addEventListener('offline', connection);
    document.addEventListener('visibilitychange', visible);
    return () => {
      clearInterval(timer);
      channel.close();
      window.removeEventListener('online', connection);
      window.removeEventListener('offline', connection);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [load]);
  const inspect = useCallback(async () => {
    if (!selected) return;
    const current = ++detailOrder.current;
    const row = rowsRef.current.find((x) => x.id === selected);
    const target =
      section === 'work'
        ? ((row?.fields.target as string) ??
          (selected.startsWith('task:') ? selected.slice(5) : selected))
        : selected;
    try {
      const next = await read(
        section === 'evidence' && selected.startsWith('operation:')
          ? 'operation'
          : section === 'work'
            ? 'work'
            : section,
        {
          id:
            section === 'evidence' && selected.startsWith('operation:')
              ? selected.slice(10)
              : target,
        },
      );
      if (current !== detailOrder.current || identityInvalid.current) return;
      if (next.session?.identity !== sessionId.current) return;
      const item = next.items[0];
      if (!item) {
        setDetail(null);
        setNotice('Object unavailable in this authorized snapshot.');
        return;
      }
      let lifetime = freshLifetime(next.server_time, next.fresh_until);
      if (typeof item.fields.maximumApprovalExpiry === 'string')
        lifetime = Math.min(
          lifetime,
          Date.parse(item.fields.maximumApprovalExpiry) -
            Date.parse(next.server_time),
        );
      setDetail({
        item,
        envelope: next,
        at: performance.now(),
        ttl: Math.max(0, lifetime),
      });
    } catch {
      if (current === detailOrder.current)
        setNotice('Exact detail unavailable. No action is enabled.');
    }
  }, [selected, section]);
  useEffect(() => {
    frozen.current = Boolean(selected);
    setCreating(null);
    setDetail(null);
    if (selected && data) inspect();
  }, [selected, section, data?.session?.identity, inspect]);
  const allowed =
    Boolean(data) &&
    !error &&
    canMutate(
      data?.features.commands.state === 'available' && !stale,
      received.current,
      ttl.current,
      performance.now(),
      online,
      document.visibilityState === 'hidden',
    ) &&
    !identityInvalid.current;
  const detailAllowed =
    allowed &&
    Boolean(detail) &&
    performance.now() - (detail?.at ?? 0) < (detail?.ttl ?? 0);
  async function issue(value: HumanCommand) {
    if (!allowed || busy) {
      setNotice('Refresh and revalidate current eligibility before acting.');
      return;
    }
    const initiatingIdentity = sessionId.current;
    setBusy(true);
    setNotice(
      'Submitting reviewed human command. No external success is inferred.',
    );
    try {
      const result = await command(value, data!.csrf);
      if (identityInvalid.current || sessionId.current !== initiatingIdentity) {
        setNotice(
          'Account changed. Previous private command response discarded.',
        );
        return;
      }
      if (result.status === 'APPLIED') {
        setNotice(
          value.kind === 'approve'
            ? 'Exact approval recorded. Execution and verification are separate.'
            : value.kind === 'revoke_grant'
              ? 'Grant revoked. Previously admitted effects may still finish.'
              : value.kind === 'create_task'
                ? 'Task recorded. No workflow or external action was started.'
                : value.kind === 'ack_incident'
                  ? 'Incident acknowledged, not resolved.'
                  : value.kind === 'mark_notification_read'
                    ? 'Notification read; incident remains unchanged.'
                    : value.kind === 'assign'
                      ? 'Workload assignment recorded. Issuance, admission and verification remain separate.'
                      : 'Human command durably applied; not external success.',
        );
        if (value.kind === 'export_evidence') {
          const blob = new Blob([JSON.stringify(result.result, null, 2)], {
              type: 'application/json',
            }),
            url = URL.createObjectURL(blob),
            a = document.createElement('a');
          a.href = url;
          a.download = 'continuum-selected-evidence.json';
          a.click();
          URL.revokeObjectURL(url);
        }
        setCreating(null);
        await load();
        await inspect();
      } else {
        setNotice(
          'Command denied: the current binding, version or authority changed. Refresh the exact review.',
        );
        setStale(true);
        setError('STALE_COMMAND');
        setDetail(null);
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'SESSION_EXPIRED') {
        identityInvalid.current = true;
        order.current.invalidate();
        detailOrder.current++;
        setData(null);
        setDetail(null);
        setRows([]);
        rowsRef.current = [];
        setCreating(null);
        setError('SESSION_EXPIRED');
        setNotice(
          'Session expired. Private data cleared; sign in, refresh and explicitly submit again.',
        );
      } else {
        setError('REQUEST_UNCONFIRMED');
        setNotice(
          'Request outcome unconfirmed. Lookup did not establish a result. Do not blindly resubmit.',
        );
      }
      setStale(true);
    } finally {
      setBusy(false);
    }
  }
  function choose(id: string) {
    const q = new URLSearchParams(params);
    q.set('selected', id);
    router.push('/console/' + section + '?' + q, { scroll: false });
    frozen.current = true;
    setCreating(null);
  }
  function back() {
    const q = new URLSearchParams(params);
    q.delete('selected');
    router.push('/console/' + section + '?' + q, { scroll: false });
    frozen.current = false;
    setDetail(null);
    setCreating(null);
  }
  async function logout() {
    if (data)
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'x-ct-csrf': data.csrf },
      });
    new BroadcastChannel('continuum-session').postMessage('changed');
    location.assign('/sign-in');
  }
  const links = nav.map(([id, title]) => (
    <Link
      key={id}
      href={'/console/' + id}
      aria-current={section === id ? 'page' : undefined}
      className={section === id ? 'active' : ''}
    >
      <span className="nav-glyph" aria-hidden>
        {id === 'work'
          ? '◈'
          : id === 'approvals'
            ? '✓'
            : id === 'agents'
              ? '◇'
              : '·'}
      </span>
      {title}
    </Link>
  ));
  return (
    <div className="console">
      <a href="#work-main" className="skip-link">
        Skip to workspace
      </a>
      <aside className="sidebar" aria-label="Main navigation">
        <Link className="brand" href="/console/work">
          <span className="brand-mark" aria-hidden>
            C
          </span>
          <span>
            ASENTXIA<small>CONTINUUM</small>
          </span>
        </Link>
        <p className="nav-heading">OPERATING CONSOLE</p>
        <nav>{links}</nav>
        <div className="sidebar-footer">
          <p className="small">
            One authority home.
            <br />
            No blind retries.
          </p>
          <span className="muted small">Canonical local release candidate</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <details className="mobile-nav">
            <summary>Continuum navigation</summary>
            <nav>{links}</nav>
          </details>
          <span className="workspace-name">
            {data?.session?.tenant
              ? 'Workspace ' + data.session.tenant
              : 'Continuum workspace'}
          </span>
          <div className="topbar-end">
            <span className="mode">
              {mode === 'LOCAL_FIXTURE' ? 'LOCAL TEST' : 'STAGING'}
            </span>
            <button className="quiet" onClick={logout}>
              Sign out
            </button>
          </div>
        </header>
        <div className="release-banner" role="note">
          <span>Production blocked · Scheduler held · Canary no-go</span>
          <Link href="/console/setup">View readiness</Link>
        </div>
        {(error || stale || !online) && (
          <div className="degraded-banner" role="alert">
            {error === 'SESSION_EXPIRED' || error === 'SESSION_CHANGED' ? (
              <>
                Session expired or changed. Private cached data cleared.{' '}
                <Link href="/sign-in">Sign in again</Link>
              </>
            ) : error === 'UNKNOWN_SCHEMA' ? (
              'Update needed: unknown response schema. Controls are unavailable.'
            ) : !online ? (
              'Offline. Displayed data may be stale; commands are unavailable.'
            ) : (
              'Data is stale or unavailable. No all-clear or effect outcome is inferred.'
            )}
            <button onClick={() => load()}>Refresh authorized snapshot</button>
          </div>
        )}
        <main id="work-main" className="main" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                CONTINUUM /{' '}
                {mode === 'LOCAL_FIXTURE' ? 'TEST WORKSPACE' : 'STAGING'}
              </p>
              <h1>{titles[section]}</h1>
              <p className="subtitle">
                {descriptions[section] ??
                  'Authoritative records, explicit availability and contextual detail.'}
              </p>
            </div>
            <div className="heading-actions">
              {(section === 'work' || section === 'authority') && (
                <button
                  className="primary"
                  disabled={!allowed || busy}
                  onClick={() => {
                    setCreating(section === 'work' ? 'task' : 'grant');
                    setDetail(null);
                    frozen.current = true;
                  }}
                >
                  {section === 'work' ? 'New task' : 'New bounded grant'}
                </button>
              )}
            </div>
          </div>
          <div className="toolbar">
            {section === 'work' && (
              <div className="view-switch" aria-label="Work view">
                <button
                  className={view === 'focus' ? 'selected' : ''}
                  onClick={() => setView('focus')}
                >
                  Needs attention
                </button>
                <button
                  className={view === 'work' ? 'selected' : ''}
                  onClick={() => setView('work')}
                >
                  All work
                </button>
              </div>
            )}
            <form
              className="search"
              onSubmit={(e) => {
                e.preventDefault();
                const q = new URLSearchParams();
                if (draftQ) q.set('q', draftQ);
                router.push('/console/' + section + '?' + q);
              }}
            >
              <label className="sr-only" htmlFor="work-search">
                Search authorized {titles[section]}
              </label>
              <input
                id="work-search"
                placeholder="Search authorized records"
                value={draftQ}
                onChange={(e) => setDraftQ(e.target.value)}
                maxLength={128}
              />
              <button type="submit">Search</button>
            </form>
            <button
              onClick={() => {
                frozen.current = false;
                rowsRef.current = pending.current;
                setRows(pending.current);
                setNewCount(0);
                load();
              }}
            >
              Refresh order{newCount ? ' · ' + newCount + ' new' : ''}
            </button>
          </div>
          {newCount > 0 && (
            <p className="arrival-notice" role="status" aria-live="polite">
              {newCount} new attention group{newCount === 1 ? '' : 's'}. Review
              order stays fixed until you refresh it.
            </p>
          )}
          <div
            className={
              'desk-grid ' + (selected || creating ? 'has-detail' : '')
            }
          >
            <section
              className={
                'work-list ' + (selected || creating ? 'mobile-hidden' : '')
              }
              aria-label={titles[section] + ' records'}
            >
              <div className="list-heading">
                <span>
                  {loading
                    ? 'Loading authorized records'
                    : data?.total === null
                      ? 'Count unknown'
                      : `${data?.total ?? 0} ${section === 'work' && view === 'focus' ? 'attention groups' : 'records'}`}
                </span>
                <span className="muted">
                  {data?.completeness === 'partial'
                    ? 'Partial snapshot'
                    : 'Authorized snapshot'}
                </span>
              </div>
              {loading ? (
                <div className="empty" role="status">
                  Loading durable state…
                </div>
              ) : !rows.length ? (
                <div className="empty">
                  {error || stale
                    ? 'Records unavailable. This is not an empty or all-clear result.'
                    : 'No items in this authorized view.'}
                </div>
              ) : (
                <ul className="records">
                  {rows.map((row) => (
                    <li key={row.id}>
                      <button
                        className={
                          'record ' +
                          (selected === row.id ? 'record-selected' : '')
                        }
                        onClick={() => choose(row.id)}
                        aria-label={row.title + ' · ' + row.status}
                      >
                        <div className="record-main">
                          <span className="record-title">{row.title}</span>
                          <span className="record-reason">
                            {String(
                              row.fields.why ??
                                row.subtitle ??
                                (row.kind === 'task'
                                  ? row.fields.accountableVERA
                                  : row.id),
                            )}
                          </span>
                        </div>
                        <div className="record-state">
                          <Badge value={row.status} />
                          {row.kind === 'focus' && (
                            <span className="muted small">
                              {String(row.fields.affectedCount)} affected ·
                              priority {String(row.fields.severity)}
                            </span>
                          )}
                        </div>
                        <span className="row-arrow" aria-hidden>
                          ↗
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {data?.cursor && (
                <div className="list-footer">
                  <button
                    onClick={() => {
                      frozen.current = false;
                      load(data.cursor!);
                    }}
                  >
                    Next authorized page
                  </button>
                  <span className="muted small">
                    Bound to tenant, filters and snapshot version.
                  </span>
                </div>
              )}
              {section === 'evidence' && rows.length > 0 && (
                <div className="list-footer">
                  <button
                    disabled={!allowed || busy}
                    onClick={() =>
                      issue({
                        schema_version: 1,
                        idempotency_key: crypto.randomUUID(),
                        kind: 'export_evidence',
                        target: 'selected-evidence',
                        expected_version: data!.projection_version,
                        input: {
                          sequences: rows.map((x) => x.version),
                          snapshot: data!.projection_version,
                        },
                      })
                    }
                  >
                    Export this authorized page
                  </button>
                  <span className="small muted">
                    Selected-page export, not a complete archive.
                  </span>
                </div>
              )}
            </section>
            <aside
              className={
                'inspector ' + (selected || creating ? 'mobile-detail' : '')
              }
              aria-label="Contextual inspector"
            >
              {selected || creating ? (
                <button className="back-button" onClick={back}>
                  ← Back to {titles[section]}
                </button>
              ) : null}
              {creating ? (
                <CreationForm
                  kind={creating}
                  canAct={allowed}
                  busy={busy}
                  onCommand={issue}
                  onClose={() => {
                    setCreating(null);
                    frozen.current = false;
                  }}
                  serverTime={data?.server_time ?? new Date().toISOString()}
                />
              ) : detail ? (
                <ReviewPanel
                  item={detail.item}
                  canAct={detailAllowed}
                  busy={busy}
                  onCommand={issue}
                  onRefresh={inspect}
                />
              ) : (
                <div className="inspector-empty">
                  <span className="inspector-symbol" aria-hidden>
                    ◇
                  </span>
                  <h2>
                    {selected
                      ? 'Loading exact detail'
                      : 'Details when you need them'}
                  </h2>
                  <p>
                    Choose work, a decision or a durable record. Identity,
                    authority and evidence stay connected without crowding the
                    default view.
                  </p>
                  <p className="muted small">
                    No provider credential or machine-renewal control belongs in
                    this console.
                  </p>
                </div>
              )}
            </aside>
          </div>
          <div className="command-status" role="status" aria-live="polite">
            {notice ||
              'Review durable state. Every enabled command is checked again on the server.'}
          </div>
          <footer className="snapshot-footer">
            <span>
              Source {data?.source_revision ?? 'not observed'} · snapshot{' '}
              {data?.projection_version ?? 'unknown'}
            </span>
            <span>
              {mode === 'LOCAL_FIXTURE'
                ? 'Local evidence is not a live qualification pass.'
                : 'Qualification scope stays independent from UI availability.'}
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
