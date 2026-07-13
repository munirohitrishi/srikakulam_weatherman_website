const TRANSLATIONS = {
  en: {
    nav: {
      home: 'Home',
      liveWeather: 'Live Weather',
      farmersHub: 'Farmer\'s Hub',
      alerts: 'Alerts',
      maps: 'Maps',
      about: 'About',
      resources: 'Resources'
    },
    ui: {
      language: 'Language',
      languageToggle: 'తెలుగు',
      search: 'Search...',
      close: 'Close',
      menu: 'Menu',
      loading: 'Loading...',
      selectLocation: 'Select Location',
      detectLocation: 'Detect My Location',
      subscribe: 'Subscribe',
      learnMore: 'Learn More',
      viewAll: 'View All',
      lastUpdated: 'Last Updated',
      followUs: 'Follow Us',
      followers: 'Followers',
      shareOnWhatsApp: 'Share on WhatsApp'
    },
    weather: {
      current: 'Current Conditions',
      temperature: 'Temperature',
      feelsLike: 'Feels Like',
      humidity: 'Humidity',
      windSpeed: 'Wind Speed',
      windDirection: 'Wind Direction',
      pressure: 'Pressure',
      visibility: 'Visibility',
      uvIndex: 'UV Index',
      dewPoint: 'Dew Point',
      rainfall: 'Rainfall',
      aqi: 'Air Quality (AQI)',
      sunrise: 'Sunrise',
      sunset: 'Sunset',
      moonPhase: 'Moon Phase',
      hourly: 'Hourly Forecast',
      daily: '7-Day Forecast',
      forecast: 'Forecast',
      condition: 'Condition'
    },
    conditions: {
      sunny: 'Sunny',
      cloudy: 'Cloudy',
      partlyCloudy: 'Partly Cloudy',
      rainy: 'Rainy',
      heavyRain: 'Heavy Rain',
      thunderstorm: 'Thunderstorm',
      storm: 'Storm',
      clearNight: 'Clear Night',
      hazy: 'Hazy',
      foggy: 'Foggy'
    },
    units: {
      celsius: '°C',
      kmh: 'km/h',
      hpa: 'hPa',
      mm: 'mm',
      percent: '%',
      km: 'km'
    },
    farmer: {
      dashboard: 'Farmer\'s Dashboard',
      cropAdvisory: 'Crop Advisory',
      sprayAdvisory: 'Spray Advisory',
      irrigationAdvice: 'Irrigation Advice',
      harvestOutlook: 'Harvest Outlook',
      rainfallTracker: 'Rainfall Tracker',
      cropCalendar: 'Crop Calendar',
      suitable: 'Suitable',
      notSuitable: 'Not Suitable',
      caution: 'Caution',
      sprayQuestion: 'Is it suitable for pesticide spraying?',
      irrigationQuestion: 'Is irrigation needed today?',
      harvestQuestion: 'Is it a good time to harvest?',
      soilMoisture: 'Soil Moisture Status',
      windAdvisory: 'Wind Advisory for Farmers',
      subscribe: {
        title: 'Get Weather Alerts',
        description: 'Subscribe to SMS or WhatsApp alerts for extreme weather.',
        phone: 'Phone Number',
        whatsapp: 'WhatsApp Alert',
        sms: 'SMS Alert'
      }
    },
    crops: {
      paddy: 'Paddy',
      sugarcane: 'Sugarcane',
      cashew: 'Cashew',
      coconut: 'Coconut',
      blackGram: 'Black Gram',
      greenGram: 'Green Gram',
      groundnut: 'Groundnut',
      chilli: 'Chilli'
    },
    alerts: {
      title: 'Active Alerts',
      active: 'Active',
      noAlerts: 'No active alerts at the moment.',
      severity: {
        watch: 'Watch',
        warning: 'Warning',
        emergency: 'Emergency'
      },
      cyclone: 'Cyclone Alert',
      heavyRain: 'Heavy Rain Alert',
      heatWave: 'Heat Wave Alert',
      flood: 'Flood Warning',
      thunderstorm: 'Thunderstorm Warning',
      preparedness: 'Disaster Preparedness',
      helplines: 'Emergency Helplines'
    },
    about: {
      title: 'About Srikakulam Weatherman',
      mission: 'Our Mission',
      missionText: 'To provide hyper-local, accurate weather forecasts for Srikakulam district. We aim to protect lives and support farmers with actionable intelligence.',
      story: 'The Story',
      storyText: 'Started as a passion project, Srikakulam Weatherman has grown into a trusted community resource for thousands of people across the district.',
      community: 'Community Impact',
      instagram: 'Latest from Instagram'
    },
    resources: {
      title: 'Useful Resources',
      imd: 'IMD Portal',
      helplines: 'Helplines',
      agricultural: 'Agricultural Contacts',
      emergency: 'Emergency Services'
    },
    footer: {
      tagline: 'Built for the community of Srikakulam',
      disclaimer: 'Data is for informational purposes only.',
      copyright: '© 2026 Srikakulam Weatherman. All rights reserved.'
    },
    months: {
      jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun',
      jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec'
    },
    days: {
      mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun'
    },
    directions: {
      N: 'N', NE: 'NE', E: 'E', SE: 'SE', S: 'S', SW: 'SW', W: 'W', NW: 'NW'
    },
    time: {
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      night: 'Night',
      now: 'Now',
      today: 'Today',
      tomorrow: 'Tomorrow'
    }
  },
  te: {
    nav: {
      home: 'హోమ్',
      liveWeather: 'ప్రత్యక్ష వాతావరణం',
      farmersHub: 'రైతు కేంద్రం',
      alerts: 'హెచ్చరికలు',
      maps: 'మ్యాప్‌లు',
      about: 'మా గురించి',
      resources: 'వనరులు'
    },
    ui: {
      language: 'భాష',
      languageToggle: 'English',
      search: 'వెతకండి...',
      close: 'మూసివేయు',
      menu: 'మెను',
      loading: 'లోడ్ అవుతోంది...',
      selectLocation: 'ప్రాంతాన్ని ఎంచుకోండి',
      detectLocation: 'నా ప్రాంతాన్ని కనుగొను',
      subscribe: 'సబ్‌స్క్రైబ్ చేయండి',
      learnMore: 'మరింత తెలుసుకోండి',
      viewAll: 'అన్నీ చూడండి',
      lastUpdated: 'చివరిగా నవీకరించబడింది',
      followUs: 'మమ్మల్ని అనుసరించండి',
      followers: 'అనుచరులు',
      shareOnWhatsApp: 'WhatsAppలో భాగస్వామ్యం చేయండి'
    },
    weather: {
      current: 'ప్రస్తుత పరిస్థితులు',
      temperature: 'ఉష్ణోగ్రత',
      feelsLike: 'అనిపిస్తుంది',
      humidity: 'తేమ',
      windSpeed: 'గాలి వేగం',
      windDirection: 'గాలి దిశ',
      pressure: 'వాయు పీడనం',
      visibility: 'దృశ్యమానత',
      uvIndex: 'UV సూచిక',
      dewPoint: 'మంచు బిందువు (Dew Point)',
      rainfall: 'వర్షపాతం',
      aqi: 'గాలి నాణ్యత (AQI)',
      sunrise: 'సూర్యోదయం',
      sunset: 'సూర్యాస్తమయం',
      moonPhase: 'చంద్ర దశ',
      hourly: 'గంటవారీ అంచనా',
      daily: '7-రోజుల అంచనా',
      forecast: 'అంచనా',
      condition: 'పరిస్థితి'
    },
    conditions: {
      sunny: 'ఎండ',
      cloudy: 'మేఘావృతం',
      partlyCloudy: 'పాక్షికంగా మేఘావృతం',
      rainy: 'వర్షం',
      heavyRain: 'భారీ వర్షం',
      thunderstorm: 'ఉరుములతో కూడిన వర్షం',
      storm: 'తుఫాను',
      clearNight: 'స్పష్టమైన రాత్రి',
      hazy: 'పొగమంచు',
      foggy: 'పొగమంచు'
    },
    units: {
      celsius: '°C',
      kmh: 'కి.మీ/గం',
      hpa: 'hPa',
      mm: 'మి.మీ',
      percent: '%',
      km: 'కి.మీ'
    },
    farmer: {
      dashboard: 'రైతు డాష్‌బోర్డ్',
      cropAdvisory: 'పంట సలహా',
      sprayAdvisory: 'పిచికారీ సలహా',
      irrigationAdvice: 'నీటిపారుదల సలహా',
      harvestOutlook: 'పంట కోత అవుట్లుక్',
      rainfallTracker: 'వర్షపాతం ట్రాకర్',
      cropCalendar: 'పంట క్యాలెండర్',
      suitable: 'అనుకూలం',
      notSuitable: 'అనుకూలం కాదు',
      caution: 'జాగ్రత్త',
      sprayQuestion: 'పురుగుమందులు పిచికారీ చేయడానికి అనుకూలమా?',
      irrigationQuestion: 'ఈ రోజు నీటిపారుదల అవసరమా?',
      harvestQuestion: 'పంట కోయడానికి ఇది మంచి సమయమా?',
      soilMoisture: 'నేల తేమ స్థితి',
      windAdvisory: 'రైతులకు గాలి సలహా',
      subscribe: {
        title: 'వాతావరణ హెచ్చరికలను పొందండి',
        description: 'తీవ్ర వాతావరణం కోసం SMS లేదా WhatsApp హెచ్చరికలకు సబ్‌స్క్రైబ్ చేయండి.',
        phone: 'ఫోన్ నంబర్',
        whatsapp: 'WhatsApp హెచ్చరిక',
        sms: 'SMS హెచ్చరిక'
      }
    },
    crops: {
      paddy: 'వరి',
      sugarcane: 'చెరకు',
      cashew: 'జీడిమామిడి',
      coconut: 'కొబ్బరి',
      blackGram: 'మినుములు',
      greenGram: 'పెసలు',
      groundnut: 'వేరుశెనగ',
      chilli: 'మిర్చి'
    },
    alerts: {
      title: 'క్రియాశీల హెచ్చరికలు',
      active: 'క్రియాశీల',
      noAlerts: 'ప్రస్తుతం ఎలాంటి క్రియాశీల హెచ్చరికలు లేవు.',
      severity: {
        watch: 'కంట కనిపెట్టండి (Watch)',
        warning: 'హెచ్చరిక (Warning)',
        emergency: 'అత్యవసరం (Emergency)'
      },
      cyclone: 'తుఫాను హెచ్చరిక',
      heavyRain: 'భారీ వర్షపాతం హెచ్చరిక',
      heatWave: 'వడగాల్పుల హెచ్చరిక',
      flood: 'వరద హెచ్చరిక',
      thunderstorm: 'ఉరుములతో కూడిన వర్షం హెచ్చరిక',
      preparedness: 'విపత్తు సన్నద్ధత',
      helplines: 'అత్యవసర హెల్ప్‌లైన్‌లు'
    },
    about: {
      title: 'శ్రీకాకుళం వెదర్మ్యాన్ గురించి',
      mission: 'మా లక్ష్యం',
      missionText: 'శ్రీకాకుళం జిల్లా కోసం అత్యంత స్థానిక, ఖచ్చితమైన వాతావరణ సూచనలను అందించడం. ప్రాణాలను రక్షించడం మరియు రైతులకు సమాచారంతో మద్దతు ఇవ్వడం మా లక్ష్యం.',
      story: 'ప్రయాణం',
      storyText: 'ఒక అభిరుచిగా ప్రారంభమైన శ్రీకాకుళం వెదర్మ్యాన్, జిల్లా వ్యాప్తంగా వేలాది మంది ప్రజలకు విశ్వసనీయమైన కమ్యూనిటీ వనరుగా ఎదిగింది.',
      community: 'కమ్యూనిటీ ప్రభావం',
      instagram: 'Instagram నుండి తాజా అప్‌డేట్‌లు'
    },
    resources: {
      title: 'ఉపయోగకరమైన వనరులు',
      imd: 'IMD పోర్టల్',
      helplines: 'హెల్ప్‌లైన్‌లు',
      agricultural: 'వ్యవసాయ అధికారులు',
      emergency: 'అత్యవసర సేవలు'
    },
    footer: {
      tagline: 'శ్రీకాకుళం సమాజం కోసం నిర్మించబడింది',
      disclaimer: 'సమాచారం కేవలం అవగాహన కోసం మాత్రమే.',
      copyright: '© 2026 శ్రీకాకుళం వెదర్మ్యాన్. సర్వ హక్కులు ప్రత్యేకించబడినవి.'
    },
    months: {
      jan: 'జన', feb: 'ఫిబ్ర', mar: 'మార్చి', apr: 'ఏప్రి', may: 'మే', jun: 'జూన్',
      jul: 'జూలై', aug: 'ఆగ', sep: 'సెప్టెం', oct: 'అక్టో', nov: 'నవం', dec: 'డిసెం'
    },
    days: {
      mon: 'సోమ', tue: 'మంగళ', wed: 'బుధ', thu: 'గురు', fri: 'శుక్ర', sat: 'శని', sun: 'ఆది'
    },
    directions: {
      N: 'ఉ', NE: 'ఈ', E: 'తూర్పు', SE: 'ఆ', S: 'ద', SW: 'నై', W: 'పడమర', NW: 'వా'
    },
    time: {
      morning: 'ఉదయం',
      afternoon: 'మధ్యాహ్నం',
      evening: 'సాయంత్రం',
      night: 'రాత్రి',
      now: 'ఇప్పుడు',
      today: 'ఈ రోజు',
      tomorrow: 'రేపు'
    }
  }
};

