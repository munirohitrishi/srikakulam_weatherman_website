/* ================================================================
   SRIKAKULAM WEATHERMAN v2 — app.js
   ----------------------------------------------------------------
   OPENWEATHER KEY (optional): paste your key below. While it says
   "YOUR_OPENWEATHER_API_KEY", the site automatically uses
   Open-Meteo (free, no key) so everything stays LIVE.
   ================================================================ */
const OWM_KEY = "YOUR_OPENWEATHER_API_KEY";
const USE_OWM = OWM_KEY && !/YOUR_/.test(OWM_KEY);

/* ---------- 26 districts: [name EN, name TE, lat, lon, coastal, sea lat, sea lon] ---------- */
const DISTRICTS = [
 ["Alluri Sitharama Raju","అల్లూరి సీతారామరాజు",18.08,82.67,0],
 ["Anakapalli","అనకాపల్లి",17.69,83.00,1,17.5,83.1],
 ["Anantapuramu","అనంతపురము",14.68,77.60,0],
 ["Annamayya","అన్నమయ్య",14.05,78.75,0],
 ["Bapatla","బాపట్ల",15.90,80.47,1,15.75,80.6],
 ["Chittoor","చిత్తూరు",13.22,79.10,0],
 ["East Godavari","తూర్పు గోదావరి",17.00,81.78,0],
 ["Eluru","ఏలూరు",16.71,81.10,0],
 ["Guntur","గుంటూరు",16.31,80.44,0],
 ["Kakinada","కాకినాడ",16.99,82.25,1,16.9,82.4],
 ["Konaseema (Dr.BRA)","కోనసీమ (డా.బి.ఆర్.అం)",16.58,82.01,1,16.5,82.2],
 ["Kurnool","కర్నూలు",15.83,78.04,0],
 ["Nandyal","నంద్యాల",15.48,78.48,0],
 ["Krishna","కృష్ణా",16.19,81.14,1,16.05,81.3],
 ["NTR","ఎన్టీఆర్",16.51,80.65,0],
 ["Palnadu","పల్నాడు",16.23,80.05,0],
 ["Parvathipuram Manyam","పార్వతీపురం మన్యం",18.78,83.43,0],
 ["Prakasam","ప్రకాశం",15.51,80.05,1,15.3,80.3],
 ["Sri Sathya Sai","శ్రీ సత్యసాయి",14.17,77.81,0],
 ["Srikakulam","శ్రీకాకుళం",18.30,83.90,1,18.2,84.1],
 ["Nellore (SPSR)","నెల్లూరు (SPSR)",14.44,79.99,1,14.4,80.25],
 ["Tirupati","తిరుపతి",13.63,79.42,1,13.65,80.25],
 ["Visakhapatnam","విశాఖపట్నం",17.69,83.22,1,17.6,83.4],
 ["Vizianagaram","విజయనగరం",18.11,83.40,1,17.95,83.6],
 ["West Godavari","పశ్చిమ గోదావరి",16.54,81.52,1,16.35,81.75],
 ["YSR Kadapa","వైఎస్ఆర్ కడప",14.47,78.82,0]
];
const SRI_IDX = 19;               // Srikakulam = safe default
let HOME_IDX = SRI_IDX;           // becomes the user's nearest district after geolocation

/* ---------- WMO weather codes → [icon, EN, TE] ---------- */
const WMO = {
 0:["☀️","Clear sky","నిర్మలాకాశం"],1:["🌤️","Mostly clear","ఎక్కువగా నిర్మలం"],
 2:["⛅","Partly cloudy","పాక్షిక మేఘాలు"],3:["☁️","Overcast","మేఘావృతం"],
 45:["🌫️","Fog","పొగమంచు"],48:["🌫️","Rime fog","పొగమంచు"],
 51:["🌦️","Light drizzle","తేలికపాటి జల్లులు"],53:["🌦️","Drizzle","జల్లులు"],55:["🌧️","Heavy drizzle","భారీ జల్లులు"],
 61:["🌦️","Light rain","తేలికపాటి వర్షం"],63:["🌧️","Moderate rain","మోస్తరు వర్షం"],65:["🌧️","Heavy rain","భారీ వర్షం"],
 66:["🌧️","Freezing rain","శీతల వర్షం"],67:["🌧️","Freezing rain","శీతల వర్షం"],
 71:["🌨️","Snow","మంచు"],73:["🌨️","Snow","మంచు"],75:["❄️","Heavy snow","భారీ మంచు"],
 80:["🌦️","Rain showers","వర్షపు జల్లులు"],81:["🌧️","Rain showers","వర్షపు జల్లులు"],82:["⛈️","Violent showers","తీవ్ర జల్లులు"],
 95:["⛈️","Thunderstorm","ఉరుములతో వర్షం"],96:["⛈️","Storm + hail","వడగళ్ల వాన"],99:["⛈️","Storm + hail","వడగళ్ల వాన"]
};
const wmo = c => WMO[c] || ["🌡️","Weather","వాతావరణం"];
const bi = (en,te)=>`<span class="en">${en}</span><span class="te">${te}</span>`;
const $ = id => document.getElementById(id);

let WX = null, selDist = SRI_IDX, chart = null;

/* ================================================================
   GEOLOCATION — custom modal + HTML5 Geolocation API
   ----------------------------------------------------------------
   HOW THE COORDINATES FEED THE WEATHER APIs:
   • On success we get { latitude, longitude } from the browser.
   • Open-Meteo:  https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LON&current=...
   • OpenWeather: https://api.openweathermap.org/data/2.5/weather?lat=LAT&lon=LON&appid=KEY
   Here we snap the coords to the NEAREST of the 26 district HQs
   (haversine distance) so every dashboard (Rytu/Matsya/forecast)
   switches to the visitor's own district automatically.
   ================================================================ */
function haversine(a1,o1,a2,o2){
  const R=6371, dA=(a2-a1)*Math.PI/180, dO=(o2-o1)*Math.PI/180;
  const s=Math.sin(dA/2)**2 + Math.cos(a1*Math.PI/180)*Math.cos(a2*Math.PI/180)*Math.sin(dO/2)**2;
  return 2*R*Math.asin(Math.sqrt(s));
}
function nearestDistrict(lat,lon){
  let best=0,bd=1e9;
  DISTRICTS.forEach((d,i)=>{ const k=haversine(lat,lon,d[2],d[3]); if(k<bd){bd=k;best=i;} });
  return best;
}
/**
 * Requests the user's location. Resolves with {lat, lon} on success.
 * NEVER rejects into a visible error — every failure path (permission
 * denied, position unavailable, timeout, unsupported browser) resolves
 * with null so the caller can silently fall back to Srikakulam.
 */
