/* ================================================================
   SRIKAKULAM WEATHERMAN — MAUSAM VANI (All-India) — app.js
   ----------------------------------------------------------------
   OPENWEATHER KEY (optional): paste your key below. While it says
   "YOUR_OPENWEATHER_API_KEY", the site automatically uses
   Open-Meteo (free, no key) so everything stays LIVE.
   ================================================================ */
const OWM_KEY = "YOUR_OPENWEATHER_API_KEY";
const USE_OWM = OWM_KEY && !/YOUR_/.test(OWM_KEY);

/* ---------- AP's 26 districts: [EN, TE, lat, lon, coastal, sea lat, sea lon] ---------- */
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
const SRI_IDX = 19;                 // Srikakulam = safe default
let HOME_IDX = SRI_IDX;             // ≥0: AP district index · -1: CUSTOM place anywhere in India
let CUSTOM = null;                  // {name, admin1, lat, lon, wx} for non-AP home / searched place
let VIEWED = null;                  // last place shown in the India search card

/* ---------- All Indian states & UTs (capital coords for quick browsing) ---------- */
const STATES = [
 ["Andhra Pradesh","Amaravati",16.51,80.52],["Arunachal Pradesh","Itanagar",27.10,93.62],
 ["Assam","Guwahati",26.14,91.77],["Bihar","Patna",25.59,85.14],
 ["Chhattisgarh","Raipur",21.25,81.63],["Goa","Panaji",15.49,73.83],
 ["Gujarat","Gandhinagar",23.22,72.65],["Haryana","Chandigarh",30.73,76.78],
 ["Himachal Pradesh","Shimla",31.10,77.17],["Jharkhand","Ranchi",23.34,85.31],
 ["Karnataka","Bengaluru",12.97,77.59],["Kerala","Thiruvananthapuram",8.52,76.94],
 ["Madhya Pradesh","Bhopal",23.26,77.41],["Maharashtra","Mumbai",19.08,72.88],
 ["Manipur","Imphal",24.82,93.94],["Meghalaya","Shillong",25.57,91.88],
 ["Mizoram","Aizawl",23.73,92.72],["Nagaland","Kohima",25.67,94.11],
 ["Odisha","Bhubaneswar",20.30,85.82],["Punjab","Chandigarh",30.73,76.78],
 ["Rajasthan","Jaipur",26.91,75.79],["Sikkim","Gangtok",27.33,88.61],
 ["Tamil Nadu","Chennai",13.08,80.27],["Telangana","Hyderabad",17.38,78.48],
 ["Tripura","Agartala",23.83,91.28],["Uttar Pradesh","Lucknow",26.85,80.95],
 ["Uttarakhand","Dehradun",30.32,78.03],["West Bengal","Kolkata",22.57,88.36],
 ["Delhi (NCT)","New Delhi",28.61,77.21],["Jammu & Kashmir","Srinagar",34.08,74.80],
 ["Ladakh","Leh",34.16,77.58],["Puducherry","Puducherry",11.93,79.83],
 ["Andaman & Nicobar","Port Blair",11.62,92.73],["Chandigarh","Chandigarh",30.73,76.78],
 ["DNH & Daman-Diu","Daman",20.40,72.85],["Lakshadweep","Kavaratti",10.57,72.64]
];

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
   Inside AP  → we snap to the nearest of the 26 district HQs.
   Elsewhere  → reverse-geocode the coords (state + district) and
                fetch weather for the exact point.
   ================================================================ */
function haversine(a1,o1,a2,o2){
  const R=6371, dA=(a2-a1)*Math.PI/180, dO=(o2-o1)*Math.PI/180;
  const s=Math.sin(dA/2)**2 + Math.cos(a1*Math.PI/180)*Math.cos(a2*Math.PI/180)*Math.sin(dO/2)**2;
  return 2*R*Math.asin(Math.sqrt(s));
}
function nearestDistrict(lat,lon){
  let best=0,bd=1e9;
  DISTRICTS.forEach((d,i)=>{ const k=haversine(lat,lon,d[2],d[3]); if(k<bd){bd=k;best=i;} });
  return {idx:best, km:bd};
}
/** Resolves {lat, lon} on success; null on ANY failure (denied /
 *  unavailable / timeout / unsupported) — silent fallback, no alerts. */
