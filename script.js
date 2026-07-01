/* =========================================================
   Horizontal scroll portfolio
   Lenis (smooth wheel) + GSAP ScrollTrigger (pin & translate)
   ========================================================= */

document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile     = window.matchMedia('(max-width: 1024px)').matches;
const projectReturnParams = new URLSearchParams(location.search);
const PROJECT_RETURN_ORIGIN_KEY = 'portfolioProjectReturnOrigin';
const INDEX_RELOAD_SCROLL_KEY = 'portfolioIndexReloadScrollY';
const INDEX_RELOAD_PATH_KEY = 'portfolioIndexReloadPath';
const INDEX_RELOAD_CURSOR_KEY = 'portfolioIndexReloadCursor';
let lastKnownCursorForReload = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  live: false,
};

const rememberCursorForReload = (event) => {
  if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
  lastKnownCursorForReload = { x: event.clientX, y: event.clientY, live: true };
};
document.addEventListener('pointermove', rememberCursorForReload, { passive: true });
document.addEventListener('mousemove', rememberCursorForReload, { passive: true });

const getReloadLoaderCursorTarget = () => {
  if (isProjectReturnToWorks || initialSectionHash || !isReloadNavigation()) return null;
  try {
    if (sessionStorage.getItem(INDEX_RELOAD_PATH_KEY) !== location.pathname) return null;
    const reloadY = Number(sessionStorage.getItem(INDEX_RELOAD_SCROLL_KEY));
    if (!Number.isFinite(reloadY) || reloadY < window.innerHeight * 5.2) return null;

    const raw = sessionStorage.getItem(INDEX_RELOAD_CURSOR_KEY);
    const stored = raw ? JSON.parse(raw) : null;
    const liveX = lastKnownCursorForReload.live ? lastKnownCursorForReload.x : NaN;
    const liveY = lastKnownCursorForReload.live ? lastKnownCursorForReload.y : NaN;
    const x = Number.isFinite(liveX) ? liveX : Number.isFinite(stored?.xPct)
      ? stored.xPct * window.innerWidth
      : Number(stored?.x);
    const y = Number.isFinite(liveY) ? liveY : Number.isFinite(stored?.yPct)
      ? stored.yPct * window.innerHeight
      : Number(stored?.y);
    return {
      x: Number.isFinite(x) ? x : window.innerWidth / 2,
      y: Number.isFinite(y) ? y : window.innerHeight / 2,
      r: Number.isFinite(stored?.r) ? stored.r : 22,
    };
  } catch (_) {
    return null;
  }
};
let storedProjectReturn = false;
try {
  storedProjectReturn = sessionStorage.getItem('portfolioProjectReturn') === '1';
} catch (_) {}
let referrerProjectReturn = false;
try {
  const referrer = new URL(document.referrer);
  referrerProjectReturn = referrer.origin === location.origin && /\/project-(ryujin|odidact|3|tasty)\.html$/i.test(referrer.pathname);
} catch (_) {}
const isProjectReturnToWorks = projectReturnParams.get('return') === 'project' || storedProjectReturn || (location.hash === '#works' && referrerProjectReturn);
if (isProjectReturnToWorks) {
  document.documentElement.classList.add('from-project-return');
  document.body.classList.add('is-project-return');
}

// Own the scroll position ourselves. With 'auto', a refresh inside the pinned
// hero restored a stale offset that the ScrollTrigger pins couldn't map back
// (jumping to section 2 on mobile), and the native #works anchor jump landed
// inside the horizontal pin and corrupted it. We reposition explicitly after
// the loader, in applyInitialScroll().
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
// Capture any incoming section hash (e.g. project page → index.html#works) and
// strip it so the browser does NOT do its own broken anchor jump; we resolve it
// to a real scroll position once the ScrollTriggers exist.
const initialSectionHash = isProjectReturnToWorks ? '#works' : location.hash;
if (initialSectionHash) {
  try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {}
}

// Per-frame / per-mousemove logging is off by default. Toggle to true while debugging.
const DEBUG = false;
const debugLog = (...args) => console.debug(...args);

const installConsoleSignature = () => {
  if (window.__hatemConsoleSignature) return;
  window.__hatemConsoleSignature = true;

  const ink = '#080807';
  const mist = '#8f8a7d';
  const serif = 'Georgia, "Times New Roman", serif';
  const sans = 'Inter, Arial, sans-serif';
  const titleStyle = `color:inherit;font:600 20px/1.3 ${serif};letter-spacing:.01em;`;
  const dotStyle = `color:${ink};font:900 42px/1 ${serif};`;
  const labelStyle = `color:${mist};font:700 11px/1.75 ${sans};letter-spacing:.18em;text-transform:uppercase;`;
  const noteStyle = `color:${mist};font:12px/1.75 ${sans};letter-spacing:.03em;`;
  const urlFor = (path) => new URL(path, window.location.href).href;
  const workIndex = [
    { id: '001', project: 'Ryujin', kind: 'Luxury e-commerce', command: 'hatem.go("ryujin")', route: urlFor('project-ryujin.html') },
    { id: '002', project: 'Odidact', kind: 'Product platform', command: 'hatem.go("odidact")', route: urlFor('project-odidact.html') },
    { id: '003', project: 'Fitness', kind: 'Mobile app case study', command: 'hatem.go("fitness")', route: urlFor('project-3.html') },
    { id: '004', project: 'Tasty', kind: 'E-commerce case study', command: 'hatem.go("tasty")', route: urlFor('project-tasty.html') },
  ];
  const routeMap = {
    home: 'index.html',
    works: 'index.html#works',
    contact: 'index.html#contact',
    ryujin: 'project-ryujin.html',
    odidact: 'project-odidact.html',
    fitness: 'project-3.html',
    tasty: 'project-tasty.html',
  };

  const printCard = () => {
    console.log(
      [
        '%c●%c Hatem Dahech',
        '%cUX/UI DESIGN + FRONT-END',
        '',
        'black sphere / white room / selected work',
        'Tunis, TN / available Q3',
        '',
        '%cCOMMANDS',
        '  hatem.work()       case-study index',
        '  hatem.contact()    direct links',
        '  hatem.about()      site note',
        '  hatem.go("works")  jump through the room',
      ].join('\n'),
      dotStyle,
      titleStyle,
      labelStyle,
      labelStyle
    );
    return 'Hidden room open: hatem.work(), hatem.contact(), hatem.about(), hatem.go("works").';
  };

  const hatem = () => printCard();
  hatem.work = () => {
    console.table(workIndex.map(({ id, project, kind, command }) => ({ id, project, kind, command })));
    console.log('%cUse hatem.go("ryujin"), hatem.go("odidact"), hatem.go("fitness"), or hatem.go("tasty").', `color:${mist};font:12px/1.6 ${sans};`);
    return workIndex;
  };
  hatem.contact = () => {
    const contact = {
      email: 'hatemdahech1@gmail.com',
      behance: 'https://www.behance.net/hatemdahech',
      linkedin: 'https://www.linkedin.com/in/hatemdahech/',
      github: 'https://github.com/htom666',
    };
    console.log('%cCONTACT', labelStyle);
    console.table(contact);
    return contact;
  };
  hatem.about = () => {
    console.log('%cThis site is built around one black sphere. Scroll is the camera. The work is the proof.', `color:inherit;font:italic 18px/1.5 ${serif};`);
    console.log('%cDesign direction: editorial, monochrome, physical motion, no decoration without consequence.', noteStyle);
    return 'One sphere, four case studies, no template.';
  };
  hatem.go = (target = 'home') => {
    const key = String(target).toLowerCase();
    const route = routeMap[key];
    if (!route) {
      console.warn(`Unknown room: ${target}. Try home, works, contact, ryujin, odidact, fitness, tasty.`);
      return null;
    }
    window.location.href = urlFor(route);
    return `Opening ${key}.`;
  };
  Object.defineProperty(hatem, 'rooms', {
    value: Object.freeze(Object.keys(routeMap)),
    enumerable: true,
  });

  window.hatem = hatem;

  console.groupCollapsed(
    '%c●%c Hatem Dahech %c/ console room',
    `color:${ink};font:900 34px/1 ${serif};`,
    `color:inherit;font:600 18px/1.2 ${serif};`,
    `color:${mist};font:500 11px/1.2 ${sans};letter-spacing:.16em;text-transform:uppercase;`
  );
  console.log('%cThe portfolio has a hidden room. Type %chatem()%c.', noteStyle, `color:inherit;font:700 13px/1.7 ${sans};`, noteStyle);
  console.log('%cCommands:%c hatem.work()  hatem.contact()  hatem.about()  hatem.go("works")', labelStyle, noteStyle);
  console.groupEnd();
};
installConsoleSignature();

const cursorStateClasses = [
  'cursor-state-default',
  'cursor-state-transition',
  'cursor-state-work',
  'cursor-state-contact',
];
let currentCursorState = '';
const setCursorState = (state = 'default') => {
  if (currentCursorState === state) return;
  currentCursorState = state;
  cursorStateClasses.forEach((className) => document.body.classList.remove(className));
  document.body.classList.add(`cursor-state-${state}`);
  if (DEBUG) {
    const cursorRect = document.querySelector('.cursor')?.getBoundingClientRect();
    DEBUG && debugLog('[CURSOR] state', state, {
      activeController: state === 'transition' ? 'transition-mask' : 'cursor-dot',
      size: cursorRect ? Math.round(Math.max(cursorRect.width, cursorRect.height)) : null,
    });
  }
  window.dispatchEvent(new CustomEvent('cursorstatechange', { detail: { state } }));
};
setCursorState('default');

/* ---------- Section 2 word morphs ---------- */
class WordStage {
  constructor(root) {
    this.root = root;
    this.wrap = root.querySelector('.canvas-wrap');
    this.mode = root.dataset.mode || 'blueprint';
    this.modelVersion = root.dataset.modelVersion || `dev-${Date.now()}`;
    this.modelUrl = root.dataset.model || 'public/models/face/face.glb';
    this.mouse = { x: 0, y: 0 };
    this.progress = 0;
    this.time = 0;
    this.hovered = false;
    this.userHovering = false;
    this.running = false;

    this.canvas = document.createElement('canvas');
    this.wrap.appendChild(this.canvas);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 1000);
    // About models (blueprint/structure/depth) sit further back so the model has
    // breathing room in frame — it rotates/floats with the cursor and was being
    // clipped at the canvas edge when filling the frame. perception/space (bridge)
    // are framed tighter on purpose and stay as they were.
    this.camera.position.z =
      this.mode === 'perception' ? 90 :
      this.mode === 'space' ? 128 :
      150;

    this.root3d = new THREE.Group();
    this.root3d.position.set(0, 0, 0);
    this.scene.add(this.root3d);
    this.core = new THREE.Group();
    this.root3d.add(this.core);

