import json,sys
from pathlib import Path
x=json.loads(Path('docs/RELEASE-GATES.json').read_text())
blocked=[g['id'] for g in x['gates'] if g['status']!='PASS_PRODUCTION']
result={'productionReady':not blocked,'canonPromotionAllowed':not blocked,'blockedGates':blocked,'schedulerDecision':x['schedulerDecision']}
Path('evidence/RELEASE-STATUS.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
if '--enforce' in sys.argv and blocked:sys.exit(1)
