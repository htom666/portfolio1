/* =========================================================
   Fitness App — Project 3 case study
   Horizontal scroll with story-driven reveal sequences

   Story arc:
     S1 Hero      — title introduces, phones arrive carrying the product
     S2 Overview  — Overview → Problem → Solution, the design thinking unfolds
     S3 Research  — research informs personas, personas inform the flow
     S4 System    — wireframes appear like sketches, the design system assembles
     S5 Showcase  — the final screens are presented, calmly, one by one
   ========================================================= */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  /* ---------- Lenis smooth scroll ----------
     Desktop only. The horizontal scroll engine below is also gated to
     >=901px; on phones/tablets the layout is a normal vertical column, and
     running Lenis there hijacked single-finger touch on some Android browsers
     (page only scrolled with two fingers). Native scroll on mobile fixes it. */
  if (!reduceMotion && window.Lenis && window.matchMedia('(min-width: 901px)').matches) {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 0.88,
    });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
  }

  if (!window.gsap || !window.ScrollTrigger) {
    body.classList.add('is-motion-ready');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const track = document.querySelector('.p3-track');
  /* Ignore non-rendered panels if a future draft section is temporarily hidden. */
  const panels = gsap.utils.toArray('.p3-panel').filter(
    (el) => getComputedStyle(el).display !== 'none'
  );
  const progressEl = document.getElementById('p3-progress');
  const mm = gsap.matchMedia();

  /* ---------- helpers ---------- */
  const q  = (sel, scope = document) => scope.querySelector(sel);
  const qa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  /* No blur on reveal: the scrubbed scroll left headings/text blurred mid-scroll
     ("behind a blur"). Keep the slide + fade, drop the filter entirely. */
  const fromBelow  = { y: 40, autoAlpha: 0 };
  const fromLeft   = { x: -60, autoAlpha: 0 };
  const fromRight  = { x: 60, autoAlpha: 0 };
  const calmIn     = { autoAlpha: 1, x: 0, y: 0 };

  const tlConfig = (trigger, containerAnim, start = 'left 75%', end = 'left 25%') => ({
    trigger,
    containerAnimation: containerAnim,
    start, end,
    toggleActions: 'play none none reverse',
  });

  /* =========================================================
     SECTION 1 — Hero: title introduces, phones arrive
     ========================================================= */
  const buildSection1 = (containerAnim) => {
    const panel = panels[0]; if (!panel) return;
    const title    = q('.f1__title',      panel);
    const lede     = q('.f1__lede',       panel);
    const feats    = qa('.f1__feat',      panel);
    const meta     = q('.f1__meta',       panel);
    const phoneBack   = q('.f1ph--left, .f1ph--back',  panel);
    const phoneFront  = q('.f1ph--center, .f1ph--front', panel);
    const phoneSide   = q('.f1ph--right, .f1ph--side', panel);
    const tags     = qa('.f1fl',          panel);

    gsap.set([title, lede, ...feats, meta], fromBelow);
    if (phoneBack)  gsap.set(phoneBack,  { x: 120, autoAlpha: 0, rotate: -8 });
    if (phoneFront) gsap.set(phoneFront, { x: 180, autoAlpha: 0, scale: 0.9 });
    if (phoneSide)  gsap.set(phoneSide,  { x: 240, autoAlpha: 0, rotate: 12 });
    gsap.set(tags,  { y: 24, autoAlpha: 0, scale: 0.92 });

    const tl = gsap.timeline({
      scrollTrigger: tlConfig(panel, containerAnim, 'left 90%', 'left 20%'),
      defaults: { ease: 'power3.out', duration: 0.9 },
    });

    tl.to(title, calmIn)
      .to(lede,  calmIn, '-=0.55')
      .to(feats, { ...calmIn, stagger: 0.1 }, '-=0.45')
      .to(meta,  calmIn, '-=0.4')
      .to(phoneBack,  { x: 0, autoAlpha: 1, rotate: -6, duration: 1.1, ease: 'power4.out' }, 0.25)
      .to(phoneFront, { x: 0, autoAlpha: 1, scale: 1,   duration: 1.2, ease: 'power4.out' }, 0.4)
      .to(phoneSide,  { x: 0, autoAlpha: 1, rotate: 6,  duration: 1.0, ease: 'power4.out' }, 0.55)
      .to(tags, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.12, duration: 0.7, ease: 'back.out(1.6)' }, '-=0.5');
  };

  /* =========================================================
     SECTION 2 — Overview → Problem → Solution
     The thinking unfolds: situation, friction, resolution
     ========================================================= */
  const buildSection2 = (containerAnim) => {
    const panel = panels[1]; if (!panel) return;
    const title  = q('.f2__title',  panel);
    const lede   = q('.f2__lede',   panel);
    const cards  = qa('.f2card',    panel);
    const steps  = qa('.f2step',    panel);

    gsap.set([title, lede], fromBelow);
    gsap.set(cards, { y: 60, autoAlpha: 0, scale: 0.97 });
    gsap.set(steps, { y: 24, autoAlpha: 0 });

    const tl = gsap.timeline({
      scrollTrigger: tlConfig(panel, containerAnim, 'left 80%', 'left 20%'),
      defaults: { ease: 'power3.out', duration: 0.85 },
    });

    tl.to(title,  calmIn)
      .to(lede,   calmIn, '-=0.5')
      // cards reveal in narrative order: Overview, Problem, Solution
      .to(cards, {
        y: 0, autoAlpha: 1, scale: 1,
        stagger: 0.18, duration: 0.95, ease: 'power4.out'
      }, '-=0.3')
      .to(steps, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.55 }, '-=0.5');
  };

  /* =========================================================
     SECTION 3 — Research informs personas, personas inform the flow
     ========================================================= */
  const buildSection3 = (containerAnim) => {
    const panel = panels[2]; if (!panel) return;
    const title    = q('.f3__title',         panel);
    const lede     = q('.f3__lede',          panel);
    const insights = qa('.f3ri__card',       panel);
    const personaL = q('.f3pers__card:first-child', panel);
    const personaR = q('.f3pers__card:last-child',  panel);
    const flowDesc = q('.f3flow__desc',      panel);
    const diagram  = q('.f3flow__diagram',   panel);

    gsap.set([title, lede], fromBelow);
    gsap.set(insights, { y: 28, autoAlpha: 0, scale: 0.95 });
    if (personaL) gsap.set(personaL, { ...fromLeft, scale: 0.96 });
    if (personaR) gsap.set(personaR, { ...fromRight, scale: 0.96 });
    if (flowDesc) gsap.set(flowDesc, fromBelow);
    if (diagram)  gsap.set(diagram,  { autoAlpha: 0, y: 36, scale: 0.96 });

    const tl = gsap.timeline({
      scrollTrigger: tlConfig(panel, containerAnim, 'left 80%', 'left 15%'),
      defaults: { ease: 'power3.out', duration: 0.85 },
    });

    tl.to(title, calmIn)
      .to(lede,  calmIn, '-=0.55')
      // research stats land first — they justify what comes next
      .to(insights, {
        y: 0, autoAlpha: 1, scale: 1,
        stagger: 0.1, duration: 0.7, ease: 'back.out(1.4)'
      }, '-=0.4')
      // personas enter from the sides — real people the data describes
      .to(personaL, { ...calmIn, scale: 1, duration: 1.0, ease: 'power4.out' }, '-=0.3')
      .to(personaR, { ...calmIn, scale: 1, duration: 1.0, ease: 'power4.out' }, '<')
      .to(flowDesc, calmIn, '-=0.5')
      // diagram resolves last — how the personas navigate the product
      .to(diagram, {
        autoAlpha: 1, y: 0, scale: 1,
        duration: 1.2, ease: 'power4.out'
      }, '-=0.4');
  };

  /* =========================================================
     SECTION 4 — System assembles: intro, wireframes, design system
     ========================================================= */
  const buildSection4 = (containerAnim) => {
    const panel = panels[3]; if (!panel) return;
    const title = q('.f4__title',  panel);
    const lede  = q('.f4__lede',   panel);
    const wires = qa('.f4wf',      panel);
    const board = q('.f4__board',  panel);
    const dsRows = qa('.f4ds__sec, .f4ds__row', panel);

    gsap.set([title, lede], fromBelow);
    gsap.set(wires, { y: 50, autoAlpha: 0, rotateX: 14 });
    if (board) gsap.set(board, { autoAlpha: 0, y: 40, scale: 0.97 });
    gsap.set(dsRows, { y: 18, autoAlpha: 0 });

    const tl = gsap.timeline({
      scrollTrigger: tlConfig(panel, containerAnim, 'left 80%', 'left 15%'),
      defaults: { ease: 'power3.out', duration: 0.85 },
    });

    tl.to(title, calmIn)
      .to(lede,  calmIn, '-=0.55')
      // wireframes appear like sketches drawn onto paper, one after another
      .to(wires, {
        y: 0, autoAlpha: 1, rotateX: 0,
        stagger: 0.09, duration: 0.7, ease: 'power3.out'
      }, '-=0.4')
      // the system board lifts into place
      .to(board, {
        autoAlpha: 1, y: 0, scale: 1,
        duration: 1.0, ease: 'power4.out'
      }, '-=0.5')
      // then its internal rows assemble
      .to(dsRows, { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.5 }, '-=0.6');
  };

  /* =========================================================
     SECTION 5 — Final showcase: introduce, then reveal each screen pair
     ========================================================= */
  const buildSection5 = (containerAnim) => {
    const panel = panels[4]; if (!panel) return;
    const intro = q('.f5__intro', panel);
    const rows  = qa('.f5__row',  panel);

    if (intro) gsap.set(intro, fromBelow);
    rows.forEach((row) => {
      const caption = q('.f5__caption', row);
      const shots   = qa('.f5__shot',   row);
      const reverse = row.classList.contains('f5__row--reverse');
      if (caption) gsap.set(caption, reverse ? fromRight : fromLeft);
      gsap.set(shots, { y: 50, autoAlpha: 0, scale: 0.95 });
    });

    const tl = gsap.timeline({
      scrollTrigger: tlConfig(panel, containerAnim, 'left 80%', 'left 15%'),
      defaults: { ease: 'power3.out' },
    });

    if (intro) tl.to(intro, { ...calmIn, duration: 0.7 });

    rows.forEach((row, i) => {
      const caption = q('.f5__caption', row);
      const shots   = qa('.f5__shot',   row);
      const reverse = row.classList.contains('f5__row--reverse');
      const label   = `row${i}`;
      tl.addLabel(label, i === 0 ? '-=0.3' : '-=0.3');
      if (caption) tl.to(caption, { ...calmIn, duration: 0.75, ease: 'power3.out' }, label);
      tl.to(shots, {
        y: 0, autoAlpha: 1, scale: 1,
        stagger: 0.15, duration: 0.85, ease: 'power4.out',
      }, `${label}+=${reverse ? 0 : 0.15}`);
    });
  };

  /* =========================================================
     Continuous subtle parallax: only on key visual anchors
     (not noise — purposeful depth on hero phones and final screens)
     ========================================================= */
  const subtleParallax = (containerAnim) => {
    const rules = [
      /* Section 1 — phones cluster drifts as one */
      { sel: '.f1__right',      depth: -0.05 },
      /* Section 2 — whole section drifts as one */
      { sel: '.f2__inner',      depth: 0.05 },
      /* Section 3 — left column drifts, right column counter-drifts */
      { sel: '.f3__col--left',  depth: 0.05 },
      { sel: '.f3__col--right', depth: -0.05 },
      /* Section 4 — entire section drifts at the same pace as the right-side wireframes */
      { sel: '.f4__inner',      depth: 0.06 },
      /* Section 5 — hero + every row + arrows drift together, each at its own pace */
      { sel: '.f5__hero',                   depth: 0.10 },
      { sel: '.f5__arrow--1',               depth: 0.06 },
      { sel: '.f5__row:nth-child(1)',       depth: 0.04 },
      { sel: '.f5__row:nth-child(3)',       depth: -0.02 },
      { sel: '.f5__arrow--2',               depth: -0.05 },
      { sel: '.f5__row:nth-child(5)',       depth: -0.08 },
    ];
    rules.forEach(({ sel, depth }) => {
      qa(sel).forEach((el) => {
        gsap.to(el, {
          x: () => window.innerWidth * depth * -1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            containerAnimation: containerAnim,
            start: 'left right',
            end: 'right left',
            scrub: 1.2,
          },
        });
      });
    });
  };

  /* =========================================================
     Horizontal scroll engine
     ========================================================= */
  mm.add('(min-width: 901px)', () => {
    if (!track || !panels.length) return;

    const horizontalTween = gsap.to(panels, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        id: 'p3-horizontal',
        trigger: track,
        pin: true,
        scrub: 1.1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        onUpdate: (self) => {
          if (progressEl) progressEl.style.width = `${(self.progress * 100).toFixed(2)}%`;
          /* Drive background blob positions from scroll progress.
             −50% to +50% sweep so blobs slide visibly as user scrolls horizontally. */
          if (track) {
            const sweep = (self.progress - 0.5) * 100; /* −50 → +50 */
            track.style.setProperty('--p3-bg-x', `${sweep}%`);
          }
        },
      },
    });

    buildSection1(horizontalTween);
    buildSection2(horizontalTween);
    buildSection3(horizontalTween);
    buildSection4(horizontalTween);
    buildSection5(horizontalTween);
    subtleParallax(horizontalTween);

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  });

  /* Mobile: clean native vertical scroll, no scroll engine at all.
     The reveal sequences are built for the horizontal container ('left 75%'
     start positions); running them on a vertical page left whole sections
     stuck hidden (autoAlpha:0 never cleared) and the stray ScrollTriggers
     interfered with single-finger touch scroll (page only moved with two
     fingers on Android). On mobile we create no ScrollTriggers and never hide
     anything — content renders as-is and the browser scrolls natively. */
  mm.add('(max-width: 900px)', () => {});

  body.classList.add('is-motion-ready');

  /* refresh after fonts / images */
  window.addEventListener('resize', () => ScrollTrigger.refresh(), { passive: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  const imgs = qa('img');
  let loaded = 0;
  imgs.forEach((img) => {
    const tick = () => { loaded++; if (loaded === imgs.length) ScrollTrigger.refresh(); };
    if (img.complete) tick();
    else {
      img.addEventListener('load',  tick, { once: true });
      img.addEventListener('error', tick, { once: true });
    }
  });
})();