    this.edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xf3ead8,
      transparent: true,
      opacity: 0.74,
    });
    this.secondaryMaterial = new THREE.LineBasicMaterial({
      color: 0xf3ead8,
      transparent: true,
      opacity: 0.36,
    });
    this.faintMaterial = new THREE.LineBasicMaterial({
      color: 0xf3ead8,
      transparent: true,
      opacity: 0.16,
    });

    this.build();
    this.resize();

    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(this.wrap);

    this.root.addEventListener('mouseenter', () => { this.userHovering = true; this.enter(); });
    this.root.addEventListener('mousemove', (event) => this.move(event));
    this.root.addEventListener('mouseleave', () => { this.userHovering = false; this.leave(); });
    // Touch has no hover, so tap to reveal for a beat — lets phone users explore.
    this.root.addEventListener('pointerup', (event) => {
      if (event.pointerType === 'touch') this.peek(2800);
    });
  }

  line(points, material = this.edgeMaterial, parent = this.core) {
    const geometry = new THREE.BufferGeometry().setFromPoints(
      points.map(([x, y, z = 0]) => new THREE.Vector3(x, y, z)),
    );
    const object = new THREE.Line(geometry, material);
    parent.add(object);
    return object;
  }

  segment(a, b, material = this.edgeMaterial, parent = this.core) {
    return this.line([a, b], material, parent);
  }

  roundedRect(x, y, w, h, r = 8, z = 0, material = this.edgeMaterial, parent = this.core) {
    const shape = new THREE.Shape();
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    const points = shape.getPoints(8).map((point) => [point.x, point.y, z]);
    points.push(points[0]);
    return this.line(points, material, parent);
  }

  roundedRectLine(...args) {
    return this.roundedRect(...args);
  }

  circle(cx, cy, radius, z = 0, material = this.secondaryMaterial, parent = this.core) {
    const points = [];
    for (let i = 0; i <= 64; i += 1) {
      const a = (i / 64) * Math.PI * 2;
      points.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, z]);
    }
    return this.line(points, material, parent);
  }

  slabMesh(width, height, depth, materialOpacity = 0.055) {
    return new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshBasicMaterial({
        color: 0xf3ead8,
        transparent: true,
        opacity: materialOpacity,
        depthWrite: false,
      }),
    );
  }

  slabEdges(width, height, depth, material = this.edgeMaterial) {
    const geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(width, height, depth));
    return new THREE.LineSegments(geometry, material);
  }

  addSlab({ width, height, depth, x = 0, y = 0, z = 0, opacity = 0.055, material = this.edgeMaterial }) {
    const group = new THREE.Group();
    const mesh = this.slabMesh(width, height, depth, opacity);
    const edges = this.slabEdges(width, height, depth, material);
    group.add(mesh);
    group.add(edges);
    group.position.set(x, y, z);
    this.core.add(group);
    return group;
  }

  makeBlueprint() {
    this.core.scale.set(1.35, 1.35, 1);
    this.core.rotation.set(-0.10, -0.15, -0.04);
    this.roundedRect(-58, -22, 116, 44, 7, 0, this.edgeMaterial);
    this.roundedRect(-48, -14, 40, 24, 4, 1, this.secondaryMaterial);
    this.roundedRect(2, -14, 48, 10, 3, 1, this.secondaryMaterial);
    this.roundedRect(2, 3, 28, 9, 3, 1, this.faintMaterial);
    this.segment([-38, -22, 1], [-38, 22, 1], this.secondaryMaterial);
    this.segment([-8, -22, 1], [-8, 22, 1], this.faintMaterial);
    this.segment([32, -22, 1], [32, 22, 1], this.faintMaterial);
    this.segment([-58, -2, 1], [58, -2, 1], this.secondaryMaterial);
    this.circle(45, 13, 4, 2, this.edgeMaterial);
    this.circle(-51, 15, 3, 2, this.secondaryMaterial);
  }

  makeStructure() {
    this.core.scale.set(1.12, 1.12, 1.12);
    this.core.rotation.set(-0.18, -0.36, -0.06);
    const back = this.addSlab({ width: 98, height: 32, depth: 8, x: 12, y: -8, z: -18, opacity: 0.035, material: this.faintMaterial });
    const mid = this.addSlab({ width: 100, height: 34, depth: 10, x: 4, y: -2, z: -4, opacity: 0.045, material: this.secondaryMaterial });
    const front = this.addSlab({ width: 102, height: 36, depth: 12, x: -6, y: 4, z: 10, opacity: 0.055, material: this.edgeMaterial });
    this.segment([-56, -8, 18], [44, -8, 18], this.secondaryMaterial);
    this.segment([-46, 6, 18], [34, 6, 18], this.secondaryMaterial);
    this.segment([-23, -14, 18], [-23, 18, 18], this.faintMaterial);
    this.segment([12, -14, 18], [12, 18, 18], this.faintMaterial);
    this.layers = [back, mid, front];
  }

  makeDepth() {
    this.core.scale.set(0.72, 0.72, 0.72);
    this.core.rotation.set(-0.12, -0.24, -0.03);
    this.depthOrbit = new THREE.Group();
    this.core.add(this.depthOrbit);
    const frames = [
      { w: 86, h: 44, z: 26, m: this.edgeMaterial },
      { w: 60, h: 31, z: -8, m: this.secondaryMaterial },
      { w: 34, h: 18, z: -42, m: this.faintMaterial },
    ];
    frames.forEach(({ w, h, z, m }) => {
      this.roundedRect(-w / 2, -h / 2, w, h, 5, z, m, this.depthOrbit);
    });
    this.segment([-43, -22, 26], [-30, -15.5, -8], this.secondaryMaterial, this.depthOrbit);
    this.segment([43, -22, 26], [30, -15.5, -8], this.secondaryMaterial, this.depthOrbit);
    this.segment([43, 22, 26], [30, 15.5, -8], this.secondaryMaterial, this.depthOrbit);
    this.segment([-43, 22, 26], [-30, 15.5, -8], this.secondaryMaterial, this.depthOrbit);
    this.segment([-30, -15.5, -8], [-17, -9, -42], this.faintMaterial, this.depthOrbit);
    this.segment([30, -15.5, -8], [17, -9, -42], this.faintMaterial, this.depthOrbit);
    this.segment([30, 15.5, -8], [17, 9, -42], this.faintMaterial, this.depthOrbit);
    this.segment([-30, 15.5, -8], [-17, 9, -42], this.faintMaterial, this.depthOrbit);
  }

  makePerception() {
    this.core.scale.set(1.08, 1.08, 1.08);
    this.core.rotation.set(-0.08, -0.18, 0.02);
    this.perceptionModel = new THREE.Group();
    this.core.add(this.perceptionModel);

    if (!THREE.GLTFLoader) {
      console.warn('[WORD MORPH] GLTFLoader is not available for Perception.');
      return;
    }

    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => {
      if (/^(blob:|data:)/.test(url)) return url;
      const joiner = url.includes('?') ? '&' : '?';
      return `${url}${joiner}v=${encodeURIComponent(this.modelVersion)}`;
    });

    // Lighting — Lambert needs lights to render anything but black.
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    const hemi    = new THREE.HemisphereLight(0xfff5e0, 0x1a1a1a, 0.55);
    const key     = new THREE.DirectionalLight(0xffffff, 0.95);
    key.position.set(2, 3, 4);
    const fill    = new THREE.DirectionalLight(0xfff0d8, 0.35);
    fill.position.set(-3, 1, 2);
    this.perceptionModel.add(ambient, hemi, key, fill);

    const loader = new THREE.GLTFLoader(manager);
    const modelUrl = `${this.modelUrl}${this.modelUrl.includes('?') ? '&' : '?'}v=${encodeURIComponent(this.modelVersion)}`;
    loader.load(
      modelUrl,
      (gltf) => {
        const root = new THREE.Group();
        gltf.scene.updateMatrixWorld(true);

        // Solid fill — readable face form. Cream Lambert for soft shading
        // against the dark page background.
        const fillMat = new THREE.MeshLambertMaterial({
          color: 0xf1e8dc,
          transparent: true,
          opacity: 0.92,
          side: THREE.DoubleSide,
          depthWrite: true,
        });
        // Wireframe overlay — denser than before (1° threshold = effectively
        // every triangle edge). Faint cream lines layered on top of the fill.
        const wireMat = new THREE.LineBasicMaterial({
          color: 0xfff5e0,
          transparent: true,
          opacity: 0.18,
          depthWrite: false,
        });

        let meshCount = 0;
        const matNames = [];
        gltf.scene.traverse((child) => {
          if (!child.isMesh || !child.geometry) return;
          meshCount += 1;
          if (child.material) matNames.push(child.material.name || child.material.type || 'unnamed');

          // Bake current transform into geometry so we can drop a fresh mesh
          // into our own root with predictable space.
          const geom = child.geometry.clone();
          geom.applyMatrix4(child.matrixWorld);
          if (!geom.attributes.normal) geom.computeVertexNormals();

          const fillMesh = new THREE.Mesh(geom, fillMat);
          fillMesh.frustumCulled = false;
          root.add(fillMesh);

          const edges = new THREE.EdgesGeometry(geom, 1);
          const lines = new THREE.LineSegments(edges, wireMat);
          lines.frustumCulled = false;
          root.add(lines);
        });

        DEBUG && debugLog('[PERCEPTION MODEL] loaded');
        DEBUG && debugLog('[PERCEPTION MODEL] mesh count', meshCount);
        DEBUG && debugLog('[PERCEPTION MODEL] materials', matNames);

        if (!root.children.length) {
          console.warn('[PERCEPTION MODEL] no mesh geometry in GLTF — nothing to render.');
          return;
        }

        // Auto-center and auto-scale to a known viewport size.
        const box = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        DEBUG && debugLog('[PERCEPTION MODEL] bbox size', { x: size.x, y: size.y, z: size.z });
        DEBUG && debugLog('[PERCEPTION MODEL] bbox center', { x: center.x, y: center.y, z: center.z });

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const TARGET = 60; // world units that fit comfortably in the canvas
        const scale = TARGET / maxDim;
        DEBUG && debugLog('[PERCEPTION MODEL] applied scale', scale);

        // Apply scale first, then translate by -center * scale so the
        // geometric center lands at world origin. (Group.scale doesn't scale
        // its own position — only its children — so the offset must be
        // pre-multiplied by scale to land correctly.)
        root.scale.setScalar(scale);
        root.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

        // Visual offset — face models bias high because the cranium dominates
        // the bbox top. Nudge the whole root down a hair so eyes/nose land
        // closer to the canvas vertical center. Anchored to TARGET so it
        // doesn't drift when models change.
        const VERTICAL_OFFSET = -TARGET * 0.08; // ≈ -4.8 world units
        root.position.y += VERTICAL_OFFSET;
        DEBUG && debugLog('[PERCEPTION MODEL] vertical offset', VERTICAL_OFFSET);

        root.rotation.set(-0.05, 0, 0); // slight downward tilt so eyes are visible

        // Camera fit: distance to comfortably frame the largest dimension at
        // the perspective FOV (34°). With a tilt we keep some headroom.
        const fovRad = THREE.MathUtils.degToRad(this.camera.fov);
        const distance = (TARGET / 2) / Math.tan(fovRad / 2) * 1.6;
        this.camera.position.set(0, 0, distance);
        this.camera.near = Math.max(0.1, distance / 100);
        this.camera.far  = distance * 100;
        this.camera.lookAt(0, 0, 0);
        this.camera.updateProjectionMatrix();
        DEBUG && debugLog('[PERCEPTION MODEL] camera z', distance);

        this.perceptionModel.add(root);
        this.model = root;
        this.render();
      },
      undefined,
      (error) => {
        console.error('[PERCEPTION MODEL] GLTF load failed', error);
      },
    );
  }

  makeSpace() {
    this.core.scale.set(1, 1, 1);
    this.core.rotation.set(0, 0, 0);
    this.spaceRoom = new THREE.Group();
    this.core.add(this.spaceRoom);

    // An infinite one-point-perspective corridor — "the geometry of space": a
    // stream of nested wireframe frames converging to a vanishing point that you
    // slowly fly through (presence + the geometry of perceived space, per the
    // sentence). Framed on the z-axis, centred with margin in the 2.18:1 reveal.
    this.camera.fov = 34;
    this.camera.position.set(0, 0, 150);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();

    const hw = 46;
    const hh = 21;
    this.corridorN = 8;
    this.corridorDz = 34;
    this.corridorStartZ = 44;
    this.corridorFlow = 0;
    this.corridorFrames = [];

    // Each frame is a unit rectangle; its z (and opacity) are animated in tick().
    const rectPositions = () => {
      const c = [[-hw, -hh, 0], [hw, -hh, 0], [hw, hh, 0], [-hw, hh, 0]];
      const p = [];
      for (let k = 0; k < 4; k += 1) {
        const a = c[k];
        const b = c[(k + 1) % 4];
        p.push(a[0], a[1], a[2], b[0], b[1], b[2]);
      }
      return p;
    };
    for (let i = 0; i < this.corridorN; i += 1) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(rectPositions(), 3));
      const mesh = new THREE.LineSegments(g, new THREE.LineBasicMaterial({
        color: 0xf1e8dc, transparent: true, opacity: 0.5, depthWrite: false,
      }));
      mesh.position.z = this.corridorStartZ - i * this.corridorDz;
      this.spaceRoom.add(mesh);
      this.corridorFrames.push(mesh);
    }

    // Four faint corner rails spanning the corridor, giving it solid walls.
    const zc = this.corridorStartZ;
    const zf = this.corridorStartZ - (this.corridorN - 1) * this.corridorDz;
    const seg = (a, b, mat) => this.segment(a, b, mat, this.spaceRoom);
    seg([-hw, -hh, zc], [-hw, -hh, zf], this.faintMaterial);
    seg([hw, -hh, zc], [hw, -hh, zf], this.faintMaterial);
    seg([hw, hh, zc], [hw, hh, zf], this.faintMaterial);
    seg([-hw, hh, zc], [-hw, hh, zf], this.faintMaterial);
  }

  build() {
    if (this.mode === 'perception') this.makePerception();
    else if (this.mode === 'space') this.makeSpace();
    else if (this.mode === 'structure') this.makeStructure();
    else if (this.mode === 'depth') this.makeDepth();
    else this.makeBlueprint();
  }

  enter() {
    this.hovered = true;
    this.root.classList.add('is-hovered');
    this.start();
  }

  move(event) {
    const rect = this.root.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    this.mouse.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    if (this.hovered) this.start();
  }

  leave() {
    this.hovered = false;
    this.root.classList.remove('is-hovered');
    this.mouse.x = 0;
    this.mouse.y = 0;
    this.start();
  }

  // Auto-reveal for `hold` ms then fall back, unless the user is genuinely
  // hovering/holding it. Used for the one-time scroll-in "show off".
  peek(hold = 1300) {
    if (this.hovered) return;
    this.enter();
    clearTimeout(this._peekTimer);
    this._peekTimer = setTimeout(() => {
      if (!this.userHovering) this.leave();
    }, hold);
  }

  start() {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame(() => this.tick());
  }

  resize() {
    const rect = this.wrap.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.root3d.position.set(0, 0, 0);
    this.render();
  }

  tick() {
    this.time += 0.016;
    this.progress += ((this.hovered ? 1 : 0) - this.progress) * 0.085;
    const float = Math.sin(this.time * 1.6) * 1.3;
    this.root3d.position.set(0, float * this.progress, 0);
    this.root3d.rotation.x += (((-this.mouse.y * 0.18) - this.root3d.rotation.x) * 0.08);
    this.root3d.rotation.y += (((this.mouse.x * 0.28) - this.root3d.rotation.y) * 0.08);
    this.root3d.rotation.z = Math.sin(this.time * 0.9) * 0.025 * this.progress;
    const pulse = 1 + Math.sin(this.time * 2.2) * 0.025 * this.progress;
    this.core.scale.multiplyScalar(pulse / (this.lastPulse || 1));
    this.lastPulse = pulse;

    if (this.mode === 'depth' && this.depthOrbit) {
      this.depthOrbit.rotation.z = Math.sin(this.time * 0.8) * 0.045 * this.progress;
      this.depthOrbit.position.z = Math.sin(this.time * 1.1) * 3.5 * this.progress;
    }

    if (this.mode === 'structure' && this.layers) {
      this.layers.forEach((layer, index) => {
        layer.position.z += (([-20, -5, 12][index] + Math.sin(this.time + index) * 1.2 * this.progress) - layer.position.z) * 0.08;
      });
    }

    if (this.mode === 'perception' && this.model) {
      const baseRotation = 0.7;
      this.model.rotation.y = baseRotation + this.mouse.x * 0.35 + Math.sin(this.time * 0.7) * 0.04 * this.progress;
      this.model.rotation.x = this.mouse.y * 0.18 + Math.sin(this.time * 0.6) * 0.025 * this.progress;
    }

    if (this.mode === 'space' && this.corridorFrames) {
      // Fly forward through the corridor: frames stream toward the camera and
      // recycle at the vanishing point. Only advances while revealed.
      this.corridorFlow += 0.02 * this.progress;
      const N = this.corridorN;
      const dz = this.corridorDz;
      const sz = this.corridorStartZ;
      for (let i = 0; i < N; i += 1) {
        const m = (((i - this.corridorFlow) % N) + N) % N; // 0 (near/exit) .. N-1 (far/birth)
        const frame = this.corridorFrames[i];
        frame.position.z = sz - m * dz;
        // Fade in at the far throat and out as it passes the camera, so the
        // recycle jump is invisible; brightest through the middle of the run.
        const edge = Math.min(m, (N - 1) - m);
        frame.material.opacity = Math.max(0.05, Math.min(0.62, edge / 2.3));
      }
      // Gentle idle sway; cursor "look around" parallax comes from root3d above.
      this.spaceRoom.rotation.y = Math.sin(this.time * 0.3) * 0.04 * this.progress;
    }

    this.render();

    const settled = this.progress < 0.002 &&
      Math.abs(this.root3d.rotation.x) < 0.002 &&
      Math.abs(this.root3d.rotation.y) < 0.002;

    if (this.hovered || !settled) {
      requestAnimationFrame(() => this.tick());
      return;
    }

    this.running = false;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

if (!reduceMotion && window.THREE) {
  document.querySelectorAll('.word-morph').forEach((word) => {
    word._wordStage = new WordStage(word);
  });
}

/* ---------- 0. Loader intro: black screen shrinks to the real hero circle ---------- */
const loaderDone = new Promise((resolve) => {
  const loader = document.getElementById('loader');
  if (isProjectReturnToWorks) {
    if (loader) {
      const countEl = loader.querySelector('.loader__count');
      if (countEl) countEl.style.display = 'none';
      const origin = getProjectReturnOriginForHome();
      const coverR = getProjectReturnCoverRadius(origin.x, origin.y);
      const coverCircle = `circle(${coverR}px at ${origin.x}px ${origin.y}px)`;
      if (window.gsap) {
        gsap.set(loader, {
          autoAlpha: 1,
          pointerEvents: 'auto',
          clipPath: coverCircle,
          webkitClipPath: coverCircle,
        });
      } else {
        loader.style.clipPath = coverCircle;
        loader.style.webkitClipPath = coverCircle;
        loader.style.pointerEvents = 'auto';
      }
    }
    document.body.classList.remove('is-loading');
    return resolve();
  }
  if (!loader || reduceMotion || !window.gsap) {
    if (loader) loader.remove();
    document.body.classList.remove('is-loading');
    return resolve();
  }

  const countEl = loader.querySelector('.loader__count');
  const pct     = loader.querySelector('#loader-pct');
  const heroSphere = document.getElementById('hero-sphere-wrap');
  let resolved = false;

  const resolveLoader = () => {
    if (resolved) return;
    resolved = true;
    resolve();
  };

  // Clean minimal preloader: a big light percentage counts up on a near-black
  // field; then the dark field necks DOWN through a circular clip until it is
  // exactly the hero's dark sphere — the curtain becomes the circle, continuous
  // dark mass the whole way, so there's no jump.
  const coverRadius = () => {
    const x = window.innerWidth / 2, y = window.innerHeight / 2;
    const corners = [[0, 0], [window.innerWidth, 0], [0, window.innerHeight], [window.innerWidth, window.innerHeight]];
    return Math.ceil(Math.max(...corners.map(([cx, cy]) => Math.hypot(cx - x, cy - y)))) + 2;
  };
  const viewportCoverRadius = () => Math.ceil(Math.hypot(window.innerWidth, window.innerHeight)) + 8;
  const sphereTarget = () => {
    const reloadCursorTarget = getReloadLoaderCursorTarget();
    if (reloadCursorTarget) return reloadCursorTarget;
    if (!heroSphere) return { x: window.innerWidth / 2, y: window.innerHeight / 2, r: Math.min(window.innerWidth, window.innerHeight) * 0.18 };
    const rect = heroSphere.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, r: Math.max(rect.width, rect.height) / 2 };
  };
  const shrinkToReloadCursor = () => Boolean(getReloadLoaderCursorTarget());
  const clipState = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    r: shrinkToReloadCursor() ? viewportCoverRadius() : coverRadius(),
  };
  const setClip = () => {
    const c = `circle(${clipState.r}px at ${clipState.x}px ${clipState.y}px)`;
    gsap.set(loader, { clipPath: c, webkitClipPath: c });
  };

  gsap.set(loader, { autoAlpha: 1, pointerEvents: 'auto' });
  setClip();
  if (countEl) gsap.set(countEl, { autoAlpha: 0, y: 26, filter: 'blur(10px)' });

  const count = { value: 0 };

  // Rolling-odometer readout: three digit columns (hundreds, tens, units) whose
  // strips translate vertically (by whole rows) as the value counts, so both
  // digits physically tick like a mechanical counter. The digits sit FLUSH-LEFT
  // for 0-99 (the hundreds column is collapsed to width 0); over the final counts
  // the hundreds "1" rolls up AND its column widens in, so the tens/units slide
  // over just once at the very end — a gentle carry, not a pop.
  let odoStrips = null;
  let odoHundredsCol = null;
  if (pct) {
    try {
      pct.textContent = '';
      const makeCol = (cells, cls) => {
        const col = document.createElement('span');
        col.className = 'odo__col' + (cls ? ' ' + cls : '');
        const strip = document.createElement('span');
        strip.className = 'odo__strip';
        cells.forEach((t) => {
          const cell = document.createElement('span');
          cell.className = 'odo__cell';
          cell.textContent = t;
          strip.appendChild(cell);
        });
        col.appendChild(strip);
        pct.appendChild(col);
        return { col, strip };
      };
      const digitCells = () => { const a = []; for (let n = 0; n <= 10; n += 1) a.push(String(n % 10)); return a; };
      const h = makeCol([' ', '1'], 'odo__col--h');
      const t = makeCol(digitCells());
      const u = makeCol(digitCells());
      odoHundredsCol = h.col;
      odoStrips = [h.strip, t.strip, u.strip];
    } catch (_) { odoStrips = null; }
  }
  const ROW_EM = 0.9; // matches .odo__cell height
  const setPct = (v) => {
    if (odoStrips) {
      const val = Math.max(0, Math.min(100, v));
      const units = val % 10;
      // Each wheel holds its digit and only rolls over during its carry (so 7
      // reads "07"). The hundreds rolls + widens in gradually over the last few
      // counts (rem 97->100) so the carry slides gently instead of snapping.
      const tens = Math.floor(val / 10) + (units > 9 ? units - 9 : 0);
      const rem = val % 100;
      const hundreds = Math.floor(val / 100) + (rem > 97 ? (rem - 97) / 3 : 0);
      odoStrips[0].style.transform = `translateY(${-hundreds * ROW_EM}em)`;
      odoStrips[1].style.transform = `translateY(${-tens * ROW_EM}em)`;
      odoStrips[2].style.transform = `translateY(${-units * ROW_EM}em)`;
      if (odoHundredsCol) odoHundredsCol.style.width = hundreds.toFixed(3) + 'ch';
    } else if (pct) {
      pct.textContent = String(Math.round(v));
    }
  };
  setPct(0);

  const tl = gsap.timeline({
    onComplete: () => {
      const finalCursorTarget = getReloadLoaderCursorTarget();
      const cursor = finalCursorTarget ? document.querySelector('.cursor') : null;
      if (cursor && window.gsap) {
        gsap.set(cursor, {
          x: finalCursorTarget.x,
          y: finalCursorTarget.y,
          opacity: 1,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
        });
      }
      loader.remove();
      document.body.classList.remove('is-loading');
      if (window.ScrollTrigger) ScrollTrigger.refresh();
      resolveLoader();
    }
  });

  // counter materialises in: blur-to-focus + fade + gentle rise
  tl.to(countEl, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power2.out' }, 0.1);

  // count 0 -> 100 — not a robotic ramp. Real loading moves in bursts with little
  // stalls and a slow crawl into the finish, so step it: quick jumps, tiny holds
  // between them, then a lingering ease up to 100. (~2.4s total, so the downstream
  // beats below are unchanged.)
  const countTl = gsap.timeline({
    onUpdate: () => setPct(count.value),
    onComplete: () => setPct(100),
  });
  countTl
    .to(count, { value: 34, duration: 0.4, ease: 'power2.out' })
    .to(count, { value: 57, duration: 0.45, ease: 'power1.inOut' }, '+=0.12')
    .to(count, { value: 79, duration: 0.4, ease: 'power2.inOut' }, '+=0.14')
    .to(count, { value: 92, duration: 0.4, ease: 'power2.out' })
    .to(count, { value: 100, duration: 0.52, ease: 'power2.out' }, '+=0.07');
  tl.add(countTl, 0.15);

  // counter clears just before the field starts contracting
  tl.to(countEl, { autoAlpha: 0, y: -12, filter: 'blur(8px)', duration: 0.45, ease: 'power2.in' }, 2.5);

  // hand off to the hero as the contraction begins (name + bloom come alive
  // through the off-white that the shrinking circle reveals)
  // the dark field necks down into the hero sphere — one smooth circular morph
  tl.to(clipState, {
    x: () => sphereTarget().x,
    y: () => sphereTarget().y,
    r: () => sphereTarget().r,
    duration: 1.4,
    ease: 'expo.inOut',
    onUpdate: () => {
      const liveTarget = getReloadLoaderCursorTarget();
      if (liveTarget) {
        clipState.x = liveTarget.x;
        clipState.y = liveTarget.y;
      }
      setClip();
    },
    onComplete: () => {
      const liveTarget = getReloadLoaderCursorTarget();
      if (liveTarget) {
        clipState.x = liveTarget.x;
        clipState.y = liveTarget.y;
        clipState.r = liveTarget.r;
      }
      setClip();
    },
  }, 2.8);

  // Hand off at the exact final circle. A tiny fade avoids a one-frame
  // compositor snap at the clipped edge while the real sphere takes over.
  tl.to(loader, {
    autoAlpha: 0,
    duration: 0.14,
    ease: 'power2.out',
    pointerEvents: 'none',
  }, 4.18);

});

