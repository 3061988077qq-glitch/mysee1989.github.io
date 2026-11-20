(() => {
  const preferenceKey = 'aimg-v2-lang';
  const valid = value => value === 'en' || value === 'zh';
  const requested = new URLSearchParams(location.search).get('lang');
  let stored;
  try { stored = localStorage.getItem(preferenceKey); } catch (_) {}
  // The language explicitly selected by the visitor also governs old bookmarks.
  let language = valid(stored) ? stored : (valid(requested) ? requested : 'zh');
  const languageButtons = [...document.querySelectorAll('[data-lang]')];
  const video = document.querySelector('.hero-video');
  const videoToggle = document.querySelector('#video-toggle');
  const themeKey = 'aimg-theme';
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const themePicker = document.querySelector('.theme-picker');
  let themePreference = document.documentElement.dataset.themePreference || 'system';

  function updateThemeControl() {
    const names = language === 'en'
      ? { system: 'System', light: 'Light', dark: 'Dark' }
      : { system: '跟随系统', light: '日间模式', dark: '夜间模式' };
    const label = (language === 'en' ? 'Appearance: ' : '显示模式：') + names[themePreference];
    const summary = themePicker?.querySelector('summary');
    if (summary) {
      summary.setAttribute('aria-label', label);
      summary.title = label;
    }
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === themePreference));
    });
  }

  function applyTheme(preference, persist = true) {
    if (!['system', 'light', 'dark'].includes(preference)) return;
    themePreference = preference;
    document.documentElement.dataset.themePreference = preference;
    document.documentElement.dataset.theme = preference === 'dark' || (preference === 'system' && systemTheme.matches) ? 'dark' : 'light';
    if (persist) {
      try { localStorage.setItem(themeKey, preference); } catch (_) {}
    }
    updateThemeControl();
  }
  document.querySelectorAll('[data-theme-choice]').forEach(button => {
    button.addEventListener('click', () => {
      applyTheme(button.dataset.themeChoice);
      themePicker.open = false;
      themePicker.querySelector('summary').focus();
    });
  });
  const onSystemThemeChange = () => {
    if (themePreference === 'system') applyTheme('system', false);
  };
  if (systemTheme.addEventListener) systemTheme.addEventListener('change', onSystemThemeChange);
  else systemTheme.addListener(onSystemThemeChange);
  document.addEventListener('click', event => {
    if (themePicker?.open && !themePicker.contains(event.target)) themePicker.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && themePicker?.open) {
      themePicker.open = false;
      themePicker.querySelector('summary').focus();
    }
  });


  function updateVideoButton() {
    if (!video || !videoToggle) return;
    videoToggle.textContent = language === 'en'
      ? (video.paused ? 'Play background video' : 'Pause background video')
      : (video.paused ? '播放背景视频' : '暂停背景视频');
  }

  function applyLanguage(next, persist = true) {
    if (!valid(next)) return;
    language = next;
    document.documentElement.lang = next === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-zh][data-en]').forEach(element => {
      element.textContent = element.dataset[next];
    });
    document.querySelectorAll('[data-aria-zh]').forEach(element => {
      element.setAttribute('aria-label', element.dataset[next === 'en' ? 'ariaEn' : 'ariaZh']);
    });
    document.querySelectorAll('[data-visible-lang]').forEach(element => {
      element.hidden = element.dataset.visibleLang !== next;
    });
    languageButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === next));
    });
    document.querySelectorAll('a[data-local-link]').forEach(anchor => {
      const destination = new URL(anchor.getAttribute('href'), location.href);
      destination.searchParams.set('lang', next);
      anchor.href = destination.pathname + destination.search + destination.hash;
    });
    const pageTitle = document.body.dataset[next === 'en' ? 'titleEn' : 'titleZh'];
    document.title = `${pageTitle || (next === 'en' ? 'AIMG' : '多模态与情感智能研究组')} | AIMG`;
    if (persist) {
      try { localStorage.setItem(preferenceKey, next); } catch (_) {}
    }
    const current = new URL(location.href);
    current.searchParams.set('lang', next);
    history.replaceState(null, '', current);
    updateVideoButton();
    updateThemeControl();
  }

  languageButtons.forEach(button => {
    button.addEventListener('click', () => applyLanguage(button.dataset.lang));
  });
  window.addEventListener('storage', event => {
    if (event.key === preferenceKey && valid(event.newValue)) applyLanguage(event.newValue, false);
    if (event.key === themeKey) applyTheme(event.newValue || 'system', false);
  });
  window.addEventListener('pageshow', () => {
    try {
      const current = localStorage.getItem(preferenceKey);
      if (valid(current) && current !== language) applyLanguage(current, false);
      applyTheme(localStorage.getItem(themeKey) || 'system', false);
    } catch (_) {}
  });

  if (video && videoToggle) {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let allowPlayback = !reducedMotion.matches;
    let heroVisible = video.getBoundingClientRect().bottom > 0;
    video.muted = true;
    video.autoplay = allowPlayback;
    const syncPlayback = () => {
      if (allowPlayback && !document.hidden && heroVisible) {
        video.play().catch(updateVideoButton);
      } else {
        video.pause();
      }
    };
    video.addEventListener('play', updateVideoButton);
    video.addEventListener('pause', updateVideoButton);
    video.addEventListener('error', () => { videoToggle.hidden = true; }, true);
    videoToggle.addEventListener('click', () => {
      allowPlayback = video.paused;
      syncPlayback();
    });
    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('pageshow', syncPlayback);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        heroVisible = entries[0].isIntersecting;
        syncPlayback();
      }, { threshold: 0.05 });
      observer.observe(video);
    }
    syncPlayback();
  }
  document.querySelectorAll('.nav a[data-local-link]').forEach(anchor => {
    const target = new URL(anchor.getAttribute('href'), location.href);
    if (target.pathname === location.pathname) anchor.setAttribute('aria-current', 'page');
  });

  const publicationTrack = document.querySelector('#publication-track');
  if (publicationTrack) {
    const cards = [...publicationTrack.querySelectorAll('.publication-card')];
    const controls = document.querySelector('.publication-controls');
    const pagination = document.querySelector('.publication-pagination');
    const previous = controls.querySelector('.publication-prev');
    const next = controls.querySelector('.publication-next');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const last = cards.length - 1;
    let active = -1;
    let destination = null;
    let stops = [];

    const dots = cards.map((card, index) => {
      const title = card.querySelector('h3').textContent;
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.dataset.ariaZh = `查看第 ${index + 1} 篇论文，共 ${cards.length} 篇 · ${title}`;
      dot.dataset.ariaEn = `Show paper ${index + 1} of ${cards.length} · ${title}`;
      dot.setAttribute('aria-controls', publicationTrack.id);
      dot.addEventListener('click', () => goTo(index));
      return dot;
    });
    pagination.append(...dots);

    function setActive(index) {
      if (index === active) return;
      active = index;
      cards.forEach((card, cardIndex) => {
        const current = cardIndex === active;
        card.toggleAttribute('data-active', current);
        dots[cardIndex].setAttribute('aria-current', String(current));
      });
      previous.setAttribute('aria-disabled', String(index === 0));
      next.setAttribute('aria-disabled', String(index === last));
    }

    function syncScroll() {
      const left = publicationTrack.scrollLeft;
      if (destination !== null) {
        if (Math.abs(stops[destination] - left) <= 2) destination = null;
        return;
      }
      const nearest = stops.reduce((best, stop, index) =>
        Math.abs(left - stop) < Math.abs(left - stops[best]) ? index : best, 0);
      setActive(nearest);
    }

    function goTo(index, animate = true) {
      if (index < 0 || index > last) return;
      destination = Math.abs(stops[index] - publicationTrack.scrollLeft) > 2 ? index : null;
      setActive(index);
      publicationTrack.scrollTo({
        left: stops[index],
        behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant',
      });
    }

    function measureStops() {
      const width = publicationTrack.clientWidth;
      const max = publicationTrack.scrollWidth - width;
      stops = cards.map(card => Math.max(0, Math.min(max, card.offsetLeft - (width - card.offsetWidth) / 2)));
      syncScroll();
    }

    previous.addEventListener('click', () => goTo(active - 1));
    next.addEventListener('click', () => goTo(active + 1));
    publicationTrack.addEventListener('click', event => {
      if (event.detail === 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const index = cards.indexOf(event.target.closest('.publication-card'));
      if (index === -1 || index === active) return;
      event.preventDefault();
      goTo(index);
    });
    publicationTrack.addEventListener('focusin', event => {
      const index = cards.indexOf(event.target.closest('.publication-card'));
      if (index !== -1 && index !== active && event.target.matches(':focus-visible')) goTo(index, false);
    });
    publicationTrack.addEventListener('keydown', event => {
      if (event.target !== publicationTrack || event.altKey || event.ctrlKey || event.metaKey) return;
      switch (event.key) {
        case 'ArrowLeft': goTo(active - 1); break;
        case 'ArrowRight': goTo(active + 1); break;
        case 'Home': goTo(0); break;
        case 'End': goTo(last); break;
        default: return;
      }
      event.preventDefault();
    });
    publicationTrack.addEventListener('scroll', syncScroll, { passive: true });
    const clearDestination = () => { destination = null; };
    for (const event of ['wheel', 'pointerdown']) {
      publicationTrack.addEventListener(event, clearDestination, { passive: true });
    }
    publicationTrack.addEventListener('scrollend', () => {
      clearDestination();
      syncScroll();
    });
    const observer = new ResizeObserver(measureStops);
    observer.observe(publicationTrack);
    measureStops();
    controls.hidden = last < 1;
    pagination.hidden = last < 1;
    publicationTrack.classList.add('is-ready');
  }

  applyTheme(themePreference, false);
  applyLanguage(language);
})();
