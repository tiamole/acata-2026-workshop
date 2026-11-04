"""Create clean source and static publication archives, excluding local state."""
import hashlib, json, zipfile
from pathlib import Path
root=Path(__file__).resolve().parents[1]
skip={'.git','node_modules','artifacts','.wrangler','__pycache__'}
outputs=[]
for kind in ['source','static']:
    start=root if kind=='source' else root/'public'
    dest=root.parent/f'acata-2026-workshop-{kind}.zip'
    with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(start.rglob('*')):
            rel=path.relative_to(start)
            if not path.is_file() or any(p in skip for p in rel.parts): continue
            if path.name.startswith(('.env','.dev.vars')) or path.suffix=='.log': continue
            archive.write(path,Path('acata-2026-workshop',rel).as_posix() if kind=='source' else rel.as_posix())
    outputs.append(dict(file=dest.name,bytes=dest.stat().st_size,sha256=hashlib.sha256(dest.read_bytes()).hexdigest()))
(root.parent/'acata-2026-workshop-release.json').write_text(json.dumps(outputs,indent=2),encoding='utf-8')
for item in outputs:print(f"{item['file']}: {item['bytes']:,} bytes, SHA-256 {item['sha256']}")