// Safety: never let the loader trap the page
setTimeout(() => {
  const l = document.getElementById('loader');
  if (l) l.remove();
  document.body.classList.remove('is-loading');
}, 8000);

/* ---------- 1. Smooth-scroll ---------- */
let lenis;
// Lenis on touch (smoothTouch:false) doesn't reliably emit scroll events, which
// left ScrollTrigger un-updated on phones — the hero pin never released and the
// works/about sections never revealed. Use native scroll on mobile; ScrollTrigger
// drives off the native scroll listener there.
const canUseLenis = !reduceMotion && window.Lenis && !isMobile;

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

if (canUseLenis) {
  lenis = new Lenis({
    duration: isMobile ? 0.82 : 1.08,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: isMobile ? 1 : 0.92,
    touchMultiplier: 1,
  });

  lenis.on('scroll', () => {
    if (window.ScrollTrigger) ScrollTrigger.update();
  });

  if (window.gsap) {
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  DEBUG && debugLog('[SCROLL] Lenis active as global smooth scroll', {
    duration: isMobile ? 0.82 : 1.08,
    smoothTouch: false,
  });
} else if (reduceMotion) {
  DEBUG && debugLog('[SCROLL] Lenis disabled for reduced motion');
}

if (window.ScrollTrigger) {
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

/* ---------- 2. ScrollTrigger setup ---------- */
// Runs on every device: the full choreography (pinned hero ball-grow -> about ->
// bridge -> iris shrink revealing Selected Works -> horizontal pin to Contact)
// is intentionally shared between desktop and mobile. Phone-specific timing is
// tuned via isPhoneViewport below.
let horizontalTween;
if (!reduceMotion && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  // --- Mobile: make pinned scroll behave on touch ---
  // Phones fire scroll events while the address bar shows/hides, which resizes
  // the viewport and makes pinned ScrollTriggers recalculate mid-scroll — this
  // was the "possessed" jumping / snap-back-to-top the desktop choreography had
  // on phones. normalizeScroll() proxies touch scrolling through GSAP (using
  // transform-based pinning), and ignoreMobileResize stops the address-bar
  // resize from forcing refreshes. This is what makes the desktop flow usable
  // on touch.
  if (isMobile) {
    ScrollTrigger.config({ ignoreMobileResize: true });
    ScrollTrigger.normalizeScroll(true);
  }

  const sphereEl = document.getElementById('hero-sphere-wrap');
  const heroPanel = document.querySelector('.panel--hero');
  const heroClipSource = sphereEl?.querySelector('.hero-bh-lens') || sphereEl;
  const updateHeroCircleClip = () => {
    if (!heroPanel || !heroClipSource) return;
    const panelRect = heroPanel.getBoundingClientRect();
    const circleRect = heroClipSource.getBoundingClientRect();
    heroPanel.style.setProperty('--hero-bh-clip-x', `${circleRect.left + circleRect.width / 2 - panelRect.left}px`);
    heroPanel.style.setProperty('--hero-bh-clip-y', `${circleRect.top + circleRect.height / 2 - panelRect.top}px`);
    heroPanel.style.setProperty('--hero-bh-clip-r', `${Math.max(circleRect.width, circleRect.height) / 2}px`);
  };
  const getScale = () => {
    if (!sphereEl) return 3;
    const half = Math.hypot(window.innerWidth, window.innerHeight) / 2;
    return (half / (sphereEl.offsetWidth / 2)) * 1.1;
  };

  const maskEl = document.querySelector('.blackMaskLayer');
  const cursorEl = document.querySelector('.cursor');
  const transitionScene = document.querySelector('.heroToSection2Scene');
  const section2ExitScene = document.querySelector('.section2ExitScene');
  const section2ContentLayer = document.querySelector('.section2ContentLayer');
  const section2Bridge = document.querySelector('.section2-bridge');
  const section3Real = document.querySelector('.panel--works');
  const section3RealContent = document.querySelector('.section3-real-content');
  const wrap = document.querySelector('.h-wrap');
  const track = document.querySelector('.h-track');
  const isPhoneViewport = window.matchMedia('(max-width: 640px)').matches;
  let cursorOpacityTarget = 0;

  const tweenCursorOpacity = (visible, duration = 0.34) => {
    if (!cursorEl) return;
    const target = visible ? 1 : 0;
    if (cursorOpacityTarget === target) return;
    cursorOpacityTarget = target;
    gsap.to(cursorEl, {
      opacity: target,
      duration,
      ease: visible ? 'power2.out' : 'power2.inOut',
      overwrite: 'auto',
    });
  };

  const setCursorOpacityNow = (visible) => {
    if (!cursorEl) return;
    cursorOpacityTarget = visible ? 1 : 0;
    gsap.set(cursorEl, { opacity: cursorOpacityTarget });
  };

  const setCursorOpacityFromScroll = (value) => {
    if (!cursorEl) return;
    const opacity = Math.max(0, Math.min(1, value));
    cursorOpacityTarget = opacity;
    gsap.killTweensOf(cursorEl, 'opacity');
    gsap.set(cursorEl, { opacity });
  };

  const getMaskDia = () => Math.max(window.innerWidth, window.innerHeight) * 2;
  const finalCursorSize = 44;
  const getCircleDia = () => finalCursorSize;
  const dotScale = () => getCircleDia() / getMaskDia();

  const toPhase2 = (p) => Math.max(0, (p - 0.51) / 0.49);
  const section3ShrinkPhaseStart = 0.58;
  const section3RevealPhaseStart = 0.72;
  const cursorFollowPhaseStart = 0.78;
  const shrinkMouseFollowPhaseStart = section3ShrinkPhaseStart;
  const cursorFollowPhaseDuration = 0.22;
  const section3ClickThroughProgress = 0.51 + 0.49 * section3RevealPhaseStart;
  // Step 1 (reversible): readiness fires when the shrink/reveal phase starts,
  // independent of the later click-through threshold. Restore by setting this
  // back to `section3ClickThroughProgress` to revert.
  const selectedWorksReadyProgress = 0.51 + 0.49 * section3ShrinkPhaseStart;
  const shrinkMouseFollowProgress = 0.51 + 0.49 * shrinkMouseFollowPhaseStart;
  const bridgeInteractiveProgress = 0.66;
  // Preview *visibility* gate — fires when the black mask is small enough that
  // it no longer covers the project rows (mask scale ≈ 0.05 at this point).
  // Earlier than full handoff so the preview feels available as soon as
  // Selected Works visually arrives, but late enough that the preview never
  // appears over the still-large shrinking circle.
  const selectedWorksPreviewVisiblePhaseStart = 0.82;
  const selectedWorksPreviewVisibleProgress = 0.51 + 0.49 * selectedWorksPreviewVisiblePhaseStart;
  const section3HandoffProgress = 0.995;

  let initialProjectReturnOrigin = null;
  if (isProjectReturnToWorks) {
    try {
      if (sessionStorage.getItem(PROJECT_RETURN_ORIGIN_KEY)) {
        initialProjectReturnOrigin = getProjectReturnOriginForHome();
      }
    } catch (_) {}
  }
  let mouseX = Number.isFinite(initialProjectReturnOrigin?.x) ? initialProjectReturnOrigin.x : window.innerWidth / 2;
  let mouseY = Number.isFinite(initialProjectReturnOrigin?.y) ? initialProjectReturnOrigin.y : window.innerHeight / 2;
  let section3ClickThroughLogged = false;
  let section3UnderlayLogged = false;
  let workHandoffCompleteLogged = false;
  const section3LayoutLoggedSamples = new Set();
  let isExitCursorActive = false;
  let isSection3InteractiveReady = false;
  let selectedWorksReady = false;
  const section2OpacitySamples = [0.1, 0.2, 0.3, 0.4, 0.5];
  const section2LoggedSamples = new Set();

  const describeHitElement = (el) => {
    if (!el) return null;
    const interactive = el.closest('a, button, [role="button"], input, textarea, select');
    return {
      tag: el.tagName?.toLowerCase(),
      id: el.id || '',
      className: typeof el.className === 'string' ? el.className : '',
      interactiveTag: interactive?.tagName?.toLowerCase() || '',
      interactiveClass: typeof interactive?.className === 'string' ? interactive.className : '',
      interactiveHref: interactive?.getAttribute?.('href') || '',
    };
  };

  const logHandoffHitTarget = (label) => {
    const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    DEBUG && debugLog(`[section3 handoff hit-test] ${label}`, describeHitElement(el));
  };

  const logBridgeToSection3HitTest = () => {
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    const el = document.elementFromPoint(x, y);
    DEBUG && debugLog("[BRIDGE TO S3 HIT TEST]", el);
    DEBUG && debugLog("[BRIDGE TO S3 HIT TEST class]", el?.className);
    DEBUG && debugLog("[BRIDGE TO S3 HIT TEST id]", el?.id);

    document.querySelectorAll(".project-row, [data-project-row], .work-row").forEach((row, i) => {
      const rect = row.getBoundingClientRect();
      const rowEl = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      DEBUG && debugLog("[PROJECT ROW HIT AFTER BRIDGE]", i, rowEl, rowEl?.className, rowEl?.id);
    });
  };

  const logWorkRowHitTest = (label) => {
    DEBUG && debugLog('[WORK STATE] row hit-test', label);
    document.querySelectorAll('.panel--works .work-row > a').forEach((link, i) => {
      const rect = link.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      DEBUG && debugLog('[WORK STATE] row hit', i, describeHitElement(hit));
    });
  };

  const rectForLog = (el) => {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      height: Math.round(rect.height),
      left: Math.round(rect.left),
      width: Math.round(rect.width),
    };
  };

  const logExitGeometry = (label, self) => {
    const pinSpacer = transitionScene?.parentElement?.classList?.contains('pin-spacer')
      ? transitionScene.parentElement
      : null;
    DEBUG && debugLog(`[SECTION 2 to 3 GEOMETRY] ${label}`, {
      section2ExitSceneRect: rectForLog(section2ExitScene),
      section3Rect: rectForLog(section3Real),
      pinSpacerHeight: pinSpacer ? getComputedStyle(pinSpacer).height : null,
      scrollTriggerStart: self?.start,
      scrollTriggerEnd: self?.end,
      scrollY: Math.round(self?.scroll?.() ?? window.scrollY),
    });
  };

  const logHorizontalHandoff = (label, self) => {
    DEBUG && debugLog(`[SECTION 3 HORIZONTAL HANDOFF] ${label}`, {
      section3RectTop: Math.round(section3Real?.getBoundingClientRect().top ?? 0),
      horizontalWrapperRectTop: Math.round(wrap?.getBoundingClientRect().top ?? 0),
      horizontalTrackTransform: track ? getComputedStyle(track).transform : '',
      section3Transform: section3Real ? getComputedStyle(section3Real).transform : '',
      horizontalStart: self?.start ?? ScrollTrigger.getById('horizontal-scroll')?.start,
      scrollY: Math.round(self?.scroll?.() ?? window.scrollY),
    });
  };

  const logShrinkLayout = (label) => {
    if (!section3Real || !maskEl || !transitionScene) return;
    const circleParent = maskEl.parentElement;
    const section3Style = getComputedStyle(section3Real);
    const wrapStyle = wrap ? getComputedStyle(wrap) : null;
    const trackStyle = track ? getComputedStyle(track) : null;
    DEBUG && debugLog(`[SECTION 2 to 3 SHRINK LAYOUT] ${label}`, {
      section3Top: Math.round(section3Real.getBoundingClientRect().top),
      horizontalWrapperTop: Math.round(wrap?.getBoundingClientRect().top ?? 0),
      horizontalTrackTop: Math.round(track?.getBoundingClientRect().top ?? 0),
      section3Transform: section3Style.transform,
      horizontalWrapperTransform: wrapStyle?.transform ?? '',
      horizontalTrackTransform: trackStyle?.transform ?? '',
      section3ComputedTop: section3Style.top,
      horizontalWrapperComputedTop: wrapStyle?.top ?? '',
      horizontalTrackComputedTop: trackStyle?.top ?? '',
      exitCircleRect: rectForLog(maskEl),
      exitCircleParentPosition: circleParent ? getComputedStyle(circleParent).position : '',
      exitCircleParentHeight: circleParent ? getComputedStyle(circleParent).height : '',
      transitionSceneHeight: getComputedStyle(transitionScene).height,
    });
  };

  const resetHorizontalHandoffY = () => {
    if (wrap) {
      wrap.classList.remove('is-section3-underlay');
      gsap.set(wrap, { y: 0 });
    }
    if (track) gsap.set(track, { x: 0, y: 0 });
    if (section3Real) gsap.set(section3Real, { y: 0 });
  };

  const logSection2OpacitySample = (phaseProgress) => {
    if (!section2ContentLayer) return;
    section2OpacitySamples.forEach((sample) => {
      if (phaseProgress < sample || section2LoggedSamples.has(sample)) return;
      section2LoggedSamples.add(sample);
      const aboutWrap = section2ContentLayer.querySelector('.about-wrap');
      DEBUG && debugLog('[SECTION 2 to 3 OPACITY]', {
        phaseProgress: sample.toFixed(2),
        timelineProgress: ScrollTrigger.getById('hero-transition')?.progress?.toFixed(3) ?? '',
        section2LayerOpacity: getComputedStyle(section2ContentLayer).opacity,
        section2ContentOpacity: aboutWrap ? getComputedStyle(aboutWrap).opacity : '',
      });
    });
  };

  const setSection3Underlay = (active, self) => {
    if (!wrap) return;
    wrap.classList.toggle('is-section3-underlay', active);
    if (!active) {
      gsap.set(wrap, { y: 0 });
      return;
    }

    gsap.set(wrap, { y: 0, force3D: true });
  };

  const setSection3InvertActive = (_active) => {
    // No-op retained for the existing transition call sites.
  };

  const setSection2ContentPointer = (enabled) => {
    if (!section2ContentLayer) return;
    const opacity = Number(gsap.getProperty(section2ContentLayer, 'opacity'));
    const visibility = getComputedStyle(section2ContentLayer).visibility;
    const isVisible = opacity > 0.02 && visibility !== 'hidden';
    gsap.set(section2ContentLayer, { pointerEvents: enabled && isVisible ? 'auto' : 'none' });
  };

  const setBridgeSelectable = (enabled, forceVisible = false) => {
    if (!section2Bridge) return;
    const opacity = Number(getComputedStyle(section2Bridge).opacity || gsap.getProperty(section2Bridge, 'opacity'));
    const visibility = getComputedStyle(section2Bridge).visibility;
    const isVisible = forceVisible || (opacity > 0.05 && visibility !== 'hidden');
    section2Bridge.classList.toggle('is-bridge-selectable', enabled && isVisible);
    section2Bridge.style.pointerEvents = enabled && isVisible ? 'auto' : 'none';
  };

  const getTransitionPinSpacer = () => transitionScene?.parentElement?.classList?.contains('pin-spacer')
    ? transitionScene.parentElement
    : null;

  const setTransitionBlockersInactive = (inactive) => {
    const pinSpacer = getTransitionPinSpacer();
    if (pinSpacer) pinSpacer.style.pointerEvents = inactive ? 'none' : '';
    if (transitionScene) transitionScene.style.pointerEvents = inactive ? 'none' : '';
    if (section2ExitScene) section2ExitScene.style.pointerEvents = inactive ? 'none' : '';
    setBridgeSelectable(!inactive);
    if (maskEl) maskEl.style.pointerEvents = 'none';
  };

  let selectedWorksPreviewVisibleReady = false;
  let lastLoggedMaskScale = null;
  const setSelectedWorksPreviewVisibleReady = (ready, label = '') => {
    if (selectedWorksPreviewVisibleReady === ready) return;
    selectedWorksPreviewVisibleReady = ready;
    document.body.classList.toggle('selected-works-preview-visible-ready', ready);
    window.dispatchEvent(new CustomEvent('selectedworkspreviewready', { detail: { ready } }));
    if (ready) {
      DEBUG && debugLog('[WORK READY TEST] previewVisibleReady true');
      DEBUG && debugLog('[PREVIEW READY UX] previewVisibleReady true', label);
      const maskScale = maskEl ? Number(gsap.getProperty(maskEl, 'scale')) : null;
      DEBUG && debugLog('[PREVIEW READY UX] mask scale', maskScale);
    } else {
      DEBUG && debugLog('[PREVIEW READY UX] hover blocked because mask still active', label);
    }
  };

  const setSection3HandoffComplete = (complete) => {
    transitionScene?.classList.toggle('is-section3-handoff-complete', complete);
    setTransitionBlockersInactive(complete);
    setSection2ContentPointer(!complete);
    // Safety net only — actual gating is done in onUpdate against the dedicated
    // mask-clear threshold so the preview becomes available much earlier than
    // full handoff (which is at master progress 0.995).
    if (complete) setSelectedWorksPreviewVisibleReady(true, 'handoff complete');
  };

  const setSection3ClickThrough = (active) => {
    const wasActive = transitionScene?.classList.contains('is-section3-click-through');
    transitionScene?.classList.toggle('is-section3-click-through', active);
    setTransitionBlockersInactive(active);
    setSection2ContentPointer(!active);
    if (active && !wasActive) DEBUG && debugLog('[WORK READY TEST] clickThrough true');
  };

  const setSection3InteractiveReady = (ready) => {
    isSection3InteractiveReady = ready;
    document.body.classList.toggle('section3-ready', ready);
    if (!ready && currentCursorState === 'work') {
      setCursorState('transition');
    }
  };

  const setSelectedWorksReady = (ready, label = '') => {
    if (selectedWorksReady === ready) return;
    selectedWorksReady = ready;
    document.body.classList.toggle('selected-works-ready', ready);
    // Step 2 (reversible): pointer-events gate flips alongside readiness.
    // Visual click-through (is-section3-click-through) still controls visuals.
    transitionScene?.classList.toggle('is-section3-pointer-through', ready);
    if (ready) DEBUG && debugLog('[WORK READY TEST] pointerThrough true');
    window.dispatchEvent(new CustomEvent('selectedworksready', { detail: { ready } }));
    if (ready) DEBUG && debugLog('[WORK STATE] selectedWorksReady true', label);
    if (ready) DEBUG && debugLog('[WORK READY TEST] selectedWorksReady true', label);
    DEBUG && debugLog('[STRETCH FIX] ready', ready, label);
    if (ready) {
      if (section3Real) section3Real.style.pointerEvents = 'auto';
      section3Real?.querySelectorAll('.work-row, .work-row > a').forEach((el) => {
        el.style.pointerEvents = 'auto';
      });
      DEBUG && debugLog('[WORK STATE] preview enabled');
      setCursorState('work');
    } else if (currentCursorState === 'work') {
      setCursorState('transition');
    }
  };

  const setTransitionCursorActive = (active) => {
    document.body.classList.toggle('is-transition-cursor-active', active);
  };

  const setDarkSectionCursor = (active, scrollOpacity = null) => {
    document.body.classList.toggle('cursor-on-dark', active);
    if (!cursorEl || isExitCursorActive || isSection3InteractiveReady) return;
    setTransitionCursorActive(active);
    if (active) {
      if (currentCursorState !== 'transition') setCursorState('transition');
      gsap.set(cursorEl, { x: mouseX, y: mouseY, scaleX: 1, scaleY: 1, rotation: 0 });
      if (Number.isFinite(scrollOpacity)) setCursorOpacityFromScroll(scrollOpacity);
      else tweenCursorOpacity(true, 0.72);
    } else {
      if (currentCursorState === 'transition') setCursorState('default');
      gsap.set(cursorEl, { scaleX: 1, scaleY: 1, rotation: 0 });
      tweenCursorOpacity(false, 0.34);
    }
  };

  const getMaskCursorPosition = () => {
    if (!maskEl) return { x: 0, y: 0 };
    return {
      x: -maskEl.offsetWidth / 2 + (mouseX - window.innerWidth / 2),
      y: -maskEl.offsetHeight / 2 + (mouseY - window.innerHeight / 2),
    };
  };

  const logExitCursorAlignment = () => {
    if (!maskEl) return;
    const rect = maskEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    DEBUG && debugLog('[EXIT CURSOR ALIGNMENT]', {
      mouseX: Math.round(mouseX),
      mouseY: Math.round(mouseY),
      circleRect: {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      circleCenterX: Math.round(centerX),
      circleCenterY: Math.round(centerY),
      deltaX: Math.round((centerX - mouseX) * 10) / 10,
      deltaY: Math.round((centerY - mouseY) * 10) / 10,
    });
  };

  const activateExitCursor = () => {
    if (!maskEl) return;
    if (!isExitCursorActive) {
      isExitCursorActive = true;
      const pos = getMaskCursorPosition();
      gsap.set(maskEl, { x: pos.x, y: pos.y });
      if (maskQuickX && maskQuickY) {
        maskQuickX(pos.x);
        maskQuickY(pos.y);
      }
      setTransitionCursorActive(true);
      if (!isSection3InteractiveReady) setCursorState('transition');
      requestAnimationFrame(logExitCursorAlignment);
      return;
    }
    setTransitionCursorActive(true);
    if (!isSection3InteractiveReady && currentCursorState !== 'transition') setCursorState('transition');
  };

  const deactivateExitCursor = () => {
    isExitCursorActive = false;
    setTransitionCursorActive(false);
    if (currentCursorState !== 'default') setCursorState('default');
  };

  if (cursorEl) {
    gsap.set(cursorEl, {
      left: 0,
      top: 0,
      xPercent: -50,
      yPercent: -50,
      x: mouseX,
      y: mouseY,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      force3D: true,
      transformOrigin: 'center center',
    });
    setCursorOpacityNow(false);
  }

  const maskQuickX = maskEl ? gsap.quickTo(maskEl, 'x', { duration: 0.18, ease: 'power3.out' }) : null;
  const maskQuickY = maskEl ? gsap.quickTo(maskEl, 'y', { duration: 0.18, ease: 'power3.out' }) : null;
  const cursorQuickX = cursorEl ? gsap.quickTo(cursorEl, 'x', { duration: 0.16, ease: 'power3.out' }) : null;
  const cursorQuickY = cursorEl ? gsap.quickTo(cursorEl, 'y', { duration: 0.16, ease: 'power3.out' }) : null;
  const cursorQuickScaleX = cursorEl ? gsap.quickTo(cursorEl, 'scaleX', { duration: 0.18, ease: 'power3.out' }) : null;
  const cursorQuickScaleY = cursorEl ? gsap.quickTo(cursorEl, 'scaleY', { duration: 0.18, ease: 'power3.out' }) : null;
  const cursorQuickRotation = cursorEl ? gsap.quickTo(cursorEl, 'rotation', { duration: 0.18, ease: 'power3.out' }) : null;
  let lastMouseX = mouseX;
  let lastMouseY = mouseY;

  document.addEventListener('mousemove', e => {
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    lastMouseX = mouseX;
    lastMouseY = mouseY;

    if (cursorQuickX && cursorQuickY) {
      cursorQuickX(mouseX);
      cursorQuickY(mouseY);
    } else if (cursorEl) {
      gsap.set(cursorEl, { x: mouseX, y: mouseY });
    }

    if (cursorQuickScaleX && cursorQuickScaleY && cursorQuickRotation && currentCursorState === 'work' && !document.body.classList.contains('project-preview-cursor-active')) {
      const velocity = Math.min(Math.hypot(dx, dy), 42);
      const stretch = 1 + (velocity / 42) * 0.1;
      const squash = 1 - (velocity / 42) * 0.05;
      cursorQuickRotation(Math.atan2(dy, dx) * 180 / Math.PI);
      cursorQuickScaleX(stretch);
      cursorQuickScaleY(squash);
    }

    if (!isExitCursorActive || !maskQuickX || !maskQuickY) return;
    const pos = getMaskCursorPosition();
    maskQuickX(pos.x);
    maskQuickY(pos.y);
  });

  gsap.ticker.add(() => {
    if (currentCursorState !== 'work' || document.body.classList.contains('project-preview-cursor-active') || !cursorQuickScaleX || !cursorQuickScaleY || !cursorQuickRotation) return;
    cursorQuickScaleX(1);
    cursorQuickScaleY(1);
    cursorQuickRotation(0);
  });

  // Iris close is scroll-driven only. The mask scale/opacity is derived from
  // ScrollTrigger progress, so it never keeps shrinking after scroll input stops.
  let irisPlayed = false;
  // Mobile + tablet have no cursor, so the bridge -> Selected Works shrink is a
  // plain scroll-driven reveal there. Start it a touch earlier on phones (wider
  // scroll window = slower) and ease it smoothly instead of the desktop's linear
  // cursor-paced curve. Desktop is unchanged.
  const irisAuto = window.matchMedia('(max-width: 1024px)').matches;
  const IRIS_TRIGGER_PROGRESS = isPhoneViewport ? 0.82 : 0.74;

  const IRIS_SCROLL_END_PROGRESS = 1;
  const IRIS_INTERACTIVE_RAW = isPhoneViewport ? 0.9 : 0.965;
  const IRIS_PREVIEW_RAW = isPhoneViewport ? IRIS_INTERACTIVE_RAW : null;
  const IRIS_CURSOR_HANDOFF_RAW = 0.995;
  const easeIrisScroll = gsap.parseEase(irisAuto ? 'power2.inOut' : 'none');
  const easeDarkCursor = gsap.parseEase('power2.inOut');
  const clampIris = gsap.utils.clamp(0, 1);

  const renderScrollDrivenIris = (self) => {
    if (!maskEl || !self) return;
    const raw = clampIris((self.progress - IRIS_TRIGGER_PROGRESS) / (IRIS_SCROLL_END_PROGRESS - IRIS_TRIGGER_PROGRESS));
    const eased = easeIrisScroll(raw);
    const scale = gsap.utils.interpolate(1, dotScale(), eased);
    const isInteractive = raw >= IRIS_INTERACTIVE_RAW;
    const isPreviewReady = isPhoneViewport
      ? raw >= IRIS_PREVIEW_RAW
      : self.progress >= selectedWorksPreviewVisibleProgress;
    // The bridge IS the big black iris mask (with its text) that shrinks to
    // reveal the white Selected Works. While that mask still dominates the
    // screen the cursor sits over black, so its difference-blend already reads
    // white — leave it alone. Only force the solid dark cursor once Selected
    // Works has visually arrived (preview gate: mask shrunk small enough to
    // clear the project rows) and before the work/preview cursor states take
    // over at interactive. Previously this fired at `raw > 0`, flipping the
    // cursor dark the instant the iris began shrinking — i.e. while the user
    // was still looking at the dark bridge.
    document.body.classList.toggle('cursor-works-incoming', isPreviewReady && !isInteractive);
    const isVisuallyHandedOff = raw >= IRIS_CURSOR_HANDOFF_RAW;
    const darkCursorFade = clampIris((self.progress - 0.405) / 0.12);
    const darkCursorOpacity = easeDarkCursor(darkCursorFade);
    const isDarkReadableSection = darkCursorFade > 0 && self.progress < IRIS_TRIGGER_PROGRESS;
    const isBeforeExitCursor = self.progress < shrinkMouseFollowProgress;
    const isBridgeInteractivePhase = self.progress >= bridgeInteractiveProgress && self.progress < shrinkMouseFollowProgress;

    gsap.set(maskEl, {
      scale: isVisuallyHandedOff ? dotScale() : scale,
      autoAlpha: isVisuallyHandedOff ? 0 : 1,
    });

    if (isVisuallyHandedOff) {
      irisPlayed = true;
      setSection3Underlay(false, self);
      setSection3ClickThrough(true);
      setSection3InteractiveReady(true);
      setSelectedWorksReady(true, 'scroll iris complete');
      setSelectedWorksPreviewVisibleReady(true, 'scroll iris complete');
      setSection3HandoffComplete(true);
      setBridgeSelectable(false);
      setSection3InvertActive(false);
      setDarkSectionCursor(false);
      if (cursorEl) {
        gsap.set(cursorEl, { x: mouseX, y: mouseY, scaleX: 1, scaleY: 1, rotation: 0 });
        tweenCursorOpacity(true, 0.18);
      }
      return;
    }

    if (raw > 0) {
      if (isBeforeExitCursor) {
        irisPlayed = false;
        setSection3Underlay(false, self);
        setSection3ClickThrough(false);
        setSection3InteractiveReady(false);
        setSelectedWorksReady(false, 'bridge before cursor shrink');
        setSelectedWorksPreviewVisibleReady(false, 'bridge before cursor shrink');
        setSection3HandoffComplete(false);
        setSection3InvertActive(false);
        setBridgeSelectable(isBridgeInteractivePhase, isBridgeInteractivePhase);
        setDarkSectionCursor(true, 1);
        return;
      }
      setDarkSectionCursor(false);
      irisPlayed = false;
      setSection3Underlay(true, self);
      activateExitCursor();
      setSection3InvertActive(true);
      setSection3HandoffComplete(false);
      setSection3ClickThrough(isInteractive);
      setSection3InteractiveReady(isInteractive);
      setSelectedWorksReady(isInteractive, isInteractive ? 'scroll iris nearly clear' : 'scroll iris active');
      setSelectedWorksPreviewVisibleReady(isPreviewReady, isPreviewReady ? 'scroll iris preview clear' : 'scroll iris active');
      setBridgeSelectable(false);
      if (cursorEl) {
        const cursorFadeStart = isPhoneViewport ? 0.76 : 0.88;
        const handoffOpacity = clampIris((raw - cursorFadeStart) / (IRIS_INTERACTIVE_RAW - cursorFadeStart));
        cursorOpacityTarget = isInteractive ? 1 : handoffOpacity;
        gsap.set(cursorEl, {
          opacity: isInteractive ? 1 : handoffOpacity,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
        });
      }
      return;
    }

    irisPlayed = false;
    setSection3HandoffComplete(false);
    setSelectedWorksPreviewVisibleReady(false, 'scroll iris reset');
    setSelectedWorksReady(false, 'scroll iris reset');
    setSection3InteractiveReady(false);
    setSection3ClickThrough(false);
    setSection3InvertActive(false);
    setBridgeSelectable(isBridgeInteractivePhase, isBridgeInteractivePhase);
    setDarkSectionCursor(isDarkReadableSection, isDarkReadableSection ? darkCursorOpacity : null);
  };

  let projectReturnIrisSynced = false;
  const syncProjectReturnIrisComplete = () => {
    if (!isProjectReturnToWorks || projectReturnIrisSynced) return;
    projectReturnIrisSynced = true;
    irisPlayed = true;
    if (maskEl) gsap.set(maskEl, { autoAlpha: 0, scale: dotScale() });
  };
  window.addEventListener('projectreturnworksstate', syncProjectReturnIrisComplete);

  const masterTl = gsap.timeline({
    scrollTrigger: {
      id: 'hero-transition',
      trigger: '.heroToSection2Scene',
      start: 'top top',
      end: '+=600%',
      scrub: 1.1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: (self) => {
        updateHeroCircleClip();
        renderScrollDrivenIris(self);
      },

      onUpdate(self) {
        updateHeroCircleClip();
        const p2 = toPhase2(self.progress);
        const isShrinkingToSection3 = p2 >= section3ShrinkPhaseStart;
        if (p2 >= shrinkMouseFollowPhaseStart) {
          activateExitCursor();
        } else if (isExitCursorActive) {
          deactivateExitCursor();
        } else if (currentCursorState !== 'default') {
          setCursorState('default');
        }
        logSection2OpacitySample(p2);
        setSection3Underlay(isShrinkingToSection3, self);
        // Iris handoff state is derived directly from scroll progress.

        renderScrollDrivenIris(self);
        if (!maskEl) return;
        if (!isExitCursorActive) {
          gsap.set(maskEl, {
            x: -maskEl.offsetWidth / 2,
            y: -maskEl.offsetHeight / 2,
          });
        }
      },

      onLeave(self) {
        renderScrollDrivenIris(self);
        setBridgeSelectable(false);
        setSection3Underlay(false, self);
        setSection3InvertActive(false);
        if (cursorEl) gsap.set(cursorEl, { x: mouseX, y: mouseY, opacity: 1, scaleX: 1, scaleY: 1, rotation: 0 });
        activateExitCursor();
      },

      onEnterBack(self) {
        section2LoggedSamples.clear();
        const p2 = toPhase2(self?.progress ?? 1);
        if (p2 >= shrinkMouseFollowPhaseStart) {
          activateExitCursor();
        } else {
          deactivateExitCursor();
        }
          // Crossed back through the iris reverse threshold — reset to start.
        renderScrollDrivenIris(self);
      },

      onLeaveBack() {
        // User scrolled up out of the trigger range entirely. Fully reset.
        irisPlayed = false;
        document.body.classList.remove('selected-works-preview-ready');
        setSection3InteractiveReady(false);
        setSelectedWorksReady(false, 'leave back');
        setSelectedWorksPreviewVisibleReady(false, 'leave back');
        setSection3ClickThrough(false);
        setSection3HandoffComplete(false);
        setSection3InvertActive(false);
        if (maskEl) gsap.set(maskEl, { autoAlpha: 1, scale: 1 });
        deactivateExitCursor();
        setBridgeSelectable(false);
      },
    },
  });

  masterTl.to('#hero-sphere-wrap',
    { scale: () => getScale(), ease: 'power3.in', duration: 162.5 }, 0);
  masterTl.to('.hero-bh',
    {
      '--hero-lens-softness': 0,
      // Keep the lens detail/edge layers OFF as the hole zooms in (resting value
      // is 0). Ramping them up read as a stray ring inside the growing circle;
      // the 3D sphere underneath still carries the black-hole feel, just clean.
      '--hero-edge-fade': 0,
      '--hero-lens-detail-opacity': 0,
      ease: 'none',
      duration: 162.5,
    }, 0);

  if (document.querySelector('.corner-cross')) {
    masterTl.to('.corner-cross',
      { autoAlpha: 0, ease: 'none', duration: 100 }, 0);
  }
  // fromTo (not to) with an explicit autoAlpha:1 start so scrubbing back to the
  // top always restores the CTA. A plain .to() recorded its start value while
  // the intro/loader still had the CTA hidden, so it never came back on scroll-up.
  masterTl.fromTo('.hero-coords, .hero-cta',
    { autoAlpha: 1, y: 0 },
    { y: '-5vh', autoAlpha: 0, ease: 'power2.in', duration: 125, immediateRender: false }, 0);
  if (document.querySelector('.hero-left')) {
    masterTl.to('.hero-left',
      { x: '10vw', autoAlpha: 0, filter: 'blur(6px)', ease: 'power2.in', duration: 125 }, 0);
  }
  if (document.querySelector('.hero-tagline')) {
    masterTl.to('.hero-tagline',
      { x: '-10vw', autoAlpha: 0, filter: 'blur(6px)', ease: 'power2.in', duration: 125 }, 0);
  }
  masterTl.to('.panel--hero .hero-name, .panel--hero .hero-name--mask',
    { scale: 0.88, autoAlpha: 0, filter: 'blur(12px)', ease: 'power2.in', duration: 125 }, 0);

  masterTl.to('.hero-veil',
    { autoAlpha: 1, ease: 'power2.in', duration: 75 }, 112.5);

  masterTl.to('.heroOverlayLayer',
    { autoAlpha: 0, ease: 'power1.in', duration: 62.5 }, 175);

  updateHeroCircleClip();
  window.addEventListener('resize', () => requestAnimationFrame(updateHeroCircleClip), { passive: true });

  // Section 2 + bridge extended by ~30%. Hero portion positions are NOT
  // changed; only the about-wrap exit moves later (more readability), the
  // bridge starts later and lingers longer, and the empty hold extends to
  // keep the iris threshold (0.86) firing just after bridge fade-out.
  const section2AboutExitAt = isPhoneViewport ? 350 : 290;
  const section2BridgeInAt = isPhoneViewport ? 430 : 344;
  const section2BridgeBodyAt = isPhoneViewport ? 466 : 374;
  const section2BridgeOutAt = isPhoneViewport ? 548 : 444;
  const section2LayerOffAt = isPhoneViewport ? 574 : 466;
  const section2HoldDuration = isPhoneViewport ? 70 : 81;

  masterTl.to('.section2ContentLayer .about-wrap',
    {
      autoAlpha: 0,
      y: -28,
      filter: 'blur(4px)',
      ease: 'power2.inOut',
      duration: 50,
      onComplete: () => gsap.set('.section2ContentLayer .about-wrap', { pointerEvents: 'none' }),
      onReverseComplete: () => gsap.set('.section2ContentLayer .about-wrap', { pointerEvents: 'auto' }),
    }, section2AboutExitAt);

  if (section2Bridge) {
    // Section 2 about-wrap exit ends ~340; quiet beat (~4 units) before the
    // bridge so the thought-shift reads as intentional.
    masterTl.to(section2Bridge,
      { autoAlpha: 1, ease: 'power2.out', duration: 26 }, section2BridgeInAt);
    masterTl.to('.section2-bridge__title',
      { autoAlpha: 1, y: 0, ease: 'power3.out', duration: 28 }, section2BridgeInAt);
    // Body waits longer so "A little more" lands and lingers first.
    masterTl.to('.section2-bridge__body',
      { autoAlpha: 1, y: 0, ease: 'power3.out', duration: 24 }, section2BridgeBodyAt);
    masterTl.to('.section2-bridge__title, .section2-bridge__body',
      { autoAlpha: 0, y: -8, ease: 'power2.in', duration: 22 }, section2BridgeOutAt);
    masterTl.to(section2Bridge,
      { autoAlpha: 0, ease: 'power1.out', duration: 22 }, section2BridgeOutAt);
  }

  // One-time auto "peek" of the interactive word-morphs as About and the Bridge
  // first scroll into view, so visitors discover them without hovering — and so
  // touch users, who have no hover at all, see the effect at least once. Guarded
  // so it plays only the first time the playhead crosses (scrubbing back/forth
  // won't replay it); a real hover/tap mid-peek takes over cleanly.
  const peekWords = (selector, stagger) => {
    gsap.utils.toArray(selector + ' .word-morph').forEach((word, i) => {
      if (word._wordStage) gsap.delayedCall(i * stagger, () => word._wordStage.peek(1200));
    });
  };
  let aboutPeeked = false;
  let bridgePeeked = false;
  masterTl.call(() => {
    if (aboutPeeked) return;
    aboutPeeked = true;
    peekWords('.section2ContentLayer .about-wrap', 0.42);
  }, null, section2AboutExitAt - 35);
  if (section2Bridge) {
    masterTl.call(() => {
      if (bridgePeeked) return;
      bridgePeeked = true;
      peekWords('.section2-bridge', 0.5);
    }, null, section2BridgeOutAt - 45);
  }

  masterTl.to('.section2ContentLayer',
    { autoAlpha: 0, pointerEvents: 'none', ease: 'none', duration: 0.01 }, section2LayerOffAt);

  // Empty hold extended so total ~547. Iris threshold 0.86 → fires at
  // ~470 (just after bridge fully gone at 466).
  masterTl.to({ _: 0 }, { _: 1, duration: section2HoldDuration }, section2LayerOffAt);
  const getDistance = () => track ? Math.max(0, track.scrollWidth - window.innerWidth) : 0;
  const hasHorizontalDistance = () => getDistance() > 1;

  if (wrap && track && hasHorizontalDistance()) {
    const horizontalMultiplier = isPhoneViewport
      ? 1.08
      : (window.matchMedia('(max-width: 1024px)').matches ? 1.65 : 1.55);
    const selectedWorksHoldUnits = isPhoneViewport ? 0.2 : 0.42;
    const selectedWorksMoveUnits = 1;
    const selectedWorksHoldRatio = selectedWorksHoldUnits / (selectedWorksHoldUnits + selectedWorksMoveUnits);
    const getHorizontalMoveDistance = () => getDistance() * horizontalMultiplier;
    const getHorizontalScrollDistance = () => getHorizontalMoveDistance() * (selectedWorksHoldUnits + selectedWorksMoveUnits);

    horizontalTween = gsap.timeline({
      scrollTrigger: {
        id: 'horizontal-scroll',
        trigger: wrap,
        pin: true,
        start: 'top top',
        end: () => '+=' + getHorizontalScrollDistance(),
        scrub: isPhoneViewport ? 0.65 : 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onEnter(self) {
          DEBUG && debugLog('[WORK STATE] horizontal scroll enter');
          resetHorizontalHandoffY();
          logHorizontalHandoff('horizontal scroll starts', self);
        },
        onUpdate(self) {
          const moveProgress = self.progress <= selectedWorksHoldRatio
            ? 0
            : (self.progress - selectedWorksHoldRatio) / (1 - selectedWorksHoldRatio);
          if (moveProgress > 0.55) {
            setCursorState('contact');
          } else if (isSection3InteractiveReady) {
            setCursorState('work');
          }
        },
      },
    });
    horizontalTween
      .to(track, { x: 0, duration: selectedWorksHoldUnits, ease: 'none' })
      .to(track, { x: () => -getDistance(), duration: selectedWorksMoveUnits, ease: 'none' });
    gsap.set(track, { x: 0 });
  } else if (track) {
    gsap.set(track, { x: 0 });
  }

  const fill = document.querySelector('.scroll-indicator__fill');
  if (fill && wrap && hasHorizontalDistance()) {
    ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: () => '+=' + (horizontalTween?.scrollTrigger
        ? horizontalTween.scrollTrigger.end - horizontalTween.scrollTrigger.start
        : getDistance()),
      onUpdate: (self) => {
        fill.style.transform = `scaleX(${self.progress})`;
      }
    });
  } else if (fill) {
    fill.style.transform = 'scaleX(0)';
  }

  /* ---- Word-split helper: wrap every word in a mask + inner, preserve inline tags (b/i) ---- */
  function splitWords(root) {
    const words = [];
    const textNodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let n;
    while ((n = walker.nextNode())) textNodes.push(n);

    textNodes.forEach((node) => {
      const raw = node.nodeValue;
      if (!raw || !raw.trim()) return;
      const frag = document.createDocumentFragment();
      raw.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const mask  = document.createElement('span');
          const inner = document.createElement('span');
          mask.className  = 'word-mask';
          inner.className = 'word-inner';
          inner.textContent = part;
          mask.appendChild(inner);
          frag.appendChild(mask);
          words.push(inner);
        }
      });
      node.parentNode.replaceChild(frag, node);
    });
    return words;
  }

  /* ---- Scroll-driven color morph for ink-morph lines: light grey â†’ black ---- */
  const usesHorizontalTrack = (panel) => Boolean(horizontalTween && panel && panel.closest('.h-track'));

  const panelScrollConfig = (panel, horizontalStart, horizontalEnd, verticalStart, verticalEnd) => {
    if (usesHorizontalTrack(panel)) {
      return {
        trigger: panel,
        containerAnimation: horizontalTween,
        start: horizontalStart,
        end: horizontalEnd,
      };
    }

    return {
      trigger: panel,
      start: verticalStart,
      end: verticalEnd,
    };
  };

  gsap.utils.toArray('.panel .ink-morph').forEach((el) => {
    const panel = el.closest('.panel');
    if (panel?.classList.contains('panel--works')) return;
    gsap.fromTo(el,
      { color: '#adb5bd' },
      {
        color: '#000000',
        ease: 'none',
        scrollTrigger: {
          ...panelScrollConfig(panel, 'left 80%', 'left 20%', 'top 80%', 'top 20%'),
          scrub: 0.6,
        }
      }
    );
  });

  /* ---- Mask reveals per panel ---- */
  const panels = gsap.utils.toArray('.panel');

  panels.forEach((panel, i) => {
    const lines  = panel.querySelectorAll('.d-line > span');
    const extras = panel.querySelectorAll('.eyebrow, .hero-tag, .roles, .cta-lead, .pill, .works-list, .contact-mail, .or-divider, .socials, .contact-meta, .hero-left, .hero-tagline, .hero-coords, .hero-cta');

    // Skip panels that must not use containerAnimation:
    // panel--works: first panel in h-track (x=0), containerAnimation can't trigger it
    if (panel.classList.contains('panel--works')) return;

    // Hero panel: the black name and clipped white name reveal as one gesture
    // after the loader hands off to the real sphere. See loader tl.
    if (i === 0) {
      const maskName  = panel.querySelector('.hero-name--mask');
      const blackName = panel.querySelector('.hero-name:not(.hero-name--mask)');
      const blackLines = blackName ? blackName.querySelectorAll('.d-line > span') : [];
      const maskLines  = maskName  ? maskName.querySelectorAll('.d-line > span')  : [];
      const allLines = [...blackLines, ...maskLines];
      const isMobileHeroIntro = window.matchMedia('(max-width: 640px)').matches;
      const heroLineY = isMobileHeroIntro ? 28 : 40;
      const heroExtraY = isMobileHeroIntro ? 18 : 24;
      const heroIntroStart = isMobileHeroIntro ? 0.35 : 0.45;
      const heroIntroDuration = isMobileHeroIntro ? 1.18 : 1.35;
      const heroIntroStagger = isMobileHeroIntro ? 0.11 : 0.16;

      if (allLines.length) gsap.set(allLines, { autoAlpha: 0, y: heroLineY, force3D: true });
      if (extras.length)   gsap.set(extras,   { autoAlpha: 0, y: heroExtraY, force3D: true });
      // white inversion starts collapsed (clip radius 0) so it can bloom out of
      // the ball centre. We drive the clip-path string directly (a gsap tween on
      // a CSS custom property is unreliable), reverting to the stylesheet at the end.
      const setMaskClip = (px) => {
        if (maskName) maskName.style.clipPath =
          `circle(${px}px at var(--hero-bh-clip-x) var(--hero-bh-clip-y))`;
      };
      setMaskClip(0);

      let heroRevealed = false;
      const revealHero = () => {
        if (heroRevealed) return;
        heroRevealed = true;
        document.body.classList.add('hero-intro-started');

        // Deep reload (curtain shrank to the cursor, not the hero): the hero is
        // off-screen up top, so DON'T play the bloom/name intro — that animation
        // firing at scroll 0 is the "black flickering ball". Snap the hero to its
        // resting state instead, so it's correct if the user scrolls back up.
        if (getReloadLoaderCursorTarget()) {
          if (blackLines.length) gsap.set(blackLines, { autoAlpha: 1, y: 0 });
          if (maskLines.length)  gsap.set(maskLines,  { autoAlpha: 1, y: 0 });
          if (extras.length)     gsap.set(extras,     { autoAlpha: 1, y: 0 });
          if (maskName) maskName.style.clipPath = ''; // resting radius from stylesheet
          return;
        }

        const introTl = gsap.timeline();
        // The black name and the clipped white name are the same reveal, so
        // animate both copies in lockstep instead of letting one chase the other.
        if (blackLines.length) {
          introTl.to(blackLines, {
            autoAlpha: 1, y: 0, duration: heroIntroDuration, ease: 'power3.out',
            stagger: heroIntroStagger, force3D: true,
          }, heroIntroStart);
        }
        if (maskLines.length) {
          introTl.to(maskLines, {
            autoAlpha: 1, y: 0, duration: heroIntroDuration, ease: 'power3.out',
            stagger: heroIntroStagger, force3D: true,
          }, heroIntroStart);
        }
        // The white inversion blooms with the name, not after it.
        if (maskName) {
          const clipSrc = sphereEl
            ? (sphereEl.querySelector('.hero-bh-lens') || sphereEl) : null;
          const rect = clipSrc ? clipSrc.getBoundingClientRect() : null;
          const sphereR = rect ? Math.max(rect.width, rect.height) / 2 : 360;
          const bloom = { r: 0 };
          introTl.to(bloom, {
            r: sphereR, duration: isMobileHeroIntro ? 1.04 : 1.15, ease: 'expo.out',
            onUpdate: () => setMaskClip(bloom.r),
            onComplete: () => { maskName.style.clipPath = ''; }, // revert to stylesheet (resting radius)
          }, heroIntroStart);
        }
        if (extras.length) {
          introTl.to(extras, {
            autoAlpha: 1, y: 0, duration: 1.0, ease: 'power3.out',
            stagger: 0.1, force3D: true,
          }, isMobileHeroIntro ? 1.28 : 1.5);
        }
      };

      // Fire on the loader handoff, but never depend on it alone — if the loader
      // intro is delayed (e.g. tab loaded unfocused) the reveal still plays.
      loaderDone.then(revealHero);
      setTimeout(() => {
        if (!document.body.classList.contains('is-loading')) revealHero();
      }, 5600);
      return;
    }

    // OTHER panels â€” scrub-driven reveals so motion is always tied to scroll
    if (lines.length) {
      gsap.set(lines, { yPercent: 110 });
      gsap.to(lines, {
        yPercent: 0,
        ease: 'power2.out',
        stagger: 0.1,
        scrollTrigger: {
          ...panelScrollConfig(panel, 'left 75%', 'left 20%', 'top 78%', 'top 30%'),
          scrub: 0.8,
        }
      });
    }
    if (extras.length) {
      gsap.set(extras, { opacity: 0, y: 20 });
      gsap.to(extras, {
        opacity: 1,
        y: 0,
        ease: 'none',
        stagger: 0.06,
        scrollTrigger: {
          ...panelScrollConfig(panel, 'left 70%', 'left 10%', 'top 74%', 'top 22%'),
          scrub: 0.8,
        }
      });
    }
  });

  /* ---- Safety net: force hero elements visible after the choreographed
         intro would have finished (~3.5s after loader is done), but only if
         the user hasn't scrolled into the zoom zone yet ---- */
  loaderDone.then(() => setTimeout(() => {
    if (window.scrollY < 50) {
      document.querySelectorAll('.panel--hero .d-line > span, .panel--hero .hero-left, .panel--hero .hero-tagline, .panel--hero .hero-coords, .panel--hero .hero-cta')
        .forEach(el => {
          const cs = getComputedStyle(el);
          if (parseFloat(cs.opacity) < 0.1) el.style.opacity = '1';
        });
    }
  }, 3500));

  // Recalculate on resize (font load / rotate)
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());

} else {
  /* ---------- Fallback: mobile / reduced-motion â€” no horizontal trick ---------- */
  // Still reveal the big italic lines as each panel enters the vertical viewport.
  if (!reduceMotion && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const setupMobileHeroZoom = () => {
      if (!window.matchMedia('(max-width: 640px)').matches) return;

      const sphereEl = document.getElementById('hero-sphere-wrap');
      const heroPanel = document.querySelector('.panel--hero');
      const heroClipSource = sphereEl?.querySelector('.hero-bh-lens') || sphereEl;
      const transitionScene = document.querySelector('.heroToSection2Scene');
      const heroOverlayLayer = document.querySelector('.heroOverlayLayer');
      const heroVeil = document.querySelector('.hero-veil');

      if (!sphereEl || !heroPanel || !transitionScene || !heroOverlayLayer) return;

      const updateHeroCircleClip = () => {
        const panelRect = heroPanel.getBoundingClientRect();
        const circleRect = heroClipSource.getBoundingClientRect();
        heroPanel.style.setProperty('--hero-bh-clip-x', `${circleRect.left + circleRect.width / 2 - panelRect.left}px`);
        heroPanel.style.setProperty('--hero-bh-clip-y', `${circleRect.top + circleRect.height / 2 - panelRect.top}px`);
        heroPanel.style.setProperty('--hero-bh-clip-r', `${Math.max(circleRect.width, circleRect.height) / 2}px`);
      };

      // Static hero state. The pinned zoom-to-black timeline used to live here
      // but it pinned the hero scene and hid the about/works on phones — removed.
      // The hero is now a plain 100svh section the user scrolls past.
      gsap.set(heroOverlayLayer, { autoAlpha: 1 });
      gsap.set(heroVeil, { autoAlpha: 0 });
      gsap.set(sphereEl, { scale: 1, transformOrigin: 'center center' });
      updateHeroCircleClip();

      window.addEventListener('resize', () => {
        requestAnimationFrame(() => {
          updateHeroCircleClip();
          ScrollTrigger.refresh();
        });
      }, { passive: true });
      document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
    };

    setupMobileHeroZoom();

    /* ---- Mobile scroll reveals (IntersectionObserver) ----
       Reliable, native rise+fade as each piece enters the viewport — mimics the
       desktop reveals without depending on ScrollTrigger/Lenis (which were flaky
       on touch). Inline styles beat any CSS reveal states (e.g. the bridge). */
    const revealGroups = [
      '.section2ContentLayer .eyebrow, .section2ContentLayer .prose, .section2ContentLayer .cta-lead, .section2ContentLayer .pill',
      '.section2-bridge__title, .section2-bridge__body',
      '.panel--works .works-title .d-line > span, .panel--works .work-row, .panel--works .pill--center',
      '.panel--contact .eyebrow, .panel--contact .connect-title .d-line > span, .panel--contact .contact-mail, .panel--contact .or-divider, .panel--contact .socials, .panel--contact .contact-meta',
    ];
    const revealEls = [];
    revealGroups.forEach((sel) => {
      const els = [...document.querySelectorAll(sel)];
      els.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(26px)';
        el.style.transition = 'opacity .8s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1)';
        el.style.transitionDelay = Math.min(i, 6) * 0.07 + 's';
        el.style.willChange = 'opacity, transform';
        revealEls.push(el);
      });
    });
    const showEl = (el) => {
      if (el.dataset.mShown) return;
      el.dataset.mShown = '1';
      el.style.opacity = '1';
      el.style.visibility = 'visible';   // beat any autoAlpha:0 (visibility:hidden)
      el.style.transform = 'none';
    };
    // Native scroll-driven reveal: when an element rises into the lower part of
    // the viewport, it fades/rises in. Plain scroll events — no ScrollTrigger,
    // no IntersectionObserver timing quirks — so it can't silently fail.
    const checkReveal = () => {
      const vh = window.innerHeight || 800;
      for (const el of revealEls) {
        if (el.dataset.mShown) continue;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) showEl(el);
      }
    };
    window.addEventListener('scroll', checkReveal, { passive: true });
    window.addEventListener('resize', checkReveal, { passive: true });
    checkReveal();                                    // reveal whatever is already in view
    // Re-check after layout/fonts settle so nothing in view stays hidden, and as
    // a last-ditch guarantee reveal everything if the user never scrolls at all.
    [400, 1200, 2500].forEach((t) => setTimeout(checkReveal, t));
    document.fonts && document.fonts.ready.then(checkReveal);
    window.addEventListener('load', () => setTimeout(() => revealEls.forEach(showEl), 12000));

    /* ---- Hero pin + "ball grows" (desktop-style overlap) ----
       The hero is held at the top for one viewport via a transform (a JS pin —
       sticky was unreliable here), the sphere scales up and the name fades, and
       the dark About (z-index 2) slides UP over the growing black hole. */
    const heroLayerM  = document.querySelector('.heroOverlayLayer');
    const heroSphereM = document.getElementById('hero-sphere-wrap');
    const heroNamesM  = document.querySelectorAll('.panel--hero .hero-name');
    const heroCtaM    = document.querySelector('.panel--hero .hero-cta');
    const onHeroScroll = () => {
      const h = window.innerHeight || 800;
      const y = window.scrollY || 0;
      const pinDist = h;                                  // pin for one viewport
      // hold the hero at the top until the About has slid up to cover it
      if (heroLayerM) heroLayerM.style.transform = `translate3d(0, ${Math.min(y, pinDist)}px, 0)`;
      const p = Math.min(1, Math.max(0, y / (h * 0.92)));
      if (heroSphereM) {
        const s = 1 + p * 2.2;                            // 1 → 3.2 : the ball gets big
        heroSphereM.style.transform = `translate(-50%, -50%) translateZ(0) scale(${s})`;
      }
      const fade = Math.max(0, 1 - p * 1.5);
      heroNamesM.forEach((n) => { n.style.opacity = fade; });
      if (heroCtaM) heroCtaM.style.opacity = Math.max(0, 1 - p * 2.4);
    };
    window.addEventListener('scroll', onHeroScroll, { passive: true });
    window.addEventListener('resize', onHeroScroll, { passive: true });
    onHeroScroll();
  } else {
    // No GSAP / reduced motion â€” just show everything
    document.querySelectorAll('.d-line > span').forEach(s => s.style.transform = 'none');
    document.querySelectorAll('.eyebrow, .hero-tag, .roles, .prose, .cta-lead, .pill, .works-list, .contact-mail, .or-divider, .socials, .contact-meta, .hero-left, .hero-tagline, .hero-coords, .hero-cta')
      .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
  }
}

