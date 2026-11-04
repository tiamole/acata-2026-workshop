export const storageKey='acata.workspace.v1';
export const moduleIds=['blueprint','prompt','review','metadata','audit'];
export function emptyWorkspace(){return {version:1,updatedAt:null,checks:{},fields:{},rubric:[],disposition:'',reviewSummary:''};}
export function validateWorkspace(raw){
 if(!raw||raw.version!==1||typeof raw!=='object')throw new Error('This is not a supported ACATA workspace backup.');
 const result=emptyWorkspace();
 if(raw.updatedAt!==null&&raw.updatedAt!==undefined){if(typeof raw.updatedAt!=='string'||!Number.isFinite(Date.parse(raw.updatedAt)))throw new Error('Invalid backup date.');result.updatedAt=raw.updatedAt;}
 for(const id of moduleIds){
  const checks=raw.checks?.[id]||[];if(!Array.isArray(checks)||checks.length>4||checks.some(x=>typeof x!=='boolean'))throw new Error('Invalid module checklist.');result.checks[id]=checks;
  const fields=raw.fields?.[id]||{};if(!fields||typeof fields!=='object'||Array.isArray(fields))throw new Error('Invalid worksheet.');
  result.fields[id]={};
  for(const [key,value] of Object.entries(fields)){if(!/^[a-z][a-zA-Z]{0,30}$/.test(key)||['constructor','prototype','__proto__'].includes(key)||typeof value!=='string'||value.length>12000)throw new Error('Invalid worksheet field.');result.fields[id][key]=value;}
 }
 if(raw.rubric!==undefined&&!Array.isArray(raw.rubric))throw new Error('Invalid rubric.');
 if((raw.rubric||[]).length>16)throw new Error('Invalid rubric length.');
 result.rubric=(raw.rubric||[]).map(r=>{if(!r||!['','1','2','3','4','NA'].includes(r.rating)||typeof r.evidence!=='string'||r.evidence.length>12000)throw new Error('Invalid rubric rating.');return {rating:r.rating,evidence:r.evidence};});
 for(const key of ['disposition','reviewSummary']){const value=raw[key]||'';if(typeof value!=='string'||value.length>12000)throw new Error('Invalid review summary.');result[key]=value;}
 return result;
}
export function completed(workspace,id){return workspace.checks[id]?.length===4&&workspace.checks[id].every(Boolean);}
export function completionCount(workspace){return moduleIds.filter(id=>completed(workspace,id)).length;}