function getUserLocation(){
  return new Promise(resolve=>{
    if(!("geolocation" in navigator)) return resolve(null);          // unsupported browser
    navigator.geolocation.getCurrentPosition(
      pos => resolve({lat:pos.coords.latitude, lon:pos.coords.longitude}), // success → coords
      err => {
        // err.code: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
        console.info("Geolocation fallback → Srikakulam (code "+err.code+")");
        resolve(null);                                               // silent fallback, no alert
      },
      { timeout:8000, maximumAge:10*60*1000, enableHighAccuracy:false }
    );
  });
}
async function useLocation(){
  const loc = await getUserLocation();
  if(loc){
    HOME_IDX = nearestDistrict(loc.lat, loc.lon);
  } // else: HOME_IDX stays Srikakulam — nothing breaks
  applyHome();
}
function applyHome(){
  $("nowCity").innerHTML = bi(DISTRICTS[HOME_IDX][0], DISTRICTS[HOME_IDX][1]);
  if(WX){
    renderHero(); renderTheme();
    ["fcDist","rytuDist"].forEach(id=>{ $(id).value = HOME_IDX; });
    renderForecast(); renderRytu();
    if(DISTRICTS[HOME_IDX][4]){ $("seaDist").value = HOME_IDX; renderSea(); }
  }
}
function initGeoModal(){
  const m = $("geoModal");
  let asked = false;
  try{ asked = localStorage.getItem("swm-geo-asked")==="1"; }catch(e){}
  if(asked){ useLocation(); return; }           // returning visitor: reuse browser permission state
  m.classList.add("on");
  const done = ()=>{ m.classList.remove("on"); try{localStorage.setItem("swm-geo-asked","1")}catch(e){} };
  $("geoAllow").onclick = ()=>{ done(); useLocation(); };            // triggers native browser prompt
  $("geoManual").onclick = ()=>{ done();                             // manual: jump to district grid
    document.querySelector("#districts").scrollIntoView({behavior:"smooth"}); };
}

/* ================= FETCH ENGINE (Open-Meteo primary, OWM optional) ================= */
async function fetchAll(){
  const lats = DISTRICTS.map(d=>d[2]).join(",");
  const lons = DISTRICTS.map(d=>d[3]).join(",");
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}`+
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day`+
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_gusts_10m_max,sunrise,sunset`+
    `&forecast_days=8&timezone=Asia%2FKolkata`;
  const r = await fetch(url);
  if(!r.ok) throw new Error("open-meteo "+r.status);
  const j = await r.json();
  WX = Array.isArray(j)? j : [j];

  if(USE_OWM){
    /* Optional OpenWeatherMap overlay for the home district's current conditions */
    try{
      const d = DISTRICTS[HOME_IDX];
      const ow = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${d[2]}&lon=${d[3]}&units=metric&appid=${OWM_KEY}`).then(x=>x.json());
      if(ow && ow.main){
        WX[HOME_IDX].current.temperature_2m = ow.main.temp;
        WX[HOME_IDX].current.apparent_temperature = ow.main.feels_like;
        WX[HOME_IDX].current.relative_humidity_2m = ow.main.humidity;
        WX[HOME_IDX].current.wind_speed_10m = ow.wind.speed*3.6;
      }
    }catch(e){ console.warn("OWM failed, using Open-Meteo", e); }
  }
}
async function fetchAqi(){
  try{
    const d = DISTRICTS[HOME_IDX];
    const j = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${d[2]}&longitude=${d[3]}&current=us_aqi`).then(r=>r.json());
    $("nowAqi").textContent = Math.round(j.current.us_aqi);
  }catch(e){ $("nowAqi").textContent = "—"; }
}
async function fetchMarine(i){
  const d = DISTRICTS[i];
  return fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${d[5]}&longitude=${d[6]}`+
    `&current=wave_height,wave_period&daily=wave_height_max&forecast_days=2&timezone=Asia%2FKolkata`).then(r=>r.json());
}

/* ================= DYNAMIC WEATHER THEME + SCENE ================= */
function themeFor(code,isDay){
  if(code>=95) return "theme-thunder";
  if((code>=51&&code<=67)||(code>=80&&code<=82)) return "theme-rainy";
  if(!isDay) return "theme-night";
  if(code<=1) return "theme-sunny";
  return "theme-cloudy";
}
function renderTheme(){
  const c = WX[HOME_IDX].current;
  const t = themeFor(c.weather_code, c.is_day);
  document.body.classList.remove("theme-sunny","theme-cloudy","theme-rainy","theme-thunder","theme-night");
  document.body.classList.add(t);
  if(window.__setRain) window.__setRain(t==="theme-rainy"||t==="theme-thunder");
}
function buildScene(){
  const stars = $("stars");
  stars.innerHTML = Array.from({length:70},()=>{
    const x=Math.random()*100, y=Math.random()*60, d=(Math.random()*3).toFixed(2);
    return `<span style="left:${x}%;top:${y}%;animation-delay:${d}s"></span>`;
  }).join("");
  const rain = $("rainLayer");
  rain.innerHTML = Array.from({length:46},()=>{
    const x=Math.random()*100, dl=(Math.random()*1.2).toFixed(2), du=(0.8+Math.random()*.7).toFixed(2);
    return `<i style="left:${x}%;animation-delay:${dl}s;animation-duration:${du}s"></i>`;
  }).join("");
}

