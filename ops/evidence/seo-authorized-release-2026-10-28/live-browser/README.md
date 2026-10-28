# Live browser acceptance — 2026-10-28

The final bounded headless browser run passed at 12:53:03–12:53:37 UTC after successful deployment 40687288662 and completed invalidation I50VZX2UOM8CBA2DBLEHYS560S. It used Node 22.23.3 and the existing cached Playwright Chromium headless shell. Candidate: source 76bbc03197b017ea813e39014bee6950455959d2; CI 40686329581; release SHA-256 79f483e38207593b14a39d9127e41d1f199b9ec0fb01b551da50a9f7599503c2.

At each of 360, 375 and 1440 px, three inquiry flows (Lviv–Hannover, Lviv–Celle, and inline Lviv–Wolfsburg) passed early CTA heading focus, no automatic date focus, direct date input focus, blank validation, keyboard activation and overflow checks. The Celle hub direction selection and inline search reversal, blank fields and no handoff also passed at each width: 12 recorded check groups total. Nine screenshots and their SHA-256 hashes are listed in results.json; screenshots are retained privately alongside the harness. The 375 px Hannover focus remained stable after a 10-second wait.

Before navigation, the harness blocked all non-first-party network requests and first-party methods other than GET. It also intercepted window.open. Fifteen external requests and 62 speculative HEAD requests were blocked; no unmatched first-party GET was allowed. Thirty-one distinct first-party GET paths returned bytes matching the downloaded CI export; the result records their hashes and matched artifact files. There were no recorded page errors or mismatches in the final run. No real inquiry, operator contact or live analytics collection was performed.

The initial and intermediate results are retained. Their reported mismatches were a harness error: it compared empty HEAD response bodies with HTML. The earlier interpretation that these were RSC prefetch payloads was incorrect. The final run blocks those speculative HEAD requests; this diagnostic does not indicate a product failure.

This headless check cannot verify the native iOS picker or physical-device behavior. The six required physical iPhone checks remain NOT RUN, not passed.
