"""Independent S05 exact-copy and inert-artifact review; stdlib only."""
import hashlib
import json
import re
import argparse
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
argparse.ArgumentParser(description=__doc__).parse_args()
OUT = Path(__file__).parent
ASSETS = ROOT / 'docs/Marketing/SEO/mitigation-2026-10/design-assets'
COPY = ROOT / 'ops/evidence/seo-s04-2026-10-27/copy-records.json'
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

def norm(value):
    return re.sub(r'\s+', ' ', value).strip()

class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []
    def text(self):
        return ''.join(x.text() if isinstance(x, Node) else x for x in self.children)
    def all(self):
        yield self
        for x in self.children:
            if isinstance(x, Node): yield from x.all()

class Tree(HTMLParser):
    def __init__(self, value):
        super().__init__(convert_charrefs=True)
        self.root = self.current = Node()
        self.feed(value)
    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.current)
        self.current.children.append(n)
        if tag not in VOID: self.current = n
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID: self.handle_endtag(tag)
    def handle_endtag(self, tag):
        n = self.current
        while n.parent:
            if n.tag == tag:
                self.current = n.parent
                return
            n = n.parent
    def handle_data(self, data): self.current.children.append(data)

def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def descendants(n, attr, value): return [x for x in n.all() if x.attrs.get(attr) == value]
def nearest_key(n):
    while n:
        if 'data-copy-key' in n.attrs: return n.attrs['data-copy-key']
        n = n.parent

copy = json.loads(COPY.read_text())
results = {'method': 'Independent stdlib HTMLParser; normalized Unicode whitespace only; exact fields/items/link labels and annotation destinations', 'copy_sha256': digest(COPY), 'pages': [], 'inert_artifacts': [], 'hashes': {}}
pages = copy['pages'] + [dict(v, kind='support') for v in copy['support'].values()]
for page in pages:
    slug = page['url'].strip('/').split('/')[-1]
    kind = page['kind']
    path = ASSETS / ('routes' if kind == 'route' else 'hubs' if kind == 'hub' else 'support') / (({'perevezennya-velosypeda':'guide'}.get(slug,slug)) + '.html')
    tree = Tree(path.read_text()).root
    nodes = list(tree.all())
    failures = []
    checked = []
    for key in page['keys']:
        record = copy['records'][key]
        blocks = descendants(tree, 'data-copy-key', key)
        if not blocks:
            failures.append({'key':key,'problem':'key count','actual':len(blocks),'expected':1})
            continue
        keyed = [n for n in nodes if nearest_key(n) == key]
        for field in ('heading','text'):
            expected = norm(record.get(field, ''))
            fields = [n for n in keyed if n.attrs.get('data-copy-field') == field]
            if expected:
                if len(fields) != 1 or norm(fields[0].text()) != expected:
                    failures.append({'key':key,'field':field,'expected':expected,'actual':[norm(x.text()) for x in fields]})
            elif fields and any(norm(x.text()) for x in fields): failures.append({'key':key,'field':field,'problem':'unexpected field'})
        item_fields = [n for n in keyed if n.attrs.get('data-copy-field') == 'items']
        actual_items = []
        for n in item_fields:
            lis = [x for x in n.all() if x.tag == 'li']
            if lis: actual_items.extend(norm(x.text()) for x in lis)
            elif len(record.get('items',[])) > 1 and all(isinstance(i,str) for i in record['items']) and len(item_fields)==1:
                actual_items.extend(norm(x.text()) for x in n.children if isinstance(x,Node))
            else: actual_items.append(norm(n.text()))
        expected_items = []
        for item in record.get('items',[]):
            expected_items.append(norm(''.join(item.get(k,'') for k in ('heading','text','label','question','answer'))) if isinstance(item,dict) else norm(item))
        if sorted(actual_items) != sorted(expected_items):
            failures.append({'key':key,'field':'items','expected':expected_items,'actual':actual_items})
        for link in record.get('links',[]):
            anchors = [n for n in keyed if n.tag=='a' and norm(n.text())==norm(link['label'])]
            if len(anchors)!=1:
                failures.append({'key':key,'field':'links','label':link['label'],'count':len(anchors)})
            elif anchors[0].attrs.get('href','').startswith('#'):
                targets=descendants(tree,'id',anchors[0].attrs['href'][1:])
                annotations = [n for n in nodes if 'annotation' in n.attrs.get('class','').split()]
                if len(targets)!=1 or not any(link['url'] in n.text() for n in targets+annotations): failures.append({'key':key,'field':'destination','expected':link['url']})
            else: failures.append({'key':key,'field':'links','problem':'non-local board href'})
        checked.append(key)
    for link in page.get('retained_links',[]) + page.get('retained_navigation',[]):
        anchors=[n for n in nodes if n.tag=='a' and norm(n.text()) in (norm(link['label']),norm('Поради: '+link['label']))]
        resolved=[]
        for anchor in anchors:
            href=anchor.attrs.get('href','')
            resolved.extend(n.text() for n in descendants(tree,'id',href[1:]))
        annotations = [n.text() for n in nodes if 'annotation' in n.attrs.get('class','').split()]
        if not anchors or not any(link['url'] in t for t in resolved+annotations): failures.append({'retained_link':link,'problem':'missing exact label/destination'})
    bodytext=tree.text()
    for field,value in page.get('metadata',{}).items():
        if value not in bodytext: failures.append({'metadata':field,'problem':'not retained in board text','expected':value})
    for field in ('sourceUrl','lastVerifiedAt'):
        value=page.get('provenance',{}).get(field)
        if value and value not in bodytext: failures.append({'provenance':field,'problem':'not retained','expected':value})
    results['pages'].append({'path':str(path.relative_to(ROOT)),'url':page['url'],'keys_checked':checked,'failures':failures})