function getUserLocation(){
  return new Promise(resolve=>{
    if(!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      pos => resolve({lat:pos.coords.latitude, lon:pos.coords.longitude}),
      err => { console.info("Geolocation fallback → Srikakulam (code "+err.code+")"); resolve(null); },
      { timeout:8000, maximumAge:10*60*1000, enableHighAccuracy:false }
    );
  });
}
/** Free, keyless reverse geocoding → {place, state} (never throws). */
async function reverseGeocode(lat,lon){
  try{
    const j = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`).then(r=>r.json());
    return { place: j.city || j.locality || j.principalSubdivision || "My Location",
             state: j.principalSubdivision || "India" };
  }catch(e){ return {place:"My Location", state:"India"}; }
}
async function useLocation(){
  const loc = await getUserLocation();
  if(!loc){ applyHome(); return; }                  // silent fallback: Srikakulam
  const near = nearestDistrict(loc.lat, loc.lon);
  if(near.km <= 45){                                // inside AP → snap to district
    HOME_IDX = near.idx; CUSTOM = null;
    applyHome();
  }else{                                            // anywhere else in India (or world)
    const g = await reverseGeocode(loc.lat, loc.lon);
    await loadPlace({name:g.place, admin1:g.state, lat:loc.lat, lon:loc.lon}, true);
  }
}
function initGeoModal(){
  const m = $("geoModal");
  let asked = false;
  try{ asked = localStorage.getItem("swm-geo-asked")==="1"; }catch(e){}
  if(asked){ useLocation(); return; }
  m.classList.add("on");
  const done = ()=>{ m.classList.remove("on"); try{localStorage.setItem("swm-geo-asked","1")}catch(e){} };
  $("geoAllow").onclick = ()=>{ done(); useLocation(); };            // native browser prompt
  $("geoManual").onclick = ()=>{ done();
    document.querySelector("#india").scrollIntoView({behavior:"smooth"}); };
}

/* ================= FETCH ENGINE (Open-Meteo primary, OWM optional) ================= */
const OM_PARAMS = `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day`+
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_gusts_10m_max,sunrise,sunset`+
  `&forecast_days=8&timezone=auto`;
async function fetchAll(){
  const lats = DISTRICTS.map(d=>d[2]).join(",");
  const lons = DISTRICTS.map(d=>d[3]).join(",");
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}${OM_PARAMS}`);
  if(!r.ok) throw new Error("open-meteo "+r.status);
  const j = await r.json();
  WX = Array.isArray(j)? j : [j];
  if(CUSTOM){ try{ CUSTOM.wx = await fetchPoint(CUSTOM.lat, CUSTOM.lon); }catch(e){} }

  if(USE_OWM && HOME_IDX>=0){
    /* Optional OpenWeatherMap overlay for home current conditions */
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
async function fetchPoint(lat,lon){
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}${OM_PARAMS}`);
  if(!r.ok) throw new Error("open-meteo point "+r.status);
  return r.json();
}
function homeCoords(){ return HOME_IDX>=0 ? {lat:DISTRICTS[HOME_IDX][2], lon:DISTRICTS[HOME_IDX][3]} : {lat:CUSTOM.lat, lon:CUSTOM.lon}; }
function homeWx(){ return HOME_IDX>=0 ? WX[HOME_IDX] : (CUSTOM && CUSTOM.wx); }
async function fetchAqi(){
  try{
    const {lat,lon} = homeCoords();
    const j = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`).then(r=>r.json());
    $("nowAqi").textContent = Math.round(j.current.us_aqi);
  }catch(e){ $("nowAqi").textContent = "—"; }
}
async function fetchMarine(i){
  const d = DISTRICTS[i];
  return fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${d[5]}&longitude=${d[6]}`+
    `&current=wave_height,wave_period&daily=wave_height_max&forecast_days=2&timezone=auto`).then(r=>r.json());
}
/* helpers to resolve select values (-1 = custom place) */
const dailyOf = i => i<0 ? CUSTOM.wx.daily : WX[i].daily;
const currentOf = i => i<0 ? CUSTOM.wx.current : WX[i].current;
const nameOf = i => i<0 ? `${CUSTOM.name}` : DISTRICTS[i][0];

