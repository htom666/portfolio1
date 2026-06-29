/* =========================================================
   TASTY — case study 004
   Horizontal story engine: pinned track, chapter reveals,
   depth parallax, self-scrolling screens.
   ========================================================= */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  /* ---------- Lenis smooth scroll (desktop only) ---------- */
  /* Lenis hijacked single-finger touch on some phones (page only scrolled with
     two fingers). Mobile is a vertical column with native scroll. */
  if (!reduceMotion && window.Lenis && window.matchMedia('(min-width: 900px)').matches) {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
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

  const track = document.getElementById('tj-track');
  const panels = gsap.utils.toArray('.tj-panel');
  if (!track || !panels.length) return;

  const chNum = document.getElementById('tj-ch-num');
  const chName = document.getElementById('tj-ch-name');
  const progressFill = document.getElementById('tj-progress');

  /* ---------- caramel dip: anchor the gradient to the outro ---------- */
  const paintWall = () => {
    const wall = document.getElementById('tj-wall');
    if (!wall) return;
    if (window.innerWidth < 900) { wall.style.removeProperty('background'); return; }
    const outro = wall.querySelector('.tj-show');
    if (!outro) return;
    const total = wall.scrollWidth;
    const start = ((outro.offsetLeft - window.innerWidth * 0.55) / total) * 100;
    const full = ((outro.offsetLeft + window.innerWidth * 0.25) / total) * 100;
    wall.style.background = `linear-gradient(to right,
      oklch(0.965 0.018 85) 0%,
      oklch(0.965 0.018 85) ${start.toFixed(2)}%,
      oklch(0.9 0.055 80) ${full.toFixed(2)}%,
      oklch(0.9 0.055 80) 100%)`;
  };

  const qa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  /* ---------- chapter indicator ---------- */
  const chapters = panels.map((p) => p.dataset.chapter || '');
  let chapterEdges = [];
  const computeEdges = () => {
    const total = track.scrollWidth - window.innerWidth;
    let acc = 0;
    chapterEdges = panels.map((p) => {
      const edge = total > 0 ? Math.max(0, Math.min(1, acc / total)) : 0;
      acc += p.offsetWidth;
      return edge;
    });
  };

  const setChapter = (progress) => {
    let idx = 0;
    for (let i = 0; i < chapterEdges.length; i += 1) {
      /* a chapter is "current" once its left edge has crossed mid-travel */
      if (progress >= chapterEdges[i] - 0.001) idx = i;
    }
    const num = String(idx + 1).padStart(2, '0');
    if (chNum && chNum.textContent !== num) chNum.textContent = num;
    if (chName && chName.textContent !== chapters[idx]) chName.textContent = chapters[idx];
  };

  /* ---------- reveal helper ---------- */
  const hideTargets = (targets) => {
    if (reduceMotion) return;
    gsap.set(targets, { autoAlpha: 0, y: 34 });
  };
  const revealTl = (targets, vars = {}) => gsap.to(targets, {
    autoAlpha: 1,
    y: 0,
    duration: 0.85,
    ease: 'expo.out',
    stagger: 0.09,
    ...vars,
  });

  /* ---------- storytelling drift: assign motion roles ---------- */
  /* data-depth = x lag; data-float = yPercent bob; data-sway = rotation flutter */
  const assignDrift = () => {
    qa('.tj-brief__lead, .tj-brief__cols, .tj-wire__intro, .tj-sys__intro, .tj-flow__intro, .tj-trust__intro, .tj-show__intro').forEach((el) => {
      if (!el.dataset.depth) el.dataset.depth = '1.4';
    });
    qa('.tj-stand .tj-print').forEach((el, i) => {
      if (!el.dataset.float) el.dataset.float = i % 2 ? '-7' : '8';
      if (!el.dataset.sway) el.dataset.sway = i % 2 ? '1.5' : '-1.3';
    });
    qa('.tj-step').forEach((el, i) => {
      if (!el.dataset.float) el.dataset.float = i % 2 ? '-6' : '6';
    });
    qa('.tj-syscard').forEach((el, i) => {
      if (!el.dataset.float) el.dataset.float = i % 2 ? '-4' : '5';
    });
    qa('.tjc-tablet, .tjc-phone, .tjc-stamp').forEach((el, i) => {
      if (!el.dataset.float) el.dataset.float = i % 2 ? '-4' : '4';
    });
  };
  assignDrift();

  /* =========================================================
     DESKTOP — horizontal engine
     ========================================================= */
  const mm = gsap.matchMedia();

  mm.add('(min-width: 900px)', () => {
    computeEdges();
    paintWall();

    /* walker state, fed by the scrub */
    let walkerVel = 0;
    let walkerDir = 1;
    let updateToast = null;
    let lastScrollT = performance.now();

    const horizontal = gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        id: 'tasty-horizontal',
        trigger: track,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        onRefresh: () => { computeEdges(); paintWall(); },
        onUpdate: (self) => {
          if (progressFill) progressFill.style.transform = `scaleX(${self.progress})`;
          setChapter(self.progress);

          const v = self.getVelocity();
          walkerVel = Math.min(1, Math.abs(v) / 2400);
          if (self.direction) walkerDir = self.direction;
          lastScrollT = performance.now();
          if (updateToast) updateToast(self.progress);
        },
      },
    });

    /* ---- extras bound once: companion, cover depth, hover tilt, idle life ---- */
    if (!window.__tastyExtras && !reduceMotion) {
      window.__tastyExtras = true;

      /* toast companion: ONE character. It sits in the cover CTA,
         leaps to the corner when the journey starts, runs with you,
         and hops into its seat next to "End of case study". */
      const walker = document.createElement('div');
      walker.className = 'tj-walker';
      walker.setAttribute('aria-hidden', 'true');
      walker.innerHTML = '<span class="tj-walker__in"><svg viewBox="0 0 90 90"><path d="M20 34 C 14 22, 24 13, 33 17 C 36 9, 50 8, 54 16 C 63 11, 74 20, 68 31 C 72 36, 71 64, 66 70 C 60 76, 28 76, 23 70 C 18 64, 17 40, 20 34 Z" fill="#F6E3C5" stroke="#9A5218" stroke-width="3" stroke-linejoin="round"/><rect x="29" y="34" width="31" height="30" rx="9" fill="#E5B161" opacity="0.55"/><circle cx="38" cy="46" r="2.6" fill="#5C3210"/><circle cx="52" cy="46" r="2.6" fill="#5C3210"/><path d="M40 54 C 43 58, 47 58, 50 54" fill="none" stroke="#5C3210" stroke-width="2.4" stroke-linecap="round"/><path d="M21 50 C 12 46, 10 40, 13 34" fill="none" stroke="#9A5218" stroke-width="3" stroke-linecap="round"/><path d="M69 50 C 78 46, 80 40, 77 34" fill="none" stroke="#9A5218" stroke-width="3" stroke-linecap="round"/><path d="M37 75 l-2 8 M53 75 l2 8" stroke="#9A5218" stroke-width="3" stroke-linecap="round"/></svg></span>';
      document.body.appendChild(walker);
      const walkerIn = walker.querySelector('.tj-walker__in');

      const coverToast = panels[0].querySelector('.tjc-ctarow .tjc-toast');
      const endToast = panels[panels.length - 1].querySelector('.tjc-ctarow .tjc-toast');
      /* the flow banner toast is just a seat: only the walker occupies it */
      const flowToast = document.querySelector('.tj-flow__banner .tjc-toast');
      if (flowToast) gsap.set(flowToast, { autoAlpha: 0 });

      /* the run cycle lives on the INNER layer, jumps on the outer */
      const wSetY = gsap.quickSetter(walkerIn, 'y', 'px');
      const wSetR = gsap.quickSetter(walkerIn, 'rotation', 'deg');
      const wSetSX = gsap.quickSetter(walkerIn, 'scaleX');
      let wTime = 0;
      gsap.ticker.add(() => {
        wTime += gsap.ticker.deltaRatio() * (0.07 + walkerVel * 0.18);
        const amp = 2 + walkerVel * 7;
        wSetY(Math.sin(wTime * 2) * -Math.abs(amp));
        wSetR(Math.sin(wTime) * (2 + walkerVel * 6));
        wSetSX(walkerDir < 0 ? -1 : 1);
        walkerVel *= 0.96;

        /* resting near the flow banner? take the empty seat */
        if (toastState === 'walking' && flowToast && performance.now() - lastScrollT > 550) {
          const r = flowToast.getBoundingClientRect();
          if (r.left > 80 && r.right < window.innerWidth - 40 && r.top > 80 && r.bottom < window.innerHeight - 20) {
            toastState = 'visiting';
            pSeat = lastP;
            seated = false;
            const d = deltaTo(flowToast);
            jump(d.x, d.y, () => { seated = toastState === 'visiting'; });
          }
        }

        /* once seated, stay glued to the seat even if the wall creeps */
        if (toastState === 'visiting' && seated) {
          const d = deltaTo(flowToast);
          const cx = Number(gsap.getProperty(walker, 'x'));
          const cy = Number(gsap.getProperty(walker, 'y'));
          gsap.set(walker, { x: cx + (d.x - cx) * 0.25, y: cy + (d.y - cy) * 0.25 });
        }
      });

      /* home = the fixed corner spot; deltas measured from it */
      gsap.set(walker, { autoAlpha: 0 });
      const homeRect = walker.getBoundingClientRect();
      const deltaTo = (el) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - (homeRect.left + homeRect.width / 2),
          y: r.top + r.height / 2 - (homeRect.top + homeRect.height / 2),
        };
      };

      let jumpTl = null;
      const jump = (toX, toY, onDone) => {
        if (jumpTl) jumpTl.kill();
        const fromY = Number(gsap.getProperty(walker, 'y'));
        const apex = Math.min(fromY, toY) - 150;
        jumpTl = gsap.timeline({ onComplete: onDone });
        jumpTl.to(walker, { x: toX, duration: 0.62, ease: 'power1.inOut' }, 0)
          .to(walker, { y: apex, duration: 0.3, ease: 'power2.out' }, 0)
          .to(walker, { y: toY, duration: 0.32, ease: 'power2.in' }, 0.3)
          .fromTo(walkerIn, { scaleY: 1 }, { scaleY: 0.8, duration: 0.09, yoyo: true, repeat: 1, ease: 'power1.in' }, 0.56);
      };

      if (endToast) gsap.set(endToast, { autoAlpha: 0 });
      let toastState = 'cover';
      let lastP = 0;
      let pSeat = 0;
      let seated = false;
      const T_START = 0.012;
      const T_END = 0.985;

      /* one transition per pass; loop until stable so a single big
         scroll jump (keyboard End/Home) can cross several states */
      const stepToast = (p) => {
        if (toastState === 'cover' && p > T_START) {
          toastState = 'walking';
          if (coverToast) {
            const d = deltaTo(coverToast);
            gsap.set(coverToast, { autoAlpha: 0 });
            gsap.set(walker, { x: d.x, y: d.y, autoAlpha: 1 });
          } else {
            gsap.set(walker, { autoAlpha: 1 });
          }
          jump(0, 0);
          return true;
        }
        if (toastState === 'walking' && p < T_START * 0.4) {
          toastState = 'cover';
          if (coverToast) {
            const d = deltaTo(coverToast);
            /* aim where the seat will be once the wall settles at x = 0 */
            d.x += 0 - Number(gsap.getProperty(track, 'x'));
            jump(d.x, d.y, () => {
              if (toastState !== 'cover') return;
              gsap.set(walker, { autoAlpha: 0 });
              gsap.fromTo(coverToast, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 });
            });
          }
          return true;
        }
        if (toastState === 'walking' && p > T_END) {
          toastState = 'end';
          if (endToast) {
            const d = deltaTo(endToast);
            /* aim where the seat will be once the wall settles at full travel */
            d.x += -(track.scrollWidth - window.innerWidth) - Number(gsap.getProperty(track, 'x'));
            jump(d.x, d.y, () => {
              if (toastState !== 'end') return;
              gsap.set(walker, { autoAlpha: 0, x: 0, y: 0 });
              gsap.fromTo(endToast, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 });
            });
          }
          return true;
        }
        if (toastState === 'end' && p < T_END - 0.012) {
          toastState = 'walking';
          if (endToast) {
            const d = deltaTo(endToast);
            gsap.set(endToast, { autoAlpha: 0 });
            gsap.set(walker, { x: d.x, y: d.y, autoAlpha: 1 });
          }
          jump(0, 0);
          return true;
        }
        return false;
      };
      updateToast = (p) => {
        lastP = p;
        /* a REAL scroll ends a banner visit (ignore scrub micro-trickle) */
        if (toastState === 'visiting' && Math.abs(p - pSeat) > 0.004) {
          toastState = 'walking';
          seated = false;
          jump(0, 0);
        }
        let guard = 0;
        while (stepToast(p) && guard++ < 3) { /* settle through multi-state jumps */ }
      };

      /* cover layers follow the cursor on depth planes */
      const coverLayers = [
        ['.tjc-browser', 10], ['.tjc-tablet', 20], ['.tjc-phone', 30],
        ['.tjc-stamp', 26],
      ].flatMap(([sel, depth]) => qa(sel, panels[0]).map((el) => ({
        depth,
        toX: gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3' }),
        toY: gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3' }),
      })));
      window.addEventListener('mousemove', (e) => {
        if (window.scrollY > window.innerWidth) return;   /* cover left behind */
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        coverLayers.forEach((l) => { l.toX(nx * l.depth); l.toY(ny * l.depth); });
      }, { passive: true });

      /* hover: lift the paper off the wall */
      qa('.tj-print, .tj-step__shot, .tjc-browser, .tjc-tablet, .tjc-phone').forEach((el) => {
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
          gsap.to(el, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.8, ease: 'power3.out' });
        });
      });

      /* idle breathing so the wall is never frozen
         (seated toasts stay still: they are jump targets) */
    }

    /* ---- cover reveal: plays on load, no scroll needed ---- */
    const coverTargets = qa('[data-reveal]', panels[0]);
    if (coverTargets.length && !reduceMotion) {
      hideTargets(coverTargets);
      revealTl(coverTargets, { delay: 0.25, duration: 1.05, stagger: 0.11 });
    }

    /* ---- later chapters reveal as they enter ---- */
    panels.slice(1).forEach((panel) => {
      const targets = qa('[data-reveal]', panel);
      if (!targets.length || reduceMotion) return;
      hideTargets(targets);
      ScrollTrigger.create({
        trigger: panel,
        containerAnimation: horizontal,
        start: 'left 62%',
        once: true,
        onEnter: () => revealTl(targets),
      });
    });

    /* ---- depth parallax: data-depth drifts against travel ---- */
    if (!reduceMotion) {
      qa('[data-depth]').forEach((el) => {
        const depth = parseFloat(el.dataset.depth || '0');
        if (!depth) return;
        const panel = el.closest('.tj-panel');
        if (!panel) return;
        gsap.fromTo(el,
          { x: () => depth * 0.012 * window.innerWidth },
          {
            x: () => -depth * 0.012 * window.innerWidth,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: horizontal,
              start: 'left right',
              end: 'right left',
              scrub: 1.4,
              invalidateOnRefresh: true,
            },
          });
      });

      /* ---- vertical bob: cards float as they cross the viewport ---- */
      qa('[data-float]').forEach((el) => {
        const amp = parseFloat(el.dataset.float || '0');
        if (!amp) return;
        const panel = el.closest('.tj-panel');
        if (!panel) return;
        gsap.fromTo(el,
          { yPercent: amp },
          {
            yPercent: -amp,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: horizontal,
              start: 'left right',
              end: 'right left',
              scrub: 1.6,
              invalidateOnRefresh: true,
            },
          });
      });

      /* ---- flutter: pinned papers sway while passing ---- */
      qa('[data-sway]').forEach((el) => {
        const deg = parseFloat(el.dataset.sway || '0');
        if (!deg) return;
        const panel = el.closest('.tj-panel');
        if (!panel) return;
        gsap.fromTo(el,
          { rotation: deg },
          {
            rotation: -deg,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: horizontal,
              start: 'left right',
              end: 'right left',
              scrub: 2.2,
              invalidateOnRefresh: true,
            },
          });
      });

      /* ---- the shelf: screens read themselves as you pass ---- */
      qa('[data-scrollimg]').forEach((img) => {
        const speed = parseFloat(img.dataset.scrollimg || '0.8');
        const view = img.parentElement;
        gsap.to(img, {
          y: () => {
            const travel = img.scrollHeight - view.clientHeight;
            return travel > 0 ? -travel * Math.min(1, speed) : 0;
          },
          ease: 'none',
          scrollTrigger: {
            trigger: view.closest('.tj-print'),
            containerAnimation: horizontal,
            start: 'left 105%',
            end: 'right -5%',
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        });
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  });

  /* =========================================================
     NARROW — vertical story, simple reveals
     ========================================================= */
  mm.add('(max-width: 899px)', () => {
    if (progressFill) progressFill.style.transform = 'scaleX(0)';

    const stripCleanups = qa('.tj-flow__steps, .tj-stand')
      .filter((strip) => strip.scrollWidth > strip.clientWidth + 4)
      .map((strip) => {
        const onWheel = (event) => {
          const rawDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
          if (!rawDelta) return;

          const max = strip.scrollWidth - strip.clientWidth;
          const atStart = strip.scrollLeft <= 1 && rawDelta < 0;
          const atEnd = strip.scrollLeft >= max - 1 && rawDelta > 0;
          if (atStart || atEnd) return;

          event.preventDefault();
          strip.scrollLeft = Math.max(0, Math.min(max, strip.scrollLeft + rawDelta));
        };

        let dragStartX = 0;
        let dragStartY = 0;
        let dragStartLeft = 0;
        let dragPointerId = null;
        let dragging = false;
        let lastPointerStartAt = 0;

        const startDrag = (event) => {
          if (event.pointerType === 'touch') return;
          if (event.button !== undefined && event.button !== 0) return;
          lastPointerStartAt = event.type === 'pointerdown' ? performance.now() : lastPointerStartAt;
          dragPointerId = event.pointerId;
          dragStartX = event.clientX;
          dragStartY = event.clientY;
          dragStartLeft = strip.scrollLeft;
          dragging = false;
          strip.classList.add('is-swipe-ready');
          if (strip.setPointerCapture && event.pointerId !== undefined) {
            try { strip.setPointerCapture(event.pointerId); } catch (_) {}
          }
        };

        const moveDrag = (event) => {
          if (event.pointerType === 'touch') return;
          if (dragPointerId !== null && event.pointerId !== dragPointerId) return;
          const dx = event.clientX - dragStartX;
          const dy = event.clientY - dragStartY;
          if (!dragging) {
            if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) return;
            if (Math.abs(dx) < 7) return;
            dragging = true;
            strip.classList.add('is-swiping');
          }
          event.preventDefault();
          strip.scrollLeft = dragStartLeft - dx;
        };

        const endDrag = (event) => {
          if (dragPointerId !== null && event?.pointerId !== undefined && event.pointerId !== dragPointerId) return;
          if (strip.releasePointerCapture && dragPointerId !== null) {
            try { strip.releasePointerCapture(dragPointerId); } catch (_) {}
          }
          dragPointerId = null;
          dragging = false;
          strip.classList.remove('is-swipe-ready', 'is-swiping');
        };

        const startMouseDrag = (event) => {
          if (performance.now() - lastPointerStartAt < 120) return;
          startDrag(event);
        };

        strip.addEventListener('wheel', onWheel, { passive: false });
        strip.addEventListener('pointerdown', startDrag, { passive: true });
        strip.addEventListener('pointermove', moveDrag, { passive: false });
        strip.addEventListener('pointerup', endDrag, { passive: true });
        strip.addEventListener('pointercancel', endDrag, { passive: true });
        strip.addEventListener('lostpointercapture', endDrag, { passive: true });
        window.addEventListener('pointermove', moveDrag, { passive: false });
        window.addEventListener('pointerup', endDrag, { passive: true });
        window.addEventListener('pointercancel', endDrag, { passive: true });
        strip.addEventListener('mousedown', startMouseDrag, { passive: true });
        window.addEventListener('mousemove', moveDrag, { passive: false });
        window.addEventListener('mouseup', endDrag, { passive: true });
        return () => {
          strip.removeEventListener('wheel', onWheel);
          strip.removeEventListener('pointerdown', startDrag);
          strip.removeEventListener('pointermove', moveDrag);
          strip.removeEventListener('pointerup', endDrag);
          strip.removeEventListener('pointercancel', endDrag);
          strip.removeEventListener('lostpointercapture', endDrag);
          window.removeEventListener('pointermove', moveDrag);
          window.removeEventListener('pointerup', endDrag);
          window.removeEventListener('pointercancel', endDrag);
          strip.removeEventListener('mousedown', startMouseDrag);
          window.removeEventListener('mousemove', moveDrag);
          window.removeEventListener('mouseup', endDrag);
        };
      });

    const setChapterVertical = () => {
      const probe = window.scrollY + window.innerHeight * 0.4;
      let idx = 0;
      panels.forEach((p, i) => { if (probe >= p.offsetTop) idx = i; });
      const num = String(idx + 1).padStart(2, '0');
      if (chNum && chNum.textContent !== num) chNum.textContent = num;
      if (chName && chName.textContent !== chapters[idx]) chName.textContent = chapters[idx];
    };

    const vertical = ScrollTrigger.create({
      trigger: document.body,
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => {
        if (progressFill) progressFill.style.transform = `scaleX(${self.progress})`;
        setChapterVertical();
      },
    });

    panels.forEach((panel, i) => {
      const targets = qa('[data-reveal]', panel);
      if (!targets.length || reduceMotion) return;
      hideTargets(targets);
      if (i === 0) {
        revealTl(targets, { delay: 0.25 });
        return;
      }
      ScrollTrigger.create({
        trigger: panel,
        start: 'top 72%',
        once: true,
        onEnter: () => revealTl(targets),
      });
    });

    return () => {
      stripCleanups.forEach((cleanup) => cleanup());
      vertical.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  });

  body.classList.add('is-motion-ready');

  /* ---------- cover CTA: begin the tour ---------- */
  const cta = document.getElementById('tjc-cta');
  if (cta) {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      const target = window.innerWidth >= 900
        ? window.innerWidth * 1.05
        : document.querySelectorAll('.tj-panel')[1]?.offsetTop || window.innerHeight;
      window.scrollTo({ top: target, behavior: 'smooth' });
    });
  }

  /* ---------- keep measurements honest ---------- */
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();
