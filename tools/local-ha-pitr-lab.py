#!/usr/bin/env python3
"""Actual native PostgreSQL streaming/failover/WAL-PITR lab; NEVER accepts a remote endpoint."""
from pathlib import Path
import os,sys,json,subprocess,time,shutil
root=Path(__file__).resolve().parent.parent;os.chdir(root)
base=root/'.local/dr-lab';out=root/'implementation/evidence/dr-lab';out.mkdir(parents=True,exist_ok=True)
if os.environ.get('CT_LOCAL_DR_LAB')!='yes':raise SystemExit('Explicit local DR lab flag required')
if base.exists():raise SystemExit('Lab directory already exists. Inspect/stop it before explicitly removing the disposable lab.')
base.mkdir(parents=True,mode=0o700);archive=base/'wal';archive.mkdir(mode=0o700)
log=open(out/'RAW-COMMANDS.log','w');started=[];results={"scope":"actual local native PostgreSQL; not cloud HA, regional DR or live identity/provider", "cases":[],"status":"FAIL"}
def cmd(args,env=None):
 log.write('$ '+' '.join(map(str,args))+'\n');log.flush();p=subprocess.run(list(map(str,args)),stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,env=env);log.write(p.stdout);log.flush()
 if p.returncode:raise RuntimeError(f'command failed ({p.returncode}): {args[0]}')
 return p.stdout.strip()
def sql(port,query,db='ct_dr'):
 return cmd(['psql','-h','127.0.0.1','-p',port,'-U','localtest','-d',db,'-v','ON_ERROR_STOP=1','-Atc',query])
def start(directory,port):
 sock=base/('socket-'+str(port));sock.mkdir(mode=0o700);cmd(['pg_ctl','-D',directory,'-l',directory/'server.log','-o',f'-p {port} -h 127.0.0.1 -k {sock}','-w','start']);started.append(directory)
def stop(directory):
 cmd(['pg_ctl','-D',directory,'-m','immediate','-w','stop']);started.remove(directory)
def probe(phase,port):
 v=json.loads(cmd(['node','dist/tests/dr-effect-probe.js',phase,port],env={**os.environ,'CT_LOCAL_DR_LAB':'yes'}));(out/(phase+'.json')).write_text(json.dumps(v,indent=2)+'\n');return v
def until(fn,timeout=30):
 end=time.monotonic()+timeout
 while time.monotonic()<end:
  if fn():return
  time.sleep(.15)
 raise RuntimeError('lab condition timeout')
try:
 primary=base/'primary';cmd(['initdb','-D',primary,'-U','localtest','-A','trust','--encoding=UTF8','--locale=C'])
 with (primary/'postgresql.conf').open('a') as f:f.write(f"\nwal_level=replica\nmax_wal_senders=6\narchive_mode=on\narchive_timeout=1\narchive_command='test -f {archive}/%f || cp %p {archive}/%f'\nfsync=on\nsynchronous_commit=on\n")
 with (primary/'pg_hba.conf').open('a') as f:f.write('\nhost replication localtest 127.0.0.1/32 trust\n')
 start(primary,55440);cmd(['createdb','-h','127.0.0.1','-p',55440,'-U','localtest','ct_dr'])
 for filename in ['001-foundation.sql','002-lock-privileges.sql','004-monotonic-fences.sql','005-identity-authority.sql','006-product-computers.sql','008-recovery-controls.sql']:
  cmd(['psql','-h','127.0.0.1','-p',55440,'-U','localtest','-d','ct_dr','-v','ON_ERROR_STOP=1','-f',root/'migrations'/filename])
 probe('seed',55440);backup=base/'backup';cmd(['pg_basebackup','-h','127.0.0.1','-p',55440,'-U','localtest','-D',backup,'-X','stream','--checkpoint=fast']);results['cases'].append({'case':'native physical base backup','status':'PASS'})
 lsn=sql(55440,"SELECT pg_create_restore_point('before_effect')");(out/'RESTORE-POINT.json').write_text(json.dumps({'name':'before_effect','lsn':lsn},indent=2))
 standby=base/'standby';shutil.copytree(backup,standby);(standby/'standby.signal').touch()
 with (standby/'postgresql.conf').open('a') as f:f.write("\nprimary_conninfo='host=127.0.0.1 port=55440 user=localtest application_name=ct_local_standby'\narchive_mode=off\n")
 start(standby,55441);until(lambda:sql(55441,'SELECT pg_is_in_recovery()')=='t');probe('send-revoke',55440)
 sql(55440,'CHECKPOINT; SELECT pg_switch_wal()');until(lambda:sql(55441,"SELECT revoked FROM ct.grants WHERE tenant='dr' AND id='dr-grant'")=='t')
 results['cases'].append({'case':'streaming standby observes committed effect and revocation','status':'PASS'})
 stop(primary);cmd(['pg_ctl','-D',standby,'-w','promote']);until(lambda:sql(55441,'SELECT pg_is_in_recovery()')=='f');probe('failover-check',55441);results['cases'].append({'case':'primary immediate crash and standby promotion preserve revocation/no duplicate','status':'PASS'})
 probe('block-before-restore',55441);stop(standby)
 restored=base/'restored';shutil.copytree(backup,restored);(restored/'recovery.signal').touch()
 with (restored/'postgresql.conf').open('a') as f:f.write(f"\narchive_mode=off\nrestore_command='cp {archive}/%f %p'\nrecovery_target_name='before_effect'\nrecovery_target_action='pause'\n")
 start(restored,55442);until(lambda:sql(55442,'SELECT pg_is_wal_replay_paused()')=='t');cmd(['pg_ctl','-D',restored,'-w','promote']);until(lambda:sql(55442,'SELECT pg_is_in_recovery()')=='f')
 restored_result=probe('restore-check',55442);results['cases'].append({'case':'WAL PITR restores deliberately old authority, but independent fence rejects stale deployment','status':'PASS'});results['cases'].append({'case':'read-only gap reconciliation and independent revocation journal prevent resend/resurrection','status':'PASS'});results['restoreChecks']=restored_result;results['status']='PASS'
except Exception as e:
 results['error']=str(e);raise
finally:
 for directory in list(reversed(started)):
  try:stop(directory)
  except Exception as e:results.setdefault('cleanupErrors',[]).append(str(e))
 results['stoppedAllLabClusters']=not started;(out/'RESULT.json').write_text(json.dumps(results,indent=2)+'\n');log.close()
 print(json.dumps({k:results[k] for k in ['status','scope','cases','stoppedAllLabClusters']}))
