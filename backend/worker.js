import {validateWorkspace,completed,moduleIds} from '../public/state.js';
import {confidenceItems,attitudeItems,stages,surveyVersion,roleOptions,experienceOptions,knowledgeItems} from '../public/content.js';

const encoder=new TextEncoder();
const hex=buffer=>[...new Uint8Array(buffer)].map(x=>x.toString(16).padStart(2,'0')).join('');
const hash=async text=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(text)));
const token=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
const valid48=x=>typeof x==='string'&&/^[a-f0-9]{48}$/.test(x);
const valid64=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const allowedPages=new Set(['home','learn','resources','workspace','survey','example','privacy','about','dashboard',...moduleIds.map(id=>'module/'+id)]);
class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new HttpError(status,message);};
async function hmac(secret,message){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(message)));}
async function equalSecrets(a,b){const aa=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(a))),bb=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(b)));let diff=0;for(let i=0;i<aa.length;i++)diff|=aa[i]^bb[i];return diff===0;}
function bearer(request){const value=request.headers.get('Authorization')||'';return value.startsWith('Bearer ')?value.slice(7):'';}
export function researchConfig(env){
 const retentionDays=Number(env.RESEARCH_RETENTION_DAYS);
 const ready=env.RESEARCH_ENABLED==='true'&&Number.isInteger(retentionDays)&&retentionDays>=1&&retentionDays<=3650&&String(env.RESEARCH_CONTACT||'').trim().length>=5&&String(env.RESEARCH_APPROVAL||'').trim().length>=5&&String(env.RESEARCH_CONSENT_VERSION||'').trim().length>=1&&String(env.RESEARCH_CONSENT_TEXT||'').trim().length>=100;
 return {enabled:Boolean(ready),...(ready?{retentionDays,contact:env.RESEARCH_CONTACT,approval:env.RESEARCH_APPROVAL,consentVersion:env.RESEARCH_CONSENT_VERSION,consentText:env.RESEARCH_CONSENT_TEXT}:{})};
}
async function jsonBody(request,max=350000){
 if(!(request.headers.get('Content-Type')||'').toLowerCase().startsWith('application/json'))fail(415,'Use application/json.');
 if(Number(request.headers.get('Content-Length'))>max)fail(413,'Request body is too large.');
 if(!request.body)fail(400,'A JSON body is required.');
 const reader=request.body.getReader(),parts=[];let bytes=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>max){await reader.cancel();fail(413,'Request body is too large.');}parts.push(value);}}finally{reader.releaseLock();}
 const combined=new Uint8Array(bytes);let offset=0;for(const part of parts){combined.set(part,offset);offset+=part.byteLength;}
 try{const parsed=JSON.parse(new TextDecoder().decode(combined));if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))fail(400,'Expected a JSON object.');return parsed;}catch(error){if(error instanceof HttpError)throw error;fail(400,'Malformed JSON.');}
}
function workspaceInput(raw){try{return validateWorkspace(raw);}catch(error){fail(400,error.message);}}
export function validateAnswers(raw,stage){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))fail(400,'Invalid survey answers.');
 const allowed=new Set(['role','experience','reflection',...confidenceItems.map(([id])=>'c_'+id),...knowledgeItems.map(k=>k.id)]);
 if(stage!=='pre')attitudeItems.forEach(([id])=>allowed.add('a_'+id));if(stage==='followup')allowed.add('transfer');
 const answers={};
 for(const [key,value] of Object.entries(raw)){
  if(!allowed.has(key))fail(400,'Unexpected survey field.');
  if(typeof value!=='string')fail(400,'Survey responses must be text values.');
  if(key==='reflection'){if(value.length>2000)fail(400,'Reflection exceeds 2,000 characters.');answers[key]=value;}
  else if(key==='role'){if(value&&!roleOptions.includes(value))fail(400,'Invalid professional role.');answers[key]=value;}
  else if(key==='experience'){if(value&&!experienceOptions.includes(value))fail(400,'Invalid AI-use frequency.');answers[key]=value;}
  else if(key==='transfer'){if(value&&!['Not yet','Once','A few times','Regularly','Prefer not to say'].includes(value))fail(400,'Invalid transfer response.');answers[key]=value;}
  else if(key.startsWith('c_')||key.startsWith('a_')){if(!['1','2','3','4','5','skip'].includes(value))fail(400,'Invalid rating.');answers[key]=value;}
  else{if(!['0','1','2','3'].includes(value))fail(400,'Invalid knowledge response.');answers[key]=value;}
 }
 return answers;
}
export function csvCell(value){let text=String(value??'');if(/^[\s]*[=+@\-\t\r\n]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';}
function csv(rows){return '\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');}
async function rateLimit(request,env,path){
 if(!env.RATE_LIMIT_SALT||env.RATE_LIMIT_SALT.length<32)fail(503,'The service is not fully configured.');
 // Connection address is used transiently for anti-abuse, never stored in plaintext.
 const ip=request.headers.get('CF-Connecting-IP')||'local';const now=Date.now(),hour=Math.floor(now/3600000);
 const bucket=await hmac(env.RATE_LIMIT_SALT,`${hour}:${path}:${ip}`);
 // Workshop attendees may share one venue Wi-Fi address. Keep public limits
 // large enough for that shared network while bounding repeated writes.
 const limit=path.startsWith('/admin')?60:path==='/participant'?500:path==='/survey'?1000:10000;
 const row=await env.DB.prepare('INSERT INTO rate_limits(bucket,count,expires_at) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count').bind(bucket,now+7200000).first();
 if(row.count>limit)fail(429,'Too many requests. Please try again later.');
}
async function participant(request,env){const secret=bearer(request);if(!valid64(secret))fail(401,'A valid workspace recovery code is required.');const key=await hash(secret);const row=await env.DB.prepare('SELECT * FROM participants WHERE token_hash=?').bind(key).first();if(!row)fail(401,'Workspace not found, or the recovery code is incorrect.');return {...row,key};}
async function admin(request,env){const supplied=bearer(request);if(!env.ADMIN_TOKEN||env.ADMIN_TOKEN.length<32||!supplied||!await equalSecrets(supplied,env.ADMIN_TOKEN))fail(401,'Administrator access is required.');}
async function stats(env){
 const since=new Date(Date.now()-29*86400000).toISOString().slice(0,10);
 const results=await env.DB.batch([
  env.DB.prepare('SELECT COUNT(*) AS views,COUNT(DISTINCT day || visitor_hash) AS visitorDays FROM visits WHERE day>=?').bind(since),
  env.DB.prepare('SELECT day,COUNT(*) AS views,COUNT(DISTINCT visitor_hash) AS visitors FROM visits WHERE day>=? GROUP BY day ORDER BY day').bind(since),
  env.DB.prepare('SELECT country,COUNT(*) AS views FROM visits WHERE day>=? GROUP BY country ORDER BY views DESC').bind(since),
  env.DB.prepare('SELECT workspace FROM participants'),
  env.DB.prepare('SELECT stage,COUNT(*) AS count FROM survey_responses WHERE expires_at>? GROUP BY stage').bind(new Date().toISOString()),
 ]);
 const completion=Object.fromEntries(moduleIds.map(id=>[id,0]));
 for(const row of results[3].results){try{const work=validateWorkspace(JSON.parse(row.workspace));moduleIds.forEach(id=>{if(completed(work,id))completion[id]++;});}catch{}}
 const surveyStages=Object.fromEntries(results[4].results.map(row=>[row.stage,row.count]));
 return {generatedAt:new Date().toISOString(),...results[0].results[0],daily:results[1].results,countries:results[2].results,participants:results[3].results.length,completion,surveyStages,responses:Object.values(surveyStages).reduce((a,b)=>a+b,0)};
}
async function exportData(env,kind){
 if(kind==='analytics'){
  const {results}=await env.DB.prepare('SELECT day,page,country,COUNT(*) AS views,COUNT(DISTINCT visitor_hash) AS visitor_days FROM visits GROUP BY day,page,country ORDER BY day DESC').all();
  return csv([['utc_day','page','approximate_country','page_views','visitor_days_per_page_country'],...results.map(r=>[r.day,r.page,r.country,r.views,r.visitor_days])]);
 }
 if(kind!=='research')fail(400,'Choose analytics or research export.');
 const {results}=await env.DB.prepare('SELECT study_hash,stage,instrument_version,consent_version,consented_at,submitted_at,answers FROM survey_responses WHERE expires_at>? ORDER BY submitted_at').bind(new Date().toISOString()).all();
 const keys=['role','experience',...confidenceItems.map(([id])=>'c_'+id),...knowledgeItems.map(k=>k.id),...attitudeItems.map(([id])=>'a_'+id),'transfer','reflection'];
 return csv([['study_pair_hash','stage','instrument_version','consent_version','consented_at','submitted_at',...keys],...results.map(r=>{const a=JSON.parse(r.answers);return [r.study_hash,r.stage,r.instrument_version,r.consent_version,r.consented_at,r.submitted_at,...keys.map(k=>a[k]??'')];})]);
}
async function handle(request,env){
 const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/',method=request.method;
 if(path==='/health'&&method==='GET')return {ok:true};
 if(path==='/config'&&method==='GET')return {available:true,research:researchConfig(env)};
 if(!env.DB)fail(503,'The database is not configured.');
 await rateLimit(request,env,path);
 if(path.startsWith('/admin/')){await admin(request,env);if(method!=='GET')fail(405,'Method not allowed.');if(path==='/admin/stats')return stats(env);if(path==='/admin/export')return {csv:await exportData(env,url.searchParams.get('kind'))};fail(404,'Endpoint not found.');}
 if(path==='/visit'&&method==='POST'){
  const body=await jsonBody(request,5000);if(!valid48(body.eventId)||!valid48(body.visitorId)||!allowedPages.has(body.page))fail(400,'Invalid visit event.');
  if(!env.ANALYTICS_SALT||env.ANALYTICS_SALT.length<32)fail(503,'Analytics is not configured.');
  const day=new Date().toISOString().slice(0,10);const visitorHash=await hmac(env.ANALYTICS_SALT,`${day}:${body.visitorId}`);
  const country=/^[A-Z]{2}$/.test(request.cf?.country||'')?request.cf.country:'XX';
  await env.DB.prepare('INSERT OR IGNORE INTO visits(event_id,day,page,country,visitor_hash) VALUES(?,?,?,?,?)').bind(body.eventId,day,body.page,country,visitorHash).run();
  return {recorded:true};
 }
 if(path==='/participant'&&method==='POST'){
  const body=await jsonBody(request);const workspace=workspaceInput(body.workspace);const secret=token();
  await env.DB.prepare('INSERT INTO participants(token_hash,workspace,revision,updated_at) VALUES(?,?,1,?)').bind(await hash(secret),JSON.stringify(workspace),new Date().toISOString()).run();
  return {token:secret,revision:1};
 }
 if(path==='/progress'){
  const person=await participant(request,env);
  if(method==='GET')return {workspace:JSON.parse(person.workspace),revision:person.revision};
  if(method==='DELETE'){await env.DB.prepare('DELETE FROM participants WHERE token_hash=?').bind(person.key).run();return {deleted:true};}
  if(method==='PUT'){
   const body=await jsonBody(request);if(!Number.isInteger(body.revision))fail(400,'A workspace revision is required.');const workspace=workspaceInput(body.workspace);
   const result=await env.DB.prepare('UPDATE participants SET workspace=?,revision=revision+1,updated_at=? WHERE token_hash=? AND revision=?').bind(JSON.stringify(workspace),new Date().toISOString(),person.key,body.revision).run();
   if(!result.meta.changes)fail(409,'The cloud copy changed on another device. Export local work, restore the newer cloud copy, and reconcile before uploading.');
   return {revision:body.revision+1};
  }
  fail(405,'Method not allowed.');
 }
 if(path==='/survey'&&method==='DELETE'){
  const code=bearer(request);if(!valid64(code))fail(400,'A valid receipt deletion code is required.');
  await env.DB.prepare('DELETE FROM survey_responses WHERE deletion_hash=?').bind(await hash(code)).run();return {deleted:true};
 }
 if(path==='/survey'&&method==='POST'){
  const research=researchConfig(env);if(!research.enabled)fail(403,'Research collection is not open.');
  const body=await jsonBody(request,20000);
  if(body.consent!==true||body.consentVersion!==research.consentVersion)fail(400,'Current voluntary consent is required.');
  if(body.instrumentVersion!==surveyVersion||!stages.includes(body.stage))fail(400,'Unsupported instrument version or stage.');
  if(!valid48(body.submissionId)||!valid48(body.studyCode)||!valid64(body.deletionCode))fail(400,'Invalid study or receipt code.');
  if(!env.RESEARCH_SALT||env.RESEARCH_SALT.length<32)fail(503,'Research storage is not configured.');
  const answers=validateAnswers(body.answers,body.stage),studyHash=await hmac(env.RESEARCH_SALT,body.studyCode),deletionHash=await hash(body.deletionCode);
  const prior=await env.DB.prepare('SELECT submission_id,deletion_hash,submitted_at FROM survey_responses WHERE submission_id=?').bind(body.submissionId).first();
  if(prior){if(prior.deletion_hash!==deletionHash)fail(409,'Submission identifier already used.');return {submissionId:prior.submission_id,submittedAt:prior.submitted_at};}
  const now=new Date().toISOString(),expires=new Date(Date.now()+research.retentionDays*86400000).toISOString();
  const inserted=await env.DB.prepare('INSERT OR IGNORE INTO survey_responses(submission_id,study_hash,deletion_hash,stage,instrument_version,consent_version,consented_at,submitted_at,expires_at,answers) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(body.submissionId,studyHash,deletionHash,body.stage,body.instrumentVersion,body.consentVersion,now,now,expires,JSON.stringify(answers)).run();
  if(!inserted.meta.changes)fail(409,'A response for this stage and study code already exists. Use your saved receipt to manage it.');
  return {submissionId:body.submissionId,submittedAt:now};
 }
 fail(404,'Endpoint not found.');
}
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin'),allowed=(env.ALLOWED_ORIGIN||'').split(',').map(s=>s.trim()).filter(Boolean);
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Vary':'Origin'};
  if(origin&&allowed.includes(origin)){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Methods']='GET, POST, PUT, DELETE, OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type, Authorization';headers['Access-Control-Max-Age']='600';}
  try{
   if(origin&&!allowed.includes(origin))fail(403,'This website origin is not allowed.');
   if(['POST','PUT','DELETE'].includes(request.method)&&!origin)fail(403,'An allowed website origin is required.');
   if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
   const data=await handle(request,env);return new Response(JSON.stringify(data),{headers});
  }catch(error){const status=error instanceof HttpError?error.status:500;return new Response(JSON.stringify({error:status===500?'The service could not complete this request. Please try again.':error.message}),{status,headers:{...headers,...(status===429?{'Retry-After':'3600'}:{})}});}
 },
 async scheduled(controller,env,ctx){
  const cleanup=env.DB.batch([
   env.DB.prepare('DELETE FROM visits WHERE day<?').bind(new Date(Date.now()-90*86400000).toISOString().slice(0,10)),
   env.DB.prepare('DELETE FROM survey_responses WHERE expires_at<=?').bind(new Date().toISOString()),
   env.DB.prepare('DELETE FROM rate_limits WHERE expires_at<=?').bind(Date.now()),
  ]);ctx.waitUntil(cleanup);await cleanup;
 }
};
