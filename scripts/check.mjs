import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(async x=>x.isDirectory()?files(path.join(dir,x.name)):path.join(dir,x.name)))).flat();}
const scripts=(await Promise.all(['public','backend','scripts','tests'].map(dir=>files(path.join(root,dir))))).flat().filter(f=>/\.(mjs|js)$/.test(f));
for(const file of scripts)execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
const manifest=JSON.parse(await readFile(path.join(root,'docs/download-manifest.json'),'utf8'));
for(const item of manifest){const bytes=await readFile(path.join(root,'public',item.file));assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256,item.file+' checksum');}
const prompts=JSON.parse(await readFile(path.join(root,'public/prompts.json'),'utf8'));assert.equal(prompts.length,10);assert.ok(prompts.every(x=>x.body.length>400));
const html=await readFile(path.join(root,'public/index.html'),'utf8');assert.ok(html.includes('Taiwo Feyijimi'));assert.ok(!html.includes('http://cdn'));
console.log(`Checked ${scripts.length} JavaScript files, ${manifest.length} original downloads, and all ten prompts.`);
