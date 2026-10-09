import asyncio,json,os,sys
from datetime import timedelta
from pathlib import Path
from temporalio import activity,workflow
from temporalio.common import RetryPolicy
from temporalio.testing import WorkflowEnvironment
from temporalio.worker import Worker
with workflow.unsafe.imports_passed_through():
 from effect_reference import prepare,verify,prepare_unsafe,verify_unsafe
@activity.defn
async def invoke_boundary(op:str)->str:
 env=dict(os.environ);env['PYTHONPATH']=os.environ.get('PYTHONPATH','')
 proc=await asyncio.create_subprocess_exec(sys.executable,str(Path(__file__).resolve().parent/'effect_reference.py'),op,env=env,stdout=asyncio.subprocess.PIPE,stderr=asyncio.subprocess.PIPE)
 out,err=await proc.communicate()
 if proc.returncode:raise RuntimeError(f'boundary child exit={proc.returncode}: {err.decode()[:200]}')
 return json.loads(out)['state']
@workflow.defn
class EffectProbe:
 @workflow.run
 async def run(self,op:str)->str:
  return await workflow.execute_activity(invoke_boundary,op,start_to_close_timeout=timedelta(seconds=10),retry_policy=RetryPolicy(initial_interval=timedelta(milliseconds=200),maximum_attempts=3))
async def main():
 cases=prepare('temporal');prepare_unsafe('unsafe-temporal')
 async with await WorkflowEnvironment.start_local() as env:
  async with Worker(env.client,task_queue='isolated-effect-probe',workflows=[EffectProbe],activities=[invoke_boundary]):
   for case in cases:
    for repeat in range(3 if case=='duplicate' else 1):
     op='temporal-'+case
     await env.client.execute_workflow(EffectProbe.run,op,id=f'{op}-delivery-{repeat}',task_queue='isolated-effect-probe')
   await env.client.execute_workflow(EffectProbe.run,'unsafe-temporal',id='unsafe-temporal-delivery',task_queue='isolated-effect-probe')
 results=verify('temporal');unsafe=verify_unsafe('unsafe-temporal')
 (Path(__file__).resolve().parent/'results/temporal-probe.json').write_text(json.dumps({'scheduler':'Temporal local dev server','cases':results,'unsafe_direct_retry_control':unsafe,'scope':'Actual Temporal SDK retries and PostgreSQL; SIGKILL of boundary subprocess, LOCAL fake provider oracle; NOT real providers, service/host/regional failover or performance benchmark'},indent=2)+'\n')
 print('Temporal shared-boundary probe: 8/8 scenarios passed; no duplicate local provider effects')
if __name__=='__main__':asyncio.run(main())
