import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {createServer} from '../scripts/serve.mjs';
import worker from '../backend/worker.js';
import {database} from './d1.mjs';
const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:process.platform==='win32'?{executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}:{})});
const failures=[];
try{
 await mkdir('artifacts',{recursive:true});
 const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage();
 await context.route('**/config.js',route=>route.fulfill({contentType:'text/javascript',body:"export const config={apiBase:'',repository:'https://github.com/tiamole/acata-2026-workshop'};"}));
 page.on('pageerror',err=>failures.push(err.message));
 page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('favicon'))failures.push(message.text());});
 await page.goto(base);await page.getByRole('heading',{name:'Better items. Stronger evidence.'}).waitFor();
 await page.screenshot({path:'artifacts/overview-desktop.png',fullPage:true});
 await page.locator('a[href="#module/blueprint"]').first().click();
 await page.locator('[data-field="blueprint:construct"]').fill('Apply Ohm’s law in a simple direct-current circuit.');
 for(const box of await page.locator('[data-check]').all())await box.check();
 await page.reload();assert.equal(await page.locator('[data-field="blueprint:construct"]').inputValue(),'Apply Ohm’s law in a simple direct-current circuit.');
 assert.equal(await page.locator('[data-check]:checked').count(),4);
 await page.goto(base+'/#workspace');await page.getByRole('heading',{name:'Your work, taking shape.'}).waitFor();assert.ok((await page.locator('body').textContent()).includes('1 of 5 modules complete'));
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export workspace'}).click();const download=await downloadPromise;assert.ok(download.suggestedFilename().startsWith('acata-workspace-'));const backupPath=await download.path();
 await page.goto(base+'/#module/blueprint');await page.locator('[data-field="blueprint:construct"]').fill('Temporary replacement.');await page.goto(base+'/#workspace');page.once('dialog',d=>d.accept());await page.locator('#import-workspace').setInputFiles(backupPath);await page.getByRole('status').filter({hasText:'Workspace restored.'}).waitFor();await page.goto(base+'/#module/blueprint');assert.equal(await page.locator('[data-field="blueprint:construct"]').inputValue(),'Apply Ohm’s law in a simple direct-current circuit.');
 await page.goto(base+'/#module/prompt');await page.getByRole('button',{name:'Build a brief from my blueprint'}).click();assert.ok((await page.locator('[data-field="prompt:brief"]').inputValue()).includes('Apply Ohm’s law'));
 assert.equal(await page.locator('details').count(),10);await page.locator('details').first().locator('summary').click();assert.ok((await page.locator('#prompt-1').textContent()).length>1000);
 await page.goto(base+'/#module/review');assert.equal(await page.locator('[data-rubric$=":rating"]').count(),16);await page.locator('[data-rubric="1:rating"]').selectOption('1');await page.locator('[data-rubric="1:evidence"]').fill('Practice: verify the key independently.');
 await page.goto(base+'/#workspace');await page.evaluate(()=>{window.print=()=>{};});await page.getByRole('button',{name:'Print / save PDF'}).click();assert.ok((await page.locator('#print-report').textContent()).includes('Practice: verify the key independently.'));await page.emulateMedia({media:'print'});await page.pdf({path:'artifacts/workspace-test.pdf',format:'A4'});await page.emulateMedia({media:'screen'});await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 await page.goto(base+'/#resources');await page.getByRole('searchbox').fill('prompt');assert.equal(await page.locator('.resource-card').count(),1);const resourceDownload=page.waitForEvent('download');await page.getByRole('link',{name:'Template'}).click();assert.ok((await resourceDownload).suggestedFilename().endsWith('.docx'));
 await page.goto(base+'/#example');await page.getByRole('button',{name:'B. 3 A',exact:true}).click();assert.ok((await page.locator('#example-feedback').textContent()).includes('Correct.'));
 await page.goto(base+'/#survey');await page.getByRole('button',{name:'Research submission not open'}).waitFor();assert.ok(await page.getByRole('button',{name:'Research submission not open'}).isDisabled());await page.locator('[name="c_blueprint"][value="4"]').check();await page.locator('[name="reflection"]').fill('My private draft.');await page.goto(base+'/#home');await page.goto(base+'/#survey');assert.equal(await page.locator('[name="reflection"]').inputValue(),'My private draft.');await page.screenshot({path:'artifacts/survey-desktop.png',fullPage:true});
 await page.goto(base+'/#dashboard');assert.equal(await page.locator('.metric').count(),0);
 // Responsive navigation and complete route sweep.
 await page.setViewportSize({width:390,height:844});
 for(const route of ['home','learn','resources','workspace','survey','module/blueprint','module/prompt','module/review','module/metadata','module/audit','example','privacy','about','dashboard']){
  await page.goto(base+'/#'+route);await page.locator('#view h1').waitFor();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,'Horizontal page overflow: '+route);
 }
 await page.goto(base);await page.screenshot({path:'artifacts/overview-mobile.png',fullPage:true});
 await context.close();
 // Full browser-to-handler flow against real SQL, with no external data storage.
 const db=database(),env={DB:db,ALLOWED_ORIGIN:base,ADMIN_TOKEN:'a'.repeat(64),RATE_LIMIT_SALT:'r'.repeat(64),ANALYTICS_SALT:'v'.repeat(64),RESEARCH_SALT:'s'.repeat(64),RESEARCH_ENABLED:'true',RESEARCH_RETENTION_DAYS:'30',RESEARCH_CONTACT:'Test coordinator',RESEARCH_APPROVAL:'Test-only review',RESEARCH_CONSENT_VERSION:'test-v1',RESEARCH_CONSENT_TEXT:'Test-only consent information for automated verification. '.repeat(5)};
 const connected=await browser.newContext({viewport:{width:1440,height:1000}}),cp=await connected.newPage();cp.on('pageerror',err=>failures.push(err.message));
 await connected.route('**/config.js',async route=>route.fulfill({contentType:'text/javascript',body:"export const config={apiBase:'https://acata-test.workers.dev',repository:'https://github.com/tiamole/acata-2026-workshop'};"}));
 await connected.route('https://acata-test.workers.dev/**',async route=>{
  const r=route.request(),headers=r.headers(),req=new Request(r.url(),{method:r.method(),headers:{...headers,'CF-Connecting-IP':'192.0.2.99'},body:['GET','HEAD'].includes(r.method())?undefined:r.postData()});Object.defineProperty(req,'cf',{value:{country:'NG'}});const response=await worker.fetch(req,env);await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});
 });
 await cp.goto(base);await cp.getByRole('dialog').waitFor();await cp.getByRole('button',{name:'Allow visit analytics'}).click();
 await cp.goto(base+'/#workspace');await cp.getByRole('button',{name:'Create my recovery code'}).waitFor();await cp.getByRole('button',{name:'Create my recovery code'}).click();await cp.locator('#sync-receipt .receipt').waitFor();const syncCode=await cp.locator('#sync-receipt .receipt').textContent();assert.equal(syncCode.length,64);
 await cp.goto(base+'/#survey');await cp.getByRole('button',{name:'Submit research response',exact:true}).waitFor();await cp.locator('[name="consent"]').check();await cp.locator('[name="c_blueprint"][value="4"]').check();await cp.locator('[name="k1"][value="1"]').check();await cp.getByRole('button',{name:'Submit research response',exact:true}).click();await cp.getByRole('heading',{name:'Your response was received.'}).waitFor();
 await cp.goto(base+'/#dashboard');await cp.locator('#admin-token').fill(env.ADMIN_TOKEN);await cp.getByRole('button',{name:'Open dashboard'}).click();await cp.getByRole('heading',{name:'Visits over time'}).waitFor();assert.equal(await cp.locator('.metric').count(),4);await cp.screenshot({path:'artifacts/dashboard-connected-test.png',fullPage:true});const csvPromise=cp.waitForEvent('download');await cp.getByRole('button',{name:'Export research CSV'}).click();assert.ok((await csvPromise).suggestedFilename().endsWith('.csv'));
 const surveyCount=db.raw.prepare('SELECT COUNT(*) AS n FROM survey_responses').get().n;assert.equal(surveyCount,1);assert.ok(db.raw.prepare('SELECT COUNT(*) AS n FROM visits').get().n>=1);
 await connected.close();db.close();
 assert.deepEqual(failures,[],'Unexpected browser errors');
 console.log('Browser checks passed: local persistence, progress, prompts, rubric, downloads, survey draft gate, 14 responsive routes, optional analytics, cloud workspace, consented submission and private dashboard.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