/* ---------- 2c. Deterministic initial scroll position ----------
   Runs once the loader is done (so the ScrollTriggers exist and the page is
   covered while we move). Resolves an incoming #works/#contact to a real
   scroll position instead of a broken native anchor jump, and otherwise
   guarantees we start at the hero — fixing the "refresh jumps to section 2"
   and "back to Selected Works corrupts the horizontal scroll" bugs. */
let initialScrollApplied = false;
let projectReturnRevealPlayed = false;
let projectReturnMaintainUntil = 0;
let projectReturnMaintainRaf = 0;

function syncProjectReturnWorksState() {
  if (!isProjectReturnToWorks) return;
  const transitionScene = document.querySelector('.heroToSection2Scene');
  transitionScene?.classList.add(
    'is-section3-handoff-complete',
    'is-section3-pointer-through',
    'is-section3-click-through',
  );
  document.body.classList.add(
    'section3-ready',
    'selected-works-ready',
    'selected-works-preview-ready',
    'selected-works-preview-visible-ready',
  );
  const section3Real = document.querySelector('.section3-real-content');
  if (section3Real) section3Real.style.pointerEvents = 'auto';
  section3Real?.querySelectorAll('.work-row, .work-row > a').forEach((el) => {
    el.style.pointerEvents = 'auto';
  });
  window.dispatchEvent(new CustomEvent('selectedworksready', { detail: { ready: true } }));
  window.dispatchEvent(new CustomEvent('selectedworkspreviewready', { detail: { ready: true } }));
  window.dispatchEvent(new CustomEvent('projectreturnworksstate', { detail: { ready: true } }));
  setCursorState('work');
}