for path in sorted(ASSETS.rglob('*')):
    if not path.is_file(): continue
    results['hashes'][str(path.relative_to(ROOT))]=digest(path)
    if path.suffix!='.html' or path.name=='hannover-route-375.html': continue
    nodes=list(Tree(path.read_text()).root.all())
    ids=[n.attrs['id'] for n in nodes if 'id' in n.attrs]
    bad=[]
    for n in nodes:
        if n.tag=='script': bad.append('script element')
        if any(k.startswith('on') for k in n.attrs): bad.append('inline handler')
        if n.tag=='a':
            href=n.attrs.get('href','')
            if not href.startswith('#') or href[1:] not in ids: bad.append('non-local/broken anchor '+href)
        if n.tag in ('button','input','select','textarea'):
            ancestors=[]; p=n
            while p: ancestors.append(p); p=p.parent
            if not any('disabled' in x.attrs for x in ancestors): bad.append('enabled '+n.tag)
        if n.tag=='form' and ('action' in n.attrs or 'method' in n.attrs): bad.append('form handoff configuration')
    if len(ids)!=len(set(ids)): bad.append('duplicate IDs')
    results['inert_artifacts'].append({'path':str(path.relative_to(ROOT)),'failures':bad})

states=Tree((ASSETS/'states.html').read_text()).root
contract=json.loads((ROOT/'ops/evidence/seo-mitigation-execution-2026-10-28/design-contract.json').read_text())
results['state_ids']=[n.attrs['data-state'] for n in states.all() if 'data-state' in n.attrs]
results['state_ids_match']=sorted(results['state_ids'])==sorted(contract['state_ids'])
results['validation']={k: len(descendants(states,'data-interface-key',k))==1 and norm(descendants(states,'data-interface-key',k)[0].text())==norm(v) for k,v in copy['retained_interface'].items() if k.startswith('validation.')}
results['media'] = []
for path in sorted((ASSETS/'routes').glob('*.html')):
    tree = Tree(path.read_text()).root
    images = [n for n in tree.all() if n.tag=='img']
    captions = [norm(n.text()) for n in tree.all() if n.tag=='figcaption']
    expected = copy['records']['shared.caption']
    results['media'].append({'path':str(path.relative_to(ROOT)), 'one_existing_image':len(images)==1 and (path.parent/images[0].attrs.get('src','')).resolve()==ROOT/'src/assets/atlas-city.jpg', 'alt_exact':len(images)==1 and images[0].attrs.get('alt')==expected['items'][0], 'caption_exact':captions==[expected['text']]})
guide = (ASSETS/'support/guide.html').read_text()
results['guide_historical_dates'] = {key: value in guide for key,value in copy['support']['guide']['schema_historical'].items() if key in ('datePublished','dateModified')}
results['failures_total']=sum(len(p['failures']) for p in results['pages'])+sum(len(p['failures']) for p in results['inert_artifacts'])
results['failures_total'] += sum(not value for row in results['media'] for key,value in row.items() if key!='path') + sum(not v for v in results['guide_historical_dates'].values())
(OUT/'static-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'pages':len(results['pages']),'keys':sum(len(p['keys_checked']) for p in results['pages']),'failures_total':results['failures_total'],'state_ids_match':results['state_ids_match'],'validation':results['validation'],'failures':[{'path':p['path'],'failures':p['failures']} for p in results['pages'] if p['failures']]},ensure_ascii=False,indent=2))
