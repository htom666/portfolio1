/* =========================================================
   RYUJIN — horizontal scroll, reveals, parallax, anatomy.
   ========================================================= */
(() => {
  const body = document.body;
  const main = document.querySelector('.showcase-main');
  const panels = Array.from(document.querySelectorAll('.section-panel'));

  initAnatomyInteraction();
  normalizeStaticLabels();

  const setBgDrift = (progress) => {
    if (!main) return;
    /* −50% → +50% sweep so the radial glows shift visibly as the track scrolls */
    const sweep = (progress - 0.5) * 100;
    main.style.setProperty('--ry-bg-x', `${sweep}%`);
  };

  if (!window.gsap || !window.ScrollTrigger || !main || !panels.length) {
    body.classList.remove('is-entering');
    revealWithoutGsap();
    setupNativeHorizontal(main, panels);
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  gsap.set('.reveal-block', { autoAlpha: 0, y: 56, filter: 'blur(10px)' });
  gsap.set('.reveal-stagger > *', { autoAlpha: 0, y: 52, filter: 'blur(8px)' });

  const intro = gsap.timeline({
    defaults: { ease: 'expo.out' },
    onComplete: () => body.classList.remove('is-entering')
  });

  intro
    .to('.ryujin-hero .reveal-stagger > *', {
      autoAlpha: 1, y: 0, filter: 'blur(0px)',
      duration: 1, stagger: 0.08
    })
    .to('.ryujin-hero .reveal-block', {
      autoAlpha: 1, y: 0, filter: 'blur(0px)',
      duration: 1.1
    }, 0.25);

  const revealIn = (target, trigger, containerAnimation) => {
    gsap.to(target, {
      autoAlpha: 1, y: 0, filter: 'blur(0px)',
      duration: 0.92,
      stagger: 0.075,
      ease: 'expo.out',
      scrollTrigger: {
        trigger,
        containerAnimation,
        start: containerAnimation ? 'left 72%' : 'top 82%',
        once: true
      }
    });
  };

  const addReveals = (containerAnimation = null) => {
    gsap.utils.toArray('.section-panel:not(.ryujin-hero)').forEach((panel) => {
      const blocks = panel.querySelectorAll('.reveal-block');
      const stagger = panel.querySelectorAll('.reveal-stagger > *');
      if (blocks.length) revealIn(blocks, panel, containerAnimation);
      if (stagger.length) revealIn(stagger, panel, containerAnimation);
    });
  };

  /* =========================================================
     SECTION-SPECIFIC CHOREOGRAPHY
     ========================================================= */

  /* Section 05 — User journey: numbered boxes, dots, lines draw in sequence */
  const choreoJourney = (containerAnimation) => {
    const panel = document.querySelector('.ryujin-journey'); if (!panel) return;
    const articles = panel.querySelectorAll('.journey-track article');
    if (!articles.length) return;

    gsap.set(articles, { autoAlpha: 0, y: 30 });
    gsap.set('.journey-track article b', { scale: 0, autoAlpha: 0 });
    gsap.set('.journey-track article i', { scale: 0, autoAlpha: 0 });
    gsap.set('.journey-track article strong, .journey-track article p', { autoAlpha: 0, y: 20 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        containerAnimation,
        start: containerAnimation ? 'left 70%' : 'top 80%',
        once: true
      }
    });
    tl.to(articles, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.18 })
      .to('.journey-track article b', {
        scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.18,
        ease: 'back.out(2)'
      }, 0.05)
      .to('.journey-track article i', {
        scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.18,
        ease: 'back.out(2.2)'
      }, 0.18)
      .to('.journey-track article strong, .journey-track article p', {
        autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'expo.out'
      }, 0.3);
  };

  /* Section 07 — Anatomy: sword slides in, then dots flash on one by one */
  const choreoAnatomy = (containerAnimation) => {
    const panel = document.querySelector('.ryujin-anatomy'); if (!panel) return;
    const sword = panel.querySelector('.sword-stage__img');
    const dots = panel.querySelectorAll('.anatomy-dot');
    const parts = panel.querySelectorAll('.parts-list article');

    if (sword) gsap.set(sword, { autoAlpha: 0, x: -60, scale: 1.04 });
    gsap.set(dots, { scale: 0, autoAlpha: 0 });
    gsap.set('.anatomy-dot::after', { scaleY: 0, transformOrigin: 'top center' });
    gsap.set(parts, { autoAlpha: 0, x: 40 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        containerAnimation,
        start: containerAnimation ? 'left 70%' : 'top 80%',
        once: true
      }
    });
    if (sword) tl.to(sword, {
      autoAlpha: 1, x: 0, scale: 1, duration: 1.1, ease: 'power4.out'
    });
    tl.to(dots, {
      scale: 1, autoAlpha: 1, duration: 0.45,
      stagger: { each: 0.13, from: 'start' },
      ease: 'back.out(2.2)'
    }, '-=0.5')
      .to(parts, {
        autoAlpha: 1, x: 0, duration: 0.55,
        stagger: 0.08, ease: 'expo.out'
      }, '-=0.7');
  };

  /* Section 08 — Forging process: 8 cards reveal in sequence like steps */
  const choreoProcess = (containerAnimation) => {
    const panel = document.querySelector('.ryujin-process'); if (!panel) return;
    const cards = panel.querySelectorAll('.process-grid article');
    if (!cards.length) return;

    gsap.set(cards, { autoAlpha: 0, y: 30, scale: 0.96 });

    gsap.to(cards, {
      autoAlpha: 1, y: 0, scale: 1,
      duration: 0.55,
      stagger: { each: 0.09, from: 'start' },
      ease: 'expo.out',
      scrollTrigger: {
        trigger: panel,
        containerAnimation,
        start: containerAnimation ? 'left 70%' : 'top 80%',
        once: true
      }
    });
  };

  /* Section 09 — Design system: each row reveals as a "block",
     then the cells inside it stagger up. Dividers wipe in left → right. */
  const choreoSystem = (containerAnimation) => {
    const panel = document.querySelector('.ryujin-system'); if (!panel) return;
    const rows = Array.from(panel.querySelectorAll('.ds__row'));
    if (!rows.length) return;

    gsap.set(rows, { autoAlpha: 0, y: 38 });
    rows.forEach((row) => {
      const cells = row.querySelectorAll('.ds__cell, .ds__stack');
      gsap.set(cells, { autoAlpha: 0, y: 20, filter: 'blur(6px)' });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        containerAnimation,
        start: containerAnimation ? 'left 72%' : 'top 80%',
        once: true
      }
    });
    rows.forEach((row, i) => {
      const cells = row.querySelectorAll('.ds__cell, .ds__stack');
      const at = i * 0.34;
      tl.to(row,   { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' }, at);
      tl.to(cells, {
        autoAlpha: 1, y: 0, filter: 'blur(0px)',
        duration: 0.55, stagger: 0.07, ease: 'expo.out'
      }, at + 0.14);
    });
  };

  /* Depth parallax — visuals AND text drift at their own rates as panels
     pass through. Text moves with a positive depth so it appears to "lag
     back" against the scroll direction, removing the per-panel feel. */
  const addParallax = (containerAnimation = null) => {
    const rules = [
      /* Visuals — drift forward (negative depth) */
      { sel: '.hero-sword',        depth: -0.05 },
      { sel: '.challenge-visual',  depth: -0.06 },
      { sel: '.approach-visual',   depth: -0.06 },
      { sel: '.solution-mockup',   depth: -0.05 },
      { sel: '.sword-stage',       depth: -0.05 },
      { sel: '.parts-list',        depth:  0.04 },
      { sel: '.process-grid',      depth: -0.04 },
      { sel: '.journey-track',     depth:  0.04 },
      { sel: '.impact-row',        depth: -0.04 },
      /* Title drifts a bit further than body — separate layers, but not
         enough to clip past the panel edges. */
      { sel: '.ryujin-hero .hero-copy h1',                                            depth:  0.06 },
      { sel: '.ryujin-hero .hero-copy .hero-subtitle, .ryujin-hero .hero-copy .hero-description', depth:  0.03 },
      { sel: '.ryujin-hero .hero-copy .hero-meta',                                    depth:  0.015 },

      { sel: '.ryujin-challenge .challenge-copy h2',                                  depth:  0.06 },
      { sel: '.ryujin-challenge .challenge-copy p, .ryujin-challenge .compact-meta',  depth:  0.025 },

      { sel: '.ryujin-approach .approach-copy h2',                                    depth:  0.06 },
      { sel: '.ryujin-approach .approach-copy p, .ryujin-approach .approach-copy ul', depth:  0.025 },

      { sel: '.ryujin-solution .solution-copy h2',                                    depth:  0.06 },
      { sel: '.ryujin-solution .solution-copy p, .ryujin-solution .principles',       depth:  0.025 },

      { sel: '.ryujin-anatomy .anatomy-copy h2',                                      depth:  0.055 },
      { sel: '.ryujin-anatomy .anatomy-copy p',                                       depth:  0.025 },

      { sel: '.ryujin-process .process-copy h2',                                      depth:  0.06 },
      { sel: '.ryujin-process .process-copy p',                                       depth:  0.025 },
      /* Individual forging cards drift forward at the same rate as the grid,
         but each card additionally counter-drifts so they read as moving
         tiles, not a single block. */
      { sel: '.ryujin-process .process-grid article',                                 depth: -0.03 },

      /* Design system: title leads, body follows, all cells lag together
         in the same direction → cohesive but layered, not a fight. */
      { sel: '.ryujin-system .ds__intro h2',                                          depth:  0.055 },
      { sel: '.ryujin-system .ds__intro p',                                           depth:  0.025 },
      { sel: '.ryujin-system .ds__row--top .ds__cell:not(.ds__intro)',                depth:  0.035 },
      { sel: '.ryujin-system .ds__row--mid .ds__cell, .ryujin-system .ds__row--mid .ds__stack', depth: 0.04 },
      { sel: '.ryujin-system .ds__row--bot .ds__cell',                                depth:  0.03 },
    ];
    rules.forEach(({ sel, depth }) => {
      gsap.utils.toArray(sel).forEach((el) => {
        gsap.to(el, {
          x: () => window.innerWidth * depth * -1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            containerAnimation,
            start: containerAnimation ? 'left right' : 'top bottom',
            end: containerAnimation ? 'right left' : 'bottom top',
            scrub: 1.2
          }
        });
      });
    });
  };

  /* Subtle image breathing — scale shift across panel passage */
  const addImageDepth = (containerAnimation = null) => {
    gsap.utils.toArray('.hero-sword img, .challenge-visual img, .approach-visual img, .solution-mockup img, .sword-stage__img')
      .forEach((img) => {
        gsap.fromTo(img,
          { scale: 1.06, xPercent: -1.5 },
          {
            scale: 1, xPercent: 1.5,
            ease: 'none',
            scrollTrigger: {
              trigger: img.closest('.section-panel') || img,
              containerAnimation,
              start: containerAnimation ? 'left right' : 'top bottom',
              end: containerAnimation ? 'right left' : 'bottom top',
              scrub: true
            }
          }
        );
      });
  };

  const mm = gsap.matchMedia();

  mm.add('(min-width: 901px)', () => {
    const distance = () => Math.max(0, main.scrollWidth - window.innerWidth);

    const horizontalTween = gsap.to(main, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: main,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        end: () => '+=' + distance(),
        onUpdate: (self) => setBgDrift(self.progress)
      }
    });

    addReveals(horizontalTween);
    addImageDepth(horizontalTween);
    addParallax(horizontalTween);
    choreoJourney(horizontalTween);
    choreoAnatomy(horizontalTween);
    choreoProcess(horizontalTween);
    choreoSystem(horizontalTween);

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  });

  mm.add('(max-width: 900px)', () => {
    addReveals();
    addImageDepth();
    choreoJourney(null);
    choreoAnatomy(null);
    choreoProcess(null);
    choreoSystem(null);
  });

  function normalizeStaticLabels() {
    const nextArrow = document.querySelector('.next-project i');
    if (nextArrow) nextArrow.textContent = '→';
  }

  function revealWithoutGsap() {
    document.querySelectorAll('.reveal-block, .reveal-stagger > *').forEach((el) => {
      el.style.opacity = '1';
      el.style.visibility = 'visible';
      el.style.transform = 'none';
      el.style.filter = 'none';
    });
  }

  function initAnatomyInteraction() {
    const listItems = Array.from(document.querySelectorAll('.parts-list article'));
    const dots = {
      edge:  document.querySelector('.anatomy-dot--edge'),
      guard: document.querySelector('.anatomy-dot--guard'),
      wrap:  document.querySelector('.anatomy-dot--handle'),
      tip:   document.querySelector('.anatomy-dot--tip'),
      saya:  document.querySelector('.anatomy-dot--saya')
    };

    const parts = ['edge', 'guard', 'wrap', 'tip', 'saya'];
    const kanji = {
      edge:  '\u5203',
      guard: '\u9354',
      wrap:  '\u67c4',
      tip:   '\u5207\u5148',
      saya:  '\u9798',
    };

    if (!listItems.length || !Object.values(dots).every(Boolean)) return;

    Object.entries(dots).forEach(([part, dot]) => {
      dot.dataset.part = part;
      const label = dot.querySelector('b');
      if (label) label.textContent = kanji[part];
    });

    listItems.forEach((item, index) => {
      const part = parts[index];
      item.dataset.part = part;
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-pressed', part === 'edge' ? 'true' : 'false');
    });

    const activatePart = (part) => {
      listItems.forEach((item) => {
        const isActive = item.dataset.part === part;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      Object.entries(dots).forEach(([dotPart, dot]) => {
        dot.classList.toggle('is-active', dotPart === part);
      });
    };

    /* List → dot */
    listItems.forEach((item) => {
      const activate = () => activatePart(item.dataset.part);
      item.addEventListener('mouseenter', activate);
      item.addEventListener('focus', activate);
      item.addEventListener('click', activate);
      item.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        activate();
      });
    });

    /* Dot → list (hover the dot lights its row too) */
    Object.entries(dots).forEach(([part, dot]) => {
      dot.addEventListener('mouseenter', () => activatePart(part));
    });

    activatePart('edge');
  }

  function setupNativeHorizontal(track, slides) {
    if (!track || !slides.length || !window.matchMedia('(min-width: 901px)').matches) return;

    const updateSize = () => {
      const distance = Math.max(0, (slides.length - 1) * window.innerWidth);
      document.body.style.height = `${distance + window.innerHeight}px`;
      track.style.position = 'fixed';
      track.style.left = '0';
      track.style.top = '0';
      track.style.transform = `translate3d(${-Math.min(window.scrollY, distance)}px,0,0)`;
      setBgDrift(distance ? Math.min(window.scrollY, distance) / distance : 0);
    };

    const updateScroll = () => {
      const distance = Math.max(0, (slides.length - 1) * window.innerWidth);
      const y = Math.min(window.scrollY, distance);
      track.style.transform = `translate3d(${-y}px,0,0)`;
      setBgDrift(distance ? y / distance : 0);
    };

    slides.forEach((panel) => {
      panel.querySelectorAll('.reveal-block, .reveal-stagger > *').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.filter = 'none';
      });
    });

    updateSize();
    window.addEventListener('resize', updateSize);
    window.addEventListener('scroll', updateScroll, { passive: true });
  }
})();
