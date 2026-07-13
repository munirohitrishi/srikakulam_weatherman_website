/* Srikakulam Weatherman live data layer.
   Open-Meteo is always available. Optional provider data is requested through
   Netlify so paid-provider keys never need to be published in the browser. */
(function () {
  'use strict';

  var CACHE_TTL = 5 * 60 * 1000;
  var OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';
  var RAIN_VIEWER = 'https://api.rainviewer.com/public/weather-maps.json';
  var weatherByLocation = {};

  var codeInfo = {
    0: ['sunny', 'Clear sky', 'స్పష్టమైన ఆకాశం'],
    1: ['partlyCloudy', 'Mainly clear', 'ఎక్కువగా స్పష్టంగా ఉంది'],
    2: ['partlyCloudy', 'Partly cloudy', 'పాక్షిక మేఘావృతం'],
    3: ['cloudy', 'Overcast', 'మేఘావృతం'],
    45: ['foggy', 'Fog', 'పొగమంచు'], 48: ['foggy', 'Rime fog', 'పొగమంచు'],
    51: ['drizzle', 'Light drizzle', 'తేలికపాటి జల్లులు'], 53: ['drizzle', 'Drizzle', 'జల్లులు'], 55: ['drizzle', 'Dense drizzle', 'దట్టమైన జల్లులు'],
    61: ['rain', 'Slight rain', 'తేలికపాటి వర్షం'], 63: ['rain', 'Rain', 'వర్షం'], 65: ['heavyRain', 'Heavy rain', 'భారీ వర్షం'],
    71: ['rain', 'Light snow', 'తేలికపాటి మంచు'], 73: ['rain', 'Snow', 'మంచు'], 75: ['heavyRain', 'Heavy snow', 'భారీ మంచు'],
    80: ['rain', 'Rain showers', 'వర్షపు జల్లులు'], 81: ['rain', 'Moderate rain showers', 'మోస్తరు వర్షపు జల్లులు'], 82: ['heavyRain', 'Violent rain showers', 'భారీ వర్షపు జల్లులు'],
    95: ['thunderstorm', 'Thunderstorm', 'ఉరుములతో కూడిన వర్షం'], 96: ['thunderstorm', 'Thunderstorm with hail', 'వడగళ్లతో ఉరుములు'], 99: ['thunderstorm', 'Severe thunderstorm with hail', 'తీవ్ర ఉరుములు']
  };

  function getInfo(code) { return codeInfo[code] || ['cloudy', 'Cloudy', 'మేఘావృతం']; }
  function number(value, fallback) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
  function cacheKey(id) { return 'srikakulam-weather-v3-' + id; }
  function readCache(id) {
    try {
      var stored = JSON.parse(localStorage.getItem(cacheKey(id)) || 'null');
      return stored && stored.data ? stored : null;
    } catch (_) { return null; }
  }
  function writeCache(id, data) {
    try { localStorage.setItem(cacheKey(id), JSON.stringify({ savedAt: Date.now(), data: data })); } catch (_) {}
  }
  function formatTime(value) {
    if (!value) return '--';
    return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).format(new Date(value));
  }
  function dayTimestamp(value) { return new Date(value + 'T00:00:00+05:30').getTime(); }
  function hourTimestamp(value) { return new Date(value + '+05:30').getTime() / 1000; }

  function openMeteoUrl(location) {
    var params = new URLSearchParams({
      latitude: location.lat, longitude: location.lon,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,uv_index',
      hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,soil_moisture_0_to_7cm,evapotranspiration',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max,sunrise,sunset',
      timezone: 'Asia/Kolkata', forecast_days: '7'
    });
    return OPEN_METEO + '?' + params;
  }

  function normalise(data, location, enrichment) {
    var current = data.current || {};
    var hourly = data.hourly || {};
    var daily = data.daily || {};
    var info = getInfo(current.weather_code);
    var currentHour = Math.max(0, (hourly.time || []).findIndex(function (time) { return time >= current.time; }));
    if (currentHour < 0) currentHour = 0;
    var aqi = enrichment && enrichment.aqi;
    var dayRain = (daily.precipitation_sum || []).slice(0, 3).reduce(function (sum, value) { return sum + number(value, 0); }, 0);
    var result = {
      source: 'Open-Meteo', updatedAt: Date.now(), isDemo: false, stale: false,
      radar: enrichment && enrichment.radar || null,
      alerts: enrichment && enrichment.alerts || [],
      current: {
        coord: { lat: location.lat, lon: location.lon }, name: location.name.en,
        condition: info[0], conditionText: { en: info[1], te: info[2] }, weatherCode: current.weather_code,
        main: { temp: number(current.temperature_2m, 29), feels_like: number(current.apparent_temperature, 31), humidity: number(current.relative_humidity_2m, 75), pressure: number(current.pressure_msl, 1010) },
        wind: { speed: number(current.wind_speed_10m, 0), deg: number(current.wind_direction_10m, 0), gust: number(current.wind_gusts_10m, 0) },
        rain: { '1h': number(current.precipitation, 0) }, uv_index: number(current.uv_index, 0),
        aqi: { value: aqi && number(aqi.value, null), category: aqi && aqi.category || 'Unavailable' },
        soilMoisture: number((hourly.soil_moisture_0_to_7cm || [])[currentHour], null),
        evapotranspiration: number((hourly.evapotranspiration || [])[currentHour], 0),
        sys: { sunrise: (daily.sunrise || [])[0], sunset: (daily.sunset || [])[0] }
      },
      forecastRain3Days: dayRain,
      hourly: (hourly.time || []).slice(0, 24).map(function (time, i) {
        var hourInfo = getInfo((hourly.weather_code || [])[i]);
        return { time: hourTimestamp(time), temp: number((hourly.temperature_2m || [])[i], 0), humidity: number((hourly.relative_humidity_2m || [])[i], 0), wind_speed: number((hourly.wind_speed_10m || [])[i], 0), rain: number((hourly.precipitation || [])[i], 0), pop: number((hourly.precipitation_probability || [])[i], 0) / 100, condition: hourInfo[0], weatherCode: (hourly.weather_code || [])[i] };
      }),
      daily: (daily.time || []).map(function (date, i) {
        var dayInfo = getInfo((daily.weather_code || [])[i]);
        return { date: dayTimestamp(date), temp: { min: number((daily.temperature_2m_min || [])[i], 0), max: number((daily.temperature_2m_max || [])[i], 0) }, rain: number((daily.precipitation_sum || [])[i], 0), pop: number((daily.precipitation_probability_max || [])[i], 0) / 100, wind_speed: 0, condition: dayInfo[0], weatherCode: (daily.weather_code || [])[i] };
      })
    };
    result.advisory = computeAdvisory(result);
    return result;
  }

  function computeAdvisory(weather) {
    var c = weather.current;
    var next6 = weather.hourly.slice(0, 6);
    var next3 = weather.daily.slice(0, 3);
    var rainChance6 = next6.some(function (item) { return item.pop > 0.4 || item.rain > 0; });
    var rainfall48 = next3.slice(0, 2).reduce(function (sum, item) { return sum + item.rain; }, 0);
    var dryHarvest = next3.every(function (item) { return item.rain === 0 && item.pop < 0.3; }) && c.main.humidity < 80 && c.wind.speed < 20;
    var spray = c.wind.speed > 25 || rainChance6 || c.main.humidity > 85 ? 'avoid' : (c.wind.speed < 15 && c.main.humidity >= 40 && c.main.humidity <= 70 ? 'good' : 'caution');
    var irrigation = rainfall48 > 10 ? 'delay' : (c.soilMoisture !== null && c.soilMoisture < 0.2 && !rainChance6 ? 'irrigate' : 'skip');
    var disease = c.main.humidity > 85 && c.main.temp >= 20 && c.main.temp <= 30 && c.rain['1h'] > 0 ? 'high' : (c.main.humidity >= 70 ? 'medium' : 'low');
    var fishing = c.wind.speed > 40 ? 'danger' : (c.wind.speed > 25 ? 'caution' : 'safe');
    return { spraying: spray, irrigation: irrigation, harvest: dryHarvest ? 'favorable' : 'unfavorable', diseaseRisk: disease, fishing: fishing, rainfall48: rainfall48 };
  }

  function advisoryText(weather, language) {
    var en = language !== 'te'; var a = weather.advisory; var c = weather.current;
    return {
      spraying: a.spraying === 'good' ? (en ? ['✅ Suitable today', 'Low wind, no rain expected in the next 6 hours.'] : ['✅ ఈ రోజు అనుకూలం', 'గాలి తక్కువగా ఉంది; వచ్చే 6 గంటల్లో వర్ష సూచన లేదు.']) : a.spraying === 'avoid' ? (en ? ['❌ Avoid spraying', 'Rain, high humidity, or strong wind can reduce spray effectiveness.'] : ['❌ పిచికారీ నివారించండి', 'వర్షం, అధిక తేమ లేదా బలమైన గాలులు ప్రభావాన్ని తగ్గిస్తాయి.']) : (en ? ['⚠️ Use caution', 'Choose a calm, dry window before spraying.'] : ['⚠️ జాగ్రత్తగా చేయండి', 'ప్రశాంతమైన, పొడి సమయాన్ని ఎంచుకోండి.']),
      irrigation: a.irrigation === 'irrigate' ? (en ? ['💧 Irrigate today', 'Topsoil is dry and no meaningful rain is expected.'] : ['💧 ఈ రోజు నీటిపారుదల చేయండి', 'పై నేల పొడిగా ఉంది; గణనీయమైన వర్ష సూచన లేదు.']) : a.irrigation === 'delay' ? (en ? ['🌧️ Delay irrigation', 'More than 10 mm of rain is forecast within 48 hours.'] : ['🌧️ నీటిపారుదల వాయిదా వేయండి', '48 గంటల్లో 10 మి.మీ. కంటే ఎక్కువ వర్షం సూచించబడింది.']) : (en ? ['✅ Irrigation not needed', 'Current soil moisture and rainfall outlook are adequate.'] : ['✅ నీటిపారుదల అవసరం లేదు', 'ప్రస్తుత నేల తేమ, వర్ష సూచన సరిపోతున్నాయి.']),
      harvest: a.harvest === 'favorable' ? (en ? ['✅ Good for harvest', 'The next three days look dry and calm.'] : ['✅ కోతకు అనుకూలం', 'వచ్చే మూడు రోజులు పొడిగా, ప్రశాంతంగా ఉన్నాయి.']) : (en ? ['⚠️ Protect harvested crops', 'Rain or humidity may affect drying produce.'] : ['⚠️ కోసిన పంటను రక్షించండి', 'వర్షం లేదా తేమ ఆరబెట్టే పంటను ప్రభావితం చేయవచ్చు.']),
      disease: a.diseaseRisk === 'high' ? (en ? ['🔴 Blight risk high', 'Warm, wet and humid conditions favour fungal disease.'] : ['🔴 ముడత తెగులు ముప్పు ఎక్కువ', 'వెచ్చని, తడి, తేమతో కూడిన పరిస్థితులు శిలీంధ్ర వ్యాధికి అనుకూలం.']) : (en ? [a.diseaseRisk === 'medium' ? '🟠 Monitor for fungal disease' : '🟢 Disease risk low', a.diseaseRisk === 'medium' ? 'Humidity is elevated; inspect crops regularly.' : 'Conditions are presently less favourable for fungal disease.'] : [a.diseaseRisk === 'medium' ? '🟠 శిలీంధ్ర వ్యాధిని గమనించండి' : '🟢 వ్యాధి ముప్పు తక్కువ', a.diseaseRisk === 'medium' ? 'తేమ పెరిగింది; పంటలను క్రమం తప్పకుండా పరిశీలించండి.' : 'ప్రస్తుతం శిలీంధ్ర వ్యాధికి పరిస్థితులు తక్కువ అనుకూలంగా ఉన్నాయి.']),
      fishing: a.fishing === 'danger' ? (en ? ['🚫 Do not venture into the sea', 'Wind speed is unsafe for small fishing vessels.'] : ['🚫 సముద్రంలోకి వెళ్లవద్దు', 'చిన్న చేపల పడవలకు గాలి వేగం అసురక్షితం.']) : (en ? [a.fishing === 'caution' ? '⚠️ Fishing: caution' : '✅ Sea conditions: safer', a.fishing === 'caution' ? 'Check official marine warnings before departure.' : 'Continue to check official marine warnings.'] : [a.fishing === 'caution' ? '⚠️ చేపల వేట: జాగ్రత్త' : '✅ సముద్ర పరిస్థితులు: సురక్షితం', a.fishing === 'caution' ? 'బయలుదేరే ముందు అధికారిక సముద్ర హెచ్చరికలు తనిఖీ చేయండి.' : 'అధికారిక సముద్ర హెచ్చరికలను తనిఖీ చేస్తూ ఉండండి.'])
    };
  }

  async function enrichment(location) {
    var results = await Promise.allSettled([
      fetch('/.netlify/functions/weather-enrichment?lat=' + encodeURIComponent(location.lat) + '&lon=' + encodeURIComponent(location.lon), { signal: AbortSignal.timeout(7000) }).then(function (r) { return r.ok ? r.json() : null; }),
      fetch(RAIN_VIEWER, { signal: AbortSignal.timeout(7000) }).then(function (r) { return r.ok ? r.json() : null; })
    ]);
    var optional = results[0].status === 'fulfilled' ? results[0].value : null;
    var radar = results[1].status === 'fulfilled' ? results[1].value : null;
    return Object.assign({}, optional || {}, { radar: radar || null });
  }

  async function loadLocation(location) {
    var cached = readCache(location.id);
    if (cached) {
      weatherByLocation[location.id] = cached.data;
      cached.data.stale = Date.now() - cached.savedAt > CACHE_TTL;
      window.dispatchEvent(new CustomEvent('weatherLoaded', { detail: { id: location.id, weather: cached.data, fromCache: true } }));
      if (!cached.data.stale) return cached.data;
    }
    try {
      var response = await fetch(openMeteoUrl(location), { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error('Open-Meteo request failed');
      var data = normalise(await response.json(), location, await enrichment(location));
      weatherByLocation[location.id] = data;
      writeCache(location.id, data);
      window.dispatchEvent(new CustomEvent('weatherLoaded', { detail: { id: location.id, weather: data, fromCache: false } }));
      return data;
    } catch (error) {
      window.dispatchEvent(new CustomEvent('weatherError', { detail: { id: location.id, error: error } }));
      throw error;
    }
  }

  function current(id) { return weatherByLocation[id] || null; }
  window.WeatherClient = { loadLocation: loadLocation, current: current, advisoryText: advisoryText, formatTime: formatTime, codeInfo: getInfo };
})();
