/**
 * Srikakulam Weatherman - Live API Integration
 */

const KEYS = {
    tomorrow: 'Bam1TK5UWkBMufRvPXRgwmxYkSZo3Pw4',
    openweather: 'bb5b555de635560c235a7321f88c07ce'
};

/**
 * Tomorrow.io Weather Codes -> Our UI conditions
 */
const tomorrowCodeToCondition = (code) => {
    const map = {
        1000: 'sunny', // Clear, Sunny
        1100: 'sunny', // Mostly Clear
        1101: 'partlyCloudy', // Partly Cloudy
        1102: 'cloudy', // Mostly Cloudy
        1001: 'cloudy', // Cloudy
        2000: 'foggy', // Fog
        2100: 'foggy', // Light Fog
        4000: 'drizzle', // Drizzle
        4001: 'rainy', // Rain
        4200: 'rainy', // Light Rain
        4201: 'heavyRain', // Heavy Rain
        8000: 'thunderstorm' // Thunderstorm
    };
    return map[code] || 'cloudy';
};

/**
 * OpenWeatherMap Icon -> Our UI conditions
 */
const owmIconToCondition = (icon) => {
    const map = {
        '01d': 'sunny',
        '01n': 'clearNight',
        '02d': 'partlyCloudy',
        '02n': 'partlyCloudy',
        '03d': 'cloudy',
        '03n': 'cloudy',
        '04d': 'cloudy',
        '04n': 'cloudy',
        '09d': 'rainy',
        '09n': 'rainy',
        '10d': 'rainy',
        '10n': 'rainy',
        '11d': 'thunderstorm',
        '11n': 'thunderstorm',
        '50d': 'hazy',
        '50n': 'foggy'
    };
    return map[icon] || 'cloudy';
};

/**
 * Fetches live weather for a given lat, lon
 * Returns data in the exact format MOCK_WEATHER used.
 */
