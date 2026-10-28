import { chromium } from '/Users/roman/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const base = process.argv[2] || 'http://127.0.0.1:4177';
const results=[];
for (const path of ['/', '/cities/lviv/', '/routes/lviv-hannover/', '/guides/perevezennya-velosypeda/']) {
 for (let run=1;run<=3;run++) {
  const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--disable-background-networking']});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,serviceWorkers:'block'});
  let blocked=0;
  await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin===base) return route.continue();blocked++;return route.abort();});
  await context.addInitScript(()=>{window.__lab={lcp:[],shifts:[]};new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lab.lcp.push({startTime:e.startTime,size:e.size,element:e.element?.tagName,src:e.url||null}))).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.__lab.shifts.push({startTime:e.startTime,value:e.value,sources:e.sources?.map(s=>s.node?.tagName)});})).observe({type:'layout-shift',buffered:true});});
  const page=await context.newPage(); const cdp=await context.newCDPSession(page);
  await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1600000/8,uploadThroughput:750000/8}); await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  const response=await page.goto(base+path,{waitUntil:'load',timeout:60000}); await page.waitForTimeout(5000);
  const data=await page.evaluate(()=>{let max=0,sum=0,first=0,last=0;for(const s of window.__lab.shifts){if(!sum||s.startTime-last>1000||s.startTime-first>5000){sum=s.value;first=s.startTime;}else sum+=s.value;last=s.startTime;max=Math.max(max,sum);} const nav=performance.getEntriesByType('navigation')[0];return {lcp:window.__lab.lcp.at(-1)||null,cls:max,shifts:window.__lab.shifts,resources:performance.getEntriesByType('resource').map(x=>({name:new URL(x.name).pathname,type:x.initiatorType,transferSize:x.transferSize,duration:x.duration})),navigation:{domContentLoaded:nav.domContentLoadedEventEnd,load:nav.loadEventEnd,transferSize:nav.transferSize}};});
  results.push({path,run,status:response.status(),blocked,...data}); console.log(JSON.stringify({path,run,status:response.status(),blocked,lcp:data.lcp?.startTime,cls:data.cls})); await browser.close();
 }
}
fs.writeFileSync(process.argv[3]||'results.json',JSON.stringify({settings:{chrome:chromium.name(),viewport:'390x844',deviceScaleFactor:1,mobile:true,touch:true,cpu:4,network:'150ms RTT, 1.6Mbps down, 0.75Mbps up, CDP applied',consent:'fresh context; no interaction',observation:'load plus 5s',cache:'fresh browser and context each run',external:'all non-local origins aborted'},results},null,2));