const LOCATIONS = [
  { id: 'srikakulam', name: { en: 'Srikakulam', te: 'శ్రీకాకుళం' }, lat: 18.2949, lon: 83.8935, isDefault: true },
  { id: 'amadalavalasa', name: { en: 'Amadalavalasa', te: 'అమదాలవలస' }, lat: 18.41, lon: 83.90 },
  { id: 'tekkali', name: { en: 'Tekkali', te: 'టెక్కలి' }, lat: 18.605, lon: 84.235 },
  { id: 'palasa', name: { en: 'Palasa', te: 'పలాస' }, lat: 18.773, lon: 84.416 },
  { id: 'narasannapeta', name: { en: 'Narasannapeta', te: 'నరసన్నపేట' }, lat: 18.414, lon: 84.044 },
  { id: 'ichapuram', name: { en: 'Ichapuram', te: 'ఇచ్ఛాపురం' }, lat: 19.114, lon: 84.692 },
  { id: 'sompeta', name: { en: 'Sompeta', te: 'సోంపేట' }, lat: 18.945, lon: 84.585 },
  { id: 'kaviti', name: { en: 'Kaviti', te: 'కవిటి' }, lat: 19.007, lon: 84.685 },
  { id: 'rajam', name: { en: 'Rajam', te: 'రాజాం' }, lat: 18.455, lon: 83.945 },
  { id: 'etcherla', name: { en: 'Etcherla', te: 'ఏచ్చెర్ల' }, lat: 18.36, lon: 83.94 }
];

