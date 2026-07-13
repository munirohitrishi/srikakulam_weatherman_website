/* ==========================================================================
   SCENE.JS — 3D Weather Globe, Charts & Map
   Srikakulam District Weather Application
   ==========================================================================
   Dependencies (loaded via CDN before this file):
     • THREE  (Three.js r160)
     • Chart  (Chart.js 4.x)
     • L      (Leaflet 1.9)
     • gsap   (GSAP 3.12)
   Global data (defined elsewhere):
     MOCK_WEATHER, MOCK_WEATHER_BY_LOCATION, LOCATIONS,
     TRANSLATIONS, currentLang, currentLocation, t()
   ========================================================================== */


/* ──────────────────────────────────────────────────────────────────────────
   §0  HELPER / UTILITY FUNCTIONS
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Detect WebGL support in the current browser.
 * @returns {boolean}
 */
function checkWebGL() {
  try {
    var c = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

/**
 * Simple mobile breakpoint check.
 * @returns {boolean}
 */
function isMobile() {
  return window.innerWidth < 768;
}

/**
 * Convert geographic latitude / longitude to a THREE.Vector3 on a sphere.
 * @param {number} lat  - Latitude in degrees
 * @param {number} lon  - Longitude in degrees
 * @param {number} radius
 * @returns {THREE.Vector3}
 */
function latLonToVector3(lat, lon, radius) {
  var phi   = (90 - lat) * (Math.PI / 180);
  var theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Map a weather condition string to a hex colour.
 * @param {string} condition
 * @returns {string} hex colour
 */
function getConditionColor(condition) {
  var map = {
    sunny:        '#FFB347',
    clearNight:   '#5B6EAE',
    partlyCloudy: '#A0C4E8',
    cloudy:       '#8899AA',
    rain:         '#4FC3F7',
    heavyRain:    '#1976D2',
    thunderstorm: '#7C4DFF',
    drizzle:      '#80DEEA',
    fog:          '#B0BEC5',
    haze:         '#BCAAA4'
  };
  return map[condition] || '#00D4AA';
}

/**
 * Format a UNIX timestamp to a localised time string.
 * @param {number} timestamp  - seconds since epoch
 * @param {string} lang       - 'en' | 'te'
 * @returns {string}
 */
function formatTime(timestamp, lang) {
  var d = new Date(timestamp * 1000);
  var locale = lang === 'te' ? 'te-IN' : 'en-IN';
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}


/* ──────────────────────────────────────────────────────────────────────────
   §1  THREE.JS — 3D WEATHER SCENE
   ────────────────────────────────────────────────────────────────────────── */

/* ·· global scene state ···················································· */
var _scene = {
  renderer:     null,
  scene:        null,
  camera:       null,
  globe:        null,
  atmosphere:   null,
  marker:       null,
  markerGlow:   null,
  particles:    null,
  particleType: 'rain',
  lights:       { ambient: null, directional: null, point: null },
  animId:       null,
  clock:        null,
  mouse:        { x: 0, y: 0, prevX: 0, prevY: 0, dragging: false },
  globeGroup:   null,
  disposed:     false
};


/* ·· shaders ·············································· */

var _globeVertexShader = [
  'varying vec3 vNormal;',
  'varying vec2 vUv;',
  'varying vec3 vPosition;',
  'void main() {',
  '  vNormal   = normalize(normalMatrix * normal);',
  '  vUv       = uv;',
  '  vPosition = position;',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
  '}'
].join('\n');

var _globeFragmentShader = [
  'uniform float uTime;',
  'uniform vec3  uBaseColor;',
  'uniform vec3  uRimColor;',
  'uniform float uRimPower;',
  'varying vec3 vNormal;',
  'varying vec2 vUv;',
  'varying vec3 vPosition;',

  /* simple pseudo-random hash */
  'float hash(vec2 p) {',
  '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);',
  '}',

  /* smooth noise */
  'float noise(vec2 p) {',
  '  vec2 i = floor(p);',
  '  vec2 f = fract(p);',
  '  f = f * f * (3.0 - 2.0 * f);',
  '  float a = hash(i);',
  '  float b = hash(i + vec2(1.0, 0.0));',
  '  float c = hash(i + vec2(0.0, 1.0));',
  '  float d = hash(i + vec2(1.0, 1.0));',
  '  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);',
  '}',

  'void main() {',
  '  /* ── fresnel rim ── */',
  '  float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), uRimPower);',

  '  /* ── latitude / longitude grid ── */',
  '  float latLines = abs(sin(vUv.y * 3.14159 * 12.0));',
  '  float lonLines = abs(sin(vUv.x * 3.14159 * 24.0));',
  '  float grid     = smoothstep(0.96, 1.0, max(latLines, lonLines));',
  '  grid *= 0.15;',   /* very subtle */

  '  /* ── animated cloud-like noise overlay ── */',
  '  float n = noise(vUv * 8.0 + uTime * 0.05);',
  '  float cloudMask = smoothstep(0.42, 0.62, n) * 0.18;',

  '  /* ── ocean depth variation ── */',
  '  float depth = noise(vUv * 5.0) * 0.12;',

  '  /* ── compose ── */',
  '  vec3 base = uBaseColor + depth;',
  '  vec3 col  = mix(base, uRimColor, fresnel * 0.7);',
  '  col += vec3(grid);',
  '  col += vec3(cloudMask) * vec3(0.7, 0.9, 1.0);',

  '  /* ── edge transparency ── */',
  '  float alpha = mix(0.95, 0.5, pow(fresnel, 3.0));',

  '  gl_FragColor = vec4(col, alpha);',
  '}'
].join('\n');

var _atmosphereVertexShader = [
  'varying vec3 vNormal;',
  'void main() {',
  '  vNormal     = normalize(normalMatrix * normal);',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
  '}'
].join('\n');

var _atmosphereFragmentShader = [
  'uniform vec3  uGlowColor;',
  'uniform float uIntensity;',
  'varying vec3 vNormal;',
  'void main() {',
  '  float glow = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);',
  '  gl_FragColor = vec4(uGlowColor, glow * uIntensity);',
  '}'
].join('\n');


/* ·· init ················································ */

function initWeatherScene() {
  if (_scene.disposed) _scene.disposed = false;

  var canvas = document.getElementById('weather-canvas');
  if (!canvas) { console.warn('[scene] #weather-canvas not found'); return; }

  if (!checkWebGL()) {
    canvas.style.display = 'none';
    var fb = document.createElement('div');
    fb.className = 'webgl-fallback';
    fb.innerHTML = '<p style="text-align:center;padding:2rem;color:#8899aa;">' +
      '🌐 Your browser does not support WebGL.<br>Please use a modern browser for the 3D experience.</p>';
    canvas.parentNode.insertBefore(fb, canvas);
    return;
  }

  /* ── renderer ── */
  _scene.renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: !isMobile()
  });
  _scene.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  _resizeRenderer();

  /* ── scene & fog ── */
  _scene.scene = new THREE.Scene();
  _scene.scene.fog = new THREE.FogExp2(0x050d1a, 0.035);

  /* ── camera ── */
  var aspect = canvas.clientWidth / canvas.clientHeight;
  _scene.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
  _scene.camera.position.set(0, 2, 14);
  _scene.camera.lookAt(0, 0, 0);

  /* ── clock ── */
  _scene.clock = new THREE.Clock();

  /* ── globe group (for rotation) ── */
  _scene.globeGroup = new THREE.Group();
  _scene.scene.add(_scene.globeGroup);

  /* build sub-elements */
  _createGlobe();
  _createAtmosphere();
  _createSrikakulamMarker();
  _createLights();
  _createParticles('rain');

  /* ── interaction ── */
  _addInteraction(canvas);

  /* ── responsive ── */
  window.addEventListener('resize', _onWindowResize);

  /* ── start loop ── */
  _scene.animId = requestAnimationFrame(animateScene);
}


/* ·· globe mesh ·········································· */

function _createGlobe() {
  var geo = new THREE.SphereGeometry(5, 64, 64);
  
  var loader = new THREE.TextureLoader();
  
  var earthMat = new THREE.MeshStandardMaterial({
    map: loader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'),
    bumpMap: loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png'),
    bumpScale: 0.1,
    roughnessMap: loader.load('https://unpkg.com/three-globe/example/img/earth-water.png'),
    metalness: 0.1,
    roughness: 0.8
  });
  
  _scene.globe = new THREE.Mesh(geo, earthMat);
  _scene.globeGroup.add(_scene.globe);

  // Cloud layer
  var cloudGeo = new THREE.SphereGeometry(5.05, 64, 64);
  var cloudMat = new THREE.MeshStandardMaterial({
    map: loader.load('https://unpkg.com/three-globe/example/img/earth-clouds1024.png'),
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  var clouds = new THREE.Mesh(cloudGeo, cloudMat);
  _scene.globe.add(clouds); // Attaching to globe so they rotate together
  
  // Slowly rotate clouds independently inside animation loop
  _scene.clouds = clouds;
}


/* ·· atmosphere glow ····································· */

function _createAtmosphere() {
  var geo = new THREE.SphereGeometry(5.3, 64, 64);
  var mat = new THREE.ShaderMaterial({
    vertexShader:   _atmosphereVertexShader,
    fragmentShader: _atmosphereFragmentShader,
    uniforms: {
      uGlowColor: { value: new THREE.Color(0x00D4AA) },
      uIntensity: { value: 0.6 }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false
  });
  _scene.atmosphere = new THREE.Mesh(geo, mat);
  _scene.globeGroup.add(_scene.atmosphere);
}


/* ·· Srikakulam marker ··································· */

function _createSrikakulamMarker() {
  var pos = latLonToVector3(18.3, 83.9, 5.05);

  /* core dot */
  var dotGeo = new THREE.SphereGeometry(0.1, 16, 16);
  var dotMat = new THREE.MeshBasicMaterial({ color: 0x00FFD0 });
  _scene.marker = new THREE.Mesh(dotGeo, dotMat);
  _scene.marker.position.copy(pos);
  _scene.globeGroup.add(_scene.marker);

  /* glow ring */
  var ringGeo = new THREE.RingGeometry(0.15, 0.35, 32);
  var ringMat = new THREE.MeshBasicMaterial({
    color: 0x00D4AA,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  _scene.markerGlow = new THREE.Mesh(ringGeo, ringMat);
  _scene.markerGlow.position.copy(pos);
  /* orient ring to face outward from sphere */
  _scene.markerGlow.lookAt(pos.clone().multiplyScalar(2));
  _scene.globeGroup.add(_scene.markerGlow);

  /* secondary outer glow */
  var glowGeo = new THREE.SphereGeometry(0.35, 16, 16);
  var glowMat = new THREE.MeshBasicMaterial({
    color: 0x00D4AA,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  var glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.position.copy(pos);
  _scene.globeGroup.add(glowMesh);
  _scene._markerOuterGlow = glowMesh;
}


/* ·· lighting ············································ */

function _createLights() {
  var amb = new THREE.AmbientLight(0x335577, 0.6);
  _scene.scene.add(amb);
  _scene.lights.ambient = amb;

  var dir = new THREE.DirectionalLight(0xAABBDD, 0.9);
  dir.position.set(5, 8, 6);
  _scene.scene.add(dir);
  _scene.lights.directional = dir;

  var srkPos = latLonToVector3(18.3, 83.9, 5.05);
  var pt = new THREE.PointLight(0x00D4AA, 1.5, 8);
  pt.position.copy(srkPos);
  _scene.globeGroup.add(pt);
  _scene.lights.point = pt;
}


/* ·· particle systems ···································· */

function _createParticles(type) {
  _removeParticles();
  _scene.particleType = type;

  switch (type) {
    case 'rain':
    case 'heavyRain':
    case 'thunderstorm':
    case 'drizzle':
      _createRainParticles(type);
      break;
    case 'cloudy':
    case 'partlyCloudy':
    case 'fog':
    case 'haze':
      _createCloudParticles();
      break;
    case 'sunny':
    case 'clearNight':
      _createSunRays(type);
      break;
    default:
      _createRainParticles('rain');
  }
}

function _removeParticles() {
  if (_scene.particles) {
    if (Array.isArray(_scene.particles)) {
      _scene.particles.forEach(function (p) {
        _scene.scene.remove(p);
        if (p.geometry) p.geometry.dispose();
        if (p.material) p.material.dispose();
      });
    } else {
      _scene.scene.remove(_scene.particles);
      if (_scene.particles.geometry) _scene.particles.geometry.dispose();
      if (_scene.particles.material) _scene.particles.material.dispose();
    }
    _scene.particles = null;
  }
}


/* ── rain ── */

function _createRainParticles(subtype) {
  var COUNT = isMobile() ? 800 : 2000;
  if (subtype === 'heavyRain')    COUNT = Math.round(COUNT * 1.6);
  if (subtype === 'thunderstorm') COUNT = Math.round(COUNT * 2.0);
  if (subtype === 'drizzle')      COUNT = Math.round(COUNT * 0.5);

  var positions  = new Float32Array(COUNT * 3);
  var velocities = new Float32Array(COUNT * 3);

  var SPREAD = 20, HEIGHT = 15;

  for (var i = 0; i < COUNT; i++) {
    var i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * SPREAD;
    positions[i3 + 1] = Math.random() * HEIGHT - HEIGHT / 2;
    positions[i3 + 2] = (Math.random() - 0.5) * SPREAD;

    /* SW monsoon wind angle → slight x drift */
    velocities[i3]     = -0.002 - Math.random() * 0.003;   /* x drift */
    velocities[i3 + 1] = -0.04  - Math.random() * 0.06;    /* fall speed */
    velocities[i3 + 2] = -0.001 - Math.random() * 0.002;   /* z drift */
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

  var rainColor = subtype === 'thunderstorm' ? 0x9FAFEF : 0xAADDFF;
  var mat = new THREE.PointsMaterial({
    color: rainColor,
    size: subtype === 'heavyRain' ? 0.07 : 0.05,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });

  _scene.particles = new THREE.Points(geo, mat);
  _scene.scene.add(_scene.particles);
}


/* ── clouds ── */

function _createCloudParticles() {
  var COUNT = isMobile() ? 80 : 200;
  var cloudGroup = [];

  /* load a soft radial gradient texture on the fly */
  var canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  var ctx = canvas.getContext('2d');
  var grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,0.6)');
  grad.addColorStop(0.4, 'rgba(220,230,240,0.3)');
  grad.addColorStop(1, 'rgba(200,210,220,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  var tex = new THREE.CanvasTexture(canvas);

  for (var i = 0; i < COUNT; i++) {
    var size = 0.5 + Math.random() * 2.0;
    var geo = new THREE.PlaneGeometry(size, size * 0.6);
    var mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.25 + Math.random() * 0.2,
      blending: THREE.NormalBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(geo, mat);

    /* cluster in layers */
    var layer = Math.floor(Math.random() * 3);
    mesh.position.set(
      (Math.random() - 0.5) * 22,
      3 + layer * 1.5 + Math.random() * 1.2,
      (Math.random() - 0.5) * 14
    );
    mesh.rotation.z = Math.random() * 0.3 - 0.15;

    /* store drift speed on userData */
    mesh.userData.driftX = (Math.random() - 0.3) * 0.008;
    mesh.userData.driftZ = (Math.random() - 0.5) * 0.003;

    _scene.scene.add(mesh);
    cloudGroup.push(mesh);
  }

  _scene.particles = cloudGroup;
}


/* ── sun rays / star field ── */

function _createSunRays(subtype) {
  var group = [];

  if (subtype === 'clearNight') {
    /* star field */
    var COUNT = isMobile() ? 300 : 800;
    var positions = new Float32Array(COUNT * 3);
    for (var i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = -10 - Math.random() * 15;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
    var stars = new THREE.Points(geo, mat);
    _scene.scene.add(stars);
    group.push(stars);

  } else {
    /* volumetric sun-ray planes */
    var RAY_COUNT = isMobile() ? 4 : 8;
    for (var r = 0; r < RAY_COUNT; r++) {
      var w = 0.6 + Math.random() * 1.2;
      var h = 6 + Math.random() * 8;
      var geo2 = new THREE.PlaneGeometry(w, h);
      var mat2 = new THREE.MeshBasicMaterial({
        color: 0xFFD080,
        transparent: true,
        opacity: 0.06 + Math.random() * 0.06,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      var ray = new THREE.Mesh(geo2, mat2);
      ray.position.set(
        5 + Math.random() * 4,
        4 + Math.random() * 3,
        -2 + Math.random() * 4
      );
      ray.rotation.z = -0.5 + Math.random() * 0.3;
      ray.rotation.y = Math.random() * 0.4;
      ray.userData.swaySpeed = 0.2 + Math.random() * 0.3;
      ray.userData.baseRotZ  = ray.rotation.z;
      _scene.scene.add(ray);
      group.push(ray);
    }
  }

  _scene.particles = group;
}


/* ·· mouse / touch interaction ···························· */

function _addInteraction(canvas) {
  /* mouse */
  canvas.addEventListener('mousedown', function (e) {
    _scene.mouse.dragging = true;
    _scene.mouse.prevX = e.clientX;
    _scene.mouse.prevY = e.clientY;
  });
  window.addEventListener('mouseup', function () { _scene.mouse.dragging = false; });
  window.addEventListener('mousemove', function (e) {
    if (!_scene.mouse.dragging || !_scene.globeGroup) return;
    var dx = e.clientX - _scene.mouse.prevX;
    var dy = e.clientY - _scene.mouse.prevY;
    _scene.globeGroup.rotation.y += dx * 0.005;
    _scene.globeGroup.rotation.x += dy * 0.005;
    _scene.globeGroup.rotation.x = Math.max(-1, Math.min(1, _scene.globeGroup.rotation.x));
    _scene.mouse.prevX = e.clientX;
    _scene.mouse.prevY = e.clientY;
  });

  /* touch */
  canvas.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      _scene.mouse.dragging = true;
      _scene.mouse.prevX = e.touches[0].clientX;
      _scene.mouse.prevY = e.touches[0].clientY;
    }
  }, { passive: true });
  canvas.addEventListener('touchend', function () { _scene.mouse.dragging = false; }, { passive: true });
  canvas.addEventListener('touchmove', function (e) {
    if (!_scene.mouse.dragging || e.touches.length !== 1 || !_scene.globeGroup) return;
    var dx = e.touches[0].clientX - _scene.mouse.prevX;
    var dy = e.touches[0].clientY - _scene.mouse.prevY;
    _scene.globeGroup.rotation.y += dx * 0.005;
    _scene.globeGroup.rotation.x += dy * 0.005;
    _scene.globeGroup.rotation.x = Math.max(-1, Math.min(1, _scene.globeGroup.rotation.x));
    _scene.mouse.prevX = e.touches[0].clientX;
    _scene.mouse.prevY = e.touches[0].clientY;
  }, { passive: true });
}


/* ·· animation loop ······································ */

function animateScene() {
  if (_scene.disposed) return;
  _scene.animId = requestAnimationFrame(animateScene);

  var elapsed = _scene.clock ? _scene.clock.getElapsedTime() : 0;

  /* ── globe auto-rotation ── */
  if (_scene.globeGroup && !_scene.mouse.dragging) {
    _scene.globeGroup.rotation.y += 0.001;
  }

  if (_scene.clouds) {
    _scene.clouds.rotation.y += 0.0005; // Clouds rotate slightly faster than earth
  }

  /* ── marker pulse ── */
  if (_scene.markerGlow) {
    var pulse = 0.4 + Math.sin(elapsed * 2.5) * 0.25;
    _scene.markerGlow.material.opacity = pulse;
    var s = 1.0 + Math.sin(elapsed * 2.5) * 0.3;
    _scene.markerGlow.scale.set(s, s, s);
  }
  if (_scene._markerOuterGlow) {
    var s2 = 1.0 + Math.sin(elapsed * 1.8) * 0.5;
    _scene._markerOuterGlow.scale.set(s2, s2, s2);
    _scene._markerOuterGlow.material.opacity = 0.08 + Math.sin(elapsed * 1.8) * 0.07;
  }

  /* ── particles ── */
  _updateParticles(elapsed);

  /* ── render ── */
  if (_scene.renderer && _scene.scene && _scene.camera) {
    _scene.renderer.render(_scene.scene, _scene.camera);
  }
}


function _updateParticles(elapsed) {
  var pt = _scene.particleType;

  /* — rain / heavy / storm / drizzle — */
  if (pt === 'rain' || pt === 'heavyRain' || pt === 'thunderstorm' || pt === 'drizzle') {
    if (!_scene.particles || !_scene.particles.geometry) return;
    var pos = _scene.particles.geometry.attributes.position;
    var vel = _scene.particles.geometry.attributes.velocity;
    if (!pos || !vel) return;
    var arr  = pos.array;
    var varr = vel.array;
    var HALF_H = 7.5, HALF_S = 10;

    for (var i = 0, len = pos.count; i < len; i++) {
      var i3 = i * 3;
      arr[i3]     += varr[i3];
      arr[i3 + 1] += varr[i3 + 1];
      arr[i3 + 2] += varr[i3 + 2];

      /* reset at bottom */
      if (arr[i3 + 1] < -HALF_H) {
        arr[i3]     = (Math.random() - 0.5) * HALF_S * 2;
        arr[i3 + 1] = HALF_H + Math.random() * 2;
        arr[i3 + 2] = (Math.random() - 0.5) * HALF_S * 2;
      }
    }
    pos.needsUpdate = true;

    /* thunderstorm: occasional flash */
    if (pt === 'thunderstorm' && _scene.lights.ambient) {
      if (Math.random() < 0.005) {
        _scene.lights.ambient.intensity = 2.0;
        setTimeout(function () {
          if (_scene.lights.ambient) _scene.lights.ambient.intensity = 0.4;
        }, 80);
      }
    }
    return;
  }

  /* — clouds — */
  if (pt === 'cloudy' || pt === 'partlyCloudy' || pt === 'fog' || pt === 'haze') {
    if (!Array.isArray(_scene.particles)) return;
    _scene.particles.forEach(function (m) {
      m.position.x += m.userData.driftX || 0;
      m.position.z += m.userData.driftZ || 0;
      if (m.position.x > 14)  m.position.x = -14;
      if (m.position.x < -14) m.position.x = 14;
    });
    return;
  }

  /* — sun rays sway — */
  if (pt === 'sunny') {
    if (!Array.isArray(_scene.particles)) return;
    _scene.particles.forEach(function (r) {
      if (r.userData.swaySpeed) {
        r.rotation.z = r.userData.baseRotZ + Math.sin(elapsed * r.userData.swaySpeed) * 0.08;
        r.material.opacity = 0.06 + Math.sin(elapsed * r.userData.swaySpeed * 0.5) * 0.03;
      }
    });
    return;
  }

  /* — clear night: gentle twinkle — */
  if (pt === 'clearNight') {
    if (!Array.isArray(_scene.particles)) return;
    _scene.particles.forEach(function (s) {
      if (s.material && s.material.opacity !== undefined) {
        s.material.opacity = 0.5 + Math.sin(elapsed * 0.8) * 0.3;
      }
    });
  }
}


/* ·· theme switching ····································· */

function updateSceneWeather(condition) {
  if (!_scene.scene) return;

  /* particle swap */
  _createParticles(condition);

  /* fog & lighting colour palette per condition */
  var palette = {
    sunny:        { fog: 0x1a1510, amb: 0xFFE0A0, ambI: 0.8, dir: 0xFFF4D0, dirI: 1.2 },
    clearNight:   { fog: 0x020510, amb: 0x223355, ambI: 0.3, dir: 0x6688AA, dirI: 0.4 },
    partlyCloudy: { fog: 0x0a1520, amb: 0x88AACC, ambI: 0.6, dir: 0xCCDDEE, dirI: 0.7 },
    cloudy:       { fog: 0x0e1825, amb: 0x667788, ambI: 0.5, dir: 0x99AABB, dirI: 0.5 },
    rain:         { fog: 0x050d1a, amb: 0x335577, ambI: 0.5, dir: 0xAABBDD, dirI: 0.6 },
    heavyRain:    { fog: 0x030a14, amb: 0x223355, ambI: 0.4, dir: 0x778899, dirI: 0.4 },
    thunderstorm: { fog: 0x020308, amb: 0x1a1a33, ambI: 0.3, dir: 0x6655AA, dirI: 0.3 },
    drizzle:      { fog: 0x080f1c, amb: 0x446688, ambI: 0.5, dir: 0x99BBDD, dirI: 0.6 },
    fog:          { fog: 0x101820, amb: 0x778899, ambI: 0.4, dir: 0xAABBCC, dirI: 0.3 },
    haze:         { fog: 0x14181c, amb: 0x998877, ambI: 0.5, dir: 0xBBAA99, dirI: 0.4 }
  };

  var p = palette[condition] || palette.rain;

  if (_scene.scene.fog) _scene.scene.fog.color.setHex(p.fog);

  if (_scene.lights.ambient) {
    _scene.lights.ambient.color.setHex(p.amb);
    _scene.lights.ambient.intensity = p.ambI;
  }
  if (_scene.lights.directional) {
    _scene.lights.directional.color.setHex(p.dir);
    _scene.lights.directional.intensity = p.dirI;
  }

  /* globe rim colour adjustments */
  if (_scene.globe && _scene.globe.material.uniforms) {
    var rimHex = (condition === 'sunny') ? 0xFFD080 :
                 (condition === 'clearNight') ? 0x5577CC :
                 (condition === 'thunderstorm') ? 0x8855FF : 0x00D4AA;
    _scene.globe.material.uniforms.uRimColor.value.setHex(rimHex);
  }

  /* atmosphere glow colour */
  if (_scene.atmosphere && _scene.atmosphere.material.uniforms) {
    var glowHex = (condition === 'sunny') ? 0xFFCC66 :
                  (condition === 'clearNight') ? 0x4466AA :
                  (condition === 'thunderstorm') ? 0x7744DD : 0x00D4AA;
    _scene.atmosphere.material.uniforms.uGlowColor.value.setHex(glowHex);
  }
}


/* ·· resize & cleanup ···································· */

function _resizeRenderer() {
  if (!_scene.renderer) return;
  var canvas = _scene.renderer.domElement;
  var parent = canvas.parentElement || document.body;
  var w = parent.clientWidth  || window.innerWidth;
  var h = parent.clientHeight || window.innerHeight;
  _scene.renderer.setSize(w, h);
  if (_scene.camera) {
    _scene.camera.aspect = w / h;
    _scene.camera.updateProjectionMatrix();
  }
}

function _onWindowResize() { _resizeRenderer(); }

/**
 * Fully dispose the 3D scene — call when navigating away.
 */
function disposeWeatherScene() {
  _scene.disposed = true;
  if (_scene.animId) cancelAnimationFrame(_scene.animId);

  _removeParticles();

  if (_scene.scene) {
    _scene.scene.traverse(function (obj) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(function (m) { m.dispose(); });
        } else {
          obj.material.dispose();
        }
      }
    });
  }

  if (_scene.renderer) {
    _scene.renderer.dispose();
    _scene.renderer.forceContextLoss();
    _scene.renderer = null;
  }

  window.removeEventListener('resize', _onWindowResize);
  _scene.scene      = null;
  _scene.camera     = null;
  _scene.globe      = null;
  _scene.atmosphere = null;
  _scene.marker     = null;
  _scene.markerGlow = null;
  _scene.globeGroup = null;
}


/* ──────────────────────────────────────────────────────────────────────────
   §2  CHART.JS — WEATHER CHARTS
   ────────────────────────────────────────────────────────────────────────── */

var _charts = {
  temp:     null,
  rain:     null,
  humidity: null
};

/* ·· shared chart defaults ································ */

var _chartDefaults = {
  font: { family: "'Inter', 'Segoe UI', sans-serif" },
  gridColor:  'rgba(255,255,255,0.08)',
  tickColor:  'rgba(255,255,255,0.45)',
  labelColor: 'rgba(255,255,255,0.55)',
  teal:       '#00D4AA',
  tealFaded:  'rgba(0,212,170,0.15)',
  blue:       '#4FC3F7',
  blueFaded:  'rgba(79,195,247,0.12)'
};


/**
 * Build a vertical gradient for Chart.js fills.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} topColor
 * @param {string} bottomColor
 * @returns {CanvasGradient}
 */
function _chartGradient(ctx, topColor, bottomColor) {
  var g = ctx.createLinearGradient(0, 0, 0, ctx.canvas.clientHeight);
  g.addColorStop(0, topColor);
  g.addColorStop(1, bottomColor);
  return g;
}


/* ·· init all charts ······································ */

function initWeatherCharts() {
  destroyCharts();

  if (typeof MOCK_WEATHER === 'undefined') {
    console.warn('[charts] MOCK_WEATHER not defined — skipping chart init.');
    return;
  }

  _initTempChart();
  _initRainChart();
  _initHumidityChart();
}


/* ── temperature line chart ── */

function _initTempChart() {
  var canvas = document.getElementById(''); if (!canvas) return;
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var source = (typeof window !== 'undefined' && window.ACTIVE_WEATHER) || MOCK_WEATHER;
  var hourly = (source.hourly || []);
  var labels = hourly.map(function (h) {
    var d = new Date(h.time * 1000);
    var hr = d.getHours();
    if (hr === 0) return '12 AM';
    if (hr === 12) return '12 PM';
    return hr > 12 ? (hr - 12) + ' PM' : hr + ' AM';
  });
  var temps = hourly.map(function (h) { return h.temp; });

  var gradient = _chartGradient(ctx, 'rgba(0,212,170,0.35)', 'rgba(0,212,170,0.02)');

  _charts.temp = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: t ? t('temperature') || 'Temperature (°C)' : 'Temperature (°C)',
        data: temps,
        borderColor: _chartDefaults.teal,
        backgroundColor: gradient,
        borderWidth: 2.5,
        pointBackgroundColor: _chartDefaults.teal,
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 3,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4
      }]
    },
    options: _lineChartOptions('°C')
  });
}


/* ── rainfall bar chart ── */

function _initRainChart() {
  var canvas = document.getElementById(''); if (!canvas) return;
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var source = (typeof window !== 'undefined' && window.ACTIVE_WEATHER) || MOCK_WEATHER;
  var daily = (source.daily || []);
  var labels = daily.map(function (d) {
    var dt = new Date(d.date);
    var days = (typeof currentLang !== 'undefined' && currentLang === 'te')
      ? ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dt.getDay()];
  });
  var rainfall = daily.map(function (d) { return d.rain; });

  /* per-bar gradient */
  var barColors = rainfall.map(function (v) {
    var ratio = Math.min(v / 60, 1);
    var r = Math.round(30  + ratio * 15);
    var g = Math.round(130 + ratio * 60);
    var b = Math.round(210 + ratio * 40);
    return 'rgba(' + r + ',' + g + ',' + b + ',0.75)';
  });

  _charts.rain = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: t ? t('rainfall') || 'Rainfall (mm)' : 'Rainfall (mm)',
        data: rainfall,
        backgroundColor: barColors,
        borderColor: barColors.map(function (c) { return c.replace('0.75', '1'); }),
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6
      }]
    },
    options: _barChartOptions('mm')
  });
}


