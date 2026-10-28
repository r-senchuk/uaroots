# Guide layout-shift diagnosis — 2026-10-28

**Conclusion:** strong evidence that loading the site's web fonts is involved in the observed guide layout shift under this lab setup. The experiment does not isolate a particular font or prove a specific CSS change. It is not a field CLS result.

The preserved lock-matched Next 16.4.0 export and the baseline browser, viewport, CPU/network throttle, consent, loopback-only routing and observation window were reused. One normal diagnostic run recorded a Chrome trace; two fresh-context runs aborted all local font files. No non-local requests were permitted; the count of attempted non-local requests was zero in all three runs. Document responses were 200. This supplements, and does not replace, the three normal baseline runs.

- Three original normal runs and the additional traced normal run each observed CLS 0.16858. Both font-blocked runs observed CLS 0 during the same bounded window. Font-blocking also changes request scheduling, so this is evidence of involvement, not an isolated single-font proof.
- In the normal diagnostic, the largest shift (0.154218 at 4515 ms) moved the H1, paragraph and a section upward by 24 CSS pixels; an affected list item moved from x=20, y=153 to x=200.98, y=117. Shift sources identify affected nodes, not necessarily the element responsible for movement. The full before/after rectangles and font timing entries are in [diagnostic results](./guide-diagnostic-results.json).
- Font loading began at 2881 ms and `document.fonts` reported `loadingdone`/`ready` at 4519.7 ms. The local IBM Plex Sans Latin font response ended at 4502.4 ms, shortly before the large shift; the generated stylesheet identifies that font face as `font-display: swap`. Other faces also loaded; timing alone cannot prove which face or wrapping change caused the movement. In both blocked runs, font load errors were observed and no layout shifts were recorded.

A bounded follow-up for the implementation owner is to inspect the affected wrapping and stabilize its geometry across fallback and loaded font states, then rerun the lock-matched baseline recipe and confirm the resulting layout with real copy. This is a diagnostic direction, not a prescribed global font change or a verified fix.

Private trace: `output/seo-mitigation-execution-2026-10-28-private/performance/guide-normal-trace.json`, SHA-256 `3119e140c7fc5b463a3e7628b817c394cae3c6b7f783238c0c1e6b76aef0793d`. The private diagnostic script and results are beside it. No source changes were made.
