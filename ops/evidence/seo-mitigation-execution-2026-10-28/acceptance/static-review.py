"""Independent frozen-byte/static-HTML review; no imports from application data."""
import pathlib,json,hashlib,re,html
from html.parser import HTMLParser
R=pathlib.Path.cwd(); B=R/'output/seo-mitigation-execution-2026-10-28-private/implementation'; C=B/'candidate'; O=C/'out'; E=R/'ops/evidence/seo-mitigation-execution-2026-10-28/acceptance'
hash=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
def check(n,v,d=None):checks.append({'name':n,'passed':bool(v),**({'detail':d} if d is not None else {})})
for name,base,expected in [('source-files.json',C,'3c114ad623fd49d791eea58ea2210170801e45613fb557ad4fdf0313c3cae29e'),('export-files.json',O,'40a5db56e1a7ae1aa8b6d06ebabf05f3d1adde1229dc2c25517adfaa89636572')]:
 m=json.loads((B/name).read_text());bad=[p for p,h in m.items() if not (base/p).is_file() or hash(base/p)!=h];check(name+' actual bytes',hash(B/name)==expected and not bad,{'files':len(m),'manifest_sha256':hash(B/name),'mismatches':bad})
m=json.loads((R/'ops/evidence/seo-mitigation-execution-2026-10-28/readiness/input-manifest.json').read_text());bad=[p for p,h in m['essential_inputs'].items() if hash(R/p)!=h];check('26 essential inputs',not bad,{'count':len(m['essential_inputs']),'mismatches':bad})
drift=[p for p,h in m['source_and_script_pre_edit_sha256'].items() if hash(C/p)!=h];allowed={'scripts/attribution-browser.mjs','scripts/inspect-out.mjs','scripts/passenger-browser.mjs','scripts/poc-browser.mjs','scripts/privacy-browser.mjs','src/app/about/page.tsx','src/app/cities/[slug]/page.tsx','src/app/guides/perevezennya-velosypeda/page.tsx','src/app/imprint/page.tsx','src/app/routes/[slug]/page.tsx','src/components/BookingWidget.tsx','src/components/CandidateInquiry.tsx','src/components/JourneyActions.tsx','src/components/NearbyPlaces.tsx','src/components/RouteSearch.tsx','src/components/StickyBookingBar.tsx','src/data/city-hubs.ts','src/data/routes.ts','src/data/types.ts','src/lib/inspect-out.test.ts','src/lib/passenger-conversion.test.ts','src/lib/seo.test.ts','src/lib/validate-catalog.test.ts','src/lib/validate-catalog.ts','src/lib/validate-city-hubs.test.ts'}
check('source changes bounded',set(drift)<=allowed,{'changed':drift,'outside_work_order':sorted(set(drift)-allowed)})
check('root matches frozen source',all(hash(R/p)==h for p,h in json.loads((B/'source-files.json').read_text()).items()))
class Page(HTMLParser):
 def __init__(self,s):
  super().__init__();self.tags=[];self.text=[];self.skip=0;self.feed(s)
 def handle_starttag(self,t,a):
  self.tags.append((t,dict(a)));self.skip+=t in ['script','style']
 def handle_endtag(self,t):
  if t in ['script','style']:self.skip=max(0,self.skip-1)
 def handle_data(self,d):
  if not self.skip:self.text.append(d)
 def attrs(self,t):return [a for tag,a in self.tags if tag==t]
 def visible(self):return re.sub(r'\s+',' ',' '.join(self.text)).strip()
commercial=['lviv-hannover','dolyna-celle','celle-dolyna','dolyna-wolfsburg','wolfsburg-dolyna','dolyna-braunschweig','braunschweig-dolyna','lviv-celle','celle-lviv','ivano-frankivsk-wolfsburg','wolfsburg-ivano-frankivsk','celle-stryi']
urls=['/','/routes/','/about/','/imprint/','/privacy/','/guides/perevezennya-velosypeda/']+['/cities/'+c+'/' for c in ['lviv','ivano-frankivsk','celle','stryi']]+['/routes/'+c+'/' for c in commercial]
xml=(O/'sitemap.xml').read_text();actual=re.findall(r'<loc>(.*?)</loc>',xml);check('literal independent sitemap set22',set(actual)=={'https://uaroute.com'+u for u in urls} and len(actual)==22)
P={};meta=[]
for u in urls+['/routes/lviv-hamburg/','/routes/lviv-berlin/']:
 s=(O/(u.strip('/')+'/' if u!='/' else '')/'index.html').read_text();p=Page(s);P[u]=p
 canonical=[a.get('href') for a in p.attrs('link') if a.get('rel')=='canonical'];check(u+' html metadata',len(p.attrs('h1'))==1 and canonical==['https://uaroute.com'+u] and p.attrs('html')[0].get('lang')=='uk')
 descriptions=[a.get('content') for a in p.attrs('meta') if a.get('name')=='description'];title=re.search(r'<title>(.*?)</title>',s).group(1);meta.append((u,title,descriptions))
 schema=[json.loads(x) for x in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s)];check(u+' no operational schema',not re.search(r'"@type"\s*:\s*"(?:BusTrip|Offer|AggregateRating|LocalBusiness)"',json.dumps(schema)))
 check(u+' no public carrier brand',not re.search('Коваль|Koval|4K Koval|КОВАЛЬ',p.visible(),re.I))
 if u.startswith('/routes/') and u!='/routes/':
  editorial=u in ['/routes/lviv-hamburg/','/routes/lviv-berlin/'];check(u+' form eligibility',len(p.attrs('form'))==(0 if editorial else 1))
  if editorial:check(u+' editorial noindex',any(a.get('name')=='robots' and 'noindex' in a.get('content','') for a in p.attrs('meta')))
  check(u+' no deferred service-claim presentation',not any(x in p.visible() for x in ['Два професійні водії','Без передоплати','Прямі рейси без пересадок']))