function revealProjectReturnLanding() {
  if (!isProjectReturnToWorks || projectReturnRevealPlayed) return;
  projectReturnRevealPlayed = true;
  const loader = document.getElementById('loader');
  const origin = getProjectReturnOriginForHome();
  const liveOrigin = { ...origin };
  const updateLiveOrigin = (event) => {
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
    liveOrigin.x = event.clientX;
    liveOrigin.y = event.clientY;
    liveOrigin.startR = 22;
  };
  window.addEventListener('pointermove', updateLiveOrigin, { passive: true });
  window.addEventListener('mousemove', updateLiveOrigin, { passive: true });
  const coverR = Math.max(
    getProjectReturnCoverRadius(origin.x, origin.y),
    Math.ceil(Math.hypot(window.innerWidth, window.innerHeight)) + 8,
  );
  const finish = () => {
    window.removeEventListener('pointermove', updateLiveOrigin);
    window.removeEventListener('mousemove', updateLiveOrigin);
    const cursor = document.querySelector('.cursor');
    if (cursor && Number.isFinite(liveOrigin.x) && Number.isFinite(liveOrigin.y)) {
      if (window.gsap) {
        gsap.set(cursor, { x: liveOrigin.x, y: liveOrigin.y, opacity: 1, scaleX: 1, scaleY: 1, rotation: 0 });
      } else {
        cursor.style.opacity = '1';
      }
    }
    if (loader) loader.remove();
    document.documentElement.classList.remove('from-project-return');
    document.body.classList.remove('is-project-return', 'project-return-home-ready');
    try {
      sessionStorage.removeItem('portfolioProjectReturn');
      sessionStorage.removeItem('portfolioProjectReturnAt');
      sessionStorage.removeItem(PROJECT_RETURN_ORIGIN_KEY);
    } catch (_) {}
    try {
      const cleanParams = new URLSearchParams(location.search);
      cleanParams.delete('return');
      const cleanQuery = cleanParams.toString();
      history.replaceState(null, '', `${location.pathname}${cleanQuery ? `?${cleanQuery}` : ''}`);
    } catch (_) {}
  };

  document.body.classList.add('project-return-home-ready');
  if (!loader) {
    finish();
    return;
  }

  const state = { r: coverR };
  const targetR = () => Math.max(0, liveOrigin.startR || 22);
  const setClip = () => {
    const circle = `circle(${Math.max(0, state.r)}px at ${liveOrigin.x}px ${liveOrigin.y}px)`;
    loader.style.clipPath = circle;
    loader.style.webkitClipPath = circle;
  };
  setClip();
  if (window.gsap && !reduceMotion) {
    gsap.killTweensOf(loader);
    gsap.set(loader, { autoAlpha: 1, pointerEvents: 'auto' });
    const returnTl = gsap.timeline({ onComplete: finish });
    returnTl.to(state, {
      r: targetR(),
      duration: 0.56,
      ease: 'power3.inOut',
      onUpdate: setClip,
    }, 0);
    returnTl.to(loader, {
      autoAlpha: 0,
      duration: 0.18,
      ease: 'power2.out',
    }, 0.38);
  } else {
    state.r = targetR;
    setClip();
    setTimeout(finish, 80);
  }
}

