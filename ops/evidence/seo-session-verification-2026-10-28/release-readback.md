# Independent CI artifact reacceptance and live readback

**Technical deployment and independent HTTP/artifact readback accepted. Final S10 physical-device acceptance remains held.** Affected CI artifact acceptance preceded deployment dispatch. This increment does not alter the initial S01–S12 audit or historical R4 decision. Detailed checks and hashes: [release-readback.json](release-readback.json).

## Exact promoted candidate

- Source `76bbc03197b017ea813e39014bee6950455959d2`; successful main push CI run `40686329581`.
- Release fingerprint `79f483e38207593b14a39d9127e41d1f199b9ec0fb01b551da50a9f7599503c2`.
- Edge fingerprint `b9bae15fec6705a1834115a492849980eaf552ce29bc6d50cf1c6663fe492f2d`.
- Actual independently downloaded bundle: `output/seo-authorized-release-2026-10-28-private/candidate/`.

Independently executed read-only `release-bundle.mjs verify` against the authenticated CI API record supplied by the release owner: exit 0. Identity, main push/success eligibility, complete manifest/file bytes and edge hash match. The local accepted disabled export and actual CI export differ; they are not represented as identical artifacts.

## Actual artifact differences and affected acceptance

CI compiles optional analytics enabled with the existing production IDs. It is a preservation of deployed enabled mode, rather than the accepted local disabled build. Independent source comparison against calendar release `ff1e4d095e96cab9f5c75cbf19854f532d6273b9` found 10/10 relevant analytics/privacy/template paths unchanged.

The all-false broad HTML comparisons have concrete explanations beyond build IDs. Global footer status changes from «Необов’язкова аналітика відвідувань вимкнена.» to «Аналітику відвідувань вимкнено.»; enabled builds also render the consent-dialog choice information. Privacy main content changes from a disabled-build explanation to the consent-only analytics explanation. Independent text parsing found 31/32 exported HTML main contents identical to the accepted local candidate; privacy is the sole main-content difference.

The existing independent S09 static oracle was run in memory against actual CI output, omitting old source-map inventory checks already covered by bundle verification: **188/188 pass**. This includes all **94/94** frozen copy consumers and their sentences/items/links, the literal **22/22** sitemap URL set, self-canonicals/Ukrainian language/single H1, editorial exclusion/form eligibility, no operational schema/public carrier branding, internal links, schema identities/dates, retained image purpose/alt and practical-before-image order. No source/build changes or full audit rerun occurred.

Reviewed release-owner actual candidate-bound runtime evidence:

| Actual run | Result | Boundary |
| --- | --- | --- |
| Enabled privacy | 10/10; no runtime errors | Explicit invocation points to exact CI export; invocation script and report hashes independently match. Mocked provider fixture; no real Google ingestion. |
| Enabled POC | 23/23; no runtime/errors | Report records exact CI export. 1 mocked GTM request, 8 blocked Google requests, 14 blocked nonlocal requests; no real inquiry sent. |
| Denied-mode passenger | 32/32; browser closed | Report/hash independently read. Optional missing-desk fixture was not supplied in this rerun; prior unchanged fixture evidence retained. Physical iPhone remains unexecuted. |

Original diagnostics remain retained: first POC invocation pointed to an absent local receiver and ran zero flows; corrected invocation used existing unchanged receiver. Original passenger run had six consent-banner interception failures, then a refusal-mode run had two fixture failures caused by scroll position and the disabled-build button label. Independent diff of the final task-local wrapper confirms only explicit refusal, scroll restoration and the actual enabled refusal label; all business assertions and interception remain. No candidate or application source changed. These corrections do not erase the first diagnostics.

**Decision:** actual enabled CI artifact is accepted within this bounded affected scope. Promotion still requires the release owner's fresh recoverability, target/config/inventory checks and actual deployment receipts. Enabled mock testing and live GTM configuration readback do not establish real vendor ingestion. Missing field/search/operator outcomes are unknown, not zero or new vetoes.

## Actual deployment receipt review

Authenticated deployment run `40687288662`, workflow `deploy-production.yml`, completed **success** for exact source above. Success receipt records **258 published objects** and verification at **2026-10-28 12:48:18.221 UTC**. Exact source/CI/release/edge identities match the reviewed candidate.

Recovery receipt records **475 objects**, prefix `releases/40687288662-1`, hash `a12b1504579354452111dc84b3b4c52b51bd0368608d9e13df9bef151af63bd5`, retrieval verified **12:32:41.209 UTC**, before publication. Invalidation `I50VZX2UOM8CBA2DBLEHYS560S` is **Completed**. Receipt hashes and cross-record identity/timestamp consistency were independently checked. The reviewer did not fetch the full private recovery bundle or access AWS directly; remote retrieval verification is supplied by the successful OIDC release receipt. Existing full isolated rollback-rehearsal limits remain unchanged.

The workflow's producer HTTP report contains **373 pass, 0 fail, 0 unknown**. It was reviewed separately and is not presented as an independent rerun.

## Independent live readback

After actual deployment, independently executed **55 public GET/HEAD requests: 55 pass, 0 fail, 0 unknown** at approximately **12:51 UTC**. Redirect following was disabled. No cookies, credentials, query inputs, JavaScript, collectors or operator handoffs were used.

| Live evidence | Denominator and result |
| --- | --- |
| Exported HTML | 15/15 GET bodies match exact CI SHA-256 and sizes; 15/15 HEAD status 200. Includes seven priority pages, supporting/trust/privacy/index pages and two editorial routes. All 15 self-canonicals match; both editorial pages retain noindex. |
| Plain artifacts | robots, sitemap and referral contract: 3/3 GET bodies match CI SHA-256/sizes; 3/3 HEAD status 200. |
| Compiled assets | Consent/analytics chunk, privacy chunk and CSS: 3/3 GET bodies match CI SHA-256/sizes. |
| Legacy redirects | Five paths ×GET/HEAD =10/10 observed permanent 308 responses with exact reviewed destinations. |
| Missing paths | Unknown provider, generic unknown and intentionally unpublished Hannover→Lviv paths: 3×GET/HEAD =6/6 status 404. All 3 GET bodies match the exact reviewed edge's Ukrainian noindex 404 body and route-index link. |

The initial network-restricted attempt received no HTTP responses because local DNS was unavailable: **55 transport unknowns**, not site failures. The same read-only checks succeeded with network permission. The reviewer initially assumed 301 redirects and the exported 404 body; inspection of the exact immutable edge established 308 and its dedicated `SEO_MISSING_DOCUMENT_BODY`. The initial diagnostic is retained, and the captured status/location/body hashes were re-evaluated against those exact existing definitions. No production/source/response changed, and no network rerun was needed for that oracle correction.

The **21/21** live export GET byte matches connect existing actual-CI static acceptance to current production within this bounded scope; **3/3** generated 404 body matches separately connect the live edge behavior. This does not independently inspect every uploaded object or repeat the browser worker's inquiry/privacy interactions. Live browser evidence remains separately owned.

Six physical iPhone checks remain **0 PASS, 0 FAIL, 6 NOT RUN of 6**. The owner selected later physical testing while authorizing technical deployment; final S10 device acceptance remains held. Screen-reader/human usability, provider receipt, GSC/AI/field performance and operator outcomes remain unexecuted or unavailable. S11 remains unposted and S12 has no elapsed observation windows established by this artifact review.

Only this increment's JSON/Markdown evidence files were written. No application, Git, browser, provider or cloud mutations were performed by the independent reviewer. Public HTTP reads created no inquiry or external handoff.