/* ================= DYNAMIC WEATHER THEME + SCENE ================= */
function themeFor(code,isDay){
  if(code>=95) return "theme-thunder";
  if((code>=51&&code<=67)||(code>=80&&code<=82)) return "theme-rainy";
  if(!isDay) return "theme-night";
  if(code<=1) return "theme-sunny";
  return "theme-cloudy";
}
function renderTheme(){
  const w = homeWx(); if(!w) return;
  const t = themeFor(w.current.weather_code, w.current.is_day);
  document.body.classList.remove("theme-sunny","theme-cloudy","theme-rainy","theme-thunder","theme-night");
  document.body.classList.add(t);
}
function buildScene(){
  $("stars").innerHTML = Array.from({length:70},()=>{
    const x=Math.random()*100, y=Math.random()*60, d=(Math.random()*3).toFixed(2);
    return `<span style="left:${x}%;top:${y}%;animation-delay:${d}s"></span>`;
  }).join("");
  $("rainLayer").innerHTML = Array.from({length:46},()=>{
    const x=Math.random()*100, dl=(Math.random()*1.2).toFixed(2), du=(0.8+Math.random()*.7).toFixed(2);
    return `<i style="left:${x}%;animation-delay:${dl}s;animation-duration:${du}s"></i>`;
  }).join("");
}

