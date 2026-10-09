import test from 'node:test';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import yaml from 'js-yaml';
import {validatePrefix,objectMetadata,target,recoveryBucket,verifyRestoredLive,inspectEdgeRuntimeCase,assertEdgeRuntimeResults,baseEdgeRuntimeCases,edgeRuntimeCases} from './production-release.mjs';
test('release targets and recovery selectors exclude other resources and shell/path injection',()=>{
 assert.equal(target.bucket,'uaroute.com');assert.equal(target.distribution,'E3L95CZFIU6533');assert.match(recoveryBucket,/^uaroute-recovery-/);assert.equal(validatePrefix('releases/123-1'),'releases/123-1');for(const bad of ['../objects','releases/123/../1','releases/123-1; echo x','releases/abc-1','s3://other/x'])assert.throws(()=>validatePrefix(bad));
});
test('restore preserves relevant S3 metadata without replaying AWS response fields',()=>{
 assert.deepEqual(objectMetadata({ContentType:'text/html',CacheControl:'no-cache',Metadata:{source:'site'},ETag:'private',LastModified:'now',ContentLength:4}),{ContentType:'text/html',CacheControl:'no-cache',Metadata:{source:'site'}});
});
test('production workflows enforce manual main-only promotion and a shared noncancelable lock',async()=>{
 for(const filename of ['deploy-production.yml','rollback-production.yml']){const data=yaml.load(await readFile(`.github/workflows/${filename}`,'utf8'));assert.ok(data.on.workflow_dispatch);assert.equal(data.concurrency.group,'uaroute-production-writer');assert.equal(data.concurrency['cancel-in-progress'],false);const job=Object.values(data.jobs)[0];assert.equal(job.if,"github.ref == 'refs/heads/main'");assert.equal(job.environment,'production');for(const step of job.steps.filter(s=>s.uses))assert.match(step.uses,/@[a-f0-9]{40}$/);assert.equal(job.permissions['id-token'],'write');assert.ok(!job.steps.some(s=>s.run?.includes('npm run build')));}
});
test('edge acceptance parses only strict CloudFront response/request envelopes and preserves routing expectations',()=>{
 const pass=(testCase,FunctionOutput,extra={})=>inspectEdgeRuntimeCase(testCase,{TestResult:{FunctionOutput:JSON.stringify(FunctionOutput),ComputeUtilization:'17',...extra}});
 const redirect=edgeRuntimeCases[0];let result=pass(redirect,{response:{statusCode:308,headers:{location:{value:'https://uaroute.com/about/?utm_source=uaroute'}}}});assert.equal(result.passed,true);assert.equal(result.outputKind,'response');assert.deepEqual(result.envelopeKeys,['response']);assert.equal(result.parseError,false);assert.equal(result.functionErrorPresent,false);assert.equal(result.actual.location,'https://uaroute.com/about/?utm_source=uaroute');assert.deepEqual(result.input.queryKeys,['utm_source']);assert.equal(Object.hasOwn(result.input,'querystring'),false);assert.equal(result.computeUtilization,17);
 const unchanged=edgeRuntimeCases[1];result=pass(unchanged,{request:{method:'GET',uri:'/referral-contract.json',querystring:{},headers:{}}});assert.equal(result.passed,true);assert.equal(result.actual.uri,'/referral-contract.json');
 assert.equal(baseEdgeRuntimeCases.length,4);assert.deepEqual(edgeRuntimeCases.slice(0,baseEdgeRuntimeCases.length),baseEdgeRuntimeCases);assert.ok(baseEdgeRuntimeCases.every(c=>!c.uri.includes('celle')&&!c.uri.includes('stryi')));assert.equal(edgeRuntimeCases.length,10);const celleGet=edgeRuntimeCases[4],celleHead=edgeRuntimeCases[5],celleRsc=edgeRuntimeCases[6],celleSlash=edgeRuntimeCases[7],stryiHub=edgeRuntimeCases[8],stryiRoute=edgeRuntimeCases[9];
 assert.equal(pass(celleGet,{request:{uri:'/cities/celle/index.html'}}).passed,true);assert.equal(pass(celleHead,{request:{uri:'/cities/celle/index.html'}}).passed,true);result=pass(celleRsc,{request:{uri:'/cities/celle/index.txt'}});assert.equal(result.passed,true);assert.equal(result.input.method,'GET');assert.deepEqual(result.input.headerKeys,['rsc']);
 result=pass(celleSlash,{response:{statusCode:308,headers:{location:{value:'https://uaroute.com/cities/celle/?utm_source=uaroute'}}}});assert.equal(result.passed,true);assert.deepEqual(result.input.queryKeys,['utm_source']);assert.equal(pass(stryiHub,{response:{statusCode:404,headers:{}}}).passed,true);assert.equal(pass(stryiRoute,{response:{statusCode:404,headers:{}}}).passed,true);
 const wrongStatus=pass(redirect,{response:{statusCode:302,headers:{location:{value:'https://uaroute.com/about/?utm_source=uaroute'}}}});assert.equal(wrongStatus.passed,false);const wrongLocation=pass(redirect,{response:{statusCode:308,headers:{location:{value:'https://uaroute.com/about/'}}}});assert.equal(wrongLocation.passed,false);const wrongUri=pass(unchanged,{request:{method:'GET',uri:'/about/',querystring:{},headers:{}}});assert.equal(wrongUri.passed,false);
 for(const FunctionOutput of [{response:{headers:{}}},{response:{statusCode:308,headers:{}},request:{uri:'/contacts'}},{response:{statusCode:'308',headers:{location:{value:'https://uaroute.com/about/?utm_source=uaroute'}}}},{statusCode:308,headers:{location:{value:'https://uaroute.com/about/?utm_source=uaroute'}}}])assert.equal(pass(redirect,FunctionOutput).passed,false);
 const invalidJson=inspectEdgeRuntimeCase(redirect,{TestResult:{FunctionOutput:'{'}});assert.equal(invalidJson.passed,false);assert.equal(invalidJson.parseError,true);assert.deepEqual(invalidJson.envelopeKeys,[]);
 const flatOutput=inspectEdgeRuntimeCase(redirect,{TestResult:{FunctionOutput:JSON.stringify({statusCode:308,headers:{location:{value:'https://uaroute.com/about/?utm_source=uaroute'}}})}});assert.equal(flatOutput.passed,false);assert.deepEqual(flatOutput.envelopeKeys,['headers','statusCode']);
 const runtimeError=pass(redirect,{response:{statusCode:308,headers:{location:{value:'https://uaroute.com/about/?utm_source=uaroute'}}}},{FunctionErrorMessage:'failure details must not be retained'});assert.equal(runtimeError.passed,false);assert.equal(runtimeError.error,'runtime-error');assert.equal(runtimeError.functionErrorPresent,true);assert.ok(!JSON.stringify(runtimeError).includes('failure details'));
 const failed=[wrongStatus];assert.throws(()=>assertEdgeRuntimeResults(failed),/cases 0/);assert.equal(assertEdgeRuntimeResults([result]),true);
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
