(() => {
  let preference = 'system';
  try {
    const stored = localStorage.getItem('aimg-theme');
    if (['system', 'light', 'dark'].includes(stored)) preference = stored;
  } catch (_) {}
  const dark = preference === 'dark' || (preference === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.themePreference = preference;
})();
