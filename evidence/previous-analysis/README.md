# Continuum validation evidence — local experiments, not production code

Contains pinned source snapshots, reproduced evidence, defect regression tests,
and a common experimental effect controller tested with Temporal and pg-boss.
The provider oracle is a local PostgreSQL table in a separate committed transaction.
No real provider, model, Runloop machine, billing operation or production system is used.

## Tested environment
- PostgreSQL 15.18, fsync=on, synchronous_commit=on, local loopback only.
- Python 3.13; psycopg 3.3.6; temporalio 1.34.0.
- Node 24.14.1; pg-boss 12.37.1; pg 8.23.1; TypeScript 5.9.3.
- Original Continuum and continuum2 pins: see SOURCE-INVENTORY.json.

## Important limits
- Existing proof: clean, same-host process restart; local SQLite effect, not a crash.
- Original-code Python/TypeScript regressions use deterministic local doubles.
- SQL regressions execute original continuum2 SQL on real local PostgreSQL.
- Paired schedulers use actual retry machinery and SIGKILL of a boundary subprocess.
  They do not kill the entire scheduler service/host or test real provider consistency.
- The reference controller deliberately omits production-grade authorization,
  network containment, full state transitions, approvals and multi-region recovery.
  NEVER deploy it as the target architecture.
- Initial fixture-failure logs are retained. UTF8 and bind-time checks were corrected;
  original product source was not modified.
- Do not summarize defect reproductions as proof that product safety tests passed.

## Reproduce (disposable local database ONLY)
1. Start a throwaway PostgreSQL 15.18 on 127.0.0.1:55432 with user localtest,
   database postgres and uuid-ossp support. Keep trust authentication loopback-only.
   No production DSN is accepted/configured by these examples.
2. In a virtual environment: pip install 'psycopg[binary]==3.3.6' temporalio==1.34.0.
3. cd tests/node && npm ci --ignore-scripts --no-audit --no-fund && cd ../..
4. cd sources/Continuum && make reproduce-p00 && cd ../..
5. python tests/current_code_regressions.py
6. python tests/postgres_source_regressions.py
7. cd tests/node && node prototype-regressions.cjs && cd ../..
8. Set PYTHONPATH to include the tests/ directory; invoke initialize() from
   effect_reference.py. Run python tests/temporal_probe.py, then
   (cd tests/node && node pgboss-probe.cjs). Fresh schemas are required between reruns.
   Temporal downloads and starts a local development server; no cloud subscription.
9. Inspect tests/results/*.json and *.log; stop all disposable services afterward.

The evidence supports separation of orchestration from effect safety.
It does not establish production readiness, cost, scale, regional failover or a
Temporal-vs-pg-boss winner. The report defines the remaining decisive tests.
