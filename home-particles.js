(() => {
  const canvas = document.querySelector('.home-particles');
  const context = canvas.getContext('2d');
  if (!context) return;

  const surface = canvas.parentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0;
  let height = 0;
  let frame = 0;
  let previousTime = 0;
  let pointer = null;
  let particles = [];

  function resize() {
    width = surface.clientWidth;
    height = surface.clientHeight;
    const scale = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = width * scale;
    canvas.height = height * scale;
    context.setTransform(scale, 0, 0, scale, 0, 0);

    if (reducedMotion.matches) return;
    const spacing = Math.max(57, Math.sqrt(width * height / 210));
    const columns = Math.max(1, Math.round(width / spacing));
    const rows = Math.max(1, Math.round(height / spacing));
    particles = Array.from({length: columns * rows}, (_, index) => {
      const originX = (index % columns + .14 + Math.random() * .72) * width / columns;
      const originY = (Math.floor(index / columns) + .14 + Math.random() * .72) * height / rows;
      return {
        originX,
        originY,
        x: originX,
        y: originY,
        phase: Math.random() * Math.PI * 2,
        drift: 8 + Math.random() * 15,
        radius: .85 + Math.random() * 1.15,
        opacity: .22 + Math.random() * .21,
      };
    });
  }

  function draw(now) {
    const delta = previousTime ? Math.min(now - previousTime, 40) : 16;
    previousTime = now;
    const blend = 1 - Math.exp(-delta / 125);
    const time = now / 1000;
    const attractionRadius = Math.min(310, Math.max(155, Math.min(width, height) * .4));
    const nearPointer = [];
    const color = getComputedStyle(canvas).color;
    context.clearRect(0, 0, width, height);
    context.fillStyle = color;
    context.strokeStyle = color;

    for (const particle of particles) {
      const driftX = particle.originX + Math.sin(particle.phase + time * .58) * particle.drift;
      const driftY = particle.originY + Math.cos(particle.phase + time * .43) * particle.drift;
      let targetX = driftX;
      let targetY = driftY;

      if (pointer) {
        const distance = Math.hypot(driftX - pointer.x, driftY - pointer.y);
        const pull = Math.max(0, Math.min(.94, 1.42 * (1 - distance / attractionRadius)));
        const angle = particle.phase + time * .85;
        targetX += (pointer.x - driftX + Math.cos(angle) * (14 + particle.drift)) * pull;
        targetY += (pointer.y - driftY + Math.sin(angle) * (14 + particle.drift)) * pull;
        if (pull > .42) nearPointer.push(particle);
      }

      particle.x += (targetX - particle.x) * blend;
      particle.y += (targetY - particle.y) * blend;
    }

    for (let index = 0; index < nearPointer.length; index++) {
      const particle = nearPointer[index];
      for (let next = index + 1; next < nearPointer.length; next++) {
        const other = nearPointer[next];
        const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
        if (distance >= 54) continue;
        context.globalAlpha = .27 * (1 - distance / 54);
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
    }

    for (const particle of particles) {
      const proximity = pointer ? Math.max(0, 1 - Math.hypot(particle.x - pointer.x, particle.y - pointer.y) / 135) : 0;
      context.globalAlpha = particle.opacity + proximity * .45;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius + proximity * .7, 0, Math.PI * 2);
      context.fill();
    }

    frame = requestAnimationFrame(draw);
  }

  function syncAnimation() {
    cancelAnimationFrame(frame);
    previousTime = 0;
    if (reducedMotion.matches || document.hidden) {
      pointer = null;
      context.clearRect(0, 0, width, height);
      return;
    }
    frame = requestAnimationFrame(draw);
  }

  surface.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    const bounds = canvas.getBoundingClientRect();
    pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }, { passive: true });
  surface.addEventListener('pointerleave', () => { pointer = null; });
  reducedMotion.addEventListener('change', () => {
    resize();
    syncAnimation();
  });
  document.addEventListener('visibilitychange', syncAnimation);
  new ResizeObserver(resize).observe(surface);
  resize();
  syncAnimation();
})();
