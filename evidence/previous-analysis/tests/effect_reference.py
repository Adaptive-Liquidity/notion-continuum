"""Experimental effect controller shared by both schedulers.
Provider is a LOCAL durable test oracle in a separate committed transaction.
No production endpoints/credentials. This is NOT a production implementation.
"""
import json,os,signal,sys
import psycopg
DSN='host=127.0.0.1 port=55432 dbname=postgres user=localtest'
def connect():return psycopg.connect(DSN, options="-c client_encoding=UTF8")
def initialize():
 with connect() as c:
  c.execute('DROP SCHEMA IF EXISTS effect_probe CASCADE;CREATE SCHEMA effect_probe')
  c.execute('CREATE TABLE effect_probe.operations(id text primary key,scenario text,state text not null default \'READY\',fault_fired boolean not null default false,grant_active boolean not null,epoch_current boolean not null,not_expired boolean not null,attempts int not null default 0)')
  c.execute('CREATE TABLE effect_probe.provider_effects(id bigserial primary key,operation_id text not null)')
  c.execute('CREATE TABLE effect_probe.evidence(id bigserial primary key,operation_id text,kind text)')
def prepare(prefix):
 cases=['normal','duplicate','kill_before_provider','kill_after_provider','kill_after_record','revoked','stale_epoch','expired']
 with connect() as c:
  for scenario in cases:c.execute('INSERT INTO effect_probe.operations(id,scenario,grant_active,epoch_current,not_expired) VALUES(%s,%s,%s,%s,%s)',(prefix+'-'+scenario,scenario,scenario!='revoked',scenario!='stale_epoch',scenario!='expired'))
 return cases
def prepare_unsafe(prefix):
 with connect() as c:c.execute('INSERT INTO effect_probe.operations(id,scenario,grant_active,epoch_current,not_expired) VALUES(%s,%s,true,true,true)',(prefix,'unsafe_after_provider'))
def unsafe_execute(op):
 with connect() as c:
  fired=c.execute('SELECT fault_fired FROM effect_probe.operations WHERE id=%s FOR UPDATE',(op,)).fetchone()[0]
  c.execute('UPDATE effect_probe.operations SET fault_fired=true,attempts=attempts+1 WHERE id=%s',(op,))
 with connect() as c:c.execute('INSERT INTO effect_probe.provider_effects(operation_id) VALUES(%s)',(op,))
 if not fired:os.kill(os.getpid(),signal.SIGKILL)
 return 'COMMITTED'
def verify_unsafe(op):
 with connect() as c:n=c.execute('SELECT count(*) FROM effect_probe.provider_effects WHERE operation_id=%s',(op,)).fetchone()[0]
 assert n==2,(op,n)
 return {'operation':op,'provider_effects':n,'result':'Unsafe direct retry duplicated the local provider effect, as expected'}
def execute(op):
 if op.startswith('unsafe-'):return unsafe_execute(op)
 with connect() as c:
  c.execute('UPDATE effect_probe.operations SET attempts=attempts+1 WHERE id=%s',(op,))
  row=c.execute('SELECT scenario,state,fault_fired,grant_active,epoch_current,not_expired FROM effect_probe.operations WHERE id=%s FOR UPDATE',(op,)).fetchone()
  case,state,fired,active,epoch,expiry=row
  if state in ('COMMITTED','DENIED'):return state
  if state in ('DISPATCHING','UNKNOWN'):
   # A strongly queryable local oracle represents provider read-back.
   exists=c.execute('SELECT 1 FROM effect_probe.provider_effects WHERE operation_id=%s',(op,)).fetchone()
   state='COMMITTED' if exists else 'UNKNOWN'
   c.execute('UPDATE effect_probe.operations SET state=%s WHERE id=%s',(state,op));c.execute('INSERT INTO effect_probe.evidence(operation_id,kind) VALUES(%s,%s)',(op,'reconciled_'+state));return state
  if not(active and epoch and expiry):
   c.execute("UPDATE effect_probe.operations SET state='DENIED' WHERE id=%s",(op,));return 'DENIED'
  c.execute("UPDATE effect_probe.operations SET state='DISPATCHING',fault_fired=true WHERE id=%s",(op,));c.execute("INSERT INTO effect_probe.evidence(operation_id,kind) VALUES(%s,'send_reserved')",(op,))
 if case=='kill_before_provider' and not fired:os.kill(os.getpid(),signal.SIGKILL)
 # Separate commit represents an external side effect. Intentionally NO UNIQUE
 # operation key at this fake provider, so a duplicate send is observable.
 with connect() as remote:remote.execute('INSERT INTO effect_probe.provider_effects(operation_id) VALUES(%s)',(op,))
 if case=='kill_after_provider' and not fired:os.kill(os.getpid(),signal.SIGKILL)
 with connect() as c:
  c.execute("UPDATE effect_probe.operations SET state='COMMITTED' WHERE id=%s",(op,));c.execute("INSERT INTO effect_probe.evidence(operation_id,kind) VALUES(%s,'authoritative_receipt')",(op,))
 if case=='kill_after_record' and not fired:os.kill(os.getpid(),signal.SIGKILL)
 return 'COMMITTED'
def verify(prefix):
 with connect() as c:
  rows=c.execute('SELECT o.id,o.scenario,o.state,o.attempts,count(p.id) FROM effect_probe.operations o LEFT JOIN effect_probe.provider_effects p ON p.operation_id=o.id WHERE o.id LIKE %s GROUP BY o.id ORDER BY o.id',(prefix+'-%',)).fetchall()
 out=[]
 for op,case,state,attempts,effects in rows:
  expected='DENIED' if case in ['revoked','stale_epoch','expired'] else 'UNKNOWN' if case=='kill_before_provider' else 'COMMITTED'
  expected_effects=0 if expected in ['DENIED','UNKNOWN'] else 1
  assert state==expected and effects==expected_effects,(op,state,effects,expected)
  out.append({'operation':op,'scenario':case,'state':state,'callback_attempts':attempts,'provider_effects':effects,'pass':True})
 assert len(out)==8
 return out
if __name__=='__main__':print(json.dumps({'state':execute(sys.argv[1])}))
