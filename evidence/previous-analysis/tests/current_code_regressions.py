"""Original Mongo dispatch functions executed with deterministic local doubles.
These reproduce application logic, NOT real Mongo/provider concurrency semantics.
"""
import ast,asyncio,copy,json,unittest
from pathlib import Path
from typing import Optional
ROOT=Path(__file__).resolve().parents[1]/'sources/Continuum'
class HTTPException(Exception):
 def __init__(self,status,detail): self.status_code=status;super().__init__(detail)
class Effect:
 @staticmethod
 def from_mongo(x):return x
class FakeCollection:
 def __init__(self,doc=None):self.doc=doc;self.barrier=None;self.reads=0
 async def find_one(self,*a,**k):
  value=copy.deepcopy(self.doc)
  if self.barrier and self.reads<2:
   self.reads+=1
   if self.reads==2:self.barrier.set()
   await self.barrier.wait()
  return value
 async def update_one(self,q,u):self.doc.update(u['$set'])
class Adapter:
 def __init__(self):self.calls=0;self.revoked_at_execution=False;self.active=True
 def dispatch(self,*a):self.calls+=1;self.revoked_at_execution=not self.active;return {'status':'committed','adapter':'local_test_double'}
def extract(file,names,env):
 tree=ast.parse(file.read_text());nodes=[]
 for n in tree.body:
  if isinstance(n,(ast.FunctionDef,ast.AsyncFunctionDef)) and n.name in names:
   n.decorator_list=[];nodes.append(n)
 assert len(nodes)==len(names)
 exec(compile(ast.fix_missing_locations(ast.Module(body=nodes,type_ignores=[])),str(file),'exec'),env)
 return env
async def nop(*a,**k):pass
class ExistingCodeRegressions(unittest.IsolatedAsyncioTestCase):
 def fixture(self,outcome='PREPARED',session=None):
  from types import SimpleNamespace
  adapter=Adapter();doc={'_id':'eff1','outcome':outcome,'vera_id':'v1','capability_required':'write','action_id':'a1','payload':{},'session_id':session}
  db=SimpleNamespace(effects=FakeCollection(doc),sessions=FakeCollection(None),placements=FakeCollection(None))
  async def auth(*a):return {'_id':'g1','state':'ACTIVE'}
  env=extract(ROOT/'backend/server.py',{'dispatch_effect'},{'db':db,'_oid':lambda x:x,'HTTPException':HTTPException,'Effect':Effect,'_resolve_authority':auth,'nexus_adapter':adapter,'append_evidence':nop,'utcnow_iso':lambda:'2026-10-08T00:00:00Z'})
  return env,db,adapter
 async def test_unknown_is_redispatched_without_reconciliation(self):
  env,_,a=self.fixture('UNKNOWN');await env['dispatch_effect']('eff1');self.assertEqual(a.calls,1)
 async def test_missing_session_placement_does_not_fail_closed(self):
  env,_,a=self.fixture(session='missing');await env['dispatch_effect']('eff1');self.assertEqual(a.calls,1)
 async def test_two_prepared_readers_dispatch_twice(self):
  env,db,a=self.fixture();db.effects.barrier=asyncio.Event();await asyncio.gather(env['dispatch_effect']('eff1'),env['dispatch_effect']('eff1'));self.assertEqual(a.calls,2)
 async def test_revocation_after_authority_read_does_not_stop_dispatch(self):
  env,_,a=self.fixture()
  async def auth(*args):a.active=False;return {'_id':'g1','state':'ACTIVE'}
  env['_resolve_authority']=auth;await env['dispatch_effect']('eff1');self.assertTrue(a.revoked_at_execution)
 async def test_committed_is_not_redispatched_control(self):
  env,_,a=self.fixture('COMMITTED')
  with self.assertRaises(HTTPException):await env['dispatch_effect']('eff1')
  self.assertEqual(a.calls,0)
 async def test_wire_error_can_fall_back_after_possible_execution(self):
  calls={'wire':0,'local':0}
  def wire(**kw):calls['wire']+=1;return {'type':'WireError','error':'timeout after sending Execute','wire_ms':1}
  def local(*a,**k):calls['local']+=1;return {'status':'committed'}
  import hashlib
  env=extract(ROOT/'backend/adapters/nexus.py',{'_live_dispatch'},{'hashlib':hashlib,'execute_wasm':local})
  env['_live_dispatch'](wire,{'capability':'compute'},'a1',{},b'test_wasm','_start',{})
  self.assertEqual(calls,{'wire':1,'local':1})
if __name__=='__main__':unittest.main(verbosity=2)