const _baseTime = Date.now() / 1000;
const _sunrise = new Date('2026-07-12T05:30:00+05:30').getTime() / 1000;
const _sunset = new Date('2026-07-12T18:45:00+05:30').getTime() / 1000;

const _generateHourly = (baseTemp) => {
  return Array.from({ length: 24 }).map((_, i) => {
    let t = _baseTime + i * 3600;
    let hour = new Date(t * 1000).getHours();
    let tempMod = Math.sin((hour - 6) * Math.PI / 12) * 3; // warmest at 12-2pm
    return {
      time: t,
      temp: parseFloat((baseTemp + tempMod).toFixed(1)),
      feels_like: parseFloat((baseTemp + tempMod + 2).toFixed(1)),
      humidity: 80 + Math.random() * 10,
      wind_speed: 15 + Math.random() * 5,
      weather: [{ main: Math.random() > 0.5 ? 'Rain' : 'Clouds', description: 'scattered clouds', icon: '10d' }],
      pop: Math.random()
    };
  });
};

const _generateDaily = (baseTemp) => {
  return Array.from({ length: 7 }).map((_, i) => {
    let t = _baseTime + i * 86400;
    return {
      date: t * 1000,
      temp: {
        day: parseFloat((baseTemp + 2).toFixed(1)),
        min: parseFloat((baseTemp - 2).toFixed(1)),
        max: parseFloat((baseTemp + 3).toFixed(1))
      },
      weather: [{ main: Math.random() > 0.4 ? 'Rain' : 'Clouds', description: 'moderate rain', icon: '10d' }],
      humidity: 85,
      wind_speed: 18,
      rain: parseFloat((Math.random() * 40).toFixed(1)), // 0-40mm
      pop: Math.random()
    };
  });
};