/* ================= HERO ================= */
const fmtTime = iso => iso ? iso.slice(11,16) : "--:--";
function renderHero(){
  const w = WX[HOME_IDX], c = w.current, dy = w.daily, ic = wmo(c.weather_code);
  $("nowTemp").innerHTML = Math.round(c.temperature_2m)+"<sup>°</sup>";
  $("nowIco").textContent = (!c.is_day && c.weather_code<=1) ? "🌙" : ic[0];
  $("nowDesc").innerHTML = bi(ic[1], ic[2]) + ` · H ${Math.round(dy.temperature_2m_max[0])}° / L ${Math.round(dy.temperature_2m_min[0])}°`;
  $("nowFeels").textContent = Math.round(c.apparent_temperature)+"°";
  $("nowHum").textContent = Math.round(c.relative_humidity_2m)+"%";
  $("nowWind").textContent = Math.round(c.wind_speed_10m);
  $("nowRise").textContent = fmtTime(dy.sunrise[0]);
  $("nowSet").textContent = fmtTime(dy.sunset[0]);
  $("nowUpdated").textContent = "Updated "+new Date().toLocaleTimeString("en-IN",{hour:'2-digit',minute:'2-digit'});
}

/* ================= DISTRICT GRID ================= */
function renderGrid(){
  const grid = $("distGrid");
  grid.innerHTML = DISTRICTS.map((d,i)=>{
    const w = WX[i], c = w.current, dy = w.daily, ic = wmo(c.weather_code);
    return `<div class="dcard glass${i===selDist?' sel':''}" data-i="${i}">
      <h4>${bi(d[0],d[1])}</h4>
      <div class="dtemp">${Math.round(c.temperature_2m)}°</div>
      <div class="dico">${(!c.is_day && c.weather_code<=1)?"🌙":ic[0]}</div>
      <div class="dmeta"><span>🌧️ ${dy.precipitation_probability_max[0] ?? 0}%</span><span>💨 ${Math.round(c.wind_speed_10m)}</span></div>
    </div>`;
  }).join("");
  grid.querySelectorAll(".dcard").forEach(el=>el.addEventListener("click",()=>selectDistrict(+el.dataset.i)));
}
const DAYS_EN=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], DAYS_TE=["ఆది","సోమ","మంగళ","బుధ","గురు","శుక్ర","శని"];
const dayName=(iso,k)=>{ const d=new Date(iso+"T00:00:00"); return k==="te"?DAYS_TE[d.getDay()]:DAYS_EN[d.getDay()]; };
function selectDistrict(i){
  selDist = i;
  renderGrid();
  const w = WX[i], dy = w.daily, c = w.current, ic = wmo(c.weather_code);
  const box = $("dist-detail");
  box.classList.add("on");
  $("ddName").innerHTML = "📍 "+bi(DISTRICTS[i][0],DISTRICTS[i][1]);
  $("ddNow").innerHTML = `${ic[0]} ${Math.round(c.temperature_2m)}°C · ` + bi(ic[1],ic[2]);
  $("ddDays").innerHTML = dy.time.slice(0,5).map((t,k)=>`
    <div class="dd-day">
      <div class="d">${bi(dayName(t,'en'),dayName(t,'te'))}</div>
      <div class="i">${wmo(dy.weather_code[k])[0]}</div>
      <div class="t">${Math.round(dy.temperature_2m_max[k])}° <span style="opacity:.6">${Math.round(dy.temperature_2m_min[k])}°</span></div>
      <div class="r">🌧️ ${dy.precipitation_probability_max[k] ?? 0}% · 💨 ${Math.round(dy.wind_gusts_10m_max[k])}</div>
    </div>`).join("");
  if(i!==+$("fcDist").value){ $("fcDist").value = i; renderForecast(); }
  box.scrollIntoView({behavior:"smooth",block:"nearest"});
}

/* ================= FORECAST ================= */
function fillSelects(){
  const opts = DISTRICTS.map((d,i)=>`<option value="${i}">${d[0]} / ${d[1]}</option>`).join("");
  ["fcDist","rytuDist"].forEach(id=>{ const s=$(id); s.innerHTML=opts; s.value=HOME_IDX; });
  const sea = $("seaDist");
  sea.innerHTML = DISTRICTS.map((d,i)=>d[4]?`<option value="${i}">${d[0]} / ${d[1]}</option>`:"").join("");
  sea.value = DISTRICTS[HOME_IDX][4] ? HOME_IDX : SRI_IDX;
}
function renderForecast(){
  const i = +$("fcDist").value, dy = WX[i].daily;
  $("fcScroll").innerHTML = dy.time.map((t,k)=>{
    const ic = wmo(dy.weather_code[k]);
    return `<div class="fc-card glass">
      <div class="day">${k===0?bi("Today","నేడు"):bi(dayName(t,'en'),dayName(t,'te'))}</div>
      <div class="date">${t.slice(8,10)}/${t.slice(5,7)}</div>
      <div class="fico" style="animation-delay:${k*.25}s">${ic[0]}</div>
      <div class="mx">${Math.round(dy.temperature_2m_max[k])}°</div>
      <div class="mn">${Math.round(dy.temperature_2m_min[k])}°</div>
      <div class="row"><span>🌧️</span><b>${dy.precipitation_probability_max[k] ?? 0}%</b></div>
      <div class="row"><span>💨 ${bi("Gust","గాలులు")}</span><b>${Math.round(dy.wind_gusts_10m_max[k])} km/h</b></div>
      <div class="row"><span>💧</span><b>${(dy.precipitation_sum[k]??0).toFixed(1)} mm</b></div>
    </div>`;
  }).join("");
  renderChart(i);
}
function renderChart(i){
  const dy = WX[i].daily, ctx = $("tempChart");
  if(!window.Chart || !ctx) return;
  const labels = dy.time.map(t=>t.slice(8,10)+"/"+t.slice(5,7));
  if(chart) chart.destroy();
  chart = new Chart(ctx,{type:"line",data:{labels,datasets:[
    {label:"Max °C",data:dy.temperature_2m_max,borderColor:"#FFC300",backgroundColor:"rgba(255,195,0,.12)",fill:true,tension:.4,pointRadius:4},
    {label:"Min °C",data:dy.temperature_2m_min,borderColor:"#00C9FF",backgroundColor:"rgba(0,201,255,.10)",fill:true,tension:.4,pointRadius:4}
  ]},options:{plugins:{legend:{labels:{color:"#9fb3d1"}}},
    scales:{x:{ticks:{color:"#8aa0c4"},grid:{color:"rgba(140,160,200,.1)"}},y:{ticks:{color:"#8aa0c4"},grid:{color:"rgba(140,160,200,.1)"}}}}});
}

