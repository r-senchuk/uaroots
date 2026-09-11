# M1 route verification matrix

**Date:** 2026-09-11  
**Evidence:** [Koval site audit](koval-site-audit.md) Appendix C, [legacy UARoute audit](legacy-uaroute-audit.md), [`src/data/routes.ts`](../../src/data/routes.ts)

Promotion rule: a city on Koval’s marketing list is **not** enough for `commercial`. Geography ≠ dated availability.

| slug | Origin evidence | Destination evidence | Desk | Unique copy | Inquiry path | Index / sitemap | Decision | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `lviv-hannover` | Verified: Львів is a Koval origin hub (JS 2026-09-11). Legacy catalog also named Lviv/Dolyna → Hannover. | Verified: Ганновер is in Koval’s Lower Saxony passenger/parcel city group. | `koval-de` | Yes, already in data | Yes | Yes | **commercial** | Flagship. Claims may be shown with provenance. |
| `lviv-hamburg` | Same Lviv hub. | Verified: Гамбург is in the Schleswig-Holstein / Hamburg group. | `koval-de` | Thin; page says commercial status unconfirmed | Page exists | No (`noindex`) | **editorial** | Keep out of `/routes/` and sitemap. |
| `lviv-berlin` | Same Lviv hub. | Verified: Берлін is in the Brandenburg / Berlin group. | `koval-de` | Thin; unconfirmed commercial status | Page exists | No | **editorial** | Same as Hamburg. |
| generic Germany | Country-level corridor only | Country, not a city pair | — | No | No | No | **out of M1** | |
| Munich / other DE cities | Lviv hub exists | Many DE cities listed | `koval-de` | No unique page | No | No | **out of M1** | Do not generate thin pages. |
| Vienna / Austria | Lviv hub | Відень listed; AT desk `koval-at` unused | `koval-at` if ever published | No | No | No | **out of M1** | Needs AT desk confirmation as a product route. |
| PL / CZ city pairs | Country in corridor | No city-level passenger inventory | Unknown (CZ ambiguous) | No | No | No | **out of M1** | |
| Ivano-Frankivsk / Chernivtsi origins | Verified hubs | Various DE cities | `koval-de` | No M1 pages | No | No | **out of M1** | Seed later after unique copy. |

## Claims allowed on commercial M1 pages

Only on `commercial` routes, as `Claim` records sourced to `https://www.4k-koval.com/` on `2026-09-11`:

- Прямі рейси без пересадок
- Два професійні водії
- Адресна доставка пасажирів у Німеччині
- Бронювання без передоплати
- Мікроавтобуси Mercedes Sprinter

Do not attach passenger prices, timetables, durations, or ratings.