function getProjectReturnOriginForHome() {
  try {
    const raw = sessionStorage.getItem(PROJECT_RETURN_ORIGIN_KEY);
    if (raw) {
      const stored = JSON.parse(raw);
      const x = Number.isFinite(stored.xPct)
        ? stored.xPct * window.innerWidth
        : Number(stored.x);
      const y = Number.isFinite(stored.yPct)
        ? stored.yPct * window.innerHeight
        : Number(stored.y);
      const xPct = Number.isFinite(stored.xPct) ? stored.xPct : x / Math.max(1, window.innerWidth);
      const yPct = Number.isFinite(stored.yPct) ? stored.yPct : y / Math.max(1, window.innerHeight);
      const source = String(stored.source || '');
      const looksLikeTopRightChrome = xPct > 0.72 && yPct < 0.18 && source !== 'content-pointer' && source !== 'project-cursor' && source !== 'live-pointer';
      if (looksLikeTopRightChrome) {
        return {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          startR: 22,
        };
      }
      return {
        x: Number.isFinite(x) ? x : window.innerWidth / 2,
        y: Number.isFinite(y) ? y : window.innerHeight / 2,
        startR: Number.isFinite(stored.startR) ? stored.startR : 22,
      };
    }
  } catch (_) {}

  const cursor = document.querySelector('.cursor');
  if (cursor) {
    const rect = cursor.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        startR: Math.max(rect.width, rect.height) / 2,
      };
    }
  }

  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    startR: 22,
  };
}

function getProjectReturnCoverRadius(x, y) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return Math.ceil(Math.max(
    Math.hypot(x, y),
    Math.hypot(w - x, y),
    Math.hypot(x, h - y),
    Math.hypot(w - x, h - y),
  )) + 8;
}

function getProjectReturnWorksY() {
  if (window.ScrollTrigger) {
    const hs = ScrollTrigger.getById('horizontal-scroll');
    if (hs) return hs.start;
    const ms = ScrollTrigger.getById('hero-transition');
    if (ms) return ms.end;
  }
  return window.innerHeight * 4;
}

function jumpToScrollY(y) {
  if (typeof lenis !== 'undefined' && lenis && typeof lenis.scrollTo === 'function') {
    if (typeof lenis.start === 'function') lenis.start();
    lenis.scrollTo(y, { immediate: true, force: true });
  } else {
    window.scrollTo(0, y);
  }
}

function getCurrentScrollYForReload() {
  const lenisY = (typeof lenis !== 'undefined' && lenis) ? lenis.scroll : NaN;
  const y = Number.isFinite(Number(lenisY)) ? Number(lenisY) : window.scrollY;
  return Math.max(0, Math.round(y || 0));
}

function isReloadNavigation() {
  try {
    const entry = performance.getEntriesByType?.('navigation')?.[0];
    if (entry?.type) return entry.type === 'reload';
  } catch (_) {}
  try {
    return performance.navigation?.type === 1;
  } catch (_) {
    return false;
  }
}

function getReloadScrollY() {
  if (isProjectReturnToWorks || initialSectionHash || !isReloadNavigation()) return null;
  try {
    if (sessionStorage.getItem(INDEX_RELOAD_PATH_KEY) !== location.pathname) return null;
    const value = Number(sessionStorage.getItem(INDEX_RELOAD_SCROLL_KEY));
    return Number.isFinite(value) ? Math.max(0, value) : null;
  } catch (_) {
    return null;
  }
}

window.addEventListener('pagehide', () => {
  try {
    sessionStorage.setItem(INDEX_RELOAD_PATH_KEY, location.pathname);
    sessionStorage.setItem(INDEX_RELOAD_SCROLL_KEY, String(getCurrentScrollYForReload()));
    sessionStorage.setItem(INDEX_RELOAD_CURSOR_KEY, JSON.stringify({
      x: lastKnownCursorForReload.x,
      y: lastKnownCursorForReload.y,
      xPct: lastKnownCursorForReload.x / Math.max(1, window.innerWidth),
      yPct: lastKnownCursorForReload.y / Math.max(1, window.innerHeight),
      r: 22,
    }));
  } catch (_) {}
});

function settleProjectReturnLanding(attempt = 0) {
  if (!isProjectReturnToWorks || projectReturnRevealPlayed) return;
  const y = getProjectReturnWorksY();
  jumpToScrollY(y);
  if (window.ScrollTrigger) ScrollTrigger.update();
  syncProjectReturnWorksState();

  const lenisY = (typeof lenis !== 'undefined' && lenis) ? lenis.scroll : window.scrollY;
  const currentY = Number(lenisY) || window.scrollY;
  const isClose = Math.abs(currentY - y) < 4 || Math.abs(window.scrollY - y) < 4;
  const hasMaster = !window.ScrollTrigger || !!ScrollTrigger.getById('hero-transition');
  const worksTop = document.querySelector('.panel--works')?.getBoundingClientRect().top;
  const worksAligned = !Number.isFinite(worksTop) || Math.abs(worksTop) < 6;
  if (attempt < 3 && (!hasMaster || !isClose || !worksAligned)) {
    setTimeout(() => settleProjectReturnLanding(attempt + 1), 80);
    return;
  }

  maintainProjectReturnWorksPosition(1600);
  requestAnimationFrame(revealProjectReturnLanding);
}

function maintainProjectReturnWorksPosition(duration = 2200) {
  if (!isProjectReturnToWorks) return;
  projectReturnMaintainUntil = Math.max(projectReturnMaintainUntil, performance.now() + duration);
  if (projectReturnMaintainRaf) return;

  const tick = () => {
    const now = performance.now();
    if (now > projectReturnMaintainUntil) {
      projectReturnMaintainRaf = 0;
      return;
    }

    const y = getProjectReturnWorksY();
    const worksTop = document.querySelector('.panel--works')?.getBoundingClientRect().top;
    const lenisY = (typeof lenis !== 'undefined' && lenis) ? lenis.scroll : window.scrollY;
    const currentY = Number(lenisY) || window.scrollY;
    const needsCorrection = Math.abs(currentY - y) > 3 ||
      Math.abs(window.scrollY - y) > 3 ||
      (Number.isFinite(worksTop) && Math.abs(worksTop) > 6);

    if (needsCorrection) {
      jumpToScrollY(y);
      if (window.ScrollTrigger) ScrollTrigger.update();
      syncProjectReturnWorksState();
    }

    projectReturnMaintainRaf = requestAnimationFrame(tick);
  };

  projectReturnMaintainRaf = requestAnimationFrame(tick);
}

function applyInitialScroll() {
  if (initialScrollApplied) return;
  initialScrollApplied = true;
  if (window.ScrollTrigger) ScrollTrigger.refresh();

  let y = 0;
  const hash = isProjectReturnToWorks ? '#works' : initialSectionHash;
  const reloadY = getReloadScrollY();
  if (reloadY !== null) {
    y = reloadY;
  } else if (hash === '#works' || hash === '#contact') {
    const ms = window.ScrollTrigger ? ScrollTrigger.getById('hero-transition') : null;
    const hs = window.ScrollTrigger ? ScrollTrigger.getById('horizontal-scroll') : null;
    if (hs || ms) {
      if (hash === '#works') y = hs ? hs.start : ms.end;
      else                   y = hs ? hs.end - 4 : ms.end + window.innerHeight;
    } else {
      // Mobile / no desktop choreography → resolve to the real element position.
      const el = document.querySelector(hash === '#works' ? '.panel--works' : '.panel--contact');
      if (el) y = Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 1));
    }
  }

  if (typeof lenis !== 'undefined' && lenis && typeof lenis.scrollTo === 'function') {
    lenis.scrollTo(y, { immediate: true, force: true });
  } else {
    window.scrollTo(0, y);
  }
  if (window.ScrollTrigger) ScrollTrigger.update();
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('is-reload-restoring');
  });
  if (isProjectReturnToWorks) {
    settleProjectReturnLanding();
  }
}

// Must run AFTER the loader removes `is-loading` (body overflow:hidden during the
// loader clamps any scrollTo to 0). Wait for that class to drop, then position.
function runInitialScrollWhenReady() {
  if (!document.body.classList.contains('is-loading')) {
    requestAnimationFrame(() => requestAnimationFrame(applyInitialScroll));
    return;
  }
  const obs = new MutationObserver(() => {
    if (!document.body.classList.contains('is-loading')) {
      obs.disconnect();
      requestAnimationFrame(() => requestAnimationFrame(applyInitialScroll));
    }
  });
  obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  // Belt-and-braces: never wait forever (run-once guarded).
  setTimeout(applyInitialScroll, 9000);
}
runInitialScrollWhenReady();

/* ---------- 2d. Magnetic hover on key interactive elements ---------- */
if (!reduceMotion && !isMobile && window.gsap) {
  const magnetic = document.querySelectorAll('.pill, .socials a, .contact-mail, .avail-badge');
  magnetic.forEach((el) => {
    const strength = el.classList.contains('pill') ? 0.35 : 0.22;

    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top  + r.height / 2);
      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: 'power3.out',
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0, y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.45)',
      });
    });
  });
}