async function fetchWeatherData(lat, lon, locNameEn) {
    try {
        // Fetch concurrently, catching individual errors
        const owmRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${KEYS.openweather}&units=metric`).catch(e => null);
        const tomorrowRes = await fetch(`https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&apikey=${KEYS.tomorrow}&units=metric`).catch(e => null);

        if (!owmRes || !owmRes.ok) {
            console.error("OpenWeatherMap failed");
            return null; // Require at least OWM for current weather
        }
        
        const owmData = await owmRes.json();
        
        let tomorrowData = {};
        if (tomorrowRes && tomorrowRes.ok) {
            tomorrowData = await tomorrowRes.json();
        } else {
            console.warn("Tomorrow.io failed, falling back to empty timelines");
        }

        // Standardize output to match our UI expected format
        const timelines = tomorrowData.timelines || {};
        const hourlyData = timelines.hourly || [];
        const dailyData = timelines.daily || [];

        // 1. Current (From OpenWeatherMap)
        const currentCondition = owmIconToCondition(owmData.weather?.[0]?.icon || '04d');
        const current = {
            main: {
                temp: owmData.main?.temp || 0,
                feels_like: owmData.main?.feels_like || 0,
                humidity: owmData.main?.humidity || 0,
                pressure: owmData.main?.pressure || 0,
            },
            wind: { speed: (owmData.wind?.speed || 0) * 3.6 }, // m/s to km/h
            condition: currentCondition,
            rain: { '1h': owmData.rain?.['1h'] || 0 },
            aqi: { value: 50 }, // Stub since OWM standard doesn't include AQI
            name: locNameEn
        };

        // 2. Hourly (From Tomorrow.io or Mock fallback)
        let hourly = hourlyData.slice(0, 24).map(h => {
            const time = new Date(h.time).getTime() / 1000;
            const vals = h.values || {};
            return {
                time: time,
                temp: vals.temperature,
                feels_like: vals.temperatureApparent,
                humidity: vals.humidity,
                wind_speed: vals.windSpeed * 3.6, // assuming m/s, convert to km/h
                pop: (vals.precipitationProbability || 0) / 100,
                condition: tomorrowCodeToCondition(vals.weatherCode)
            };
        });

        if (hourly.length === 0) {
            // Fallback to mock data if Tomorrow API failed
            hourly = MOCK_WEATHER.hourly;
        }

        // 3. Daily (From Tomorrow.io or Mock fallback)
        let daily = dailyData.slice(0, 7).map(d => {
            const time = new Date(d.time).getTime();
            const vals = d.values || {};
            return {
                date: time,
                temp: {
                    day: vals.temperatureAvg || vals.temperatureMax,
                    min: vals.temperatureMin,
                    max: vals.temperatureMax
                },
                humidity: vals.humidityAvg || 0,
                wind_speed: (vals.windSpeedAvg || 0) * 3.6,
                rain: vals.precipitationAccumulation || 0, // mm
                condition: tomorrowCodeToCondition(vals.weatherCodeMax || vals.weatherCode)
            };
        });

        if (daily.length === 0) {
            // Fallback to mock data if Tomorrow API failed
            daily = MOCK_WEATHER.daily;
        }

        return { current, hourly, daily };

    } catch (error) {
        console.error("Error fetching live weather data:", error);
        return null;
    }
}

/**
 * Dynamically generate Farmer Advisories based on live weather data
 */
function generateFarmerAdvisories(weatherData) {
    const current = weatherData.current;
    const daily = weatherData.daily;
    const today = daily[0] || {};
    
    // Logic for Spraying
    const windSpeed = current.wind.speed;
    const rainExpected = (today.rain > 2) || (current.rain?.['1h'] > 0);
    
    let spraySuitable = true;
    let sprayReasonEn = 'Conditions are good for spraying.';
    let sprayReasonTe = 'పిచికారీకి పరిస్థితులు అనుకూలంగా ఉన్నాయి.';
    
    if (windSpeed > 15) {
        spraySuitable = false;
        sprayReasonEn = 'Wind speeds are too high for spraying.';
        sprayReasonTe = 'పిచికారీకి గాలి వేగం చాలా ఎక్కువగా ఉంది.';
    } else if (rainExpected) {
        spraySuitable = false;
        sprayReasonEn = 'Rainfall expected. Spraying is not recommended.';
        sprayReasonTe = 'వర్షం వచ్చే అవకాశం ఉంది. పిచికారీకి అనుకూలం కాదు.';
    }
    
    // Logic for Irrigation
    let irrigationNeeded = true;
    let irrigationReasonEn = 'Soil is likely dry, irrigation is recommended.';
    let irrigationReasonTe = 'నేల పొడిగా ఉండే అవకాశం ఉంది, నీటిపారుదల సిఫార్సు చేయబడింది.';
    
    // Calculate total rain in next 3 days
    let upcomingRain = 0;
    for (let i = 0; i < Math.min(3, daily.length); i++) {
        upcomingRain += daily[i].rain || 0;
    }
    
    if (upcomingRain > 10 || current.rain?.['1h'] > 0) {
        irrigationNeeded = false;
        irrigationReasonEn = 'Sufficient rainfall expected. No irrigation needed.';
        irrigationReasonTe = 'తగినంత వర్షపాతం ఆశించబడుతోంది. నీటిపారుదల అవసరం లేదు.';
    }

    return {
        sprayAdvisory: {
            suitable: spraySuitable,
            reason: { en: sprayReasonEn, te: sprayReasonTe },
            windSpeed: windSpeed.toFixed(1),
            rainExpected: rainExpected,
            nextWindow: { en: spraySuitable ? 'Now' : 'Check tomorrow', te: spraySuitable ? 'ఇప్పుడు' : 'రేపు తనిఖీ చేయండి' }
        },
        irrigationAdvice: {
            needed: irrigationNeeded,
            reason: { en: irrigationReasonEn, te: irrigationReasonTe },
            soilMoisture: irrigationNeeded ? 'Low' : 'Adequate',
            rainfallLast7Days: upcomingRain.toFixed(1) + ' (next 3 days)'
        }
    };
}
