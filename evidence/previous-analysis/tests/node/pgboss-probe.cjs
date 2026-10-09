const pathModule=require('path');
const{PgBoss}=require('pg-boss'),{spawn}=require('child_process'),fs=require('fs');
const path=pathModule.resolve(__dirname,'../effect_reference.py');
function python(args,code){return new Promise((resolve,reject)=>{let out='',err='';const p=spawn('python',code?['-c',code]:[path,...args],{env:{...process.env,PYTHONPATH:[process.env.PYTHONPATH||'',pathModule.resolve(__dirname,'..')].join(':')}});p.stdout.on('data',x=>out+=x);p.stderr.on('data',x=>err+=x);p.on('exit',(c,s)=>c===0?resolve(out.trim()):reject(Error(`boundary child exit=${c},signal=${s}: ${err.slice(0,200)}`)))});}
(async()=>{
 const cases=JSON.parse(await python([],"from effect_reference import prepare;import json;print(json.dumps(prepare('pgboss')))"));
 await python([],"from effect_reference import prepare_unsafe;prepare_unsafe('unsafe-pgboss')");
 const boss=new PgBoss({connectionString:'postgres://localtest@127.0.0.1:55432/postgres',schema:'probe_queue'});boss.on('error',e=>console.error(e.message));await boss.start();
 let completed=0;const expected=cases.length+3;const queue='isolated_effect_probe';await boss.createQueue(queue,{retryLimit:2,retryDelay:1});
 await boss.work(queue,{pollingIntervalSeconds:0.5},async jobs=>{for(const job of jobs){await python([job.data.operation]);completed++;}});
 for(const c of cases)for(let repeat=0;repeat<(c==='duplicate'?3:1);repeat++)await boss.send(queue,{operation:'pgboss-'+c},{retryLimit:2,retryDelay:1});
 await boss.send(queue,{operation:'unsafe-pgboss'},{retryLimit:2,retryDelay:1});
 const deadline=Date.now()+60000;while(completed<expected&&Date.now()<deadline)await new Promise(r=>setTimeout(r,200));
 await boss.stop({graceful:true});if(completed!==expected)throw Error(`Completed ${completed}/${expected}`);
 const results=JSON.parse(await python([],"from effect_reference import verify;import json;print(json.dumps(verify('pgboss')))"));
 const unsafe=JSON.parse(await python([],"from effect_reference import verify_unsafe;import json;print(json.dumps(verify_unsafe('unsafe-pgboss')))"));
 fs.writeFileSync('../results/pgboss-probe.json',JSON.stringify({scheduler:'pg-boss',cases:results,unsafe_direct_retry_control:unsafe,scope:'Actual pg-boss retries and PostgreSQL; SIGKILL of boundary subprocess, LOCAL fake provider oracle; NOT real providers, service/host/regional failover or performance benchmark'},null,2)+'\n');console.log('pg-boss shared-boundary probe: 8/8 scenarios passed; no duplicate local provider effects');
})().catch(e=>{console.error(e);process.exit(1)});
