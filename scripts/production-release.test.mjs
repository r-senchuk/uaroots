import test from 'node:test';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import yaml from 'js-yaml';
import {validatePrefix,objectMetadata,target,recoveryBucket,verifyRestoredLive} from './production-release.mjs';
test('release targets and recovery selectors exclude other resources and shell/path injection',()=>{
 assert.equal(target.bucket,'uaroute.com');assert.equal(target.distribution,'E3L95CZFIU6533');assert.match(recoveryBucket,/^uaroute-recovery-/);assert.equal(validatePrefix('releases/123-1'),'releases/123-1');for(const bad of ['../objects','releases/123/../1','releases/123-1; echo x','releases/abc-1','s3://other/x'])assert.throws(()=>validatePrefix(bad));
});
test('restore preserves relevant S3 metadata without replaying AWS response fields',()=>{
 assert.deepEqual(objectMetadata({ContentType:'text/html',CacheControl:'no-cache',Metadata:{source:'site'},ETag:'private',LastModified:'now',ContentLength:4}),{ContentType:'text/html',CacheControl:'no-cache',Metadata:{source:'site'}});
});
test('production workflows enforce manual main-only promotion and a shared noncancelable lock',async()=>{
 for(const filename of ['deploy-production.yml','rollback-production.yml']){const data=yaml.load(await readFile(`.github/workflows/${filename}`,'utf8'));assert.ok(data.on.workflow_dispatch);assert.equal(data.concurrency.group,'uaroute-production-writer');assert.equal(data.concurrency['cancel-in-progress'],false);const job=Object.values(data.jobs)[0];assert.equal(job.if,"github.ref == 'refs/heads/main'");assert.equal(job.environment,'production');for(const step of job.steps.filter(s=>s.uses))assert.match(step.uses,/@[a-f0-9]{40}$/);assert.equal(job.permissions['id-token'],'write');assert.ok(!job.steps.some(s=>s.run?.includes('npm run build')));}
});
test('OIDC policy uses exact production subject and no site deletes or IAM administration',async()=>{
 const trust=JSON.parse(await readFile('infra/github-actions/trust.json','utf8'));assert.equal(trust.Statement[0].Condition.StringEquals['token.actions.githubusercontent.com:sub'],'repo:r-senchuk/uaroots:environment:production');const p=JSON.parse(await readFile('infra/github-actions/policy.json','utf8'));for(const s of p.Statement){for(const a of [s.Action].flat())assert.ok(!/Delete|iam:|\*/.test(a));if(s.Resource==='*')assert.equal(s.Action,'cloudfront:ListDistributions');}assert.ok(!JSON.stringify(p).includes('4k-koval'));assert.ok(!JSON.stringify(p).includes('UpdateDistribution'));
});

test('rollback acceptance rejects stale CDN bytes, wrong MIME and broken redirects',async()=>{
 const previous=globalThis.fetch;
 const bodies={'/':'home','/sitemap.xml':'xml','/referral-contract.json':'json'};
 const types={'/':'text/html','/sitemap.xml':'application/xml','/referral-contract.json':'application/json'};
 const m={objects:Object.entries(bodies).map(([url,body])=>({key:url==='/'?'index.html':url.slice(1),sha256:createHash('sha256').update(body).digest('hex')}))};
 let failure;
 globalThis.fetch=async url=>{const u=new URL(url);if(u.pathname==='/contacts')return new Response(null,{status:308,headers:{location:failure==='redirect'?'https://other.example/':'https://uaroute.com/about/?utm_source=uaroute'}});if(u.pathname==='/provider/unknown')return new Response(null,{status:404});return new Response(failure==='bytes'?'stale':bodies[u.pathname],{status:200,headers:{'content-type':failure==='mime'?'text/plain':types[u.pathname]}});};
 try{assert.equal((await verifyRestoredLive(m)).results.length,5);for(failure of ['bytes','mime','redirect'])await assert.rejects(()=>verifyRestoredLive(m),/restored .* mismatch/);}finally{globalThis.fetch=previous;}
});
