(() => {
  const RETURN_FLAG = 'portfolioProjectReturn';
  const RETURN_TIME = 'portfolioProjectReturnAt';
  const RETURN_ORIGIN = 'portfolioProjectReturnOrigin';
  const TARGET_URL = 'index.html?return=project#works';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isTransitioning = false;
  let lastPointer = null;
  let lastContentPointer = null;

  const isTopChromeTarget = (target) => Boolean(target?.closest?.(
    'header, nav, .rytop, .odtop, .ftop, .tjtop, .rytop__links, .odtop__links, .ftop__links, .tjtop__links'
  ));

  const rememberPointer = (event) => {
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
    lastPointer = { x: event.clientX, y: event.clientY, source: 'pointer' };
    if (!isTopChromeTarget(event.target)) {
      lastContentPointer = { x: event.clientX, y: event.clientY, source: 'content-pointer' };
    }
  };

  document.addEventListener('pointermove', rememberPointer, { passive: true });
  document.addEventListener('mousemove', rememberPointer, { passive: true });

  const isModifiedClick = (event) => (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );

  const isPortfolioIndex = (url) => {
    const path = url.pathname.toLowerCase();
    return path.endsWith('/index.html') || path.endsWith('/');
  };

  const isWorksReturnLink = (link) => {
    const rawHref = link.getAttribute('href');
    if (!rawHref) return false;

    let url;
    try {
      url = new URL(rawHref, window.location.href);
    } catch (_) {
      return false;
    }

    if (url.origin !== window.location.origin || !isPortfolioIndex(url)) return false;

    const label = `${link.textContent || ''} ${link.getAttribute('aria-label') || ''}`.toLowerCase();
    return url.hash === '#works' || label.includes('selected works') || label.includes('back to portfolio');
  };

  const rememberReturn = (origin) => {
    try {
      sessionStorage.setItem(RETURN_FLAG, '1');
      sessionStorage.setItem(RETURN_TIME, String(Date.now()));
      if (origin) {
        sessionStorage.setItem(RETURN_ORIGIN, JSON.stringify({
          x: origin.x,
          y: origin.y,
          xPct: origin.x / Math.max(1, window.innerWidth),
          yPct: origin.y / Math.max(1, window.innerHeight),
          startR: origin.startR,
          source: origin.source || 'unknown',
        }));
      }
    } catch (_) {}
  };

  const navigateHome = (origin) => {
    rememberReturn(origin);
    window.location.href = new URL(TARGET_URL, window.location.href).href;
  };

  const getCoverRadius = (x, y) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return Math.ceil(Math.max(
      Math.hypot(x, y),
      Math.hypot(w - x, y),
      Math.hypot(x, h - y),
      Math.hypot(w - x, h - y),
    )) + 8;
  };

  const getRevealOrigin = (link, event) => {
    const clickedFromTopChrome = isTopChromeTarget(link);
    const cursor = document.querySelector('.project-cursor[data-return-origin]');
    if (cursor) {
      const rect = cursor.getBoundingClientRect();
      const style = getComputedStyle(cursor);
      if (rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && Number(style.opacity) > 0.01) {
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          startR: Math.max(22, Math.max(rect.width, rect.height) / 2),
          source: 'project-cursor',
        };
      }
    }

    if (clickedFromTopChrome && lastContentPointer) {
      return { x: lastContentPointer.x, y: lastContentPointer.y, startR: 22, source: 'content-pointer' };
    }
    if (clickedFromTopChrome) {
      return { x: window.innerWidth / 2, y: window.innerHeight / 2, startR: 22, source: 'top-chrome-center' };
    }
    if (lastPointer) {
      return { x: lastPointer.x, y: lastPointer.y, startR: 22, source: lastPointer.source };
    }
    if (event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
      return { x: event.clientX, y: event.clientY, startR: 22, source: 'click' };
    }
    const rect = link.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      startR: Math.max(22, Math.max(rect.width, rect.height) / 2),
      source: 'link-center',
    };
  };

  const playReturnTransition = (link, event) => {
    if (isTransitioning) return;
    isTransitioning = true;
    const origin = getRevealOrigin(link, event);

    if (reduceMotion || !window.gsap) {
      navigateHome(origin);
      return;
    }

    const curtain = document.createElement('div');
    curtain.className = 'project-return-curtain';
    curtain.setAttribute('aria-hidden', 'true');

    document.body.append(curtain);
    document.body.classList.add('project-return-active');

    curtain.style.setProperty('--return-x', `${origin.x}px`);
    curtain.style.setProperty('--return-y', `${origin.y}px`);
    curtain.style.setProperty('--return-r', `${origin.startR}px`);
    curtain.classList.add('is-active');

    const state = { p: 0 };
    const liveOrigin = { ...origin };
    const updateLiveOrigin = (moveEvent) => {
      if (!Number.isFinite(moveEvent.clientX) || !Number.isFinite(moveEvent.clientY)) return;
      liveOrigin.x = moveEvent.clientX;
      liveOrigin.y = moveEvent.clientY;
      liveOrigin.startR = 22;
      liveOrigin.source = 'live-pointer';
    };
    const setRadius = () => {
      const targetR = getCoverRadius(liveOrigin.x, liveOrigin.y);
      const r = liveOrigin.startR + (targetR - liveOrigin.startR) * state.p;
      curtain.style.setProperty('--return-x', `${liveOrigin.x}px`);
      curtain.style.setProperty('--return-y', `${liveOrigin.y}px`);
      curtain.style.setProperty('--return-r', `${Math.max(0, r)}px`);
    };
    window.addEventListener('pointermove', updateLiveOrigin, { passive: true });
    window.addEventListener('mousemove', updateLiveOrigin, { passive: true });
    setRadius();

    const timeline = gsap.timeline({
      onComplete: () => {
        window.removeEventListener('pointermove', updateLiveOrigin);
        window.removeEventListener('mousemove', updateLiveOrigin);
        navigateHome(liveOrigin);
      },
    });

    timeline.to(state, {
      p: 1,
      duration: 0.76,
      ease: 'power3.inOut',
      onUpdate: setRadius,
    }, 0);
  };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || isModifiedClick(event)) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target && link.target !== '_self') return;
    if (!isWorksReturnLink(link)) return;

    event.preventDefault();
    rememberPointer(event);
    playReturnTransition(link, event);
  }, true);

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    isTransitioning = false;
    document.body.classList.remove('project-return-active');
    document.querySelectorAll('.project-return-curtain').forEach((node) => node.remove());
    Array.from(document.body.children).forEach((node) => {
      if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
      node.style.transform = '';
      node.style.filter = '';
      node.style.pointerEvents = '';
    });
  });
})();