const MOCK_WEATHER = {
  current: {
    coord: { lat: 18.2949, lon: 83.8935 },
    weather: [{ id: 500, main: 'Rain', description: 'moderate rain', icon: '10d' }],
    condition: 'heavyRain',
    main: {
      temp: 29.2, feels_like: 34.5, temp_min: 27.1, temp_max: 31.8,
      pressure: 1004, humidity: 87, sea_level: 1004
    },
    visibility: 6000,
    wind: { speed: 18.5, deg: 225, gust: 28.3 },
    rain: { '1h': 4.2 },
    clouds: { all: 78 },
    dt: _baseTime,
    sys: { sunrise: _sunrise, sunset: _sunset },
    name: 'Srikakulam',
    uv_index: 4,
    dew_point: 26.1,
    aqi: { value: 68, category: 'Moderate', pm25: 23, pm10: 45, o3: 38 }
  },
  hourly: _generateHourly(29),
  daily: _generateDaily(29)
};

const MOCK_WEATHER_BY_LOCATION = {};
LOCATIONS.forEach(loc => {
  let baseTemp = 28 + Math.random() * 2;
  MOCK_WEATHER_BY_LOCATION[loc.id] = {
    current: {
      ...MOCK_WEATHER.current,
      name: loc.name.en,
      main: { ...MOCK_WEATHER.current.main, temp: parseFloat(baseTemp.toFixed(1)) },
      condition: Math.random() > 0.5 ? 'rain' : 'cloudy'
    },
    hourly: _generateHourly(baseTemp),
    daily: _generateDaily(baseTemp)
  };
});
// Override default location with the main mock weather
MOCK_WEATHER_BY_LOCATION['srikakulam'] = MOCK_WEATHER;