/* ---------- 3. Site menu — full-screen circular reveal ---------- */
(() => {
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('site-menu');
  const closeBtn = document.getElementById('site-menu-close');
  if (!menuBtn || !menu || !window.gsap) return;

  const links = Array.from(menu.querySelectorAll('.site-menu__list a'));
  const meta = menu.querySelector('.site-menu__meta');
  let isOpen = false;
  let openTl = null;
  let closeTl = null;

  // ---- Section-aware nav contrast (body.nav-on-dark) ----
  // Hero / Selected Works / contact have light backgrounds. Section 2 + bridge
  // are dark. Poll the master ScrollTrigger progress and toggle the body class.
  if (window.ScrollTrigger) {
    const wireNavContrast = () => {
      const master = ScrollTrigger.getById('hero-transition');
      if (!master) { setTimeout(wireNavContrast, 60); return; }
      const apply = () => {
        const p = master.progress;
        // Section 2 visible roughly 0.50, bridge ends/iris fires ~0.86.
        const onDark = p >= 0.45 && p < 0.86;
        document.body.classList.toggle('nav-on-dark', onDark);
      };
      gsap.ticker.add(apply);
      apply();
    };
    wireNavContrast();
  }

  // Source priority is driven by the SECTION first, not by element presence.
  // The hero sphere (#hero-sphere-wrap) exists in the DOM everywhere; after
  // the masterTl zoom it's huge and partially intersects the viewport even
  // when the user is in Selected Works — so a naive "is it in viewport?"
  // check made it win in every section. Use detectSection() to gate.
  const CURSOR_SELECTOR = '.cursor';
  const getMenuRevealOrigin = (event) => {
    const section = detectSection();

    // 1) Selected Works → real Section 3 cursor element.
    if (section === 'selected-works') {
      const cur = document.querySelector(CURSOR_SELECTOR);
      if (cur) {
        const r = cur.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          DEBUG && debugLog('[MENU DEBUG] using works cursor', true);
          DEBUG && debugLog('[MENU DEBUG] works cursor selector', CURSOR_SELECTOR);
          DEBUG && debugLog('[MENU DEBUG] works cursor rect', {
            left: Math.round(r.left), top: Math.round(r.top),
            width: Math.round(r.width), height: Math.round(r.height),
          });
          DEBUG && debugLog('[MENU DEBUG] hero circle rejected because not in hero');
          return {
            x: r.left + r.width / 2,
            y: r.top + r.height / 2,
            startR: Math.max(r.width, r.height) / 2,
            source: 'works-cursor',
          };
        }
      }
      // Cursor missing or zero-sized — fall through to hamburger fallback.
    }

    // 2) Hero → sphere center, but ONLY when the section is actually hero.
    if (section === 'hero') {
      const heroCircle = document.getElementById('hero-sphere-wrap');
      if (heroCircle) {
        const r = heroCircle.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          return {
            x: r.left + r.width / 2,
            y: r.top + r.height / 2,
            startR: Math.max(r.width, r.height) / 2,
            source: 'hero-circle',
          };
        }
      }
    }

    // 3) Section 2 / bridge / contact / unknown → click coords if available,
    //    else hamburger center.
    if (event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
      return {
        x: event.clientX,
        y: event.clientY,
        startR: 22,
        source: 'click',
      };
    }
    const r = menuBtn.getBoundingClientRect();
    return {
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
      startR: Math.max(r.width, r.height) / 2,
      source: 'hamburger',
    };
  };

  const getLiveCursorOrigin = () => {
    const cur = document.querySelector(CURSOR_SELECTOR);
    if (cur) {
      const cs = getComputedStyle(cur);
      const r = cur.getBoundingClientRect();
      if (cs.display !== 'none' && r.width > 0 && r.height > 0) {
        return {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
          startR: Math.max(r.width, r.height) / 2,
          source: 'live-cursor',
        };
      }
    }

    if (lastKnownCursorForReload.live) {
      return {
        x: Math.min(Math.max(lastKnownCursorForReload.x, 0), window.innerWidth),
        y: Math.min(Math.max(lastKnownCursorForReload.y, 0), window.innerHeight),
        startR: 22,
        source: 'live-pointer',
      };
    }

    return null;
  };

  const getMenuCloseOrigin = () => {
    const section = detectSection();
    if (section !== 'hero') {
      const cursorOrigin = getLiveCursorOrigin();
      if (cursorOrigin) {
        DEBUG && debugLog('[MENU DEBUG] close using cursor origin', cursorOrigin.source, {
          x: Math.round(cursorOrigin.x),
          y: Math.round(cursorOrigin.y),
          startR: Math.round(cursorOrigin.startR),
          section,
        });
        return cursorOrigin;
      }
    }
    return getMenuRevealOrigin();
  };

  const getCoverRadius = (x, y) => {
    const w = window.innerWidth, h = window.innerHeight;
    return Math.ceil(Math.max(
      Math.hypot(x, y),
      Math.hypot(w - x, y),
      Math.hypot(x, h - y),
      Math.hypot(w - x, h - y),
    )) + 8;
  };

  const setClipR = (val) => menu.style.setProperty('--menu-r', `${val}px`);

  // ---- Section detector for debug ----
  const detectSection = () => {
    const ms = window.ScrollTrigger ? ScrollTrigger.getById('hero-transition') : null;
    const hs = window.ScrollTrigger ? ScrollTrigger.getById('horizontal-scroll') : null;
    if (hs && hs.progress > 0 && hs.progress < 1) {
      return hs.progress > 0.72 ? 'contact' : 'selected-works';
    }
    if (hs && hs.progress >= 1) return 'contact';
    if (!ms) return 'unknown';
    const p = ms.progress;
    if (p < 0.40) return 'hero';
    if (p < 0.62) return 'section-2';
    if (p < 0.85) return 'bridge';
    return 'selected-works';
  };

  const openMenu = (event) => {
    DEBUG && debugLog('[MENU DEBUG] open clicked', event ? { x: event.clientX, y: event.clientY, type: event.type } : '(no event)');
    if (isOpen) {
      DEBUG && debugLog('[MENU DEBUG] open ignored — already open');
      return;
    }
    isOpen = true;
    if (closeTl) { DEBUG && debugLog('[MENU DEBUG] killing in-flight closeTl'); closeTl.kill(); closeTl = null; }

    // ---- Pre-flight diagnostics ----
    const section = detectSection();
    DEBUG && debugLog('[MENU DEBUG] current section', section);

    // Cursor element introspection
    const cursorEl = document.querySelector('.cursor');
    const cursorFound = Boolean(cursorEl);
    DEBUG && debugLog('[MENU DEBUG] selected works cursor found', cursorFound, cursorEl);
    if (cursorEl) {
      const cr = cursorEl.getBoundingClientRect();
      DEBUG && debugLog('[MENU DEBUG] selected works cursor rect', {
        left: Math.round(cr.left), top: Math.round(cr.top),
        width: Math.round(cr.width), height: Math.round(cr.height),
        cx: Math.round(cr.left + cr.width / 2), cy: Math.round(cr.top + cr.height / 2),
      });
      const cs = getComputedStyle(cursorEl);
      DEBUG && debugLog('[MENU DEBUG] cursor computed', {
        opacity: cs.opacity, visibility: cs.visibility, display: cs.display,
      });
    }
    DEBUG && debugLog('[MENU DEBUG] body classes', Array.from(document.body.classList));

    // Overlay element introspection — confirm we have ONE menu overlay
    const allMenuOverlays = document.querySelectorAll('.site-menu, [id="site-menu"], [class*="menu-overlay"]');
    DEBUG && debugLog('[MENU DEBUG] overlay element', menu);
    DEBUG && debugLog('[MENU DEBUG] overlay element count (selector survey)', allMenuOverlays.length, allMenuOverlays);
    DEBUG && debugLog('[MENU DEBUG] overlay clip before', getComputedStyle(menu).clipPath);
    DEBUG && debugLog('[MENU DEBUG] overlay computed before', {
      visibility: getComputedStyle(menu).visibility,
      pointerEvents: getComputedStyle(menu).pointerEvents,
      background: getComputedStyle(menu).backgroundColor,
      zIndex: getComputedStyle(menu).zIndex,
    });

    // Active GSAP tweens on this overlay
    const existingTweens = gsap.getTweensOf(menu);
    DEBUG && debugLog('[MENU DEBUG] existing tweens on overlay', existingTweens.length, existingTweens);

    const origin = getMenuRevealOrigin(event);
    const r = getCoverRadius(origin.x, origin.y);
    const fromDark = document.body.classList.contains('nav-on-dark');
    DEBUG && debugLog('[MENU DEBUG] source type', origin.source);
    DEBUG && debugLog('[MENU DEBUG] final source type', origin.source);
    DEBUG && debugLog('[MENU DEBUG] origin x y', { x: Math.round(origin.x), y: Math.round(origin.y) });
    DEBUG && debugLog('[MENU DEBUG] start radius', Math.round(origin.startR));
    DEBUG && debugLog('[MENU DEBUG] target radius', r);
    DEBUG && debugLog('[MENU DEBUG] theme', fromDark ? 'is-light (cream)' : 'default (black)');
    DEBUG && debugLog('[MENU DEBUG] using last section reveal logic', !fromDark && origin.source !== 'hero-circle');

    // Cursor inversion — applied for Selected Works and Contact, where the
    // page background is light(ish) but the menu overlay is BLACK, and the
    // cursor itself is also black so it'd disappear against the menu. The
    // class flips the cursor cream and bumps it above the menu so it's
    // visible as the reveal source. Section 2 / bridge already use the
    // cream "is-light" menu, so the black cursor is visible there without
    // inversion. Hero uses the sphere itself as the source — no cursor.
    const invertCursor = section === 'selected-works' || section === 'contact';
    if (invertCursor) {
      const cursorEl = document.querySelector('.cursor');
      if (cursorEl) {
        cursorEl.classList.add('is-menu-invert');
        DEBUG && debugLog('[MENU DEBUG] cursor invert applied (.cursor → .is-menu-invert)', '| section:', section);
      }
    }
    if (fromDark && cursorEl) {
      cursorEl.classList.remove('is-menu-invert');
      cursorEl.classList.add('is-menu-on-light');
      DEBUG && debugLog('[MENU DEBUG] menu cursor contrast applied is-menu-on-light | section:', section);
    } else if (cursorEl) {
      cursorEl.classList.remove('is-menu-on-light');
    }

    DEBUG && debugLog('[MENU SOURCE] section', fromDark ? 'dark (Section 2 / bridge)' : 'light');
    DEBUG && debugLog('[MENU SOURCE] theme', fromDark ? 'is-light (cream menu, dark text)' : 'default (black menu, cream text)');
    DEBUG && debugLog('[MENU SOURCE] cursor selector', origin.source === 'works-cursor' ? '.cursor' : `(${origin.source})`);
    DEBUG && debugLog('[MENU SOURCE] cursor rect', { x: Math.round(origin.x), y: Math.round(origin.y), startR: Math.round(origin.startR) });
    DEBUG && debugLog('[MENU SOURCE] reveal start radius', Math.round(origin.startR));
    DEBUG && debugLog('[MENU SOURCE] reveal start x y', Math.round(origin.x), Math.round(origin.y));
    DEBUG && debugLog('[MENU SOURCE] duplicate circle removed', origin.source === 'works-cursor' || origin.source === 'hero-circle');
    DEBUG && debugLog('[MENU] cover radius', r);

    // CRITICAL ORDER: pin the clip-path origin/radius and the theme class
    // BEFORE flipping visibility, so the overlay never appears unclipped or
    // with the wrong colour for a single frame.
    menu.style.setProperty('--menu-x', `${origin.x}px`);
    menu.style.setProperty('--menu-y', `${origin.y}px`);
    setClipR(origin.startR);
    menu.classList.toggle('is-light', fromDark);
    gsap.set(links, { autoAlpha: 0, y: 30 });
    if (meta) gsap.set(meta, { autoAlpha: 0, y: 16 });
    if (closeBtn) gsap.set(closeBtn, { autoAlpha: 0 });

    DEBUG && debugLog('[MENU DEBUG] overlay clip after set', getComputedStyle(menu).clipPath);

    // Now make the overlay visible — the clip is already a tiny circle at
    // the source, so the user sees a small dot, not a full flash.
    document.body.classList.add('is-menu-open');
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');

    DEBUG && debugLog('[MENU DEBUG] overlay clip after .is-open class', getComputedStyle(menu).clipPath);
    DEBUG && debugLog('[MENU DEBUG] overlay computed after open', {
      visibility: getComputedStyle(menu).visibility,
      pointerEvents: getComputedStyle(menu).pointerEvents,
      background: getComputedStyle(menu).backgroundColor,
    });

    if (typeof lenis !== 'undefined' && lenis && typeof lenis.stop === 'function') {
      lenis.stop();
      DEBUG && debugLog('[MENU] lenis paused');
    }

    const state = { r: origin.startR };
    let _sampleCount = 0;
    openTl = gsap.timeline();
    // Spring-approximating ease — `expo.out` matches the FlowingMenu
    // standard spring (stiffness 80 / damping 22 / mass 1.0): quick visible
    // start, soft deceleration, no overshoot, no rubbery cartoon feel.
    openTl.to(state, {
      r,
      duration: 1.0,
      ease: 'expo.out',
      onUpdate: () => {
        setClipR(state.r);
        _sampleCount += 1;
        if (_sampleCount === 6 || _sampleCount === 30 || _sampleCount === 55) {
          DEBUG && debugLog('[MENU DEBUG] overlay clip during animation', {
            stateR: Math.round(state.r),
            computed: getComputedStyle(menu).clipPath,
          });
        }
      },
      onComplete: () => {
        DEBUG && debugLog('[MENU DEBUG] open animation complete — final clip', getComputedStyle(menu).clipPath);
      },
    }, 0);
    openTl.to(links, {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.08,
    }, 0.30);
    if (meta) {
      openTl.to(meta, {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
      }, 0.65);
    }
    if (closeBtn) {
      openTl.to(closeBtn, {
        autoAlpha: 1,
        duration: 0.35,
        ease: 'power3.out',
      }, 0.55);
    }
  };

  const closeMenu = ({ onCloseDone } = {}) => {
    if (!isOpen) return;
    isOpen = false;
    if (openTl) { openTl.kill(); openTl = null; }
    DEBUG && debugLog('[MENU] close');

    const origin = getMenuCloseOrigin();
    menu.style.setProperty('--menu-x', `${origin.x}px`);
    menu.style.setProperty('--menu-y', `${origin.y}px`);

    const currentR = Math.max(
      parseFloat(getComputedStyle(menu).getPropertyValue('--menu-r')) || 0,
      getCoverRadius(origin.x, origin.y)
    );
    const targetR = origin.startR; // collapse back into the visible source circle
    const state = { r: currentR };

    closeTl = gsap.timeline({
      onComplete: () => {
        menu.classList.remove('is-open');
        menu.classList.remove('is-light');
        menu.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('is-menu-open');
        menu.style.background = '';
        // Restore the cursor to its normal ink color.
        const cursorEl = document.querySelector('.cursor');
        if (cursorEl && cursorEl.classList.contains('is-menu-invert')) {
          cursorEl.classList.remove('is-menu-invert');
          DEBUG && debugLog('[MENU DEBUG] cursor invert removed');
        }
        if (cursorEl && cursorEl.classList.contains('is-menu-on-light')) {
          cursorEl.classList.remove('is-menu-on-light');
          DEBUG && debugLog('[MENU DEBUG] light menu cursor removed');
        }
        if (typeof lenis !== 'undefined' && lenis && typeof lenis.start === 'function') {
          lenis.start();
          DEBUG && debugLog('[MENU] lenis resumed');
        }
        if (typeof onCloseDone === 'function') onCloseDone();
      },
    });
    closeTl.to(links, {
      autoAlpha: 0,
      y: 20,
      duration: 0.30,
      ease: 'power2.in',
      stagger: 0.04,
    }, 0);
    if (meta) {
      closeTl.to(meta, {
        autoAlpha: 0,
        y: 10,
        duration: 0.25,
        ease: 'power2.in',
      }, 0);
    }
    if (closeBtn) {
      closeTl.to(closeBtn, {
        autoAlpha: 0,
        duration: 0.20,
        ease: 'power2.in',
      }, 0);
    }
    closeTl.to(state, {
      r: targetR,
      duration: 0.75,
      ease: 'expo.in',
      onUpdate: () => setClipR(state.r),
    }, 0.20);
  };

  // ---- Link target resolution ----
  // Selected Works and Contact live inside the horizontal-pin track, so naive
  // scrollIntoView lands wrong. Resolve to actual scroll positions using the
  // master + horizontal ScrollTriggers.
  const resolveTarget = (key) => {
    const ms = window.ScrollTrigger ? ScrollTrigger.getById('hero-transition') : null;
    const hs = window.ScrollTrigger ? ScrollTrigger.getById('horizontal-scroll') : null;
    // Mobile / no desktop choreography: the sections are a normal vertical flow,
    // so resolve to the actual element's document position.
    const elTop = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      return Math.round(el.getBoundingClientRect().top + window.scrollY);
    };
    switch (key) {
      case 'hero': return 0;
      case 'about': {
        // Section 2 visible — about progress ~0.55 of master.
        if (ms) return ms.start + (ms.end - ms.start) * 0.55;
        const y = elTop('.section2ContentLayer');
        return y != null ? y : window.innerHeight * 1.5;
      }
      case 'works': {
        // Just past the master pin → entering the horizontal pin (works panel).
        if (hs) return hs.start;
        if (ms) return ms.end;
        const y = elTop('.panel--works');
        return y != null ? y : window.innerHeight * 4;
      }
      case 'contact': {
        // End of the horizontal pin → contact panel fully on screen.
        if (hs) return hs.end - 4;
        if (ms) return ms.end + window.innerHeight;
        const y = elTop('.panel--contact');
        return y != null ? y : window.innerHeight * 5;
      }
      default: return 0;
    }
  };

  // Force-clean residual hero-transition state after navigating Home.
  // Lenis scrollTo + ScrollTrigger updates should reset the masterTl
  // naturally, but we belt-and-braces remove section3 classes and force a
  // ScrollTrigger update so the hero name stops showing the inverted-mask
  // styling.
  const forceHeroReset = () => {
    const scene = document.querySelector('.heroToSection2Scene');
    if (scene) {
      scene.classList.remove(
        'is-section3-handoff-complete',
        'is-section3-pointer-through',
        'is-section3-click-through',
      );
    }
    document.body.classList.remove(
      'selected-works-ready',
      'selected-works-preview-visible-ready',
      'selected-works-preview-ready',
      'section3-ready',
    );
    if (window.ScrollTrigger) {
      ScrollTrigger.update();
    }
  };

  const navigateTo = (key) => {
    const targetY = resolveTarget(key);
    let finalized = false;
    const finalize = () => {
      if (finalized) return;
      finalized = true;
      // Sync ScrollTrigger to the new scroll position so masterTl/iris/etc.
      // reflect the destination before the menu closes (avoids hero text
      // glitches and mid-state classes).
      if (window.ScrollTrigger) ScrollTrigger.update();
      if (key === 'hero') forceHeroReset();
      // Stop Lenis again so the menu close runs against a paused scroll
      // (lenis.start() is called in closeMenu's onComplete).
      if (typeof lenis !== 'undefined' && lenis && typeof lenis.stop === 'function') {
        lenis.stop();
      }
      closeMenu({
        onCloseDone: () => {
          if (key === 'hero') forceHeroReset();
        },
      });
    };

    // Page is fully hidden behind the open menu — scroll INSTANTLY so the
    // user never sees the page travel through sections.
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.scrollTo === 'function') {
      // Start lenis briefly so scrollTo can drive the position, then we'll
      // stop again in finalize().
      if (typeof lenis.start === 'function') lenis.start();
      lenis.scrollTo(targetY, {
        immediate: true,
        force: true,
        onComplete: finalize,
      });
      // Safety net: if Lenis doesn't fire onComplete for an immediate jump,
      // finalize after one frame anyway.
      setTimeout(finalize, 80);
    } else {
      window.scrollTo(0, targetY);
      setTimeout(finalize, 50);
    }
  };

  menuBtn.addEventListener('click', (e) => (isOpen ? closeMenu() : openMenu(e)));
  if (closeBtn) closeBtn.addEventListener('click', () => closeMenu());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const key = link.dataset.menuTarget || 'hero';
      const targetY = resolveTarget(key);
      DEBUG && debugLog('[MENU DEBUG] link clicked', link.textContent.trim(), 'data-menu-target=', key);
      DEBUG && debugLog('[MENU DEBUG] target', key);
      DEBUG && debugLog('[MENU DEBUG] target scrollY', targetY);
      DEBUG && debugLog('[MENU DEBUG] using hidden jump', typeof lenis !== 'undefined' && lenis ? 'lenis.scrollTo immediate' : 'window.scrollTo');
      DEBUG && debugLog('[MENU DEBUG] menu close after navigation = scheduled');
      navigateTo(key);
    });
  });
})();