/* ================= CYCLONE BULLETIN & EMERGENCY HUB ================= */
function renderCyclone(){
  const coastal = DISTRICTS.map((d,i)=>({d,i})).filter(x=>x.d[4]);
  const events = [];
  let active = false;
  coastal.forEach(({d,i})=>{
    const w=WX[i], c=w.current, dy=w.daily;
    const gust=dy.wind_gusts_10m_max[0]||0, prob=dy.precipitation_probability_max[0]||0, sum=dy.precipitation_sum[0]||0;
    if(c.weather_code>=95){ active=true; events.push([2,`⛈️ ${d[0]}: `+ "Thunderstorm active — squalls & lightning reported.", `⛈️ ${d[1]}: ఉరుములతో తుఫాను — మెరుపులు నమోదు.`]); }
    if(gust>=60){ active=true; events.push([2,`🌬️ ${d[0]}: `+`Squally winds up to ${Math.round(gust)} km/h along the coast.`, `🌬️ ${d[1]}: తీరం వెంట ${Math.round(gust)} km/h గాలులు.`]); }
    else if(gust>=45) events.push([1,`💨 ${d[0]}: `+`Strong winds ${Math.round(gust)} km/h expected today.`, `💨 ${d[1]}: నేడు ${Math.round(gust)} km/h గాలులు.`]);
    if(prob>=80 && sum>=20) events.push([1,`🌧️ ${d[0]}: `+`Heavy rain spell likely (~${sum.toFixed(0)}mm).`, `🌧️ ${d[1]}: భారీ వర్షం (~${sum.toFixed(0)}mm) అవకాశం.`]);
  });
  events.sort((a,b)=>b[0]-a[0]);
  const now = new Date(), hhmm = h => h.toLocaleTimeString("en-IN",{hour:'2-digit',minute:'2-digit',hour12:false});
  const items = (events.length?events:[[0,
      "All coastal districts normal — no cyclone/low-pressure impact signals in today's model data.",
      "అన్ని తీర జిల్లాలు సాధారణం — నేటి మోడల్ డేటాలో తుఫాను/అల్పపీడన సంకేతాలు లేవు."]])
    .slice(0,7).map((e,k)=>{
      const t=new Date(now-k*9*60000);
      return `<div class="tl-item"><span class="t">${hhmm(t)} IST</span>${bi(e[1],e[2])}</div>`;
    }).join("");
  $("cycTimeline").innerHTML = items + `<div class="tl-item"><span class="t">${bi("Auto-generated from live model data — for official bulletins see IMD/APSDMA","లైవ్ మోడల్ డేటా నుండి ఆటో-జనరేటెడ్ — అధికారిక బులెటిన్ల కోసం IMD/APSDMA చూడండి")}</span></div>`;

  const hub = $("hubBox"), ticker = $("cycTicker");
  hub.classList.toggle("calm", !active);
  ticker.classList.toggle("calm", !active);
  ticker.classList.toggle("flash", active);
  $("hubHeadTxt").innerHTML = active
    ? bi("🔴 LIVE — Storm conditions active on the AP coast","🔴 లైవ్ — AP తీరంలో తుఫాను పరిస్థితులు")
    : bi("🟢 Cyclone Bulletin & Emergency Hub — no active warning","🟢 తుఫాను బులెటిన్ & ఎమర్జెన్సీ హబ్ — హెచ్చరిక లేదు");
  const tick = active
    ? "🔴 LIVE: Cyclone/storm warning conditions active for coastal districts · తీరప్రాంత జిల్లాలకు తుఫాను హెచ్చరిక జారీ చేయబడింది · Call 1070 / 1077 for help"
    : "🟢 No active cyclone warning for AP coast · ప్రస్తుతం తీరప్రాంతానికి తుఫాను హెచ్చరిక లేదు · Bay of Bengal monitored live · Follow @srikakulam_weatherman";
  $("cycTickerIn").innerHTML = `<span>${tick}</span><span>${tick}</span>`;
}

/* ================= JALA VANI — DAM TRACKER ================= */
/* Indicative figures for layout/demo. For live data connect the AP WRIMS feed
   (apwrims.ap.gov.in) or a scraped govt bulletin API, replacing `pct/inflow/outflow`. */
const DAMS = [
 {en:"Srisailam",te:"శ్రీశైలం",river:"Krishna",frl:"885 ft",cap:"215.8 TMC",pct:64,inflow:"1,42,000",outflow:"98,500"},
 {en:"Nagarjuna Sagar",te:"నాగార్జున సాగర్",river:"Krishna",frl:"590 ft",cap:"312.0 TMC",pct:52,inflow:"96,300",outflow:"41,000"},
 {en:"Pulichintala",te:"పులిచింతల",river:"Krishna",frl:"175 ft",cap:"45.8 TMC",pct:58,inflow:"38,400",outflow:"22,100"},
 {en:"Somasila",te:"సోమశిల",river:"Pennar",frl:"100 ft",cap:"78.0 TMC",pct:46,inflow:"12,900",outflow:"6,400"},
 {en:"Gotta Barrage",te:"గొట్టా బ్యారేజ్",river:"Vamsadhara",frl:"—",cap:"—",pct:81,inflow:"24,700",outflow:"21,300"},
 {en:"Thotapalli",te:"తోటపల్లి",river:"Nagavali",frl:"—",cap:"3.0 TMC",pct:73,inflow:"9,800",outflow:"7,200"}
];
function renderJala(){
  $("damGrid").innerHTML = DAMS.map(d=>{
    const st = d.pct>=90 ? ["danger",bi("DANGER — GATES","ప్రమాదం — గేట్లు")] : d.pct>=70 ? ["fill",bi("FILLING FAST","వేగంగా నిండుతోంది")] : ["ok",bi("NORMAL","సాధారణం")];
    return `<div class="dam glass">
      <div class="dam-top">
        <h4>${bi(d.en,d.te)}<small>${d.river} · FRL ${d.frl} · ${d.cap}</small></h4>
        <span class="dam-status ${st[0]}">${st[1]}</span>
      </div>
      <div class="dam-bar"><div class="fill-b" style="width:${d.pct}%"></div><span class="mark" title="Danger level"></span></div>
      <div class="dam-pct"><span>${bi("Current level","ప్రస్తుత మట్టం")}: <b>${d.pct}%</b></span><span>${bi("Danger","ప్రమాదం")}: 92%</span></div>
      <div class="dam-nums">
        <div class="n"><b>${d.inflow}</b><span>${bi("Inflow (cusecs)","ఇన్‌ఫ్లో")}</span></div>
        <div class="n"><b>${d.outflow}</b><span>${bi("Outflow (cusecs)","అవుట్‌ఫ్లో")}</span></div>
        <div class="n"><b>${d.pct>=90?"⚠️":"—"}</b><span>${bi("Gate lift","గేట్ లిఫ్ట్")}</span></div>
      </div>
    </div>`;
  }).join("");
}