const FARMER_ADVISORIES = {
  sprayAdvisory: {
    suitable: false,
    reason: { en: 'High chances of rainfall and strong winds today.', te: 'ఈ రోజు భారీ వర్షం మరియు ఈదురు గాలులు వచ్చే అవకాశం ఉంది.' },
    windSpeed: 18.5,
    rainExpected: true,
    nextWindow: { en: 'Tomorrow afternoon', te: 'రేపు మధ్యాహ్నం' }
  },
  irrigationAdvice: {
    needed: false,
    reason: { en: 'Recent rainfall has provided adequate soil moisture.', te: 'ఇటీవలి వర్షపాతం కారణంగా నేలలో తగినంత తేమ ఉంది.' },
    soilMoisture: 'High',
    rainfallLast7Days: 127
  },
  harvestOutlook: {
    status: 'caution',
    reason: { en: 'Not suitable for harvesting due to wet conditions.', te: 'తేమ పరిస్థితుల కారణంగా పంట కోయడానికి అనుకూలం కాదు.' },
    dryDaysAhead: 1
  },
  cropTips: [
    { crop: 'paddy', tip: { en: 'Ensure proper drainage in nurseries to avoid water stagnation.', te: 'నీరు నిలిచిపోకుండా నారుమడులలో సరైన మురుగునీటి పారుదల ఉండేలా చూసుకోండి.' }, urgency: 'high' },
    { crop: 'sugarcane', tip: { en: 'Tie canes to prevent lodging from strong winds.', te: 'బలమైన గాలుల వలన పంట పడిపోకుండా చెరకు గడలను కట్టండి.' }, urgency: 'normal' },
    { crop: 'coconut', tip: { en: 'Check for rhinoceros beetle infestation after rains.', te: 'వర్షాల తర్వాత కొబ్బరి చెట్లకు కొమ్ము పురుగు ఆశించిందేమో తనిఖీ చేయండి.' }, urgency: 'normal' }
  ]
};