/* ── humidity area chart ── */

function _initHumidityChart() {
  var canvas = document.getElementById(''); if (!canvas) return;
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var source = (typeof window !== 'undefined' && window.ACTIVE_WEATHER) || MOCK_WEATHER;
  var hourly = (source.hourly || []);
  var labels = hourly.map(function (h) {
    var d = new Date(h.time * 1000);
    var hr = d.getHours();
    if (hr === 0) return '12 AM';
    if (hr === 12) return '12 PM';
    return hr > 12 ? (hr - 12) + ' PM' : hr + ' AM';
  });
  var hum = hourly.map(function (h) { return h.humidity; });

  var gradient = _chartGradient(ctx, 'rgba(79,195,247,0.35)', 'rgba(79,195,247,0.02)');

  _charts.humidity = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: t ? t('humidity') || 'Humidity (%)' : 'Humidity (%)',
        data: hum,
        borderColor: _chartDefaults.blue,
        backgroundColor: gradient,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
        pointBackgroundColor: _chartDefaults.blue,
        fill: true,
        tension: 0.35
      }]
    },
    options: _lineChartOptions('%')
  });
}


/* ── shared options builders ── */

function _lineChartOptions(unit) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10,20,40,0.9)',
        titleFont: { family: _chartDefaults.font.family, size: 13 },
        bodyFont:  { family: _chartDefaults.font.family, size: 12 },
        borderColor: 'rgba(0,212,170,0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (ctx) { return ctx.parsed.y + unit; }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: _chartDefaults.tickColor,
          font: { family: _chartDefaults.font.family, size: 11 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        },
        grid: { color: _chartDefaults.gridColor, drawBorder: false }
      },
      y: {
        ticks: {
          color: _chartDefaults.tickColor,
          font: { family: _chartDefaults.font.family, size: 11 },
          callback: function (v) { return v + unit; }
        },
        grid: { color: _chartDefaults.gridColor, drawBorder: false }
      }
    }
  };
}