/* ================= VIDYUT VANI — LIGHTNING & OUTAGE RISK ================= */
function renderVidyut(){
  let cells=0, maxGust=0, hi=[], md=[];
  WX.forEach((w,i)=>{
    const g = w.daily.wind_gusts_10m_max[0]||0;
    if(w.current.weather_code>=95) cells++;
    if(g>maxGust) maxGust=g;
    if(g>60) hi.push(i); else if(g>=45) md.push(i);
  });
  $("vidCells").innerHTML = cells+`<small> ${bi("active storm cells","యాక్టివ్ స్టార్మ్ సెల్స్")}</small>`;
  $("vidCellsNote").innerHTML = cells
    ? bi(`Thunderstorms currently active over ${cells} district(s). Lightning risk — unplug appliances, avoid open fields & trees.`,
         `${cells} జిల్లాల్లో ఉరుములు యాక్టివ్. మెరుపుల ప్రమాదం — ఉపకరణాలు అన్‌ప్లగ్ చేయండి, ఖాళీ పొలాలు & చెట్ల కింద ఉండొద్దు.`)
    : bi("No active thunderstorm cells detected across AP right now.","ప్రస్తుతం AP అంతటా ఉరుముల సెల్స్ లేవు.");

  /* Risk score: gusts dominate (grid damage), thunder cells add weight */
  const risk = Math.min(100, Math.round(maxGust*0.9 + cells*8));
  $("riskFill").style.width = Math.max(4,risk)+"%";
  $("riskPct").textContent = risk+"%";

  const warn = $("vidWarn");
  if(hi.length){
    warn.classList.add("on");
    const names = hi.map(i=>DISTRICTS[i][0]).join(", ");
    const namesTe = hi.map(i=>DISTRICTS[i][1]).join(", ");
    warn.innerHTML = bi(`⚠️ HIGH RISK OF POWER OUTAGES — winds above 60 km/h expected in: ${names}. Charge phones, inverters & emergency lights NOW.`,
                        `⚠️ విద్యుత్ అంతరాయ ప్రమాదం — 60 km/h పైగా గాలులు: ${namesTe}. ఫోన్లు, ఇన్వర్టర్లు & ఎమర్జెన్సీ లైట్లు ఇప్పుడే ఛార్జ్ చేసుకోండి.`);
  } else warn.classList.remove("on");

  $("riskChips").innerHTML =
    hi.map(i=>`<span class="rchip hi">⚡ ${DISTRICTS[i][0]} · ${Math.round(WX[i].daily.wind_gusts_10m_max[0])} km/h</span>`).join("")+
    md.map(i=>`<span class="rchip md">💨 ${DISTRICTS[i][0]} · ${Math.round(WX[i].daily.wind_gusts_10m_max[0])} km/h</span>`).join("")||
    `<span class="rchip md" style="border-color:rgba(34,197,94,.4);background:rgba(34,197,94,.1);color:#7effb0">✅ ${bi("Grid conditions normal in all 26 districts","అన్ని 26 జిల్లాల్లో గ్రిడ్ సాధారణం")}</span>`;
}