/* ================= HERO ================= */
const fmtTime = iso => iso ? iso.slice(11,16) : "--:--";
function renderHero(){
  const w = homeWx(); if(!w) return;
  const c = w.current, dy = w.daily, ic = wmo(c.weather_code);
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
function applyHome(){
  $("nowCity").innerHTML = HOME_IDX>=0
    ? bi(DISTRICTS[HOME_IDX][0], DISTRICTS[HOME_IDX][1])
    : `${CUSTOM.name}, ${CUSTOM.admin1}`;
  if(!WX) return;
  refreshSelectOptions();
  renderHero(); renderTheme();
  $("fcDist").value = String(HOME_IDX>=0?HOME_IDX:-1);
  $("rytuDist").value = String(HOME_IDX>=0?HOME_IDX:-1);
  renderForecast(); renderRytu();
  if(HOME_IDX>=0 && DISTRICTS[HOME_IDX][4]){ $("seaDist").value = HOME_IDX; renderSea(); }
  fetchAqi();
}

/* ================= ALL-INDIA SEARCH ================= */
function initIndiaUI(){
  const sel = $("stateSel");
  sel.innerHTML = `<option value="">${"— State / రాష్ట్రం —"}</option>` +
    STATES.map((s,i)=>`<option value="${i}">${s[0]}</option>`).join("");
  sel.addEventListener("change", ()=>{
    if(sel.value==="") return;
    const s = STATES[+sel.value];
    loadPlace({name:s[1], admin1:s[0], lat:s[2], lon:s[3]}, false);
  });

  const inp = $("inSearch"), sug = $("inSug");
  let t = null;
  inp.addEventListener("input", ()=>{
    clearTimeout(t);
    const q = inp.value.trim();
    if(q.length<2){ sug.classList.remove("on"); return; }
    t = setTimeout(async ()=>{
      try{
        /* Open-Meteo geocoding: any city/district/village; filtered to India */
        const j = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`).then(r=>r.json());
        const res = (j.results||[]).filter(x=>x.country_code==="IN");
        sug.innerHTML = res.length
          ? res.map((x,k)=>`<button data-k="${k}">${x.name}<small>${[x.admin2,x.admin1].filter(Boolean).join(", ")}</small></button>`).join("")
          : `<button disabled>${"No places found in India"}</button>`;
        sug.classList.add("on");
        sug.querySelectorAll("button[data-k]").forEach(b=>b.addEventListener("click",()=>{
          const x = res[+b.dataset.k];
          sug.classList.remove("on"); inp.value = x.name;
          loadPlace({name:x.name, admin1:x.admin1||"India", lat:x.latitude, lon:x.longitude}, false);
        }));
      }catch(e){ console.warn("geocoding", e); }
    }, 350);
  });
  document.addEventListener("click", e=>{ if(!sug.contains(e.target) && e.target!==inp) sug.classList.remove("on"); });

  $("inSetHome").addEventListener("click", ()=>{
    if(!VIEWED) return;
    CUSTOM = VIEWED; HOME_IDX = -1;
    applyHome();
    document.querySelector("#hero").scrollIntoView({behavior:"smooth"});
  });
}
/** Fetch + show a place in the India card. setHome=true also makes it the dashboard home. */
async function loadPlace(p, setHome){
  try{
    p.wx = await fetchPoint(p.lat, p.lon);
  }catch(e){ console.warn("loadPlace",e); return; }
  VIEWED = p;
  const c = p.wx.current, dy = p.wx.daily, ic = wmo(c.weather_code);
  $("inResult").classList.add("on");
  $("inName").textContent = "📍 "+p.name;
  $("inState").textContent = p.admin1||"India";
  $("inTemp").textContent = Math.round(c.temperature_2m)+"°";
  $("inIco").textContent = (!c.is_day && c.weather_code<=1)?"🌙":ic[0];
  $("inDesc").innerHTML = bi(ic[1],ic[2]);
  $("inMeta").innerHTML = `H ${Math.round(dy.temperature_2m_max[0])}° / L ${Math.round(dy.temperature_2m_min[0])}° · 💧${Math.round(c.relative_humidity_2m)}% · 💨${Math.round(c.wind_speed_10m)} km/h`;
  $("inDays").innerHTML = dy.time.slice(0,5).map((t,k)=>`
    <div class="dd-day">
      <div class="d">${bi(dayName(t,'en'),dayName(t,'te'))}</div>
      <div class="i">${wmo(dy.weather_code[k])[0]}</div>
      <div class="t">${Math.round(dy.temperature_2m_max[k])}° <span style="opacity:.6">${Math.round(dy.temperature_2m_min[k])}°</span></div>
      <div class="r">🌧️ ${dy.precipitation_probability_max[k] ?? 0}%</div>
    </div>`).join("");
  if(setHome){ CUSTOM = p; HOME_IDX = -1; applyHome(); }
}

/* ================= DISTRICT GRID (AP) ================= */
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
  if(String(i)!==$("fcDist").value){ $("fcDist").value = String(i); renderForecast(); }
  box.scrollIntoView({behavior:"smooth",block:"nearest"});
}

/* ================= FORECAST ================= */
function refreshSelectOptions(){
  const customOpt = CUSTOM ? `<option value="-1">📍 ${CUSTOM.name}, ${CUSTOM.admin1}</option>` : "";
  const opts = customOpt + DISTRICTS.map((d,i)=>`<option value="${i}">${d[0]} / ${d[1]}</option>`).join("");
  ["fcDist","rytuDist"].forEach(id=>{
    const s=$(id), v=s.value; s.innerHTML=opts;
    s.value = [...s.options].some(o=>o.value===v)? v : String(HOME_IDX>=0?HOME_IDX:-1);
  });
  const sea = $("seaDist"), sv = sea.value;
  sea.innerHTML = DISTRICTS.map((d,i)=>d[4]?`<option value="${i}">${d[0]} / ${d[1]}</option>`:"").join("");
  sea.value = [...sea.options].some(o=>o.value===sv)? sv : String(SRI_IDX);
}
function renderForecast(){
  const i = +$("fcDist").value;
  if(i<0 && !CUSTOM) return;
  const dy = dailyOf(i);
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
  renderChart(dy);
}
function renderChart(dy){
  const ctx = $("tempChart");
  if(!window.Chart || !ctx) return;
  const labels = dy.time.map(t=>t.slice(8,10)+"/"+t.slice(5,7));
  if(chart) chart.destroy();
  chart = new Chart(ctx,{type:"line",data:{labels,datasets:[
    {label:"Max °C",data:dy.temperature_2m_max,borderColor:"#FFC300",backgroundColor:"rgba(255,195,0,.12)",fill:true,tension:.4,pointRadius:4},
    {label:"Min °C",data:dy.temperature_2m_min,borderColor:"#00C9FF",backgroundColor:"rgba(0,201,255,.10)",fill:true,tension:.4,pointRadius:4}
  ]},options:{plugins:{legend:{labels:{color:"#9fb3d1"}}},
    scales:{x:{ticks:{color:"#8aa0c4"},grid:{color:"rgba(140,160,200,.1)"}},y:{ticks:{color:"#8aa0c4"},grid:{color:"rgba(140,160,200,.1)"}}}}});
}

/* ================= CYCLONE BULLETIN & EMERGENCY HUB + PATH BADGE ================= */
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
    : "🟢 No active cyclone warning for the Indian coast · ప్రస్తుతం తీరప్రాంతానికి తుఫాను హెచ్చరిక లేదు · Bay of Bengal & Arabian Sea monitored live · Follow @srikakulam_weatherman";
  $("cycTickerIn").innerHTML = `<span>${tick}</span><span>${tick}</span>`;

  /* Cyclone Path Predictor badge follows live status */
  const badge = $("cpBadge");
  if(badge){
    badge.className = "cp-badge "+(active?"live":"demo");
    badge.textContent = active ? "⚠ STORM SIGNALS ACTIVE — SEE IMD FOR OFFICIAL TRACK" : "MONITORING · NO ACTIVE CYCLONE";
  }
}

/* ================= JALA VANI — DAM TRACKER ================= */
/* Indicative figures for layout/demo. For live data connect the AP WRIMS feed
   (apwrims.ap.gov.in), replacing `pct/inflow/outflow`. */
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

/* ================= RYTU VANI ================= */
function renderRytu(){
  const i = +$("rytuDist").value;
  if(i<0 && !CUSTOM) return;
  const dy = dailyOf(i), c = currentOf(i);
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
  if(!crop.length) crop.push(["✅",bi("<b>Normal conditions</b><span>No major weather stress for crops in this area. Continue routine operations.</span>","<b>సాధారణ పరిస్థితులు</b><span>ఈ ప్రాంతంలో పంటలకు పెద్ద ప్రమాదం లేదు. యథావిధిగా పనులు కొనసాగించండి.</span>")]);
  crop.push(["📞",bi("<b>Kisan Call Centre: 1800-180-1551</b><span>For crop-specific advisories also see your local KVK / state agri-university bulletins.</span>","<b>కిసాన్ కాల్ సెంటర్: 1800-180-1551</b><span>పంట వారీ సలహాల కోసం KVK / వ్యవసాయ విశ్వవిద్యాలయ బులెటిన్లు చూడండి.</span>")]);
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
    renderCyclone(); renderJala();
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

/* ================================================================
   MAUSAM VANI — TELUGU VOICE ASSISTANT (Web Speech Synthesis)
   ----------------------------------------------------------------
   Speaks simple, spoken Telugu (not formal written Telugu) so that
   elderly & rural users can follow. Numbers are converted to Telugu
   words and speech rate is slowed for clarity. Falls back gracefully
   if no Telugu (te-IN) voice is installed on the device.
   ================================================================ */
const MV = { last:"", voice:null, ready:("speechSynthesis" in window) };

/* Telugu number words 0–100 (spoken form) */
const TE_UNITS=["సున్నా","ఒకటి","రెండు","మూడు","నాలుగు","ఐదు","ఆరు","ఏడు","ఎనిమిది","తొమ్మిది","పది",
 "పదకొండు","పన్నెండు","పదమూడు","పద్నాలుగు","పదిహేను","పదహారు","పదిహేడు","పద్దెనిమిది","పంతొమ్మిది"];
const TE_TENS={20:"ఇరవై",30:"ముప్పై",40:"నలభై",50:"యాభై",60:"అరవై",70:"డెబ్బై",80:"ఎనభై",90:"తొంభై"};
function teNum(n){
  n=Math.round(n);
  if(n<0) return "మైనస్ "+teNum(-n);
  if(n<20) return TE_UNITS[n];
  if(n===100) return "వంద";
  if(n>100) return String(n);                 // rare; let engine read digits
  const t=Math.floor(n/10)*10, u=n%10;
  return u===0 ? TE_TENS[t] : TE_TENS[t]+" "+TE_UNITS[u];
}

function pickTeluguVoice(){
  if(!MV.ready) return null;
  const vs = speechSynthesis.getVoices()||[];
  return vs.find(v=>v.lang==="te-IN") || vs.find(v=>/^te(-|_|$)/i.test(v.lang)) ||
         vs.find(v=>/telugu/i.test(v.name)) || null;
}
function initVoices(){
  MV.voice = pickTeluguVoice();
  const warn = $("mvWarn");
  if(MV.ready && !MV.voice){
    warn.classList.add("on");
    warn.innerHTML = "ℹ️ మీ ఫోన్‌లో తెలుగు వాయిస్ లేదు — డిఫాల్ట్ వాయిస్‌తో చదువుతుంది. తెలుగు వాయిస్ కోసం: Settings → Language → Add Telugu (offline speech).";
  }else if(!MV.ready){
    warn.classList.add("on");
    warn.textContent = "ℹ️ ఈ బ్రౌజర్ వాయిస్‌కు మద్దతు ఇవ్వదు. Chrome లేదా Edge వాడండి.";
  }else{ warn.classList.remove("on"); }
}
if(MV.ready){ speechSynthesis.onvoiceschanged = initVoices; }

function speak(text){
  if(!MV.ready){ $("mvStatus").textContent="వాయిస్ అందుబాటులో లేదు"; return; }
  MV.last = text;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "te-IN";
  if(MV.voice) u.voice = MV.voice;
  u.rate = 0.82;              // slower & clearer for elderly / rural users
  u.pitch = 1.0; u.volume = 1;
  u.onstart = ()=>{ setMvState("speaking"); $("mvStatus").textContent="🔊 చెప్తోంది…"; };
  u.onend   = ()=>{ setMvState(""); $("mvStatus").textContent="పూర్తయింది ✅ మళ్లీ నొక్కండి"; };
  u.onerror = ()=>{ setMvState(""); $("mvStatus").textContent="మళ్లీ ప్రయత్నించండి"; };
  speechSynthesis.speak(u);
}
function setMvState(s){
  const fab=$("mvFab"); if(!fab) return;
  fab.classList.remove("speaking","listening");
  $("mvOrb").textContent = s==="speaking"?"🔊":s==="listening"?"👂":"🎙️";
  if(s) fab.classList.add(s);
}

/* ---- phrase builders: read LIVE data as spoken Telugu ---- */
function placeNameTe(){ return HOME_IDX>=0 ? DISTRICTS[HOME_IDX][1] : (CUSTOM?CUSTOM.name:"మీ ప్రాంతం"); }
function sayWeather(){
  const w = homeWx(); if(!w) return "డేటా లోడ్ అవుతోంది. కాసేపటి తర్వాత ప్రయత్నించండి.";
  const c=w.current, dy=w.daily, ic=wmo(c.weather_code);
  const t = `${placeNameTe()} లో ప్రస్తుత వాతావరణం. `+
    `ఉష్ణోగ్రత ${teNum(c.temperature_2m)} డిగ్రీలు. `+
    `${ic[2]}. `+
    `అనుభూతి ${teNum(c.apparent_temperature)} డిగ్రీలు. `+
    `గాలిలో తేమ ${teNum(c.relative_humidity_2m)} శాతం. `+
    `గాలి వేగం గంటకు ${teNum(c.wind_speed_10m)} కిలోమీటర్లు. `+
    `ఈ రోజు గరిష్ఠం ${teNum(dy.temperature_2m_max[0])}, కనిష్ఠం ${teNum(dy.temperature_2m_min[0])} డిగ్రీలు. `+
    `వర్షం పడే అవకాశం ${teNum(dy.precipitation_probability_max[0]||0)} శాతం.`;
  return t;
}
function sayFarmer(){
  const i = HOME_IDX>=0?HOME_IDX:-1;
  const dy = i<0 ? (CUSTOM&&CUSTOM.wx&&CUSTOM.wx.daily) : WX[i].daily;
  if(!dy) return "డేటా లోడ్ అవుతోంది.";
  const rain5 = dy.precipitation_sum.slice(0,5).reduce((a,b)=>a+(b||0),0);
  const prob = dy.precipitation_probability_max[0]||0, gust = dy.wind_gusts_10m_max[0]||0;
  let t = `రైతు సోదరులకు సలహా. `+
    `రాబోయే ఐదు రోజుల్లో సుమారు ${teNum(rain5)} మిల్లీమీటర్ల వర్షం పడొచ్చు. `;
  if(prob<30 && gust<25) t += `ఈ రోజు వర్షం అవకాశం తక్కువ, గాలి కూడా తక్కువ. పంటలకు మందు కొట్టడానికి, పురుగుమందు పిచికారీకి మంచి రోజు. `;
  else t += `ఈ రోజు వర్షం లేదా గాలి ఎక్కువ. మందు కొడితే కొట్టుకుపోతుంది, ఈ రోజు పిచికారీ వద్దు. `;
  if(rain5>=40) t += `మంచి వర్షాలు వస్తున్నాయి, వరి నాట్లకు అనుకూలం. `;
  else if(rain5<10) t += `వర్షం చాలా తక్కువ. విత్తనం వాయిదా వేసి, నీటి తడులు ప్లాన్ చేసుకోండి. `;
  t += `మరిన్ని వివరాలకు కిసాన్ కాల్ సెంటర్ ఒన్ ఎయిట్ డబుల్ ఓ, ఒన్ ఎయిట్ ఓ, ఫిఫ్టీన్ ఫిఫ్టీ ఒన్ కి కాల్ చేయండి.`;
  return t;
}
function sayFisher(){
  /* use nearest coastal district's gusts as a proxy when home is inland */
  let i = (HOME_IDX>=0 && DISTRICTS[HOME_IDX][4]) ? HOME_IDX : SRI_IDX;
  const gust = WX[i].daily.wind_gusts_10m_max[0]||0, wind = WX[i].current.wind_speed_10m;
  let t = `మత్స్యకార సోదరులకు సలహా. ${DISTRICTS[i][1]} తీరం. `+
    `గాలి వేగం గంటకు ${teNum(wind)} కిలోమీటర్లు, గరిష్ఠ గాలులు ${teNum(gust)} కిలోమీటర్లు. `;
  if(gust>45) t += `సముద్రం అల్లకల్లోలంగా ఉంది. ఈ రోజు వేటకు వెళ్లొద్దు. పడవలు తీరానికి తిరిగి రండి. `;
  else if(gust>35) t += `కొంచెం జాగ్రత్త. తీరానికి దగ్గరగానే ఉండండి, లోతు సముద్రానికి వెళ్లొద్దు. లైఫ్ జాకెట్ తప్పకుండా వేసుకోండి. `;
  else t += `సముద్రం సాధారణంగా ఉంది. వేటకు అనుకూలం. అయినా లైఫ్ జాకెట్, జీపీఎస్ తీసుకెళ్లండి. `;
  t += `అత్యవసరమైతే ఒన్ ఓ నైన్ త్రీ కి, లేదా కోస్ట్ గార్డ్ ఒన్ ఫైవ్ ఫైవ్ ఫోర్ కి కాల్ చేయండి. అధికారిక హెచ్చరికల కోసం ఐ ఎం డి చూడండి.`;
  return t;
}
function sayCyclone(){
  const coastal = DISTRICTS.map((d,i)=>({d,i})).filter(x=>x.d[4]);
  let active=false, worst=0, wi=SRI_IDX;
  coastal.forEach(({d,i})=>{ const g=WX[i].daily.wind_gusts_10m_max[0]||0;
    if(WX[i].current.weather_code>=95||g>=60) active=true;
    if(g>worst){worst=g;wi=i;} });
  let t = `సైక్లోన్ అలర్ట్. `;
  if(active) t += `ఆంధ్రప్రదేశ్ తీరంలో తుఫాను పరిస్థితులు ఉన్నాయి. ${DISTRICTS[wi][1]} వద్ద గాలులు గంటకు ${teNum(worst)} కిలోమీటర్ల వరకు వీస్తున్నాయి. `+
    `తీర ప్రజలు జాగ్రత్తగా ఉండండి. అవసరమైతే దగ్గరి సైక్లోన్ షెల్టర్‌కు వెళ్లండి. ఫోన్లు, ఎమర్జెన్సీ లైట్లు ఛార్జ్ చేసుకోండి. `+
    `సహాయం కోసం ఒన్ ఓ సెవెన్ జీరో, లేదా జిల్లా కంట్రోల్ రూమ్ ఒన్ ఓ డబుల్ సెవెన్ కి కాల్ చేయండి.`;
  else t += `ప్రస్తుతం ఆంధ్రప్రదేశ్ తీరానికి ఎలాంటి తుఫాను హెచ్చరిక లేదు. సముద్రం, బంగాళాఖాతం ప్రశాంతంగా ఉన్నాయి. అంతా క్షేమం. `+
    `అయినా వాతావరణ అప్‌డేట్స్ కోసం మౌసం వాణి, శ్రీకాకుళం వెదర్‌మ్యాన్ ఫాలో అవ్వండి.`;
  return t;
}
const MV_SAY = { weather:sayWeather, farmer:sayFarmer, fisher:sayFisher, cyclone:sayCyclone };

/* ---- optional voice INPUT (mic) — matches keyword to a preset ---- */
function startListening(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ togglePanel(true); return; }               // no recognition → just open panel
  const r = new SR(); r.lang="te-IN"; r.interimResults=false; r.maxAlternatives=1;
  setMvState("listening"); $("mvStatus").textContent="👂 వినుతోంది… చెప్పండి";
  r.onresult = e=>{
    const s=(e.results[0][0].transcript||"").toLowerCase();
    let key="weather";
    if(/రైతు|farmer|పంట|వ్యవసాయ/.test(s)) key="farmer";
    else if(/మత్స్య|చేప|fish|సముద్ర|వేట/.test(s)) key="fisher";
    else if(/సైక్లోన్|తుఫాన|cyclone|storm|గాలి/.test(s)) key="cyclone";
    runSay(key);
  };
  r.onerror = ()=>{ setMvState(""); $("mvStatus").textContent="వినపడలేదు. బటన్ నొక్కండి."; };
  r.onend = ()=>{ if($("mvFab").classList.contains("listening")) setMvState(""); };
  try{ r.start(); }catch(e){ togglePanel(true); }
}

function runSay(key){
  const fn = MV_SAY[key]; if(!fn) return;
  const text = fn();
  $("mvLive").textContent = text;                     // show on-screen for the deaf/hard-of-hearing
  speak(text);
}
function togglePanel(open){
  const p=$("mvPanel"), fab=$("mvFab");
  const show = open!==undefined ? open : !p.classList.contains("on");
  p.classList.toggle("on", show);
  fab.setAttribute("aria-expanded", show?"true":"false");
}
(function initMausamVani(){
  if(MV.ready) initVoices();                           // some browsers have voices immediately
  $("mvFab").addEventListener("click", ()=>{
    const p=$("mvPanel");
    if(p.classList.contains("on")) startListening();   // panel already open → mic
    else togglePanel(true);
  });
  $("mvClose").addEventListener("click", ()=>{ speechSynthesis && speechSynthesis.cancel(); setMvState(""); togglePanel(false); });
  document.querySelectorAll(".mvb").forEach(b=>b.addEventListener("click", ()=>runSay(b.dataset.say)));
  $("mvStop").addEventListener("click", ()=>{ if(MV.ready) speechSynthesis.cancel(); setMvState(""); $("mvStatus").textContent="ఆపేశాను ⏹️"; });
  $("mvRepeat").addEventListener("click", ()=>{ if(MV.last) speak(MV.last); });
})();

/* ================= PWA ================= */
if("serviceWorker" in navigator && location.protocol.startsWith("http")){
  addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}

/* ================= BOOT ================= */
buildScene();
refreshSelectOptions();
initIndiaUI();
initGeoModal();                       // location on first load; silent Srikakulam fallback
refresh().then(()=>applyHome());
setInterval(refresh, 10*60*1000);     // auto-refresh every 10 minutes
setInterval(fetchAqi, 30*60*1000);
