from pathlib import Path
from datetime import datetime, timezone
import hashlib,json,os,re,subprocess

ROOT=Path(__file__).resolve().parents[4]
PUB=ROOT/'ops/evidence/seo-release-preparation-2026-10-28/r3'
PRIV=ROOT/'output/seo-release-preparation-2026-10-28-private/r3'
IMPL=ROOT/'output/seo-mitigation-execution-2026-10-28-private/implementation'
CAND=IMPL/'candidate'
NODE=Path('/Users/roman/.npm/_npx/52027bd8fc0022aa/node_modules/node/bin/node')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,x):p.write_text(json.dumps(x,indent=2,ensure_ascii=False)+'\n')
def tree(p):return {str(x.relative_to(p)): {'size':x.stat().st_size,'sha256':sha(x)} for x in sorted(p.rglob('*')) if x.is_file()}
def preserved():
 return {'root_export':tree(ROOT/'out'),'root_build_id':sha(ROOT/'.next/BUILD_ID') if (ROOT/'.next/BUILD_ID').exists() else None,'root_next_package':sha(ROOT/'node_modules/next/package.json'),'root_lock':sha(ROOT/'package-lock.json'),'root_next_config':sha(ROOT/'next.config.ts'),'candidate_build_id':sha(CAND/'.next/BUILD_ID')}
BEFORE=preserved()
source=json.loads((IMPL/'source-files.json').read_text())
export=json.loads((IMPL/'export-files.json').read_text())
sourcebad={p:expected for p,expected in source.items() if sha(CAND/p)!=expected or sha(ROOT/p)!=expected}
actual=tree(CAND/'out')
exportbad={p:expected for p,expected in export.items() if p not in actual or actual[p]['sha256']!=expected}
assert not sourcebad and not exportbad and sorted(actual)==sorted(export)
config_paths=['.nvmrc','package.json','package-lock.json','next.config.ts','src/config/analytics.ts','scripts/deploy.sh','scripts/seo-release.mjs','scripts/release-bundle.mjs','scripts/production-release.mjs','scripts/recovery-tool.mjs','.github/workflows/ci.yml','.github/workflows/deploy-production.yml','.github/workflows/rollback-production.yml','infra/cloudfront/seo-viewer-request.v1.js','infra/cloudfront/seo-http-acceptance.v1.json']
configs={p:{'root_sha256':sha(ROOT/p),'candidate_sha256':sha(CAND/p),'same':sha(ROOT/p)==sha(CAND/p)} for p in config_paths if (ROOT/p).is_file() and (CAND/p).is_file()}
assert all(x['same'] for x in configs.values())
lock=json.loads((CAND/'package-lock.json').read_text())
runtime={'node':subprocess.check_output([str(NODE),'--version'],text=True).strip(),'node_binary':str(NODE),'node_binary_sha256':sha(NODE),'nvmrc':(CAND/'.nvmrc').read_text().strip()}
for package in ['next','typescript','react','react-dom']:
 installed=json.loads((CAND/f'node_modules/{package}/package.json').read_text())['version']; locked=lock['packages'][f'node_modules/{package}']['version'];assert installed==locked
 runtime[package]={'installed':installed,'locked':locked,'match':True}
analytics=[]
for p in sorted((CAND/'out/_next/static').rglob('*.js')):
 t=p.read_text()
 if 'GTM-WD2F63V5' in t and 'G-PMXHF9YT7V' in t:
  m=re.search(r'function \w+\(\)\{let \w+="G-PMXHF9YT7V",\w+="GTM-WD2F63V5";.{0,400}?enabled:!1\}',t)
  assert m, str(p)
  analytics.append({'path':str(p.relative_to(CAND/'out')),'sha256':sha(p),'compiled_configuration':m.group(0),'enabled':False})
assert len(analytics)==2
manifest=PUB/'release-manifest.json'
env={'PATH':str(NODE.parent)+':/usr/bin:/bin','HOME':os.environ['HOME'],'TMPDIR':str(PRIV),'NEXT_TELEMETRY_DISABLED':'1'}
command=['/bin/bash',str(CAND/'scripts/deploy.sh'),'--dry-run','--manifest',str(manifest)]
run=subprocess.run(command,cwd=PRIV,env=env,text=True,capture_output=True)
(PUB/'dry-run.log').write_text(run.stdout+run.stderr)
(PUB/'dry-run.txt').write_bytes((PUB/'dry-run.log').read_bytes())
assert run.returncode==0,(run.stdout,run.stderr)
m=json.loads(manifest.read_text());assert len(m['files'])==258
assert {f['path']:f['sha256'] for f in m['files']}==export
assert all(f['size']==actual[f['path']]['size'] for f in m['files'])
AFTER=preserved();assert BEFORE==AFTER
receipt={'observed_at_utc':datetime.now(timezone.utc).isoformat(),'status':'ready_with_explicit_unknowns_local_preparation_only','source_manifest_sha256':sha(IMPL/'source-files.json'),'source_files_verified':len(source),'source_mismatches':sourcebad,'export_manifest_sha256':sha(IMPL/'export-files.json'),'export_files_verified':len(export),'export_mismatches':exportbad,'export_extra_files':[],'export_bytes':sum(f['size'] for f in m['files']),'releaseSha256':m['releaseSha256'],'release_manifest_file_sha256':sha(manifest),'edgeSha256':sha(CAND/'infra/cloudfront/seo-viewer-request.v1.js'),'configuration_and_tooling':configs,'runtime':runtime,'compiled_analytics':analytics,'dry_run':{'argv':command,'cwd':str(PRIV),'exit_code':run.returncode,'log_sha256':sha(PUB/'dry-run.log'),'no_aws_calls':'deploy.sh exits after local manifest+plan; minimal PATH, no credentials supplied'},'preservation':{'root_export_before_after_identical':True,'root_build_id_before_after_identical':True,'root_dependencies_package_before_after_identical':True,'root_lock_and_config_before_after_identical':True,'candidate_build_id_before_after_identical':True,'before_after_receipt':'private r3/preservation.json'},'not_performed':['build','dependency installation','credential access','AWS/network capture or mutation','Git writes','workflow dispatch','commit','push','deployment'],'current_recovery_freshness':'unknown; no current capture/retrieval performed','matching_successful_ci_run':'not established for this uncommitted candidate'}
dump(PRIV/'preservation.json',{'before':BEFORE,'after':AFTER})
dump(PUB/'local-receipt.json',receipt)
print(json.dumps({k:receipt[k] for k in ['status','source_files_verified','export_files_verified','export_bytes','releaseSha256','edgeSha256','runtime']},indent=2))