const MOCK_ALERTS = [
  {
    id: 1,
    type: 'heavy_rain',
    severity: 'warning',
    title: { en: 'Heavy Rainfall Warning', te: 'భారీ వర్షపాతం హెచ్చరిక' },
    description: { en: 'Heavy to very heavy rainfall expected in Srikakulam district over the next 24 hours.', te: 'రాబోయే 24 గంటల్లో శ్రీకాకుళం జిల్లాలో భారీ నుండి అతి భారీ వర్షాలు కురిసే అవకాశం ఉంది.' },
    issued: '2026-07-12T09:00:00+05:30',
    expires: '2026-07-13T09:00:00+05:30',
    affectedAreas: ['Srikakulam', 'Tekkali', 'Narasannapeta'],
    actions: { en: ['Stay indoors', 'Avoid crossing streams', 'Secure loose objects'], te: ['ఇంట్లోనే ఉండండి', 'వాగులు దాటకండి', 'వదులుగా ఉన్న వస్తువులను భద్రపరచండి'] }
  },
  {
    id: 2,
    type: 'cyclone',
    severity: 'watch',
    title: { en: 'Cyclone Watch', te: 'తుఫాను నిఘా (Watch)' },
    description: { en: 'A low-pressure area over Bay of Bengal is likely to intensify. Fishermen are advised not to venture into the sea.', te: 'బంగాళాఖాతంలో అల్పపీడనం బలపడే అవకాశం ఉంది. మత్స్యకారులు సముద్రంలోకి వేటకు వెళ్లవద్దని సూచించబడింది.' },
    issued: '2026-07-12T08:00:00+05:30',
    expires: '2026-07-15T18:00:00+05:30',
    affectedAreas: ['Kaviti', 'Sompeta', 'Ichapuram', 'Coastal Mandals'],
    actions: { en: ['Fishermen warning', 'Keep emergency kits ready'], te: ['మత్స్యకారులకు హెచ్చరిక', 'అత్యవసర కిట్లను సిద్ధంగా ఉంచుకోండి'] }
  }
];