function _barChartOptions(unit) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10,20,40,0.9)',
        titleFont: { family: _chartDefaults.font.family, size: 13 },
        bodyFont:  { family: _chartDefaults.font.family, size: 12 },
        borderColor: 'rgba(79,195,247,0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (ctx) { return ctx.parsed.y + ' ' + unit; }
        }
      },
      /* value labels on top of bars */
      datalabels: false   /* requires plugin; we use a custom afterDraw instead */
    },
    scales: {
      x: {
        ticks: {
          color: _chartDefaults.tickColor,
          font: { family: _chartDefaults.font.family, size: 12 }
        },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: _chartDefaults.tickColor,
          font: { family: _chartDefaults.font.family, size: 11 },
          callback: function (v) { return v + ' ' + unit; }
        },
        grid: { color: _chartDefaults.gridColor, drawBorder: false }
      }
    }
  };
}


/* ·· bar-top value labels (custom plugin, registered once) ····· */

(function _registerBarLabelPlugin() {
  if (typeof Chart === 'undefined') return;
  var plugin = {
    id: 'barValueLabels',
    afterDatasetsDraw: function (chart) {
      if (chart.config.type !== 'bar') return;
      var ctx2 = chart.ctx;
      chart.data.datasets.forEach(function (ds, dsIndex) {
        var meta = chart.getDatasetMeta(dsIndex);
        meta.data.forEach(function (bar, i) {
          var val = ds.data[i];
          if (val == null) return;
          ctx2.save();
          ctx2.fillStyle = 'rgba(255,255,255,0.7)';
          ctx2.font = '11px ' + _chartDefaults.font.family;
          ctx2.textAlign = 'center';
          ctx2.fillText(val + ' mm', bar.x, bar.y - 6);
          ctx2.restore();
        });
      });
    }
  };
  Chart.register(plugin);
})();


