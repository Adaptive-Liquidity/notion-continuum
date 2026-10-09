from pathlib import Path
Path(".artifacts/qualification").mkdir(parents=True,exist_ok=True)
import json,sys
x=json.loads(Path('qualification/PRODUCTION-GATES.json').read_text());allowed=set(x['allowedStatuses'])
assert all(g['status'] in allowed for g in x['gates']+x['narrowSubchecks'])
blocked=[g['id'] for g in x['gates'] if g['status']!='PASS']
r={'productionReady':not blocked,'canary':'NO-GO' if blocked else 'OWNER APPROVAL REQUIRED','scheduler':x['schedulerDecision'],'blocked':blocked}
Path('.artifacts/qualification/GATE-STATUS.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
if '--enforce' in sys.argv and blocked:sys.exit(1)
