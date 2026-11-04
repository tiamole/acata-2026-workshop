// Explicit publishing helper for the repository authorized by Taiwo Feyijimi.
// Authenticates only through an existing GitHub CLI login; no tokens in files.
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const repository='tiamole/acata-2026-workshop';
function run(program,args,{input,allowFailure=false,capture=false}={}){
 const out=spawnSync(program,args,{cwd:root,input,encoding:'utf8',shell:false,stdio:capture||input?['pipe','pipe','pipe']:'inherit'});
 if(out.error)throw new Error(`Cannot run ${program}. Install it and make it available on PATH.`);
 if(out.status!==0&&!allowFailure){if(capture)throw new Error(`${program} ${args[0]} failed. Check authentication and repository access.`);throw new Error(`${program} ${args[0]} failed.`);}
 return out;
}
try{
 run('gh',['auth','status']);
 const login=run('gh',['api','user','--jq','.login'],{capture:true}).stdout.trim();
 if(login!=='tiamole')throw new Error('The active GitHub account must be tiamole for this approved publication. Switch the account in GitHub CLI first.');
 const lookup=run('gh',['api','repos/'+repository],{capture:true,allowFailure:true});
 if(lookup.status===0)throw new Error('The GitHub repository already exists. This creation helper will not replace it. Review that repository and publish through a normal branch/PR workflow.');
 if(!lookup.stderr.includes('404'))throw new Error('Could not establish whether the destination repository exists. Resolve the GitHub API error first.');
 run(process.execPath,['scripts/check.mjs']);run(process.execPath,['--test','tests/backend.test.mjs','tests/state.test.mjs']);
 if(!existsSync(new URL('../.git',import.meta.url))){run('git',['init','-b','main']);}
 run('git',['add','--all']);
 const staged=run('git',['diff','--cached','--quiet'],{capture:true,allowFailure:true});
 if(staged.status!==0){run('git',['-c','user.name=Codex','-c','user.email=codex@openai.com','commit','-m','Build ACATA 2026 participant learning website']);}
 run('gh',['repo','create',repository,'--public','--source',root,'--remote','origin','--push','--description','Modernising Item Development with AI and LLMs · Taiwo Feyijimi']);
 run('gh',['api','--method','POST','repos/'+repository+'/pages','--input','-'],{input:JSON.stringify({build_type:'workflow'})});
 run('gh',['workflow','run','pages.yml','--repo',repository]);
 console.log('Repository created and Pages workflow launched: https://github.com/'+repository);
 console.log('Confirm the Actions deployment succeeds before sharing the returned Pages URL.');
}catch(error){console.error(error.message);process.exitCode=1;}