/* ·· destroy & update ···································· */

function destroyCharts() {
  ['temp', 'rain', 'humidity'].forEach(function (key) {
    if (_charts[key]) {
      _charts[key].destroy();
      _charts[key] = null;
    }
  });
}

/**
 * Re-build charts for a different location.
 * @param {string} locationId
 */
function updateCharts(locationId) {
  if (typeof MOCK_WEATHER_BY_LOCATION === 'undefined') return;
  var locData = MOCK_WEATHER_BY_LOCATION[locationId];
  if (!locData) return;

  if (typeof window !== 'undefined') window.ACTIVE_WEATHER = locData;
  initWeatherCharts();
}


/* ──────────────────────────────────────────────────────────────────────────
   §3  LEAFLET — WEATHER MAP
   ────────────────────────────────────────────────────────────────────────── */

var _map = {
  instance: null,
  markers: [],
  tileLayer: null,
  radarLayer: null,
  radarTimer: null
};


function initWeatherMap() {
  destroyMap();

  var container = document.getElementById('weather-map');
  if (!container) { console.warn('[map] #weather-map not found'); return; }

  /* ── create map ── */
  _map.instance = L.map('weather-map', {
    center: [18.5, 84.2],
    zoom: 9,
    zoomControl: true,
    scrollWheelZoom: true,
    attributionControl: false
  });

  /* ── dark tile layer ── */
  _map.tileLayer = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd'
    }
  ).addTo(_map.instance);

  /* ── attribution (small, unobtrusive) ── */
  L.control.attribution({ prefix: false, position: 'bottomright' })
    .addAttribution('&copy; <a href="https://carto.com/">CARTO</a>')
    .addTo(_map.instance);

  /* ── place markers ── */
  _placeMarkers();

  /* fix tile rendering after container becomes visible */
  setTimeout(function () {
    if (_map.instance) _map.instance.invalidateSize();
  }, 300);
}


