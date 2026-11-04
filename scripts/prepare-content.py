"""Build a source-faithful prompt library and review manifest from reviewed text.
Run from the repository root after the source review has been extracted.
"""
import json, re, hashlib
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = root / 'review/folder-02_AI_LLM_Item_Development_Prompt_Pack.txt'
text = source.read_text(encoding='utf-8')
prompts = []
for match in re.finditer(r'^Prompt (\d+)\. ([^\n]+)\n(.*?)(?=^Prompt \d+\.|^Rapid prompt builder)', text, re.M | re.S):
    number, title, body = match.groups()
    lines = body.strip().splitlines()
    description = ''
    if lines and lines[0] == 'Use when':
        description = lines[1]
        lines = lines[2:]
    if lines and lines[0] == 'Copy and adapt:':
        lines = lines[1:]
    body = '\n'.join(lines)
    # The source has prompt text in single paragraphs. Add presentation line breaks.
    body = re.sub(r'(?<!\n)([A-Z][A-Z /-]{4,}:?)', r'\n\n\1', body)
    body = re.sub(r'(?<=[.\]])(?=[1-9]\d*\. )', '\n', body)
    body = re.sub(r'\](?=[A-Z])', ']\n', body)
    prompts.append(dict(number=int(number), title=title, description=description, body=body.strip()))
assert len(prompts) == 10
(root / 'public/prompts.json').write_text(json.dumps(prompts, ensure_ascii=False, indent=2), encoding='utf-8')
records = []
for path in sorted((root / 'public/downloads').rglob('*')):
    if path.is_file():
        records.append(dict(file=path.relative_to(root/'public').as_posix(), bytes=path.stat().st_size,
                            sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
(root/'docs/download-manifest.json').write_text(json.dumps(records, indent=2), encoding='utf-8')
print(f'Prepared {len(prompts)} complete source prompts and {len(records)} downloadable assets.')