/* ================= RYTU VANI ================= */
function renderRytu(){
  const i = +$("rytuDist").value, w = WX[i], dy = w.daily, c = w.current;
  const rain5 = dy.precipitation_sum.slice(0,5).reduce((a,b)=>a+(b||0),0);
  const probToday = dy.precipitation_probability_max[0]||0;
  const gustToday = dy.wind_gusts_10m_max[0]||0;
  const tmax = dy.temperature_2m_max[0], hum = c.relative_humidity_2m;
  const prob3 = Math.max(...dy.precipitation_probability_max.slice(0,3));

  $("rytuAgg").innerHTML =
    `<div class="a"><b>${rain5.toFixed(0)} mm</b><span>${bi("Rain next 5 days","5 రోజుల వర్షం")}</span></div>
     <div class="a"><b>${probToday}%</b><span>${bi("Rain chance today","నేడు వర్ష అవకాశం")}</span></div>
     <div class="a"><b>${Math.round(gustToday)} km/h</b><span>${bi("Wind gusts","గాలుల వేగం")}</span></div>
     <div class="a"><b>${Math.round(tmax)}°C</b><span>${bi("Max temp","గరిష్ట ఉష్ణోగ్రత")}</span></div>
     <div class="a"><b>${Math.round(hum)}%</b><span>${bi("Humidity","తేమ")}</span></div>`;

  const sprayOK = probToday<30 && gustToday<25;
  const ops = [
    ["🧴", sprayOK
      ? bi("<b>Spraying: GOOD ✅</b><span>Low rain chance & calm winds today — pesticide/fertilizer spray can be done.</span>","<b>మందు కొట్టడం: అనుకూలం ✅</b><span>నేడు వర్ష అవకాశం తక్కువ, గాలులు శాంతం — మిర్చి/పంటలకు మందు కొట్టవచ్చు.</span>")
      : bi("<b>Spraying: AVOID ❌</b><span>Rain or strong winds expected — spray will wash off / drift. Wait for a clear window.</span>","<b>మందు కొట్టడం: వద్దు ❌</b><span>వర్షం లేదా బలమైన గాలుల అవకాశం — మందు కొట్టొద్దు, అనుకూల సమయం కోసం ఆగండి.</span>")],
    ["🌾", rain5>=40
      ? bi("<b>Sowing / Transplanting: FAVOURABLE ✅</b><span>Good rainfall expected (≥40mm in 5 days). Paddy transplanting (vari) conditions are good.</span>","<b>విత్తనం / నాట్లు: అనుకూలం ✅</b><span>మంచి వర్షాలు (5 రోజుల్లో ≥40mm). వరి నాట్లకు పరిస్థితులు అనుకూలం.</span>")
      : rain5>=15
      ? bi("<b>Sowing: MODERATE ⚠️</b><span>Some rain expected — sow only with assured irrigation backup.</span>","<b>విత్తనం: ఓ మోస్తరు ⚠️</b><span>కొంత వర్షం మాత్రమే — నీటి వసతి ఉంటేనే విత్తండి.</span>")
      : bi("<b>Sowing: DELAY ❌</b><span>Very little rain in next 5 days — delay rain-fed sowing, plan irrigation.</span>","<b>విత్తనం: ఆలస్యం చేయండి ❌</b><span>వచ్చే 5 రోజుల్లో వర్షం చాలా తక్కువ — వర్షాధార విత్తనం వాయిదా వేయండి.</span>")],
    ["🌻", prob3>=60
      ? bi("<b>Harvesting: HURRY ⚠️</b><span>High rain chance in next 3 days — harvest mature crops early & move produce to covered storage.</span>","<b>కోత: త్వరపడండి ⚠️</b><span>3 రోజుల్లో వర్ష అవకాశం ఎక్కువ — పండిన పంటను ముందుగా కోసి, సురక్షిత గోదాముకు తరలించండి.</span>")
      : bi("<b>Harvesting: SAFE ✅</b><span>Dry spell ahead — good window for harvesting and open-yard drying.</span>","<b>కోత: అనుకూలం ✅</b><span>పొడి వాతావరణం — కోత & ఆరబెట్టడానికి మంచి సమయం.</span>")],
    ["💧", rain5<10
      ? bi("<b>Irrigation: NEEDED</b><span>Almost no rain ahead — schedule irrigation; mulch to retain soil moisture.</span>","<b>నీటి తడి: అవసరం</b><span>వర్షం లేదు — తడులు ఇవ్వండి; నేల తేమ కోసం మల్చింగ్ చేయండి.</span>")
      : bi("<b>Irrigation: HOLD</b><span>Expected rainfall should cover crop water needs — avoid over-watering.</span>","<b>నీటి తడి: ఆపండి</b><span>రాబోయే వర్షాలు సరిపోతాయి — అధిక తడులు వద్దు.</span>")]
  ];
  $("rytuOps").innerHTML = ops.map(o=>`<div class="adv-item"><span class="e">${o[0]}</span><div>${o[1]}</div></div>`).join("");

  const crop = [];
  if(tmax>=40) crop.push(["🥵",bi("<b>Heat stress alert</b><span>Max temp ≥40°C — irrigate in evening, provide shade nets for vegetables & chilli nurseries.</span>","<b>వేడి ఒత్తిడి హెచ్చరిక</b><span>ఉష్ణోగ్రత ≥40°C — సాయంత్రం తడులు ఇవ్వండి, మిర్చి నారుమళ్లకు షేడ్ నెట్ వాడండి.</span>")]);
  if(hum>=85 && tmax>=28) crop.push(["🍄",bi("<b>Fungus / pest watch (Mirchi, Paddy, Cotton)</b><span>High humidity — watch for blast, leaf spot & sucking pests. Scout fields daily.</span>","<b>తెగుళ్ల హెచ్చరిక (మిర్చి, వరి, పత్తి)</b><span>అధిక తేమ — అగ్గి తెగులు, ఆకుమచ్చ & రసం పీల్చే పురుగులను గమనించండి.</span>")]);
  if(rain5>=80) crop.push(["🌊",bi("<b>Drainage alert</b><span>Heavy rain expected — clear field drains; protect harvested produce & fertilizer stock.</span>","<b>మురుగు నీటి హెచ్చరిక</b><span>భారీ వర్షాలు — కాలువలు శుభ్రం చేయండి; పంట & ఎరువులను కాపాడుకోండి.</span>")]);
  if(gustToday>=40) crop.push(["🌬️",bi("<b>Wind alert for banana/papaya</b><span>Strong gusts — stake tall crops, delay drone/knapsack spraying.</span>","<b>అరటి/బొప్పాయికి గాలుల హెచ్చరిక</b><span>బలమైన గాలులు — ఊతలు ఇవ్వండి, స్ప్రేయింగ్ వాయిదా వేయండి.</span>")]);
  if(!crop.length) crop.push(["✅",bi("<b>Normal conditions</b><span>No major weather stress for crops in this district. Continue routine operations.</span>","<b>సాధారణ పరిస్థితులు</b><span>ఈ జిల్లాలో పంటలకు పెద్ద ప్రమాదం లేదు. యథావిధిగా పనులు కొనసాగించండి.</span>")]);
  crop.push(["📞",bi("<b>Kisan Call Centre: 1800-180-1551</b><span>For crop-specific advisories also see your local KVK / ANGRAU bulletins.</span>","<b>కిసాన్ కాల్ సెంటర్: 1800-180-1551</b><span>పంట వారీ సలహాల కోసం KVK / ANGRAU బులెటిన్లు చూడండి.</span>")]);
  $("rytuCrop").innerHTML = crop.map(o=>`<div class="adv-item"><span class="e">${o[0]}</span><div>${o[1]}</div></div>`).join("");
}