/* ·· marker placement ···································· */

function _placeMarkers() {
  if (typeof LOCATIONS === 'undefined' || !_map.instance) return;

  LOCATIONS.forEach(function (loc) {
    var weather = _getLocationWeather(loc.id);
    var temp      = weather ? weather.temp      : '--';
    var condition = weather ? weather.condition  : 'rain';
    var humidity  = weather ? weather.humidity   : '--';
    var wind      = weather ? weather.wind       : '--';
    var condColor = getConditionColor(condition);

    /* custom DivIcon */
    var icon = L.divIcon({
      className: 'weather-marker',
      html: '<div class="marker-inner" style="background:' + condColor + ';">' +
              '<span class="marker-temp">' + temp + '°</span>' +
            '</div>',
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -28]
    });

    var marker = L.marker([loc.lat, loc.lon], { icon: icon }).addTo(_map.instance);

    /* popup */
    marker.bindPopup(_buildPopup(loc, weather));

    /* click → select location */
    marker.on('click', (function (locId) {
      return function () {
        if (typeof currentLocation !== 'undefined') {
          window.currentLocation = locId;
        }
        /* Dispatch a custom event so other parts of the app can react */
        window.dispatchEvent(new CustomEvent('locationChange', { detail: { id: locId } }));
      };
    })(loc.id));

    _map.markers.push({ leaflet: marker, locId: loc.id });
  });
}


