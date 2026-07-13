# Srikakulam Weatherman

Static, bilingual weather dashboard for Srikakulam District. It uses Open-Meteo as the real-time primary source, with local caching and an automatic demo-data fallback so the page remains useful when a provider is unreachable.

## Deploy on Netlify

1. Push this folder to a new GitHub repository.
2. In Netlify, choose **Add new site → Import an existing project**, select the repository, and deploy. No build command or publish directory is needed: the repository root is the site.
3. To enable optional AQI, WeatherAPI alerts, and Tomorrow.io enrichment, add these Netlify environment variables, then redeploy:
   - `WEATHERAPI_KEY`
   - `TOMORROW_API_KEY`

Never put API keys in `index.html`, `parts/weather.js`, or your GitHub repository. The Netlify function keeps optional keys on the server. Open-Meteo and RainViewer need no key and work immediately.

## Data behaviour

- Current conditions and seven-day forecast: Open-Meteo, refreshed every ten minutes.
- Radar: RainViewer frames, animated on the live map when available.
- Optional provider calls: WeatherAPI (AQI and alerts) and Tomorrow.io (forecast enrichment), via `/.netlify/functions/weather-enrichment`.
- Cache: last successful data is stored for five minutes; a saved reading is shown while a refresh is in progress.
- If all live calls fail, the existing clearly labelled demo display remains available.

Official India Meteorological Department bulletins should be checked at [IMD Mausam](https://mausam.imd.gov.in/) before acting on cyclone or marine risk. Its public warning widget is not a stable browser API, so it is intentionally not scraped from the deployed client.
