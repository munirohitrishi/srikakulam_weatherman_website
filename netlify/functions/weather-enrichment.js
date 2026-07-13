// Optional server-side enrichment. Set WEATHERAPI_KEY and TOMORROW_API_KEY in
// Netlify environment variables; the site remains fully functional without them.
exports.handler = async function (event) {
  const lat = event.queryStringParameters && event.queryStringParameters.lat;
  const lon = event.queryStringParameters && event.queryStringParameters.lon;
  if (!lat || !lon) return { statusCode: 400, body: JSON.stringify({ error: 'lat and lon are required' }) };

  const results = await Promise.allSettled([
    process.env.WEATHERAPI_KEY ? fetch(`https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHERAPI_KEY}&q=${lat},${lon}&days=3&aqi=yes&alerts=yes`).then(r => r.ok ? r.json() : null) : Promise.resolve(null),
    process.env.TOMORROW_API_KEY ? fetch(`https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&apikey=${process.env.TOMORROW_API_KEY}&timesteps=1h,1d&fields=temperature,humidity,windSpeed,precipitationIntensity,weatherCode,epaIndex,treeIndex,grassIndex`).then(r => r.ok ? r.json() : null) : Promise.resolve(null)
  ]);
  const weatherApi = results[0].status === 'fulfilled' ? results[0].value : null;
  const tomorrow = results[1].status === 'fulfilled' ? results[1].value : null;
  const aqi = weatherApi && weatherApi.current && weatherApi.current.air_quality;
  const alerts = weatherApi && weatherApi.alerts && Array.isArray(weatherApi.alerts.alert) ? weatherApi.alerts.alert.map(alert => ({
    title: alert.headline || 'Weather alert', description: alert.desc || '', severity: alert.severity || 'medium', start: alert.effective || '', end: alert.expires || ''
  })) : [];
  return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' }, body: JSON.stringify({
    aqi: aqi ? { value: Math.round(aqi['us-epa-index'] || aqi['pm2_5'] || 0), category: aqi['us-epa-index'] ? `EPA ${aqi['us-epa-index']}` : 'Available' } : null,
    alerts, tomorrowAvailable: Boolean(tomorrow)
  }) };
};