function _buildPopup(loc, weather) {
  var lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';
  var name = loc.name && typeof loc.name === 'object' ? loc.name[lang] : (lang === 'te' ? (loc.nameTe || loc.name) : loc.name);
  var temp      = weather ? weather.temp      : '--';
  var condition = weather ? weather.condition  : '--';
  var humidity  = weather ? weather.humidity   : '--';
  var wind      = weather ? weather.wind       : '--';

  var condLabel = t ? (t(condition) || condition) : condition;

  return '<div class="map-popup">' +
           '<h4 class="popup-title">' + name + '</h4>' +
           '<div class="popup-temp">' + temp + '°C</div>' +
           '<div class="popup-detail">' + condLabel + '</div>' +
           '<div class="popup-row">' +
             '<span>💧 ' + humidity + '%</span>' +
             '<span>🌬 ' + wind + ' km/h</span>' +
           '</div>' +
         '</div>';
}


/**
 * Look up current weather for a location from MOCK_WEATHER_BY_LOCATION.
 * Falls back to MOCK_WEATHER for the default/current location.
 */
function _getLocationWeather(locId) {
  var data = typeof MOCK_WEATHER_BY_LOCATION !== 'undefined' && MOCK_WEATHER_BY_LOCATION[locId] ? MOCK_WEATHER_BY_LOCATION[locId] : (typeof MOCK_WEATHER !== 'undefined' ? MOCK_WEATHER : null);
  if (!data) return null;
  var current = data.current || data;
  return {
    temp: Math.round(current.main && current.main.temp || 0), condition: current.condition || 'cloudy',
    humidity: current.main && current.main.humidity || 0, wind: current.wind && current.wind.speed || 0
  };
}

