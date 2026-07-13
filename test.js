const KEYS = {
    tomorrow: 'Bam1TK5UWkBMufRvPXRgwmxYkSZo3Pw4',
    openweather: 'bb5b555de635560c235a7321f88c07ce'
};

const lat = 18.2949;
const lon = 83.8935;

async function testApis() {
    console.log("Testing OpenWeatherMap API...");
    try {
        const owmRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${KEYS.openweather}&units=metric`);
        if (owmRes.ok) {
            const data = await owmRes.json();
            console.log("✅ OpenWeatherMap Success! Temp:", data.main.temp, "Condition:", data.weather[0].main);
        } else {
            console.log("❌ OpenWeatherMap Failed:", owmRes.status, await owmRes.text());
        }
    } catch (e) {
        console.log("❌ OpenWeatherMap Error:", e.message);
    }

    console.log("\nTesting Tomorrow.io API...");
    try {
        const tomRes = await fetch(`https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&apikey=${KEYS.tomorrow}&units=metric`);
        if (tomRes.ok) {
            const data = await tomRes.json();
            const hourly = data.timelines?.hourly;
            console.log("✅ Tomorrow.io Success! Found hourly records:", hourly ? hourly.length : 0);
        } else {
            console.log("❌ Tomorrow.io Failed:", tomRes.status, await tomRes.text());
        }
    } catch (e) {
        console.log("❌ Tomorrow.io Error:", e.message);
    }
}

testApis();
