import fs from 'node:fs';
import crypto from 'node:crypto';
import {chromium} from '/Users/roman/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const base='docs/Marketing/SEO/mitigation-2026-10/design-assets/';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const checks=[];
try {
  for (const file of ['routes/lviv-hannover.html','routes/ivano-frankivsk-wolfsburg.html','hubs/lviv.html','hubs/ivano-frankivsk.html','states.html']) {
    const page=await browser.newPage({viewport:{width:375,height:812}});
    const external=[];
    await page.route('**/*',async r=>{
      if(new URL(r.request().url()).origin==='http://127.0.0.1:4175')await r.continue();
      else {external.push(r.request().url());await r.abort();}
    });
    await page.goto('http://127.0.0.1:4175/'+base+file);
    await page.evaluate(()=>document.fonts.ready);
    checks.push({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(base+file)).digest('hex'),external,...await page.evaluate(()=>{
      const norm=s=>s.replace(/\s+/g,' ').trim();
      return {
        fonts:document.fonts.status,
        inputs:[...document.querySelectorAll('input,select')].map(e=>{const s=getComputedStyle(e);const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');ctx.font=s.font;return {tag:e.tagName,border:s.borderColor,background:s.backgroundColor,borderWidth:s.borderWidth,width:e.getBoundingClientRect().width,font:s.font,selected:e.tagName==='SELECT'?e.selectedOptions[0]?.textContent:null,text_width:e.tagName==='SELECT'?ctx.measureText(e.selectedOptions[0]?.textContent||'').width:null,padding_left:s.paddingLeft,padding_right:s.paddingRight};}),
        search:[...document.querySelectorAll('button')].filter(e=>norm(e.textContent)==='Знайти маршрут').map(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,height:e.getBoundingClientRect().height})),
        images:[...document.images].map(e=>({alt:e.alt,loaded:e.complete&&e.naturalWidth>0,src:e.getAttribute('src'),aspect:getComputedStyle(e).aspectRatio,fit:getComputedStyle(e).objectFit,position:getComputedStyle(e).objectPosition})),
      };
    })});
    await page.close();
  }
} finally {await browser.close();}
const output={method:'Independent isolated headless Chrome; external requests blocked before navigation; fonts.ready;375x812',css_sha256:crypto.createHash('sha256').update(fs.readFileSync(base+'board.css')).digest('hex'),checks};
fs.writeFileSync('ops/evidence/seo-mitigation-execution-2026-10-28/design-review/rendered-spot-check.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