const RESOURCES = {
  helplines: [
    { name: { en: 'District Emergency Center', te: 'జిల్లా అత్యవసర కేంద్రం' }, number: '08942-222333', type: 'emergency' },
    { name: { en: 'IMD Cyclone Warning', te: 'IMD తుఫాను హెచ్చరిక' }, number: '1800-180-1717', type: 'weather' },
    { name: { en: 'Agriculture Helpline', te: 'వ్యవసాయ హెల్ప్‌లైన్' }, number: '155235', type: 'agriculture' }
  ],
  links: [
    { name: { en: 'IMD Official Website', te: 'IMD అధికారిక వెబ్‌సైట్' }, url: 'https://mausam.imd.gov.in/', icon: '🌐' },
    { name: { en: 'AP Disaster Management', te: 'AP విపత్తు నిర్వహణ సంస్థ' }, url: 'https://apsdma.ap.gov.in/', icon: '⚠️' }
  ]
};

const INSTAGRAM_MOCK = {
  username: 'srikakulam_weatherman',
  followers: '12.5K',
  posts: 342,
  following: 156,
  latestPosts: [
    { id: 1, caption: { en: 'Heavy rains lashing Srikakulam town now.', te: 'శ్రీకాకుళం పట్టణంలో ఇప్పుడు భారీ వర్షం.' }, likes: 234, comments: 18, timeAgo: '2h', img: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500&q=80' },
    { id: 2, caption: { en: 'Monsoon clouds gathering over Tekkali.', te: 'టెక్కలి పై కమ్ముకుంటున్న రుతుపవన మేఘాలు.' }, likes: 456, comments: 22, timeAgo: '5h', img: 'https://images.unsplash.com/photo-1534088568595-a066f410cbda?w=500&q=80' },
    { id: 3, caption: { en: 'Beautiful sunset after the rain at Kalingapatnam beach.', te: 'కళింగపట్నం బీచ్‌లో వర్షం తర్వాత అందమైన సూర్యాస్తమయం.' }, likes: 890, comments: 45, timeAgo: '1d', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80' },
    { id: 4, caption: { en: 'Farmers starting paddy nursery preparation.', te: 'వరి నారుమడులు సిద్ధం చేస్తున్న రైతులు.' }, likes: 312, comments: 12, timeAgo: '2d', img: 'https://images.unsplash.com/photo-1592982537447-6f233ba38eb8?w=500&q=80' },
    { id: 5, caption: { en: 'Water levels rising in Vamsadhara river.', te: 'వంశధార నదిలో పెరుగుతున్న నీటిమట్టం.' }, likes: 567, comments: 30, timeAgo: '3d', img: 'https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?w=500&q=80' },
    { id: 6, caption: { en: 'A cloudy day in Palasa.', te: 'పలాసలో మేఘావృతమైన రోజు.' }, likes: 421, comments: 15, timeAgo: '4d', img: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=500&q=80' }
  ]
};

const CROP_CALENDAR = [
  {
    crop: { en: 'Paddy (Kharif)', te: 'వరి (ఖరీఫ్)' },
    sowingMonths: [5, 6, 7],
    harvestMonths: [10, 11, 12],
    currentStatus: 'sowing',
    weatherNeeds: { en: 'Requires continuous rainfall or irrigation during early stages.', te: 'తొలి దశలో నిరంతర వర్షపాతం లేదా నీటిపారుదల అవసరం.' }
  },
  {
    crop: { en: 'Sugarcane', te: 'చెరకు' },
    sowingMonths: [0, 1, 2],
    harvestMonths: [10, 11, 12],
    currentStatus: 'growing',
    weatherNeeds: { en: 'Needs moderate rainfall and warm temperatures.', te: 'మోస్తరు వర్షపాతం మరియు వెచ్చని ఉష్ణోగ్రతలు అవసరం.' }
  },
  {
    crop: { en: 'Cashew', te: 'జీడిమామిడి' },
    sowingMonths: [5, 6],
    harvestMonths: [2, 3, 4],
    currentStatus: 'growing',
    weatherNeeds: { en: 'Sensitive to heavy rains during flowering.', te: 'పూత దశలో భారీ వర్షాలు ఉంటే నష్టం వాటిల్లుతుంది.' }
  }
];