/** Add a subtle animated RainViewer radar overlay when its free data is available. */
function setRainRadar(radar) {
  if (!_map.instance || !radar || !radar.radar) return;
  if (_map.radarTimer) { clearInterval(_map.radarTimer); _map.radarTimer = null; }
  if (_map.radarLayer) { _map.instance.removeLayer(_map.radarLayer); _map.radarLayer = null; }
  var frames = (radar.radar.past || []).slice(-3).concat((radar.radar.nowcast || []).slice(0, 3));
  if (!frames.length) return;
  var host = radar.host || 'https://tilecache.rainviewer.com';
  var index = 0;
  function showFrame() {
    if (_map.radarLayer) _map.instance.removeLayer(_map.radarLayer);
    var path = frames[index].path;
    _map.radarLayer = L.tileLayer(host + path + '/256/{z}/{x}/{y}/2/1_1.png', { opacity: 0.5, zIndex: 10, attribution: 'RainViewer' }).addTo(_map.instance);
    index = (index + 1) % frames.length;
  }
  showFrame();
  _map.radarTimer = setInterval(showFrame, 1200);
}


/* ·· language & cleanup ·································· */

function updateMapLanguage() {
  if (!_map.instance || typeof LOCATIONS === 'undefined') return;

  _map.markers.forEach(function (entry) {
    var loc = LOCATIONS.find(function (l) { return l.id === entry.locId; });
    if (!loc) return;
    var weather = _getLocationWeather(loc.id);
    entry.leaflet.setPopupContent(_buildPopup(loc, weather));
  });
}

