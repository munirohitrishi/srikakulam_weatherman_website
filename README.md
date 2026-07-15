# Srikakulam Weatherman — Live AP Weather Hub

Single-file live weather site (`index.html`) for all **26 districts of Andhra Pradesh**, built for [@srikakulam_weatherman](https://www.instagram.com/srikakulam_weatherman). Bilingual (Telugu / English), dark + light mode, glassmorphism UI, Three.js animated hero, PWA installable.

> The previous single-district version is preserved as `index-old.html` (with its `parts/` and `netlify/` folders).

## Sections

- **Hero** — animated 3D globe with clouds, rain & lightning; live Srikakulam conditions, AQI, sunrise/sunset, real-time IST clock.
- **AP Districts Live Grid** — 26 district cards + interactive stylised SVG map; click any district for current conditions and a 5-day forecast. Auto-refreshes every 10 minutes.
- **8-Day Advanced Forecast** — horizontal timeline (max/min, rain %, gusts, rainfall) + Chart.js temperature trend, per district.
- **Rytu Vani (Farmers)** — weather-based advisories: spraying, sowing/transplanting, harvesting, irrigation, heat/pest alerts. Telugu + English.
- **Matsyakara Vani (Fishermen)** — wave height/period from Open-Meteo Marine, SAFE / CAUTION / NOT SAFE banner, Windy Bay of Bengal cyclone tracker, INCOIS/IMD links.
- **Live Alerts & Radar** — auto-generated heatwave/thunderstorm/heavy-rain/squall banners scanning all 26 districts, alert ticker, Windy radar embed.
- **Instagram** — official profile embed + follow CTA.

## Data sources

- **Default (no key needed):** Open-Meteo forecast, marine and air-quality APIs — the site is fully live out of the box.
- **OpenWeatherMap (optional):** paste your key in `index.html` at `const OWM_KEY = "YOUR_OPENWEATHER_API_KEY"`. When set, hero current conditions come from OpenWeatherMap. Note: the key is visible client-side; restrict it by domain in your OWM dashboard, or proxy via a Netlify function.
- Official warnings: always refer [IMD](https://mausam.imd.gov.in/) and [INCOIS](https://incois.gov.in/) — advisories on this site are auto-generated from forecast models and indicative only.

## Deploy

Any static host works (Netlify, GitHub Pages, Vercel). Files needed: `index.html`, `manifest.json`, `sw.js`. The service worker enables offline shell caching and PWA install (HTTPS required).

## Instagram Graph API (later)

Live post pulling requires a Facebook developer app + access token owned by the creator. The embed-based section works without any token; swap it for Graph API calls when a token is available.
