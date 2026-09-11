# UARoute (uaroots)

Passenger-transport directory for journeys **from Ukraine to Europe** (minibuses / coaches). Live site: [uaroute.com](https://uaroute.com). Repo name is `uaroots`; product name in the UI is **UAROUTE**.

## Stack

- Create React App 5 (`react-scripts`), React 18, JavaScript (no TypeScript)
- `react-router-dom` v6 (`createBrowserRouter` in `src/App.js`)
- Bulma CSS + Font Awesome 5 (CDN in `public/index.html`)
- Global state: `TransporterContext` in `src/context/transporter.js` wrapping the app in `src/index.js`
- Static data: `src/json/transporters.json`, copy in `src/json/content.json`
- Contact form POSTs via `PUT` to an AWS API Gateway URL in `src/components/ContactUs.js`

## Layout

- `src/pages/` — route screens (`Root` = nav + outlet + footer)
- `src/components/` — UI; colocate `*.css` next to the component
- Routes: `/` providers list, `/about`, `/contact`, `/provider/:name` (stub — `ProvDetailsPage`)

## Commands

```bash
npm start          # http://localhost:3000
npm test
npm run build      # output: ./build
make deploy        # aws s3 cp ./build/ s3://uaroute.com --recursive
```

## Product rules

- User-facing copy is **Ukrainian**. Keep new UI strings in Ukrainian unless asked otherwise.
- Catalog rows currently link to the carrier’s own `url`, not the in-app `/provider/:name` route.
- Do not treat unused CRA leftovers (`BookCreate`, `BookEdit`, `src/api.js` Unsplash helper) as the source of truth for architecture.
- Never commit or copy secrets. `src/api.js` contains a hardcoded Unsplash client id — do not reuse or expand it; prefer env vars if image search is needed later.