/**
 * Refresh marker icons and popups (e.g. after data update).
 */
function refreshMapMarkers() {
  if (!_map.instance) return;
  /* remove old markers */
  _map.markers.forEach(function (entry) {
    _map.instance.removeLayer(entry.leaflet);
  });
  _map.markers = [];
  _placeMarkers();
}

function destroyMap() {
  if (_map.radarTimer) clearInterval(_map.radarTimer);
  if (_map.instance) {
    _map.instance.remove();
    _map.instance  = null;
    _map.markers   = [];
    _map.tileLayer = null;
    _map.radarLayer = null;
    _map.radarTimer = null;
  }
}


/* ──────────────────────────────────────────────────────────────────────────
   §4  INITIALIZATION ORCHESTRATOR
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Master init — call when the weather page/section is ready.
 * Safe to call multiple times; idempotent.
 */
function initAllVisuals() {
  initWeatherScene();
  initWeatherCharts();
  initWeatherMap();
  if (typeof window !== 'undefined' && window.WeatherClient && typeof currentLocation !== 'undefined') {
    var live = window.WeatherClient.current(currentLocation);
    if (live && live.radar) setRainRadar(live.radar);
  }
}

/**
 * Master teardown — call when navigating away from the weather page.
 */
function destroyAllVisuals() {
  disposeWeatherScene();
  destroyCharts();
  destroyMap();
}


/* ──────────────────────────────────────────────────────────────────────────
   §5  CSS INJECTION — Marker & Popup Styles (scoped to weather-marker)
   ────────────────────────────────────────────────────────────────────────── */

(function _injectMarkerCSS() {
  if (document.getElementById('weather-marker-css')) return;
  var style = document.createElement('style');
  style.id = 'weather-marker-css';
  style.textContent = [
    /* marker circle */
    '.weather-marker { background: none !important; border: none !important; }',
    '.marker-inner {',
    '  width: 44px; height: 44px; border-radius: 50%;',
    '  display: flex; align-items: center; justify-content: center;',
    '  color: #fff; font-weight: 700; font-size: 13px;',
    '  font-family: "Inter", sans-serif;',
    '  box-shadow: 0 0 12px rgba(0,0,0,0.5), inset 0 0 6px rgba(255,255,255,0.12);',
    '  border: 2px solid rgba(255,255,255,0.25);',
    '  transition: transform 0.2s ease, box-shadow 0.2s ease;',
    '  cursor: pointer;',
    '}',
    '.marker-inner:hover {',
    '  transform: scale(1.18);',
    '  box-shadow: 0 0 20px rgba(0,212,170,0.6), inset 0 0 8px rgba(255,255,255,0.2);',
    '}',
    '.marker-temp { text-shadow: 0 1px 3px rgba(0,0,0,0.5); }',

    /* popup */
    '.leaflet-popup-content-wrapper {',
    '  background: rgba(10,20,40,0.92) !important;',
    '  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);',
    '  border: 1px solid rgba(0,212,170,0.2);',
    '  border-radius: 14px !important;',
    '  color: #fff;',
    '  font-family: "Inter", sans-serif;',
    '  box-shadow: 0 8px 32px rgba(0,0,0,0.4);',
    '}',
    '.leaflet-popup-tip { background: rgba(10,20,40,0.92) !important; }',
    '.map-popup { padding: 4px 2px; min-width: 140px; }',
    '.popup-title { margin: 0 0 4px; font-size: 14px; color: #00D4AA; }',
    '.popup-temp  { font-size: 24px; font-weight: 700; margin-bottom: 2px; }',
    '.popup-detail { font-size: 12px; opacity: 0.7; margin-bottom: 6px; text-transform: capitalize; }',
    '.popup-row { display: flex; gap: 12px; font-size: 12px; opacity: 0.8; }',
    '.popup-row span { white-space: nowrap; }'
  ].join('\n');
  document.head.appendChild(style);
})();


/* ══════════════════════════════════════════════════════════════════════════
   END  scene.js
   ══════════════════════════════════════════════════════════════════════════ */
