(() => {
  const preferenceKey = 'aimg-v2-lang';
  const valid = value => value === 'en' || value === 'zh';
  const params = new URLSearchParams(location.search);
  const requested = params.get('lang');
  let stored;
  try { stored = localStorage.getItem(preferenceKey); } catch (_) {}
  // The language explicitly selected by the visitor also governs old bookmarks.
  let language = valid(stored) ? stored : (valid(requested) ? requested : 'zh');
  const languageButtons = [...document.querySelectorAll('[data-lang]')];
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

  const publicationsHeader = document.querySelector('.papers-head');
  const topicTitles = new Map([
    ['multimodal', ['多模态理解与生成', 'Multimodal Understanding and Generation']],
    ['affective', ['情感感知与推理', 'Affective Perception and Reasoning']],
    ['embodied', ['具身智能与数字人', 'Embodied Intelligence and Digital Humans']],
    ['healthcare', ['智慧医疗与康复评估', 'Intelligent Healthcare and Rehabilitation Assessment']],
  ]);
  const requestedTopic = params.get('topic');
  const topic = publicationsHeader && topicTitles.get(requestedTopic);

  if (topic) {
    const [titleZh, titleEn] = topic;
    const heading = publicationsHeader.querySelector('h1');
    const intro = publicationsHeader.querySelector('.paper-intro');
    heading.dataset.zh = titleZh;
    heading.dataset.en = titleEn;
    document.body.dataset.titleZh = titleZh + '相关论著';
    document.body.dataset.titleEn = 'Publications in ' + titleEn;
    intro.hidden = requestedTopic !== 'healthcare';

    if (requestedTopic === 'healthcare') {
      intro.dataset.zh = '相关基础研究，涵盖脑电信号解码与脑机接口。';
      intro.dataset.en = 'Related foundational work on EEG decoding and brain–computer interfaces.';
    }

    let count = 0;
    document.querySelectorAll('.paper-group').forEach(group => {
      let yearCount = 0;
      group.querySelectorAll('.paper').forEach(paper => {
        paper.hidden = !paper.matches(`[data-topics~="${requestedTopic}"]`);
        if (!paper.hidden) yearCount++;
      });
      const yearLink = document.querySelector(`.paper-layout aside a[href="#${group.id}"]`);
      group.hidden = yearLink.hidden = yearCount === 0;
      group.querySelector('.year-title span').textContent = yearCount;
      yearLink.querySelector('span').textContent = yearCount;
      count += yearCount;
    });
    const countLabel = publicationsHeader.querySelector('.paper-count');
    countLabel.dataset.zh = `${count} 篇相关论著`;
    countLabel.dataset.en = `${count} related publications`;
  }

  document.querySelectorAll('.nav a[data-local-link]').forEach(anchor => {
    const target = new URL(anchor.getAttribute('href'), location.href);
    if (topic && target.pathname.endsWith('/research.html')) anchor.setAttribute('aria-current', 'location');
    if (!topic && target.pathname === location.pathname) anchor.setAttribute('aria-current', 'page');
  });

  const publicationTrack = document.querySelector('#publication-track');
  if (publicationTrack) {
    const cards = [...publicationTrack.querySelectorAll('.publication-card')];
    const pagination = document.querySelector('.publication-pagination');
    const controls = document.querySelector('.publication-controls');
    const previous = controls?.querySelector('.publication-prev');
    const next = controls?.querySelector('.publication-next');
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
      dot.dataset.ariaEn = `View publication ${index + 1} of ${cards.length} · ${title}`;
      dot.setAttribute('aria-controls', publicationTrack.id);
      dot.addEventListener('click', () => goTo(index));
      return dot;
    });
    pagination.append(...dots);

    function setActive(index) {
      if (index === active) return;
      active = index;
      previous?.setAttribute('aria-disabled', String(index === 0));
      next?.setAttribute('aria-disabled', String(index === last));
      cards.forEach((card, cardIndex) => {
        const current = cardIndex === active;
        card.toggleAttribute('data-active', current);
        dots[cardIndex].setAttribute('aria-current', String(current));
      });
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

    previous?.addEventListener('click', () => goTo(active - 1));
    next?.addEventListener('click', () => goTo(active + 1));
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
    publicationTrack.addEventListener('scrollend', syncScroll);
    const observer = new ResizeObserver(() => {
      measureStops();
      if (destination !== null) goTo(destination, false);
    });
    observer.observe(publicationTrack);
    measureStops();
    if (controls) controls.hidden = last < 1;
    pagination.hidden = last < 1;
    publicationTrack.classList.add('is-ready');
  }

  applyTheme(themePreference, false);
  applyLanguage(language);
})();
