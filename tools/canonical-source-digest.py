#!/usr/bin/env python3
"""Stable content fingerprint for implemented source, lockfiles and test harness, not generated evidence."""
from pathlib import Path
import hashlib,json
roots=['src','scheduler','migrations','tests','tools','web','internal/operator']
files=[]
for root in roots:
 for p in Path(root).rglob('*'):
  if not p.is_file() or any(part in {'node_modules','.next','test-results','playwright-report','__pycache__'} for part in p.parts) or p.name.endswith('.tsbuildinfo'):continue
  files.append(p)
files.extend(Path(p) for p in ['package.json','package-lock.json','tsconfig.json'] if Path(p).exists())
entries=[{'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(set(files))]
print(json.dumps({'sourceDigest':hashlib.sha256(json.dumps(entries,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'files':len(entries),'scope':'Implemented source and verification harness; generated evidence/docs excluded'},sort_keys=True,indent=2))