/* ================= MATSYAKARA VANI ================= */
async function renderSea(){
  const i = +$("seaDist").value;
  const w = WX[i], gust = w.daily.wind_gusts_10m_max[0]||0, wind = w.current.wind_speed_10m;
  let wave = null, period = null;
  try{ const m = await fetchMarine(i); wave = m.daily.wave_height_max[0]; period = m.current.wave_period; }catch(e){ console.warn("marine",e); }

  const banner = $("seaBanner");
  const unsafe = (wave!==null && wave>2.5) || gust>45;
  const caution = !unsafe && ((wave!==null && wave>1.5) || gust>35);
  banner.className = "safe-banner "+(unsafe?"no":"ok");
  $("seaBannerIco").textContent = unsafe?"⛔":caution?"⚠️":"✅";
  $("seaBannerTxt").innerHTML = unsafe
    ? bi("FISHING: NOT SAFE — do not venture into the sea. High waves / strong winds.","చేపల వేట: సురక్షితం కాదు — సముద్రంలోకి వెళ్లవద్దు. ఎత్తైన అలలు / బలమైన గాలులు.")
    : caution
    ? bi("FISHING: CAUTION — rough patches possible, stay close to shore & monitor INCOIS.","చేపల వేట: జాగ్రత్త — తీరానికి దగ్గరగా ఉండండి, INCOIS హెచ్చరికలు గమనించండి.")
    : bi("FISHING: SAFE — sea conditions are normal along this coast today.","చేపల వేట: సురక్షితం — నేడు ఈ తీరంలో సముద్రం సాధారణంగా ఉంది.");

  $("seaAgg").innerHTML =
    `<div class="a"><b>${wave!==null?wave.toFixed(1)+" m":"—"}</b><span>${bi("Max wave height","గరిష్ట అల ఎత్తు")}</span></div>
     <div class="a"><b>${period!==null?period.toFixed(0)+" s":"—"}</b><span>${bi("Wave period","అల వ్యవధి")}</span></div>
     <div class="a"><b>${Math.round(wind)} km/h</b><span>${bi("Coastal wind","తీర గాలి")}</span></div>
     <div class="a"><b>${Math.round(gust)} km/h</b><span>${bi("Max gusts","గరిష్ట గాలులు")}</span></div>`;

  const adv = [];
  if(unsafe) adv.push(["⛔",bi("<b>Do not venture</b><span>Waves above 2.5m or gusts above 45 km/h — boats should return to harbour.</span>","<b>వేటకు వెళ్లవద్దు</b><span>అలలు 2.5m పైన లేదా గాలులు 45 km/h పైన — పడవలు తీరానికి తిరిగి రావాలి.</span>")]);
  else if(caution) adv.push(["⚠️",bi("<b>Stay near shore</b><span>Moderate swell — small boats avoid deep-sea trips; carry life jackets & GPS.</span>","<b>తీరానికి దగ్గరగా ఉండండి</b><span>మోస్తరు అలలు — చిన్న పడవలు లోతు సముద్రానికి వెళ్లొద్దు; లైఫ్ జాకెట్లు తప్పనిసరి.</span>")]);
  else adv.push(["✅",bi("<b>Normal sea</b><span>Conditions fine for fishing. Still carry life jackets, DAT/transponder & check wind before return trip.</span>","<b>సాధారణ సముద్రం</b><span>వేటకు అనుకూలం. లైఫ్ జాకెట్లు, ట్రాన్స్‌పాండర్ తీసుకెళ్లండి.</span>")]);
  adv.push(["🌀",bi("<b>Low-pressure watch</b><span>Check the Windy map for circulations over the Bay of Bengal. During cyclone alerts, IMD/INCOIS warnings override everything here.</span>","<b>అల్పపీడన పరిశీలన</b><span>బంగాళాఖాతంలో ఆవర్తనాల కోసం Windy మ్యాప్ చూడండి. తుఫాను హెచ్చరికల సమయంలో IMD/INCOIS హెచ్చరికలే అంతిమం.</span>")]);
  adv.push(["📻",bi("<b>Emergency: 1093 / Coast Guard 1554</b><span>Toll-free marine emergency & search-rescue numbers.</span>","<b>అత్యవసరం: 1093 / కోస్ట్ గార్డ్ 1554</b><span>సముద్ర అత్యవసర సహాయ నంబర్లు.</span>")]);
  $("seaAdv").innerHTML = adv.map(o=>`<div class="adv-item"><span class="e">${o[0]}</span><div>${o[1]}</div></div>`).join("");
}

/* ================= ALERTS ================= */
function renderAlerts(){
  const alerts = [];
  WX.forEach((w,i)=>{
    const n = DISTRICTS[i][0], nte = DISTRICTS[i][1], dy = w.daily, c = w.current;
    const feels = c.apparent_temperature, code = c.weather_code;
    if(feels>=45) alerts.push(["dang","🥵",`<b>${n}:</b> ${bi(`Extreme heat — real-feel ${Math.round(feels)}°C. Avoid 12–4pm sun.`,`తీవ్ర వేడి — రియల్-ఫీల్ ${Math.round(feels)}°C (${nte}). మధ్యాహ్నం ఎండలో వెళ్లొద్దు.`)}`]);
    else if(dy.temperature_2m_max[0]>=42) alerts.push(["warn","☀️",`<b>${n}:</b> ${bi(`Heatwave-like: max ${Math.round(dy.temperature_2m_max[0])}°C today.`,`వడగాలి: నేడు గరిష్టం ${Math.round(dy.temperature_2m_max[0])}°C (${nte}).`)}`]);
    if(code>=95) alerts.push(["dang","⛈️",`<b>${n}:</b> ${bi("Thunderstorm active now — stay indoors, unplug electronics.",`ఇప్పుడు ఉరుములతో వర్షం (${nte}) — ఇంట్లోనే ఉండండి.`)}`]);
    else if((dy.precipitation_probability_max[0]||0)>=80 && (dy.precipitation_sum[0]||0)>=15) alerts.push(["warn","🌧️",`<b>${n}:</b> ${bi(`Heavy rain likely today (${dy.precipitation_probability_max[0]}%, ~${dy.precipitation_sum[0].toFixed(0)}mm).`,`నేడు భారీ వర్షం అవకాశం (${nte}) — ${dy.precipitation_probability_max[0]}%.`)}`]);
    if((dy.wind_gusts_10m_max[0]||0)>=55) alerts.push(["warn","🌬️",`<b>${n}:</b> ${bi(`Squally winds up to ${Math.round(dy.wind_gusts_10m_max[0])} km/h.`,`బలమైన గాలులు ${Math.round(dy.wind_gusts_10m_max[0])} km/h వరకు (${nte}).`)}`]);
  });
  $("alert-list").innerHTML = alerts.length
    ? alerts.slice(0,8).map(a=>`<div class="al ${a[0]}"><span class="e">${a[1]}</span><div>${a[2]}</div></div>`).join("")
    : `<div class="al ok"><span class="e">✅</span><div>${bi("No severe weather alerts across AP right now. Pleasant day!","ప్రస్తుతం AP అంతటా తీవ్ర హెచ్చరికలు లేవు. మంచి రోజు!")}</div></div>`;
}

