const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const root=path.resolve(__dirname,'../../sources/continuum2');
function load(rel,modules={}){const filename=path.join(root,rel);const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const mod={exports:{}};const context={exports:mod.exports,module:mod,require:n=>modules[n]||require(n),console,Date,crypto:require('crypto')};vm.runInNewContext(code,context,{filename});return mod.exports;}
(async()=>{
 const findings=[];let actualWorkflowCalls=0;
 const {ContinuumMCP}=load('apps/api-mcp/src/index.ts',{'@continuum/coordinator':{CoordinatorEngine:{executeOperationWorkflow(){actualWorkflowCalls++}}}});
 const mcpResult=await new ContinuumMCP().handleToolCall('execute_effect',{provider:'github',action:'pull_request.create',resource:'repo',data:{}},{tenantId:'tenantA',principalId:'pA',activePolicy:'test'});
 if(mcpResult.status==='dispatched'&&actualWorkflowCalls===0)findings.push('API reports dispatched without invoking coordinator');else throw Error('API reproduction changed');
 const {GitHubProvider}=load('packages/providers/src/index.ts');const provider=new GitHubProvider();const receipt=await provider.execute({},{});if(receipt.outcome==='COMMITTED'&&receipt.operation_id==='op_sim')findings.push('Provider generates simulated COMMITTED receipt without a provider call');else throw Error('Provider changed');
 let contexts=[];class RegencyEngine{async evaluatePolicy(p,principal,a,r,c){contexts.push(c);return true;}}
 const {EffectBoundary}=load('packages/effect-boundary/src/index.ts',{'@continuum/regency':{RegencyEngine}});
 const queries=[];const client={async query(sql,args){queries.push(sql);if(sql.includes('FROM authority_grants'))return{rowCount:1,rows:[{authority_id:'g',status:'ACTIVE',version:1,principal_id:'otherPrincipal',expires_at:'2000-01-01',requires_approval:true,constraints:{}}]};if(sql.includes('FROM principals'))return{rowCount:1,rows:[{epoch:1,status:'SUSPENDED'}]};if(sql.includes('MAX(seq)'))return{rows:[{next_seq:1}]};return{rowCount:0,rows:[]};}};
 const op={operation_id:'op',principal_id:'pA',principal_epoch:1,authority:{authority_id:'g',grant_version:1},action:'write',resource:'r',state:'AWAITING_APPROVAL'};
 const boundary=new EffectBoundary();await boundary.commitTimeRecheckAndDispatch(client,'tenantA',op,'allow');await boundary.commitTimeRecheckAndDispatch(client,'tenantA',op,'allow');
 findings.push('Local DB double: expired grant, mismatched grantee and suspended principal not rejected by application checks');
 if(contexts.every(c=>c.approved===true))findings.push('AWAITING_APPROVAL state is mapped to approved=true without an approval record');
 if(queries.filter(q=>q.includes('UPDATE operations')).length===2)findings.push('Repeated call reaches DISPATCHED update twice; no expected-state compare-and-swap');
 fs.writeFileSync('../results/prototype-code-regressions.json',JSON.stringify({scope:'Original TypeScript compiled and executed with local doubles; not PostgreSQL or live-provider proof',findings,passedReproductions:findings.length},null,2)+'\n');console.log(JSON.stringify({passedReproductions:findings.length,findings},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
