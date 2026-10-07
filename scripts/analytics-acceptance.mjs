import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative, extname, join } from 'node:path';
import { createHash } from 'node:crypto';

// Owned static-export QA. Fresh browser contexts; no extensions or passenger sends.
// Preview credentials are read only from a private temporary file, never reported.
const root = resolve(process.env.UAROUTE_OUT_DIR ?? 'out');
const output = resolve(process.env.ANALYTICS_QA_OUTPUT_DIR ?? 'output/analytics-acceptance');
const origin = 'https://uaroute.test';
const preview = JSON.parse(readFileSync(process.env.GTM_QA_PREVIEW_FILE, 'utf8'));
if (!preview.auth || !/^env-\d+$/.test(preview.preview)) throw new Error('Missing private preview context');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH ?? 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const userAgent = process.env.ANALYTICS_QA_STANDARD_UA === '1' ? `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browser.version()} Safari/537.36` : undefined;
const report = { userAgentMode: userAgent ? 'standard-chrome-qa' : 'default-headless', mode: 'clean-profile-real-gtm-draft', environment: preview.preview, startedAt: new Date().toISOString(), scenarios: [], runtimeErrors: [], draftScriptHashes: [], productionChanged: false };
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.txt':'text/x-component', '.woff2':'font/woff2', '.webp':'image/webp', '.svg':'image/svg+xml', '.ico':'image/x-icon' };
const google = host => /(^|\.)(googletagmanager\.com|google-analytics\.com|analytics\.google\.com|googleadservices\.com|doubleclick\.net)$/.test(host);
const ensure = (value, message) => { if (!value) throw new Error(message); };
const redact = value => String(value).replaceAll(preview.auth, '[preview-redacted]').replace(/https?:\/\/[^\s)]+/g, '[url-redacted]');
mkdirSync(output, { recursive: true });
let activeEvidence;
async function scenario(name, fn) {
  const result = { name, passed: false, evidence: {} };
  activeEvidence=result.evidence;
  try { await fn(result.evidence); result.passed = true; }
  catch (error) { result.error = redact(error.message); }
  report.scenarios.push(result);
  writeFileSync(join(output,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({ name, passed: result.passed, error: result.error }));
}
function decode(value) { for(let n=0;n<3;n++){try {const next=decodeURIComponent(value);if(next===value)break;value=next;}catch{break;}}return value; }
async function setup(blocked = false) {
  const ctx = await browser.newContext({ locale:'uk-UA', viewport:{width:1440,height:1000}, serviceWorkers:'block', ...(userAgent ? { userAgent } : {}) });
  ctx.setDefaultTimeout(12000);
  const requests=[], consent=[];const requestRows=new WeakMap();
  activeEvidence.requests=requests;activeEvidence.consent=consent;
  await ctx.exposeBinding('__qaConsent',(_source,value)=>consent.push(value));
  await ctx.addInitScript(()=>{
    window.__qaOpened=[];
    window.open=url=>{window.__qaOpened.push(String(url));return null;};
    document.addEventListener('click',event=>{const anchor=event.target.closest?.('a');if(anchor&&/^https?:/.test(anchor.href)&&!anchor.href.startsWith(location.origin))event.preventDefault();},true);
    window.addEventListener('uaroute:analytics-consent',()=>window.__qaConsent({accepted:window.__uarouteAnalyticsConsent===true,time:Date.now()}));
  });
  ctx.on('request',request=>{
    const url=new URL(request.url());
    if(url.origin===origin)return;
    const text=request.postData() ?? '';
    const chunks=text ? text.split('\n') : [''];const captured=[];
    for(const chunk of chunks){
      const params=new URLSearchParams(url.search);
      for(const [key,value] of new URLSearchParams(chunk.replace(/\r$/, '')))params.set(key,value);
      const inspected=decode(url.href+' '+text+' '+(request.headers().referer??''));
      const sensitive=/QA_PRIVATE_CANARY|48700000123|2099-12-24|24\.12\.2099|UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,16}/.test(inspected);
      const fields=Object.fromEntries([...params].filter(([key])=>key.startsWith('ep.')||key.startsWith('epn.')));
      const row={time:Date.now(),host:url.hostname,path:url.pathname,google:google(url.hostname),method:request.method(),event:params.get('en'),measurementId:params.get('tid'),page:params.get('dl'),referrer:params.get('dr'),gcs:params.get('gcs'),nonPersonalizedAds:params.get('npa'),fields,sensitive,status:null};requests.push(row);captured.push(row);
    }
    requestRows.set(request,captured);
  });
  ctx.on('response',response=>{
    for(const row of requestRows.get(response.request())??[])row.status=response.status();
  });
  await ctx.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin===origin){
      let path=decodeURIComponent(url.pathname).replace(/^\/+/, '');
      if(!path||path.endsWith('/'))path+=(url.searchParams.has('_rsc')||request.headers().rsc==='1')?'index.txt':'index.html';
      const file=resolve(root,path);
      if(relative(root,file).startsWith('..')||!existsSync(file)){await route.fulfill({status:404,body:'Missing static export'});return;}
      await route.fulfill({contentType:mime[extname(file)]??'application/octet-stream',body:readFileSync(file)});return;
    }
    if(blocked||!google(url.hostname)){await route.abort('blockedbyclient');return;}
    if(url.hostname==='www.googletagmanager.com'&&url.pathname==='/gtm.js'&&!url.searchParams.has('gtm_auth')){
      url.searchParams.set('gtm_auth',preview.auth);url.searchParams.set('gtm_preview',preview.preview);url.searchParams.set('gtm_cookies_win','x');
      const response=await route.fetch({url:url.href});
      const body=await response.body();
      report.draftScriptHashes.push(createHash('sha256').update(body).digest('hex'));
      await route.fulfill({response,body});return;
    }
    await route.continue();
  });
  const page=await ctx.newPage();
  page.on('pageerror',error=>report.runtimeErrors.push(redact(error.message)));
  return {ctx,page,requests,consent};
}
const load=(page,path='/')=>page.goto(origin+path,{waitUntil:'networkidle'});
async function accept(page){await page.getByRole('button',{name:'Дозволити аналітику',exact:true}).click();await page.waitForFunction(()=>window.__uarouteAnalyticsProviderReady===true,{},{timeout:20000});}
const collects=requests=>requests.filter(row=>row.google&&row.path.endsWith('/collect'));
const events=requests=>collects(requests).filter(row=>row.event);
async function waitForHits(requests, predicate){const deadline=Date.now()+15000;while(Date.now()<deadline){const rows=events(requests);if(predicate(rows)&&rows.every(row=>row.status>=200&&row.status<300))return;await new Promise(resolve=>setTimeout(resolve,200));}throw new Error('Expected actual Google hits did not arrive');}
async function settled(page){await page.waitForLoadState('networkidle');await page.waitForTimeout(1200);}
function cleanPayload(requests){ensure(!requests.some(row=>row.google&&row.sensitive),'Synthetic private data leaked to Google');for(const row of events(requests)){ensure(row.measurementId==='G-PMXHF9YT7V','Wrong Google measurement destination');ensure(row.gcs==='G101','Unexpected analytics/ads storage state');ensure(row.nonPersonalizedAds==='1','Advertising personalization not disabled');ensure(row.status>=200&&row.status<300,'Google request was not accepted');ensure(row.page?.startsWith('https://uaroute.com/'),'Noncanonical page location');ensure(!/[?#]/.test(row.page),'Raw page query/hash');ensure(row.referrer==='', 'Raw referrer');ensure(!Object.keys(row.fields).some(key=>/phone|date|message|leadId|request|href/i.test(key)), 'Private field in Google event');}}
try {
  await scenario('clean browser: unknown, refusal, reload and navigation',async evidence=>{
    const {ctx,page,requests}=await setup();
    await load(page,'/routes/celle-lviv/?phone=QA_PRIVATE_CANARY#QA_PRIVATE_CANARY');
    ensure(requests.length===0,'Unknown choice made an external request');
    await page.getByRole('button',{name:'Без аналітики',exact:true}).click();
    await page.reload({waitUntil:'networkidle'});
    await page.getByRole('link',{name:'Маршрути',exact:true}).first().click();await page.waitForURL('**/routes/');await settled(page);
    ensure(requests.length===0,'Refusal/reload/navigation made an external request');
    ensure((await ctx.cookies()).length===0,'Cookies before consent');
    evidence.externalRequestAttempts=0;evidence.cookieNames=[];await ctx.close();
  });
  await scenario('real draft: acceptance, withdrawal through unload and refused reload',async evidence=>{
    const {ctx,page,requests,consent}=await setup();
    await load(page,'/routes/celle-lviv/');await accept(page);await settled(page);
    await waitForHits(requests,rows=>rows.some(row=>row.event==='page_view')&&rows.some(row=>row.event==='route_view'));
    const before=(await ctx.cookies()).map(cookie=>cookie.name);ensure(before.includes('_ga')&&before.includes('_ga_PMXHF9YT7V'),'Actual GA4 cookies missing');
    await page.getByRole('button',{name:'Вимкнути аналітику',exact:true}).click();await page.waitForFunction(()=>window.__uarouteAnalyticsConsent===false);await settled(page);
    const grantIndex=consent.findLastIndex(row=>row.accepted);const denial=consent.slice(grantIndex+1).find(row=>!row.accepted)?.time;ensure(denial,'Denial timestamp missing');
    const after=(await ctx.cookies()).map(cookie=>cookie.name);ensure(!after.some(name=>/^_ga(?:_|$)/.test(name)),'GA4 cookies remain');
    ensure(!requests.some(row=>row.google&&row.time>=denial),'New Google request after withdrawal');evidence.googleRequestsAfterWithdrawal=0;
    const count=requests.length;await page.reload({waitUntil:'networkidle'});await settled(page);ensure(requests.length===count,'Provider reloaded after refusal');
    cleanPayload(requests);evidence.cookieNamesBefore=before;evidence.cookieNamesAfter=after;evidence.requests=requests;evidence.consent=consent;await ctx.close();
  });
  for(const blocked of [false,true])await scenario(blocked?'blocked Google: search and inquiry remain usable':'real draft: contact payloads exclude private form data',async evidence=>{
    const {ctx,page,requests}=await setup(blocked);
    await load(page,'/routes/celle-lviv/?phone=QA_PRIVATE_CANARY&uaroute_id=QA_PRIVATE_CANARY#QA_PRIVATE_CANARY');
    if(blocked){await page.getByRole('button',{name:'Дозволити аналітику',exact:true}).click();await settled(page);ensure(await page.evaluate(()=>window.__uarouteAnalyticsProviderReady)!==true,'Blocked provider ready');}else{await accept(page);}
    await page.locator('#inquiry-date').fill('2099-12-24');await page.locator('#inquiry-phone').fill('+48700000123');
    await page.getByRole('button',{name:'Уточнити поїздку в WhatsApp',exact:true}).click();
    ensure(await page.evaluate(()=>window.__qaOpened.length)===1,'Valid inquiry did not prepare WhatsApp');
    await page.getByRole('link',{name:'Сайт Коваль ↗',exact:true}).first().click();await settled(page);
    if(!blocked){await waitForHits(requests,rows=>['booking_intent','whatsapp_click','koval_site_click'].every(event=>rows.some(row=>row.event===event)));for(const event of ['booking_intent','whatsapp_click','koval_site_click'])ensure(events(requests).some(row=>row.event===event),event+' real hit missing');cleanPayload(requests);}else ensure(collects(requests).length===0,'Blocked provider sent collection');
    await page.getByRole('link',{name:'Маршрути',exact:true}).first().click();await page.waitForURL('**/routes/');
    await page.getByRole('button',{name:'До України',exact:true}).click();
    await page.getByRole('combobox',{name:'Українське місто',exact:true}).selectOption('lviv');await page.getByRole('combobox',{name:'Місто в Німеччині',exact:true}).selectOption('celle');
    await page.getByRole('button',{name:'Знайти маршрут',exact:true}).click();await page.waitForURL('**/routes/celle-lviv/');await settled(page);
    evidence.preparedInquiries=1;evidence.actualPartnerOrWhatsAppRequests=requests.filter(row=>!row.google).length;evidence.requests=requests;ensure(evidence.actualPartnerOrWhatsAppRequests===0,'External passenger navigation escaped');
    if(blocked)await page.screenshot({path:join(output,'blocked-google-business-flow.png'),fullPage:false});await ctx.close();
  });
  await scenario('real draft: mobile, partner and footer contact placements',async evidence=>{
    const {ctx,page,requests}=await setup();await load(page,'/routes/celle-lviv/');await accept(page);await settled(page);
    await page.locator('#inquiry-date').fill('2099-12-24');await page.locator('#inquiry-phone').fill('+48700000123');await page.locator('h1').click();
    await page.setViewportSize({width:375,height:812});await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
    await page.getByRole('button',{name:'Уточнити поїздку',exact:true}).click();
    await page.getByRole('link',{name:'Сайт Коваль ↗',exact:true}).nth(1).click();
    await page.getByRole('link',{name:'Сайт перевізника Коваль ↗',exact:true}).click();await settled(page);
    await waitForHits(requests,rows=>rows.some(row=>row.event==='whatsapp_click'&&row.fields['ep.ctaLocation']==='sticky_mobile')&&['partner_card','footer'].every(placement=>rows.some(row=>row.event==='koval_site_click'&&row.fields['ep.ctaLocation']===placement)));
    cleanPayload(requests);ensure(await page.evaluate(()=>window.__qaOpened.length)===1,'Mobile inquiry not prepared');ensure(requests.every(row=>row.google),'External navigation escaped');
    evidence.placements=['sticky_mobile','partner_card','footer'];await ctx.close();
  });
  await scenario('real draft: missing-page inquiry payload and zero-result context',async evidence=>{
    const {ctx,page,requests}=await setup();await load(page,'/?phone=QA_PRIVATE_CANARY#QA_PRIVATE_CANARY');await accept(page);
    await page.getByRole('combobox',{name:'Українське місто',exact:true}).selectOption('lviv');await page.getByRole('combobox',{name:'Місто в Німеччині',exact:true}).selectOption('luebeck');await page.getByRole('button',{name:'Знайти маршрут',exact:true}).click();
    const form=page.locator('section[aria-labelledby$="-candidate-inquiry-title"]');await form.waitFor();
    await form.getByLabel('Бажана дата поїздки',{exact:true}).fill('2099-12-24');await form.getByLabel('Телефон для зв’язку',{exact:true}).fill('+48700000123');await form.getByRole('button',{name:'Уточнити поїздку в WhatsApp',exact:true}).click();await form.getByRole('link',{name:'Перейдіть на сайт Коваль',exact:true}).click();await settled(page);
    await waitForHits(requests,rows=>['route_search_completed','booking_intent','whatsapp_click','koval_site_click'].every(event=>rows.some(row=>row.event===event)));
    cleanPayload(requests);const search=events(requests).find(row=>row.event==='route_search_completed');ensure(search.fields['epn.resultCount']==='0'||search.fields['ep.resultCount']==='0','Zero-result field missing');ensure(!search.fields['ep.matchedRouteId']&&!search.fields['ep.routeId'],'Missing page inherited route');
    ensure(await page.evaluate(()=>window.__qaOpened.length)===1,'Fallback inquiry not prepared');ensure(requests.every(row=>row.google),'External navigation escaped');evidence.pageMatchResult=0;evidence.preparedInquiries=1;await ctx.close();
  });
  await scenario('real draft: SPA forward, back, return and sparse event reset',async evidence=>{
    const {ctx,page,requests}=await setup();await load(page,'/routes/celle-lviv/');await accept(page);await settled(page);
    await page.getByRole('link',{name:'Маршрути',exact:true}).first().click();await page.waitForURL('**/routes/');await settled(page);
    await page.getByRole('button',{name:'До Німеччини',exact:true}).click();await page.getByRole('combobox',{name:'Українське місто',exact:true}).selectOption('lviv');await page.getByRole('combobox',{name:'Місто в Німеччині',exact:true}).selectOption('celle');await page.getByRole('button',{name:'Знайти маршрут',exact:true}).click();await page.waitForURL('**/routes/lviv-celle/');await settled(page);
    await page.goBack();await page.waitForURL('**/routes/');await settled(page);await page.goForward();await page.waitForURL('**/routes/lviv-celle/');await settled(page);
    await waitForHits(requests,rows=>rows.filter(row=>row.event==='page_view').length>=5&&rows.filter(row=>row.event==='route_view').length>=3);const eventRows=events(requests);const views=eventRows.filter(row=>row.event==='page_view').map(row=>row.page);const routes=eventRows.filter(row=>row.event==='route_view').map(row=>row.fields['ep.routeId']);
    ensure(JSON.stringify(views)===JSON.stringify(['/routes/celle-lviv/','/routes/','/routes/lviv-celle/','/routes/','/routes/lviv-celle/'].map(path=>'https://uaroute.com'+path)),'Duplicate or missing SPA page views');ensure(JSON.stringify(routes)===JSON.stringify(['celle-lviv','lviv-celle','lviv-celle']),'Duplicate/missing route arrivals');
    const search=eventRows.find(row=>row.event==='route_search_completed');ensure(search&&!search.fields['ep.routeId']&&!search.fields['ep.routeStatus'],'Sparse search inherited route context');
    ensure(search.fields['epn.resultCount']==='1'||search.fields['ep.resultCount']==='1','Search page-match result missing');cleanPayload(requests);evidence.pageViews=views;evidence.routeViews=routes;evidence.requests=requests;await ctx.close();
  });
} finally {await browser.close();report.finishedAt=new Date().toISOString();report.draftScriptHashes=[...new Set(report.draftScriptHashes)];writeFileSync(join(output,'report.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify({scenarios:report.scenarios.map(({name,passed,error})=>({name,passed,error})),runtimeErrors:report.runtimeErrors,productionChanged:false},null,2));
if(report.scenarios.some(row=>!row.passed)||report.runtimeErrors.length)process.exitCode=1;
