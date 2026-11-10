const portal='https://acata-workshop-api.acata-2026-workshop.workers.dev';
const hash=location.hash;
const destination=hash==='#survey'?portal+'/research':hash==='#dashboard'?portal+'/access#admin':portal+'/access'+(['#login','#register','#account','#admin'].includes(hash)?hash:'');
const link=document.querySelector('#portal-link');if(link)link.href=destination;
let saved=null;try{saved=localStorage.getItem('acata.workspace.v1');}catch{}
if(saved&&document.querySelector('#previous-work')){
 document.querySelector('#previous-work').hidden=false;
 document.querySelector('#export-work').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([saved],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='acata-workspace-before-member-portal.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}else location.replace(destination);
