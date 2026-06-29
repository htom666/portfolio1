const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const odidactJourneyIcons = {
  search: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>',
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.87 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.87 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h18"></path>',
  'circle-check-big': '<path d="M21.8 10.8A10 10 0 1 1 12 2"></path><path d="m9 11 3 3L22 4"></path>',
  video: '<path d="m16 13 5 3V8l-5 3"></path><rect x="3" y="6" width="13" height="12" rx="2"></rect>',
  'refresh-cw': '<path d="M21 12a9 9 0 0 0-15-6.7L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path><path d="M21 21v-5h-5"></path>',
  check: '<path d="m20 6-11 11-5-5"></path>',
  'clock-3': '<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6h4"></path>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><path d="M12 19v3"></path>',
  'message-square-text': '<path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"></path><path d="M8 9h8"></path><path d="M8 13h6"></path>',
  'more-horizontal': '<circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>',
  'phone-off': '<path d="M10.1 13.9a14 14 0 0 0 6 3.4l2-2a1.6 1.6 0 0 1 1.6-.4c1 .3 2 .5 3.1.5a1.2 1.2 0 0 1 1.2 1.2V20a2 2 0 0 1-2 2C10.9 22 2 13.1 2 2a2 2 0 0 1 2-2h3.4A1.2 1.2 0 0 1 8.6 1.2c0 1.1.2 2.1.5 3.1a1.6 1.6 0 0 1-.4 1.6l-2 2a14 14 0 0 0 3.4 6Z"></path><path d="m2 2 20 20"></path>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
  'calendar-plus': '<path d="M8 2v4"></path><path d="M16 2v4"></path><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M3 10h18"></path><path d="M12 14v5"></path><path d="M9.5 16.5h5"></path>',
  sparkles: '<path d="m12 3 1.7 4.4L18 9l-4.3 1.6L12 15l-1.7-4.4L6 9l4.3-1.6L12 3Z"></path><path d="m5 14 .9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14Z"></path><path d="m19 15 .8 1.8L22 18l-2.2 1.2L19 21l-.8-1.8L16 18l2.2-1.2L19 15Z"></path>',
  sparkle: '<path d="m12 3 1.7 4.4L18 9l-4.3 1.6L12 15l-1.7-4.4L6 9l4.3-1.6L12 3Z"></path>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.7 8.9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .7-1L12 2l7.3 3a1 1 0 0 1 .7 1v7Z"></path><path d="m9 12 2 2 4-4"></path>',
  wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a2 2 0 0 1 2 2v4h-3a2 2 0 0 0 0 4h3v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"></path><path d="M18 12h.01"></path>',
  'badge-check': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.77 4 4 0 0 1 0 6.76 4 4 0 0 1-4.78 4.77 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="m9 12 2 2 4-4"></path>',
  'circle-check': '<circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9Z"></path>',
  calendar: '<path d="M8 2v4"></path><path d="M16 2v4"></path><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M3 10h18"></path>',
  'chevron-left': '<path d="m15 18-6-6 6-6"></path>',
  'chevron-right': '<path d="m9 18 6-6-6-6"></path>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 1 1 5 0"></path><path d="M12 8a2.5 2.5 0 1 1 5 0"></path>',
  'message-square': '<path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"></path>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.9"></path><path d="M16 3.1a4 4 0 0 1 0 7.8"></path>',
  'badge-info': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.77 4 4 0 0 1 0 6.76 4 4 0 0 1-4.78 4.77 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="M12 16v-4"></path><path d="M12 8h.01"></path>',
  'arrow-right': '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>',
};

/* Lucide names drifted across versions; map ours to the pinned build */
const odidactLucideNames = { 'more-horizontal': 'ellipsis', sparkle: 'sparkles' };