for u,p in P.items():
 bad=[]
 for a in p.attrs('a'):
  h=a.get('href','')
  if h.startswith('/') and not h.startswith('//'):
   path=h.split('?')[0].split('#')[0]
   if path and path!='/' and not path.endswith('/'):bad.append(h)
   if path and not (O/(path.strip('/')+'/' if path!='/' else '')/'index.html').exists():bad.append(h)
 check(u+' internal hrefs resolve/slash',not bad,bad)
check('unique titles/descriptions',len(set(t for _,t,_ in meta))==24 and len(set(tuple(d) for _,_,d in meta))==24)
copy=json.loads((R/'ops/evidence/seo-s04-2026-10-27/copy-records.json').read_text());cons=json.loads((R/'ops/evidence/seo-mitigation-execution-2026-10-28/readiness/copy-consumers.json').read_text());missing=[];matched=0
# Check each factual sentence, heading, item, and link. Inquiry composition is deliberately split/reordered.
def sentences(s):return re.split(r'(?<=[.!?])\s+',s)
def flatten(v):
 if isinstance(v,str):yield v
 elif isinstance(v,list):
  for x in v:yield from flatten(x)
 elif isinstance(v,dict):
  for k,x in v.items():
   if k not in ['url']:yield from flatten(x)
for c in cons['consumers']:
 u,k=c['url'],c['key'];p=P.get(u)
 if not p:continue
 rec=copy['records'].get(k)
 if rec is None:
  for group in copy['support'].values() if isinstance(copy['support'],dict) else copy['support']:
   if isinstance(group,dict) and k in group:rec=group[k]
 if rec is None:continue
 text=p.visible();raw=(O/(u.strip('/')+'/' if u!='/' else '')/'index.html').read_text();failed=[]
 for key in ['heading','text','items']:
  for s in flatten(rec.get(key,[])):
   for sentence in sentences(s):
    if sentence and re.sub(r'\s+','',sentence) not in re.sub(r'\s+','',text) and sentence not in html.unescape(raw):failed.append(sentence)
 for link in rec.get('links',[]):
  if not any(a.get('href')==link['url'] for a in p.attrs('a')):failed.append('link '+link['url'])
 if failed:missing.append({'url':u,'key':k,'missing':failed})
 else:matched+=1
check('frozen copy consumer sentences/items/links',not missing,{'matched':matched,'missing':missing})
redirects={'contact':'/about/','contacts':'/about/','carriers':'/routes/','packages':'/about/','gallery':'/'}
for old,new in redirects.items():
 s=(O/old/'index.html').read_text();p=Page(s);check('/'+old+'/ redirect',any(a.get('http-equiv')=='refresh' and new in a.get('content','') for a in p.attrs('meta')))
check('404 artifact no homepage canonical',not re.search(r'rel="canonical"[^>]*href="https://uaroute.com/"',(O/'404.html').read_text()))
baseline=R/'output/seo-mitigation-execution-2026-10-28-private/performance/baseline-locked/out'
check('no extra exported files',set(str(p.relative_to(O)) for p in O.rglob('*') if p.is_file())==set(json.loads((B/'export-files.json').read_text())))
check('sitemap dates byte-identical to baseline',(O/'sitemap.xml').read_bytes()==(baseline/'sitemap.xml').read_bytes())
def identity(v,path=''):
 out={}
 if isinstance(v,dict):
  for k,x in v.items():
   p=path+'/'+k
   if k in ['author','publisher','datePublished','dateModified','dateCreated','reviewedAt']:out[p]=x
   else:out.update(identity(x,p))
 elif isinstance(v,list):
  for i,x in enumerate(v):out.update(identity(x,path+'/'+str(i)))
 return out
for u,p in P.items():
 path=(u.strip('/')+'/' if u!='/' else '')+'index.html';current=(O/path).read_text();before=(baseline/path).read_text()
 schemas=lambda source:[json.loads(x) for x in re.findall(r'<script type="application/ld\+json">(.*?)</script>',source)]
 check(u+' schema identities and dates retained',identity(schemas(current))==identity(schemas(before)))
 if u.startswith('/routes/') and u!='/routes/':
  old=Page(before)
  check(u+' existing illustrative image/alt retained',p.attrs('img')==old.attrs('img'))
  practical=next((i for i,(t,a) in enumerate(p.tags) if a.get('aria-labelledby')=='practical-heading'),None)
  figure=next((i for i,(t,a) in enumerate(p.tags) if t=='figure'),None)
  check(u+' practical precedes image',practical is None or (figure is not None and figure>practical))
result={'reviewer' :'S09 independent','scope':'read-only source/export; no build/browser','checks':checks,'passed':all(c['passed'] for c in checks)}
(E/'static-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'checks':len(checks),'passed':result['passed'],'failed':[c for c in checks if not c['passed']]},ensure_ascii=False,indent=2))