/* ---------- 3.4 Section 2 word-by-word reveal ---------- */
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  const aboutWrap = document.querySelector('.section2ContentLayer .about-wrap');
  if (!aboutWrap) return;

  const reduceMotionLocal = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const eyebrowEl = aboutWrap.querySelector('.eyebrow');
  const proseEl = aboutWrap.querySelector('.prose');
  const ctaLeadEl = aboutWrap.querySelector('.cta-lead');
  const pillEl = aboutWrap.querySelector('.pill');

  // Walk .prose and wrap text-node words in inline-block spans. Treat
  // .word-morph as atomic — it already contains its own canvas/layer setup.
  const wordTargets = [];
  if (eyebrowEl) wordTargets.push(eyebrowEl);

  if (proseEl) {
    const walk = (node) => {
      const children = Array.from(node.childNodes);
      children.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent;
          if (!text) return;
          const tokens = text.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          tokens.forEach((tok) => {
            if (tok === '') return;
            if (/^\s+$/.test(tok)) {
              frag.appendChild(document.createTextNode(tok));
              return;
            }
            const span = document.createElement('span');
            span.className = 's2-word';
            span.style.display = 'inline-block';
            span.style.willChange = 'transform, opacity';
            span.textContent = tok;
            frag.appendChild(span);
            wordTargets.push(span);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          if (child.classList && child.classList.contains('word-morph')) {
            // Atomic — push as one target. Already an inline-ish wrapper.
            child.style.willChange = 'transform, opacity';
            wordTargets.push(child);
          } else {
            walk(child);
          }
        }
      });
    };
    walk(proseEl);
  }

  if (ctaLeadEl) wordTargets.push(ctaLeadEl);
  if (pillEl) wordTargets.push(pillEl);

  if (!wordTargets.length) return;

  let played = false;
  const setInitial = () => {
    if (reduceMotionLocal) {
      gsap.set(wordTargets, { autoAlpha: 0, y: 0, filter: 'none', force3D: true });
    } else {
      gsap.set(wordTargets, { autoAlpha: 0, y: 22, filter: 'blur(8px)', force3D: true });
    }
  };
  const play = () => {
    if (played) return;
    played = true;
    if (reduceMotionLocal) {
      gsap.to(wordTargets, {
        autoAlpha: 1,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.02,
      });
      return;
    }
    gsap.to(wordTargets, {
      autoAlpha: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.05,
      force3D: true,
      // After animating, strip the filter entirely so no compositor cost
      // remains while the words sit on screen.
      onComplete: () => {
        wordTargets.forEach((el) => { el.style.filter = ''; });
      },
    });
  };
  const reset = () => {
    if (!played) return;
    played = false;
    gsap.killTweensOf(wordTargets);
    setInitial();
  };

  // Wait for the master ScrollTrigger to exist, then poll its progress
  // every frame. Far more reliable than creating a parallel ScrollTrigger
  // when the master pin has already inserted its spacer into the layout.
  const wireUp = () => {
    const master = ScrollTrigger.getById('hero-transition');
    if (!master) {
      setTimeout(wireUp, 60);
      return;
    }
    setInitial();
    const isPhoneReveal = window.matchMedia('(max-width: 640px)').matches;
    const revealAt = isPhoneReveal ? 0.40 : 0.50;
    const resetAt = isPhoneReveal ? 0.36 : 0.46;
    const checkProgress = () => {
      const p = master.progress;
      if (p >= revealAt && !played) {
        play();
      } else if (p < resetAt && played) {
        reset();
      }
    };
    gsap.ticker.add(checkProgress);
    // Also check once immediately in case the page loads already scrolled
    // past the trigger point.
    checkProgress();
  };
  wireUp();

  // Safety net: if for any reason the master trigger never wires up within
  // 4s, fail open and reveal the words so Section 2 is never permanently blank.
  setTimeout(() => { if (!played) play(); }, 4000);
})();

/* ---------- 3.45 Bridge title + body word-by-word reveal ---------- */
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  const titleEl = document.querySelector('.section2-bridge__title');
  const bodyEl = document.querySelector('.section2-bridge__body');
  if (!titleEl && !bodyEl) return;

  const reduceMotionLocal = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const splitTextWords = (root) => {
    const targets = [];
    const walk = (node) => {
      const children = Array.from(node.childNodes);
      children.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent;
          if (!text) return;
          const tokens = text.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          tokens.forEach((tok) => {
            if (tok === '') return;
            if (/^\s+$/.test(tok)) {
              frag.appendChild(document.createTextNode(tok));
              return;
            }
            const span = document.createElement('span');
            span.className = 'br-word';
            span.style.display = 'inline-block';
            span.style.willChange = 'opacity, filter';
            span.textContent = tok;
            frag.appendChild(span);
            targets.push(span);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          if (child.classList && child.classList.contains('word-morph')) {
            child.style.willChange = 'opacity, filter';
            targets.push(child);
          } else {
            walk(child);
          }
        }
      });
    };
    walk(root);
    return targets;
  };

  const titleTargets = titleEl ? splitTextWords(titleEl) : [];
  const bodyTargets  = bodyEl  ? splitTextWords(bodyEl)  : [];

  const setInitial = (targets) => {
    if (!targets.length) return;
    if (reduceMotionLocal) gsap.set(targets, { autoAlpha: 0, filter: 'none', force3D: true });
    else gsap.set(targets, { autoAlpha: 0, filter: 'blur(8px)', force3D: true });
  };

  const playReveal = (targets) => {
    if (!targets.length) return;
    if (reduceMotionLocal) {
      gsap.to(targets, { autoAlpha: 1, duration: 0.65, ease: 'power2.out', stagger: 0.04 });
      return;
    }
    gsap.to(targets, {
      autoAlpha: 1,
      filter: 'blur(0px)',
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.075,
      force3D: true,
      onComplete: () => { targets.forEach((el) => { el.style.filter = ''; }); },
    });
  };

  let titlePlayed = false;
  let bodyPlayed  = false;

  const playTitle = () => { if (titlePlayed) return; titlePlayed = true; playReveal(titleTargets); };
  const playBody  = () => { if (bodyPlayed)  return; bodyPlayed  = true; playReveal(bodyTargets);  };
  const resetTitle = () => { if (!titlePlayed) return; titlePlayed = false; gsap.killTweensOf(titleTargets); setInitial(titleTargets); };
  const resetBody  = () => { if (!bodyPlayed)  return; bodyPlayed  = false; gsap.killTweensOf(bodyTargets);  setInitial(bodyTargets);  };

  setInitial(titleTargets);
  setInitial(bodyTargets);

  // Hook into the master ScrollTrigger and fire reveals when its progress
  // crosses the bridge title (~0.68) and body (~0.74) thresholds. masterTl
  // total ≈ 462; title fade-in starts at position 314 (≈0.68), body at 340
  // (≈0.74). Resets fire on back-scroll past the title window.
  const wireUp = () => {
    const master = ScrollTrigger.getById('hero-transition');
    if (!master) { setTimeout(wireUp, 60); return; }
    const isPhoneBridge = window.matchMedia('(max-width: 640px)').matches;
    const resetAfter = isPhoneBridge ? 0.90 : 0.855;
    const titleIn = isPhoneBridge ? 0.66 : 0.62;
    const titleReset = isPhoneBridge ? 0.62 : 0.59;
    const bodyIn = isPhoneBridge ? 0.72 : 0.68;
    const bodyReset = isPhoneBridge ? 0.68 : 0.65;
    const check = () => {
      const p = master.progress;
      if (p > resetAfter) {
        resetTitle();
        resetBody();
        return;
      }
      // Master total ~547 after Section 2/bridge extension.
      // Title fade-in starts at position 344 (≈0.629). Body at 374 (≈0.684).
      if (p >= titleIn && !titlePlayed) playTitle();
      else if (p < titleReset && titlePlayed) resetTitle();
      if (p >= bodyIn && !bodyPlayed) playBody();
      else if (p < bodyReset && bodyPlayed) resetBody();
    };
    gsap.ticker.add(check);
    check();
  };
  wireUp();

  // Safety: if master never wires up within 4s, reveal so bridge isn't blank.
  setTimeout(() => { playTitle(); playBody(); }, 4000);
})();

/* ---------- 3.5 Selected Works subtle reveal (post-iris) ---------- */
(() => {
  if (!window.gsap) return;
  // Hide Selected Works until the iris/"preview ready" handoff fires.
  // mobile — leaving Selected Works permanently invisible. On mobile the plain
  const titleSpans = document.querySelectorAll('.panel--works .works-title .d-line > span');
  const rows = document.querySelectorAll('.panel--works .works-list .work-row');
  const pill = document.querySelector('.panel--works .pill--center');
  if (!titleSpans.length && !rows.length) return;

  let played = false;
  let tl = null;

  const setInitial = () => {
    if (titleSpans.length) gsap.set(titleSpans, { autoAlpha: 0, y: 8, force3D: true });
    if (rows.length) gsap.set(rows, { autoAlpha: 0, y: 16, force3D: true });
    if (pill) gsap.set(pill, { autoAlpha: 0, y: 8, force3D: true });
  };

  const play = () => {
    if (played) return;
    played = true;
    if (tl) tl.kill();
    tl = gsap.timeline();
    if (titleSpans.length) {
      tl.to(titleSpans, {
        autoAlpha: 1, y: 0,
        duration: 0.55, ease: 'power3.out', stagger: 0.07, force3D: true,
      }, 0);
    }
    if (rows.length) {
      tl.to(rows, {
        autoAlpha: 1, y: 0,
        duration: 0.55, ease: 'power3.out', stagger: 0.07, force3D: true,
      }, 0.10);
    }
    if (pill) {
      tl.to(pill, {
        autoAlpha: 1, y: 0,
        duration: 0.45, ease: 'power3.out', force3D: true,
      }, '>-0.2');
    }
  };

  const reset = () => {
    if (!played) return;
    played = false;
    if (tl) { tl.kill(); tl = null; }
    setInitial();
  };

  setInitial();

  const syncReadyState = () => {
    if (document.body.classList.contains('selected-works-preview-visible-ready')) play();
    else reset();
  };

  syncReadyState();

  window.addEventListener('selectedworkspreviewready', (e) => {
    if (e.detail?.ready) play();
    else reset();
  });
  if (window.gsap?.ticker) gsap.ticker.add(syncReadyState);
})();

/* ---------- 4. Selected Works hover preview — Codrops/EffectShell-style WebGL ---------- */
(() => {
  if (!window.THREE) return;
  if (isMobile || window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  const worksPanel = document.querySelector('.panel--works');
  const projectLinks = Array.from(document.querySelectorAll('.panel--works .work-row > a'));
  if (!worksPanel || !projectLinks.length) return;
  const cursorEl = document.querySelector('.cursor');

  const fallbackImage = 'assets/previews/ryu.webp';
  const PLANE_H = 430;
  const FALLBACK_RATIO = 1.55;
  const FOLLOW_LERP = 0.10;
  const OFFSET_CLAMP = 92;
  const OFFSET_TO_LOCAL = 0.00085;

  // ONE canvas, full viewport, transparent, ignores pointer events.
  const canvas = document.createElement('canvas');
  canvas.className = 'hover-fx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  worksPanel.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: true, premultipliedAlpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearAlpha(0);
  renderer.autoClear = true;

  // ONE scene, ONE camera (orthographic in pixel coords).
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -100, 100);
  const setSize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.left = -w / 2; camera.right = w / 2;
    camera.top = h / 2;   camera.bottom = -h / 2;
    camera.updateProjectionMatrix();
  };
  setSize();
  window.addEventListener('resize', setSize, { passive: true });

  const uniforms = {
    uTexture: { value: null },
    uAlpha:   { value: 0 },
    uOffset:  { value: new THREE.Vector2(0, 0) },
  };
  const transparentTexture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat);
  transparentTexture.needsUpdate = true;
  uniforms.uTexture.value = transparentTexture;

  // ONE plane mesh — sized to PLANE_W x PLANE_H in world units (= pixels).
  const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms,
    vertexShader: `
      uniform vec2 uOffset;
      varying vec2 vUv;
      const float M_PI = 3.1415926535897932384626433832795;
      vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
        position.x = position.x + (sin(uv.y * M_PI) * offset.x);
        position.y = position.y + (sin(uv.x * M_PI) * offset.y);
        return position;
      }
      void main() {
        vUv = uv;
        vec3 newPosition = deformationCurve(position, uv, uOffset);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uAlpha;
      uniform vec2 uOffset;
      varying vec2 vUv;
      vec3 rgbShift(sampler2D tex, vec2 uv, vec2 offset) {
        vec2 shift = offset * 0.24;
        float r = texture2D(tex, uv + shift).r;
        vec2 gb = texture2D(tex, uv).gb;
        return vec3(r, gb);
      }
      void main() {
        vec3 color = rgbShift(uTexture, vUv, uOffset);
        gl_FragColor = vec4(color, uAlpha);
      }
    `,
  });
  const plane = new THREE.Mesh(geometry, material);
  const setPlaneScaleForTexture = (tex) => {
    const img = tex?.image;
    const rawRatio = img && img.width && img.height ? img.width / img.height : FALLBACK_RATIO;
    const ratio = THREE.MathUtils.clamp(rawRatio, 0.72, 1.65);
    plane.scale.set(PLANE_H * ratio, PLANE_H, 1);
  };
  setPlaneScaleForTexture(null);
  scene.add(plane);

  // Texture cache + preload.
  const loader = new THREE.TextureLoader();
  const textureCache = new Map();
  let activeImageSrc = null;
  const loadTexture = (src) => {
    if (textureCache.has(src)) return textureCache.get(src);
    let tex;
    tex = loader.load(src, () => {
      tex.userData = tex.userData || {};
      tex.userData.loaded = true;
      if (activeImageSrc === src) {
        uniforms.uTexture.value = tex;
        setPlaneScaleForTexture(tex);
      }
    }, undefined, () => {
      if (src === fallbackImage) return;
      const fb = loadTexture(fallbackImage);
      if (activeImageSrc === src) uniforms.uTexture.value = fb;
    });
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.userData = { loaded: false };
    textureCache.set(src, tex);
    return tex;
  };
  projectLinks.forEach((link) => loadTexture(link.closest('.work-row')?.dataset.image || fallbackImage));

  // Mouse → world coords. Smooth follow + velocity-driven uOffset (= dx/dy
  // between mouse target and lerped plane position, clamped).
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let targetX = 0, targetY = 0;
  let curX = 0, curY = 0;
  let isHovering = false;
  let ready = false;

  const screenToWorld = (px, py) => ({
    x: px - window.innerWidth / 2,
    y: -(py - window.innerHeight / 2),
  });

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    const w = screenToWorld(mouseX, mouseY);
    targetX = w.x; targetY = w.y;
  }, { passive: true });

  const tick = () => {
    curX += (targetX - curX) * FOLLOW_LERP;
    curY += (targetY - curY) * FOLLOW_LERP;
    plane.position.x = curX;
    plane.position.y = curY;
    const dx = targetX - curX;
    const dy = targetY - curY;
    uniforms.uOffset.value.set(
      THREE.MathUtils.clamp(dx, -OFFSET_CLAMP, OFFSET_CLAMP) * OFFSET_TO_LOCAL,
      THREE.MathUtils.clamp(-dy, -OFFSET_CLAMP, OFFSET_CLAMP) * OFFSET_TO_LOCAL,
    );
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  const imageForLink = (link) => link.closest('.work-row')?.dataset.image || fallbackImage;

  const showPreview = (link) => {
    if (!ready) return;
    isHovering = true;
    document.body.classList.add('project-preview-cursor-active');
    cursorEl?.classList.add('is-project-preview');
    projectLinks.forEach((item) => {
      item.closest('.work-row')?.classList.toggle('is-previewed', item === link);
    });
    const src = imageForLink(link);
    activeImageSrc = src;
    const tex = loadTexture(src);
    uniforms.uTexture.value = tex.userData?.loaded ? tex : transparentTexture;
    setPlaneScaleForTexture(tex.userData?.loaded ? tex : null);
    // Snap plane to current mouse position so it doesn't fly in from elsewhere.
    const w = screenToWorld(mouseX, mouseY);
    curX = w.x; curY = w.y;
    plane.position.x = curX; plane.position.y = curY;
    if (window.gsap) {
      gsap.to(uniforms.uAlpha, { value: 1, duration: 0.5, ease: 'power4.out', overwrite: 'auto' });
    } else { uniforms.uAlpha.value = 1; }
  };

  const hidePreview = () => {
    if (!isHovering) return;
    isHovering = false;
    activeImageSrc = null;
    projectLinks.forEach((item) => item.closest('.work-row')?.classList.remove('is-previewed'));
    document.body.classList.remove('project-preview-cursor-active');
    cursorEl?.classList.remove('is-project-preview');
    if (window.gsap) {
      gsap.to(uniforms.uAlpha, { value: 0, duration: 0.5, ease: 'power4.out', overwrite: 'auto' });
    } else { uniforms.uAlpha.value = 0; }
  };

  // Gate by the existing readiness event so the preview can't appear over
  // the still-shrinking iris mask.
  window.addEventListener('selectedworkspreviewready', (e) => {
    ready = Boolean(e.detail?.ready);
    if (!ready) hidePreview();
  });
  ready = document.body.classList.contains('selected-works-preview-visible-ready');

  projectLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => showPreview(link));
    link.addEventListener('mouseleave', hidePreview);
  });
})();