const renderOdidactJourneyIcons = () => {
  const useLucide = !!(window.lucide && window.lucide.createIcons);
  document.querySelectorAll('[data-oj-icon], [data-od-icon]').forEach((el) => {
    const iconName = el.dataset.ojIcon || el.dataset.odIcon;
    if (!iconName || el.dataset.odIconRendered === 'true') return;
    if (useLucide) {
      el.setAttribute('data-lucide', odidactLucideNames[iconName] || iconName);
    } else {
      const icon = odidactJourneyIcons[iconName];
      if (!icon) return;
      el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg>`;
    }
    el.dataset.odIconRendered = 'true';
  });
  if (useLucide) window.lucide.createIcons();
};

const fitOdidactStandaloneSection = (sectionSelector, stageSelector, scaleVar, artW = 1792) => {
  const section = document.querySelector(sectionSelector);
  const stage = document.querySelector(stageSelector);
  if (!section || !stage) return;

  /* below 901px the stages are native flow layouts, no artboard scaling */
  if (window.innerWidth <= 900) {
    stage.style.removeProperty(scaleVar);
    return;
  }

  const rect = section.getBoundingClientRect();
  const scale = Math.min(rect.width / artW, rect.height / 1024);
  stage.style.setProperty(scaleVar, scale);
};

const balanceOdsColumns = () => {
  const lg = document.querySelector('.ods-left-grid');
  const rw = document.querySelector('.ods-right-wrap');
  if (!lg || !rw) return;
  if (window.innerWidth > 900) rw.style.height = `${lg.offsetTop + lg.offsetHeight - rw.offsetTop}px`;
  else rw.style.removeProperty('height');
};

const fitOdidactStandaloneSections = () => {
  balanceOdsColumns();
  fitOdidactStandaloneSection('.oi-impact-section', '.oi-stage', '--oi-section-scale', 1792);
};

renderOdidactJourneyIcons();

/* color tokens live under components; typography owns the left column */
(() => {
  const color = document.querySelector('.ods-token-panel');
  const wrap = document.querySelector('.ods-right-wrap');
  if (color && wrap) wrap.appendChild(color);
})();

fitOdidactStandaloneSections();
setTimeout(fitOdidactStandaloneSections, 1200);
setTimeout(fitOdidactStandaloneSections, 3000);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitOdidactStandaloneSections);
window.addEventListener('resize', fitOdidactStandaloneSections);

if (window.ResizeObserver) {
  ['.oi-impact-section'].forEach((selector) => {
    const section = document.querySelector(selector);
    section && new ResizeObserver(fitOdidactStandaloneSections).observe(section);
  });
}

/* Desktop only — Lenis hijacked single-finger touch on some phones (page only
   scrolled with two fingers). Mobile is a vertical column with native scroll. */
if (!reduceMotion && window.Lenis && window.matchMedia('(min-width: 901px)').matches) {
  const lenis = new Lenis({
    duration: 1.12,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 0.94,
  });

  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  if (window.ScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
  }
}

if (!reduceMotion && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  const nav = document.querySelector('.odtop');
  const main = document.querySelector('.showcase-main');
  const panels = gsap.utils.toArray('.section-panel');
  const mm = gsap.matchMedia();

  gsap.set('.hero-copy > *', { autoAlpha: 0, y: 28 });
  gsap.set('.hero-visual', { autoAlpha: 0 });

  const entry = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => document.body.classList.remove('is-entering'),
  });

  entry
    .to('.hero-copy > *', {
      autoAlpha: 1,
      y: 0,
      duration: 0.72,
      stagger: 0.08,
      ease: 'power3.out',
    }, 0.28)
    .to('.hero-visual', {
      autoAlpha: 1,
      duration: 0.82,
      ease: 'power3.out',
    }, 0.42);

  /* ---------- premium chrome lives in the navbar now ---------- */
  const progressFill = document.getElementById('od-progress-fill');
  const counterNum = document.getElementById('od-ch');
  const chNameEl = document.getElementById('odx-chname');
  const stepEls = Array.from(document.querySelectorAll('.odx-step'));
  const CHAPTER_NAMES = ['Overview', 'Challenge', 'User Journey', 'Solution', 'Key Screens', 'Design System', 'Next'];

  const setActiveChapter = (idx) => {
    stepEls.forEach((el, i) => {
      el.classList.toggle('is-active', i === idx);
      el.classList.toggle('is-done', i < idx);
    });
    const num = String(idx + 1).padStart(2, '0');
    if (counterNum && counterNum.textContent !== num) {
      counterNum.textContent = num;
      gsap.fromTo(counterNum, { y: 9, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' });
    }
    if (chNameEl && chNameEl.textContent !== CHAPTER_NAMES[idx]) {
      gsap.fromTo(chNameEl, { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' });
      chNameEl.textContent = CHAPTER_NAMES[idx];
    }
  };

  /* click a chapter dot to fly there */
  stepEls.forEach((el) => {
    el.addEventListener('click', () => {
      const idx = Number(el.dataset.i);
      const target = panels[idx];
      if (!target) return;
      const y = window.innerWidth > 900 ? target.offsetLeft : target.offsetTop;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* ---------- one gradient wall travelling behind all chapters ---------- */
  const wall = document.createElement('div');
  wall.className = 'od-wall';
  wall.setAttribute('aria-hidden', 'true');
  main.prepend(wall);
  const sizeWall = () => { wall.style.width = `${main.scrollWidth}px`; };
  sizeWall();

  /* ---------- journey path: drawn through the real circle centers ---------- */
  const alignJourneyPath = () => {
    const line = document.querySelector('.oj-path-line');
    const path = line && line.querySelector('path');
    const circles = gsap.utils.toArray('.oj-step-circle');
    if (!line || !path || circles.length < 2 || window.innerWidth <= 900) return;
    const box = line.getBoundingClientRect();
    if (!box.width) return;
    const pts = circles.map((c) => {
      const r = c.getBoundingClientRect();
      return {
        x: ((r.left + r.width / 2 - box.left) / box.width) * 1200,
        y: ((r.top + r.height / 2 - box.top) / box.height) * 88,
        radius: (r.width / 2 / box.width) * 1200,
      };
    });
    /* gentle wave through the circle centers, then on to the edge */
    const y = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    line.style.overflow = 'visible';
    let d = `M${pts[0].x.toFixed(1)} ${y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i += 1) {
      const a = pts[i - 1].x;
      const b = i === pts.length - 1 ? pts[i].x + pts[i].radius : pts[i].x;
      const dx = (b - a) / 3;
      /* keep every bow inside the viewBox so no segment can be clipped */
      const amplitude = Math.max(5, Math.min(12, (b - a) * 0.055));
      let lift = i % 2 ? -amplitude : amplitude;
      if (y + lift > 80) lift = -12;
      if (y + lift < 8) lift = 12;
      d += ` C${(a + dx).toFixed(1)} ${(y + lift).toFixed(1)}, ${(b - dx).toFixed(1)} ${(y + lift).toFixed(1)}, ${b.toFixed(1)} ${y.toFixed(1)}`;
    }
    path.setAttribute('d', d);
    path.style.strokeDashoffset = '0';
    path.getBoundingClientRect();
  };

  const queueJourneyPathAlign = () => {
    requestAnimationFrame(() => {
      alignJourneyPath();
      requestAnimationFrame(alignJourneyPath);
    });
  };
  window.addEventListener('resize', queueJourneyPathAlign, { passive: true });
  window.addEventListener('orientationchange', queueJourneyPathAlign, { passive: true });
  if (window.visualViewport) {
    visualViewport.addEventListener('resize', queueJourneyPathAlign, { passive: true });
    visualViewport.addEventListener('scroll', queueJourneyPathAlign, { passive: true });
  }
  if (window.ResizeObserver) {
    const journeyBoard = document.querySelector('.oj-journey-board');
    journeyBoard && new ResizeObserver(queueJourneyPathAlign).observe(journeyBoard);
  }

  /* ---------- one thread + floating particles through every chapter ---------- */
  const DECO_LAYOUTS = [
    [['plus', 38, 14, 0, 2], ['ring', 62, 76, 1, 3], ['dot', 84, 22, 1, 2], ['blob', 70, 8, 0, 1]],
    [['ring', 30, 12, 0, 2], ['plus', 74, 18, 1, 3], ['dot', 12, 80, 0, 2], ['blob', 6, 55, 1, 1]],
    [['dot', 30, 10, 1, 2], ['plus', 88, 12, 0, 2], ['ring', 8, 30, 1, 3], ['blob', 78, 60, 0, 1]],
    [['ring', 44, 8, 0, 3], ['dot', 68, 14, 1, 2], ['plus', 10, 72, 1, 2], ['blob', 40, 70, 1, 1]],
    [['plus', 30, 10, 1, 2], ['ring', 82, 16, 0, 2], ['dot', 6, 60, 0, 3], ['blob', 60, 4, 0, 1]],
    [['dot', 36, 8, 0, 2], ['ring', 72, 10, 1, 3], ['plus', 90, 70, 0, 2], ['blob', 12, 10, 1, 1]],
    [['ring', 40, 12, 1, 2], ['plus', 60, 8, 0, 3], ['dot', 78, 74, 1, 2], ['blob', 26, 50, 0, 1]],
  ];
  panels.forEach((panel, i) => {
    (DECO_LAYOUTS[i % DECO_LAYOUTS.length] || []).forEach(([kind, x, y, pink, depth]) => {
      const d = document.createElement('span');
      d.className = `od-deco od-deco--${kind}${pink ? ' od-deco--pink' : ''}${kind === 'ring' && depth > 2 ? ' is-lg' : ''}`;
      d.setAttribute('aria-hidden', 'true');
      if (kind === 'plus') d.textContent = '+';
      d.style.left = `${x}%`;
      d.style.top = `${y}%`;
      d.dataset.depth = String(depth);
      panel.appendChild(d);
    });
  });

  const addSectionNav = (containerAnimation, horizontal) => {
    panels.forEach((section) => {
      const updateSectionState = () => {
        const idx = panels.indexOf(section);
        setActiveChapter(idx);
        nav.classList.toggle('is-dark', section.dataset.nav === 'dark');
        document.body.classList.toggle('is-solution-panel', section.classList.contains('odidact-solution'));
        document.body.classList.toggle('is-journey-panel', section.classList.contains('odidact-flow'));
        document.body.classList.toggle('is-system-panel', section.classList.contains('odidact-system'));
        document.body.classList.toggle('is-impact-panel', section.classList.contains('odidact-ending'));
      };

      ScrollTrigger.create({
        trigger: section,
        containerAnimation,
        start: horizontal ? 'left 48%' : 'top 45%',
        end: horizontal ? 'right 48%' : 'bottom 45%',
        onEnter: updateSectionState,
        onEnterBack: updateSectionState,
      });
    });
  };

  const addRevealAnimations = (containerAnimation, horizontal) => {
    const start = horizontal ? 'left 78%' : 'top 84%';

    gsap.utils.toArray('.reveal-block').forEach((el) => {
      gsap.fromTo(el,
        { autoAlpha: 0, y: 22 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          ease: 'power3.out',
          clearProps: 'filter',
          scrollTrigger: {
            trigger: el,
            containerAnimation,
            start,
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    gsap.utils.toArray('.reveal-stagger').forEach((group) => {
      gsap.fromTo(group.children,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.68,
          stagger: 0.075,
          ease: 'power3.out',
          clearProps: 'filter',
          scrollTrigger: {
            trigger: group,
            containerAnimation,
            start: horizontal ? 'left 76%' : 'top 82%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    gsap.utils.toArray('.ui-shot, .solution-screen').forEach((surface) => {
      gsap.fromTo(surface,
        { clipPath: 'inset(4% 0 4% 0)', y: 14 },
        {
          clipPath: 'inset(0% 0 0% 0)',
          y: 0,
          duration: 0.72,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: surface,
            containerAnimation,
            start: horizontal ? 'left 80%' : 'top 86%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  };

  /* =========================================================
     LIFE — the product UI performs as it arrives
     ========================================================= */
  const addLifeAnimations = (containerAnimation, horizontal) => {
    const enter = (extra = 0) => (horizontal ? `left ${74 - extra}%` : `top ${82 - extra}%`);
    const trig = (trigger, start, vars) => ({
      scrollTrigger: { trigger, containerAnimation, start, toggleActions: 'play none none reverse' },
      ...vars,
    });

    /* --- 03 user journey: the path performs --- */
    /* JOURNEY (rebuilt): the path draws, each stage activates in order,
       then its UI proof rises beneath it — the literal user journey. */
    const jr = document.querySelector('.jr');
    if (jr) {
      const jline = jr.querySelector('.jr-line');
      if (jline) {
        gsap.fromTo(jline, { clipPath: 'inset(0 100% 0 0)' }, trig(jr, enter(), {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.4,
          ease: 'power1.inOut',
        }));
      }
      gsap.from('.jr-step', trig(jr, enter(), {
        autoAlpha: 0, y: 24, scale: 0.9,
        duration: 0.5, stagger: 0.26, delay: 0.12,
        ease: 'back.out(1.7)',
      }));
      gsap.from('.jr-card', trig(jr, enter(-6), {
        autoAlpha: 0, y: 26,
        duration: 0.55, stagger: 0.26, delay: 0.34,
        ease: 'power3.out',
      }));
      const jfill = jr.querySelector('.jr-progress > i');
      if (jfill) {
        gsap.fromTo(jfill, { width: '0%' }, trig(jr, enter(-6), {
          width: '70%', duration: 1, ease: 'power2.inOut', delay: 1.4,
        }));
      }
    }

    /* --- 04 solution (rebuilt): the four systems assemble, then connect --- */
    const sol = document.querySelector('.sol');
    if (sol) {
      gsap.from('.sol-card', trig(sol, enter(), {
        autoAlpha: 0, y: 26,
        duration: 0.55, stagger: 0.12, ease: 'power3.out',
      }));
      const summary = sol.querySelector('.sol-summary');
      if (summary) {
        gsap.from('.sol-flow > *', trig(summary, enter(-8), {
          autoAlpha: 0, scale: 0.4,
          duration: 0.4, stagger: 0.07, ease: 'back.out(2)',
        }));
      }
    }

    /* --- 05 key screens: image-only reveal, captions stay planted --- */
    gsap.utils.toArray('.key-shot').forEach((shot, i) => {
      const image = shot.querySelector('img');
      if (!image) return;
      gsap.set(shot, { autoAlpha: 1, clearProps: 'transform' });
      gsap.from(image, trig(shot, enter(), horizontal ? {
        autoAlpha: 0,
        y: 34,
        scale: 0.985,
        filter: 'blur(8px)',
        transformOrigin: '50% 50%',
        duration: 0.9,
        ease: 'power3.out',
        delay: i * 0.09,
        clearProps: 'filter',
      } : {
        autoAlpha: 0,
        y: 18,
        scale: 0.992,
        filter: 'blur(6px)',
        duration: 0.62,
        ease: 'power3.out',
        delay: i * 0.05,
        clearProps: 'filter',
      }));
    });

    /* --- 06 design system (rebuilt): boards rise, swatches pop, rows slide --- */
    const ds = document.querySelector('.ds');
    if (ds) {
      gsap.from('.ds-board', trig(ds, enter(), {
        autoAlpha: 0, y: 26,
        duration: 0.6, stagger: 0.12, ease: 'power3.out',
      }));
      gsap.from('.ds-sw', trig(ds, enter(-4), {
        scale: 0, duration: 0.4, stagger: 0.03, ease: 'back.out(2.2)', delay: 0.3,
      }));
      gsap.from('.ds-trow', trig(ds, enter(-4), {
        autoAlpha: 0, x: -16, duration: 0.45, stagger: 0.05, ease: 'power2.out', delay: 0.3,
      }));
      gsap.from('.ds-bar-row i', trig(ds, enter(-6), {
        scaleX: 0, transformOrigin: 'left center', duration: 0.5, stagger: 0.04, ease: 'power2.out', delay: 0.4,
      }));
    }

    /* --- 07 impact: the numbers earn themselves --- */
    const stats = document.querySelector('.oi-stats');
    if (stats) {
      gsap.utils.toArray('.oi-stat-value').forEach((el) => {
        const raw = el.textContent.trim();
        const m = raw.match(/^([+-]?)(\d+)(%?)$/);
        if (!m) return;
        const [, sign, num, suffix] = m;
        const target = Number(num);
        const counter = { v: 0 };
        el.textContent = `${sign}0${suffix}`;
        gsap.to(counter, trig(stats, enter(), {
          v: target,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = `${sign}${Math.round(counter.v)}${suffix}`; },
          onComplete: () => gsap.fromTo(el, { scale: 1.16 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }),
        }));
      });
      gsap.from('.oi-info-card', trig(stats, enter(), {
        autoAlpha: 0,
        y: 26,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
      }));
    }
    const orbit = document.querySelector('.oi-project-orbit');
    if (orbit) {
      gsap.from(orbit, trig(orbit, enter(), {
        autoAlpha: 0,
        y: 30,
        scale: 0.96,
        duration: 0.85,
        ease: 'power3.out',
      }));
    }
  };

  /* ---------- word-by-word reveals for the big chapter titles ---------- */
  const splitWords = (el) => {
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3 && child.textContent.trim()) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
            const w = document.createElement('span');
            w.textContent = tok;
            w.style.display = 'inline-block';
            w.style.willChange = 'transform';
            frag.appendChild(w);
            words.push(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') walk(child);
      });
    };
    walk(el);
    return words;
  };

  const addTitleReveals = (containerAnimation, horizontal) => {
    gsap.utils.toArray('.oj-hero h2, .os-hero-title, .key-screens-copy h2, .ods-hero h1, .oi-next-title').forEach((title) => {
      const words = splitWords(title);
      if (!words.length) return;
      const panel = title.closest('.section-panel');
      gsap.from(words, {
        autoAlpha: 0,
        y: 30,
        rotation: 2.5,
        duration: 0.7,
        stagger: 0.05,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: panel,
          containerAnimation,
          start: horizontal ? 'left 70%' : 'top 78%',
          toggleActions: 'play none none reverse',
        },
      });
    });
  };

  /* ---------- magnetic buttons ---------- */
  const magnetize = () => {
    document.querySelectorAll('.od-bar__next, .od-bar__back, .os-cta, .os-primary, .oi-btn, .oi-arrow-circle').forEach((el) => {
      const pull = 0.32;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * pull,
          y: (e.clientY - r.top - r.height / 2) * pull,
          duration: 0.4,
          ease: 'power2.out',
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
      });
    });
  };

  /* ---------- cursor glow on the canvas ---------- */
  const addCursorGlow = () => {
    const glow = document.createElement('div');
    glow.className = 'od-cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    const toX = gsap.quickTo(glow, 'x', { duration: 0.55, ease: 'power3' });
    const toY = gsap.quickTo(glow, 'y', { duration: 0.55, ease: 'power3' });
    window.addEventListener('mousemove', (e) => { toX(e.clientX); toY(e.clientY); }, { passive: true });
  };

  /* ambient: glows drift forever, softly */
  gsap.to('.odidact-glow--one', { xPercent: 6, yPercent: -8, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('.odidact-glow--two', { xPercent: -7, yPercent: 6, duration: 8.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  mm.add('(min-width: 901px)', () => {
    /* text blocks ride a slightly nearer plane than the wall */
    gsap.utils.toArray(
      '.hero-copy, .challenge-copy, .jr-head, .sol-head, .key-screens-copy, .oi-impact-copy'
    ).forEach((el) => { if (!el.dataset.depth) el.dataset.depth = '2'; });
    /* visual boards counter-drift gently: two planes sliding past each other */
    gsap.utils.toArray(
      '.odh-stage, .challenge-visual, .jr-flow, .jr-cards, .sol-grid, .key-screens-collage, .ds-board, .oi-project-orbit'
    ).forEach((el) => { if (!el.dataset.depth) el.dataset.depth = '-0.7'; });
    /* key-screen captions stay anchored; only the images carry motion. */
    gsap.utils.toArray('.key-shot').forEach((el) => { delete el.dataset.depth; });
    /* section 03 needs to land as one composed board; independent parallax made it feel misaligned */
    gsap.utils.toArray('.oj-journey-section .oj-hero, .oj-journey-section .oj-card-row, .oj-journey-section .oj-journey-board')
      .forEach((el) => { el.dataset.depth = '0'; });

    const horizontalTween = gsap.to([wall, ...panels], {
      x: () => -(main.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: main,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        end: () => `+=${main.scrollWidth - window.innerWidth}`,
        onRefresh: () => { sizeWall(); alignJourneyPath(); },
        onUpdate: (self) => {
          if (progressFill) progressFill.style.transform = `scaleX(${self.progress})`;
        },
      },
    });

    addSectionNav(horizontalTween, true);
    addRevealAnimations(horizontalTween, true);
    addLifeAnimations(horizontalTween, true);
    addTitleReveals(horizontalTween, true);

    magnetize();
    addCursorGlow();
    alignJourneyPath();
    /* re-align once everything (icons, fonts, scale) has settled */
    setTimeout(alignJourneyPath, 1200);
    setTimeout(alignJourneyPath, 3000);

    /* particles and text drift on depth planes as the story travels */
    gsap.utils.toArray('[data-depth]').forEach((el) => {
      const depth = parseFloat(el.dataset.depth || '0');
      if (!depth) return;
      const panel = el.closest('.section-panel');
      if (!panel) return;
      gsap.fromTo(el,
        { x: () => depth * 0.024 * window.innerWidth },
        {
          x: () => -depth * 0.024 * window.innerWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: horizontalTween,
            start: 'left right',
            end: 'right left',
            scrub: 1.4,
            invalidateOnRefresh: true,
          },
        });
    });

    /* Key-screen mockups stay flat so the screenshots remain fully visible.
       The hero browser is left as a clean fill — the hover-tilt gives it depth. */
    const keepKeyShotFlat = (img) => {
      gsap.set(img, {
        clearProps: 'transform,scale,rotationX,rotationY,transformPerspective,x,y,yPercent',
        transformOrigin: '50% 50%',
        willChange: 'opacity',
      });
    };

    gsap.utils.toArray('.key-shot img').forEach((img) => {
      if (!img.closest('.section-panel')) return;
      keepKeyShotFlat(img);
    });

    /* hover tilt on the screen mockups — Core Product images get the same 3D
       feel as the hero browser while captions stay anchored. */
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      gsap.utils.toArray('.odh-stage, .challenge-visual, .sol-card, .ds-board').forEach((el) => {
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(el, {
            rotationY: px * 7,
            rotationX: -py * 5,
            transformPerspective: 800,
            scale: 1.015,
            duration: 0.5,
            ease: 'power2.out',
          });
        });
        el.addEventListener('mouseleave', () => {
          gsap.to(el, {
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
          });
        });
      });
    }
    /* idle shimmer so the canvas never freezes */
    gsap.utils.toArray('.od-deco--ring, .od-deco--dot').forEach((el, i) => {
      gsap.to(el, {
        y: '+=10',
        duration: 1.9 + (i % 4) * 0.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: (i % 5) * 0.3,
      });
    });


    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  });

  mm.add('(max-width: 900px)', () => {
    addSectionNav(null, false);
    addRevealAnimations(null, false);
    addLifeAnimations(null, false);

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  });

  window.addEventListener('resize', () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
}