/* ================= MASTER REFRESH ================= */
async function refresh(){
  try{
    await fetchAll();
    renderTheme(); renderHero(); renderGrid(); renderForecast();
    renderCyclone(); renderJala(); renderVidyut();
    renderRytu(); renderAlerts(); renderSea();
    $("lastRefresh").textContent = new Date().toLocaleTimeString("en-IN",{hour:'2-digit',minute:'2-digit'});
  }catch(e){
    console.error(e);
    $("nowDesc").innerHTML = bi("⚠️ Could not load live data — check connection & retry.","⚠️ లైవ్ డేటా లోడ్ కాలేదు — కనెక్షన్ చూసి మళ్లీ ప్రయత్నించండి.");
  }
}

/* ================= UI: clock / theme / lang / reveal ================= */
setInterval(()=>{ const el=$("clock"); if(el) el.textContent =
  new Date().toLocaleTimeString("en-IN",{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})+" IST"; },1000);

function setTheme(t){ document.documentElement.dataset.theme=t; $("themeTgl").textContent = t==="light"?"☀️":"🌙"; try{localStorage.setItem("swm-theme",t)}catch(e){} }
$("themeTgl").onclick = ()=> setTheme(document.documentElement.dataset.theme==="light"?"dark":"light");
try{ setTheme(localStorage.getItem("swm-theme")||"dark"); }catch(e){ setTheme("dark"); }

function setLang(l){ document.body.classList.toggle("te", l==="te"); document.documentElement.lang = l==="te"?"te":"en"; try{localStorage.setItem("swm-lang",l)}catch(e){} }
$("langTgl").onclick = ()=> setLang(document.body.classList.contains("te")?"en":"te");
try{ setLang(localStorage.getItem("swm-lang")||"en"); }catch(e){}

const io = new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add("in")),{threshold:.08});
document.querySelectorAll("section .wrap > *").forEach(el=>{ el.classList.add("reveal"); io.observe(el); });

$("fcDist").addEventListener("change",renderForecast);
$("rytuDist").addEventListener("change",renderRytu);
$("seaDist").addEventListener("change",renderSea);

/* ================= THREE.JS HERO (globe + clouds + rain + lightning) ================= */
(function(){
  if(!window.THREE) return;
  const box = $("three-bg"); if(!box) return;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(60, box.clientWidth/box.clientHeight, .1, 100);
  cam.position.z = 7;
  const ren = new THREE.WebGLRenderer({alpha:true, antialias:true});
  ren.setSize(box.clientWidth, box.clientHeight);
  ren.setPixelRatio(Math.min(devicePixelRatio,2));
  box.appendChild(ren.domElement);

  const globe = new THREE.Group();
  const gGeo = new THREE.SphereGeometry(2.6, 40, 40);
  globe.add(new THREE.Points(gGeo, new THREE.PointsMaterial({color:0x9fd0ff, size:.035, transparent:true, opacity:.55})));
  globe.add(new THREE.Mesh(gGeo, new THREE.MeshBasicMaterial({color:0x0A1931, transparent:true, opacity:.28})));
  const marker = new THREE.Mesh(new THREE.SphereGeometry(.09,16,16), new THREE.MeshBasicMaterial({color:0xFFC300}));
  const la=16.5*Math.PI/180, lo=80.6*Math.PI/180;
  marker.position.set(2.62*Math.cos(la)*Math.sin(lo), 2.62*Math.sin(la), 2.62*Math.cos(la)*Math.cos(lo));
  globe.add(marker);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.14,.2,32), new THREE.MeshBasicMaterial({color:0xFFC300,side:THREE.DoubleSide,transparent:true,opacity:.75}));
  ring.position.copy(marker.position); ring.lookAt(0,0,0);
  globe.add(ring);
  globe.position.x = 2.2; globe.rotation.y = -.9;
  scene.add(globe);

  const rN = 700, rPos = new Float32Array(rN*3);
  for(let i=0;i<rN;i++){ rPos[i*3]=(Math.random()-.5)*16; rPos[i*3+1]=Math.random()*10-5; rPos[i*3+2]=(Math.random()-.5)*4-1; }
  const rGeo = new THREE.BufferGeometry();
  rGeo.setAttribute("position", new THREE.BufferAttribute(rPos,3));
  const rain = new THREE.Points(rGeo, new THREE.PointsMaterial({color:0x9fd8ff, size:.03, transparent:true, opacity:.5}));
  rain.visible = false;
  scene.add(rain);
  window.__setRain = v => { rain.visible = v; };   // theme engine hooks in here

  const flash = new THREE.PointLight(0xaaddff, 0, 30);
  flash.position.set(0,3,2); scene.add(flash);
  let flashT = 0;
  const hero = $("hero");
  if(hero) hero.addEventListener("pointermove", ()=>{ if(Math.random()<.006) flashT = 1; });

  let mx=0,my=0;
  addEventListener("pointermove",e=>{ mx=(e.clientX/innerWidth-.5); my=(e.clientY/innerHeight-.5); });
  addEventListener("resize",()=>{ cam.aspect=box.clientWidth/box.clientHeight; cam.updateProjectionMatrix(); ren.setSize(box.clientWidth,box.clientHeight); });

  (function loop(){
    requestAnimationFrame(loop);
    globe.rotation.y += .0016;
    if(rain.visible){
      const p = rGeo.attributes.position.array;
      for(let i=0;i<rN;i++){ p[i*3+1]-=.045; if(p[i*3+1]<-5) p[i*3+1]=5; }
      rGeo.attributes.position.needsUpdate = true;
    }
    if(flashT>0){ flash.intensity = flashT*6; flashT-=.06; } else flash.intensity = 0;
    cam.position.x += (mx*.8-cam.position.x)*.04;
    cam.position.y += (-my*.5-cam.position.y)*.04;
    cam.lookAt(1,0,0);
    ren.render(scene,cam);
  })();
})();

/* ================= PWA ================= */
if("serviceWorker" in navigator && location.protocol.startsWith("http")){
  addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}

/* ================= BOOT ================= */
buildScene();
fillSelects();
initGeoModal();          // asks location on first load; silent Srikakulam fallback
refresh().then(()=>applyHome());
fetchAqi();
setInterval(refresh, 10*60*1000);   // auto-refresh every 10 minutes
setInterval(fetchAqi, 30*60*1000);
