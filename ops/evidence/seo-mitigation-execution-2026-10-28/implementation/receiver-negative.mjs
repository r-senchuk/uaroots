import {chromium} from '/Users/roman/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=path.resolve(process.env.KOVAL_DIST_PATH),output=path.resolve(process.env.RECEIVER_NEGATIVE_OUTPUT);fs.mkdirSync(output,{recursive:true});
const report={scope:'fresh-context compiled local receiver negative fixtures; no receiver edits',checks:[],runtimeErrors:[],blockedHandoffs:0,blockedOther:0,realMessagesSent:0,sourceAndCodePolicy:'invalid source is not attributed; malformed original code is not retained; existing safe-code regeneration remains allowed'};
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});report.browser=browser.version();
for(const specimen of [{name:'invalid source with otherwise valid code',source:'other',code:'UR-ABCDEFGHJK'},{name:'malformed original code with valid source',source:'uaroute',code:'invalid-code'}]){
 const context=await browser.newContext({locale:'uk-UA',serviceWorkers:'block'});let message='';
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='www.4k-koval.com'){if(u.hostname==='wa.me'){message=u.searchParams.get('text')??'';report.blockedHandoffs++;}else report.blockedOther++;return route.abort();}let key=decodeURIComponent(u.pathname).replace(/^\/+/, '');if(!key||!path.extname(key))key=key.replace(/\/$/,'')+(key?'/':'')+'index.html';const file=path.resolve(root,key);if(!file.startsWith(root+'/')||!fs.existsSync(file))return route.fulfill({status:404,body:''});return route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp'})[path.extname(file)]??'application/octet-stream'});});
 const page=await context.newPage();page.on('pageerror',e=>report.runtimeErrors.push(e.message));
 try{
  const query=new URLSearchParams({utm_source:specimen.source,utm_medium:'referral',utm_campaign:'koval_poc',utm_content:'lviv-celle_hero',ref_code:specimen.code,origin_city_id:'lviv',destination_city_id:'celle'});
  await page.goto('https://www.4k-koval.com/?'+query,{waitUntil:'networkidle'});
  await page.getByLabel('Місто відправлення').fill('Львів');await page.getByLabel('Місто прибуття').fill('Целле');await page.getByLabel('Дата поїздки').fill('2030-12-31');await page.getByLabel('Контактний телефон').fill('+48111222333');
  const blocked=page.waitForEvent('requestfailed',{predicate:r=>new URL(r.url()).hostname==='wa.me'});await page.locator('form').getByRole('button',{name:/WhatsApp|запит/i}).click({noWaitAfter:true});await blocked;
  assert(message);assert(!message.startsWith(specimen.code+'\nВітаю! Хочу уточнити можливість поїздки:'));assert(!message.includes(specimen.code));
  if(specimen.source!=='uaroute')assert(!/^UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,16}\nВітаю!/u.test(message));
  else {assert(/^UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,16}\nВітаю! Хочу уточнити можливість поїздки:/u.test(message));assert(message.includes('Прошу підтвердити можливість поїздки та її умови.'));}
  report.checks.push({name:specimen.name,passed:true,originalCodeRejected:true,invalidSourceNotAttributed:specimen.source!=='uaroute',safeRegenerationObserved:specimen.source==='uaroute'});
 }catch(e){report.checks.push({name:specimen.name,passed:false,error:e.message.replace(/https?:\/\/[^\s]+/g,'[url]').replace(/UR-[A-Z0-9]+/g,'[code]')});}finally{message='';await context.close();}
}
await browser.close();report.passed=report.checks.every(c=>c.passed)&&!report.runtimeErrors.length;report.cleanup='all contexts and browser closed';fs.writeFileSync(output+'/results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exitCode=report.passed?0:1;
