# Self-hosted fonts

These WOFF2 files are byte-for-byte copies of the font assets already fetched into the local Next.js development cache for this project. They remove the Google Fonts build-time fetch while keeping the IBM Plex Sans, IBM Plex Mono, and Playfair Display families, configured weights/styles, and Unicode subset mappings.

The cached assets were matched to the `@font-face` subset declarations in `.next/dev/static/chunks/[next]_internal_font_google_*_module_css_*.single.css` on 2026-10-06. The corresponding cached files were under `.next/dev/static/media/`. `fonts.css` carries the CSS family, weight, style, and Unicode range mappings. The Latin range placeholder (`U+??`) emitted by the cache was normalized to the standard Latin range `U+0000-00FF`; all font binaries remain unchanged.

Upstream license sources:

- IBM Plex Sans and IBM Plex Mono: [Google Fonts IBM Plex Sans OFL.txt](https://github.com/google/fonts/blob/main/ofl/ibmplexsans/OFL.txt) and [IBM Plex Mono OFL.txt](https://github.com/google/fonts/blob/main/ofl/ibmplexmono/OFL.txt). Both identify copyright © 2017 IBM Corp. and SIL Open Font License 1.1. The copied text is in [OFL-IBM-Plex.txt](./OFL-IBM-Plex.txt).
- Playfair Display: [Google Fonts Playfair Display OFL.txt](https://github.com/google/fonts/blob/main/ofl/playfairdisplay/OFL.txt). It identifies the Playfair Display Project Authors and SIL Open Font License 1.1. The copied text is in [OFL-Playfair-Display.txt](./OFL-Playfair-Display.txt).
