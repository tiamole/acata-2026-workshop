import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {createServer} from '../scripts/serve.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:process.platform==='win32'?{executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}:{})});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1100}});const page=await context.newPage();const reports=[];
 for(const route of ['home','module/blueprint','module/review','resources','workspace','survey','privacy']){
  await page.goto(base+'/#'+route);await page.locator('#view h1').waitFor();
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  reports.push({route,violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
 }
 await mkdir('artifacts',{recursive:true});await writeFile('artifacts/accessibility.json',JSON.stringify(reports,null,2));
 const failed=reports.filter(r=>r.violations.length);for(const r of failed)console.log(r.route,JSON.stringify(r.violations.map(v=>({id:v.id,count:v.nodes.length,first:v.nodes[0]}))));
 if(failed.length)process.exitCode=1;else console.log('No automated WCAG A/AA violations across seven representative pages. Manual review is still needed for full conformance.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
