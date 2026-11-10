const portal='https://acata-workshop-api.acata-2026-workshop.workers.dev';
const hash=location.hash;
const destination=hash==='#survey'?portal+'/research':hash==='#dashboard'?portal+'/access#admin':portal+'/access'+(['#login','#register','#account','#admin'].includes(hash)?hash:'');
const link=document.querySelector('#portal-link');if(link)link.href=destination;
let saved=null;const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
try{saved=localStorage.getItem('acata.workspace.v1');}catch{}
const stages=['pre','post','followup'];
const research={type:'acata-research-browser-backup-v1',studyCode:read('acata.study.code',''),drafts:read('acata.survey.draft.v1',{}),receipts:Object.fromEntries(stages.map(stage=>[stage,read('acata.survey.receipt.'+stage,null)])),pending:Object.fromEntries(stages.map(stage=>[stage,read('acata.survey.pending.'+stage,null)]))};
const hasResearch=Boolean(research.studyCode||Object.keys(research.drafts).length||Object.values(research.receipts).some(Boolean)||Object.values(research.pending).some(Boolean));
function exportFile(name,text){const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
if(saved||hasResearch){
 if(saved&&document.querySelector('#previous-work')){
  document.querySelector('#previous-work').hidden=false;
  document.querySelector('#export-work').addEventListener('click',()=>exportFile('acata-workspace-before-member-portal.json',saved));
 }
 if(hasResearch){
  const section=document.createElement('section'),heading=document.createElement('h2'),description=document.createElement('p'),button=document.createElement('button');
  heading.textContent='Keep your private survey codes and receipts.';
  description.textContent='Export the research records saved in this browser, then use Restore earlier survey records on the new survey page. This preserves pairing and withdrawal codes. The export stays on your device; it is not sent to the server.';
  button.textContent='Export my private survey records';button.addEventListener('click',()=>exportFile('acata-private-survey-records.json',JSON.stringify(research,null,2)));
  section.append(heading,description,button);document.body.append(section);
 }
}else location.replace(destination);
