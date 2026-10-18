/**
 * Applications ChromaGrid
 * JavaScript spotlight engine adapted from React Bits ChromaGrid (plain JS + CSS variant).
 * Scoped strictly to .applications-chroma-grid.
 */
(() => {
  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  const falloffStops = (softness = 0.6) => {
    const core = clamp(1 - softness, 0, 0.95);
    const stops = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const u = clamp((t - core) / Math.max(0.0001, 1 - core), 0, 1);
      const alpha = 1 - u * u * u * (u * (u * 6 - 15) + 10);
      stops.push(`rgba(0, 0, 0, ${alpha.toFixed(3)}) ${(t * 100).toFixed(1)}%`);
    }
    return stops.join(', ');
  };

  function initChromaGrid(root) {
    if (!root || root.__chromaInitialized) return;
    root.__chromaInitialized = true;

    const damping = 0.45;
    const fadeOut = 0.6;
    const radius = 280;
    const softness = 0.6;

    const reduceQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    let reduce = reduceQuery ? reduceQuery.matches : false;
    if (reduceQuery && reduceQuery.addEventListener) {
      reduceQuery.addEventListener('change', e => {
        reduce = e.matches;
      });
    }

    root.style.setProperty('--chroma-r', `${radius}px`);
    root.style.setProperty('--chroma-stops', falloffStops(softness));

    const state = {
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      power: 0,
      target: 0,
      primed: false
    };

    let raf = 0;
    let last = 0;

    const place = () => {
      const box = root.getBoundingClientRect();
      const cards = root.querySelectorAll('[data-chroma-area]');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--chroma-ox', `${rect.left - box.left}px`);
        card.style.setProperty('--chroma-oy', `${rect.top - box.top}px`);
      });
    };

    const frame = now => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;

      const follow = reduce ? 1 : 1 - Math.exp(-dt / Math.max(0.01, damping * 0.32));
      state.x += (state.tx - state.x) * follow;
      state.y += (state.ty - state.y) * follow;

      const span = state.target > state.power ? 0.1 : Math.max(0.02, fadeOut * 0.35);
      state.power += (state.target - state.power) * (reduce ? 1 : 1 - Math.exp(-dt / span));

      root.style.setProperty('--chroma-x', `${state.x.toFixed(2)}px`);
      root.style.setProperty('--chroma-y', `${state.y.toFixed(2)}px`);
      root.style.setProperty('--chroma-power', state.power.toFixed(4));

      const settled =
        Math.abs(state.tx - state.x) < 0.1 &&
        Math.abs(state.ty - state.y) < 0.1 &&
        Math.abs(state.target - state.power) < 0.002;

      if (settled) {
        state.power = state.target;
        root.style.setProperty('--chroma-power', state.power.toFixed(4));
        last = 0;
      } else {
        raf = requestAnimationFrame(frame);
      }
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = event => {
      const box = root.getBoundingClientRect();
      state.tx = event.clientX - box.left;
      state.ty = event.clientY - box.top;

      if (!state.primed || state.power < 0.02) {
        state.x = state.tx;
        state.y = state.ty;
        state.primed = true;
      }
      state.target = 1;
      wake();
    };

    const onLeave = () => {
      state.target = 0;
      wake();
    };

    // Touch device support: when a card is touched, update coordinates immediately
    const onTouch = event => {
      if (!event.touches || event.touches.length === 0) return;
      const touch = event.touches[0];
      const box = root.getBoundingClientRect();
      state.tx = touch.clientX - box.left;
      state.ty = touch.clientY - box.top;
      state.x = state.tx;
      state.y = state.ty;
      state.target = 1;
      wake();
    };

    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerdown', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave, { passive: true });
    root.addEventListener('pointercancel', onLeave, { passive: true });
    root.addEventListener('touchstart', onTouch, { passive: true });
    root.addEventListener('touchmove', onTouch, { passive: true });
    root.addEventListener('touchend', onLeave, { passive: true });

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => place());
      ro.observe(root);
    }
    window.addEventListener('resize', place, { passive: true });
    window.addEventListener('scroll', place, { passive: true });

    place();
  }

  function init() {
    const grids = document.querySelectorAll('.applications-chroma-grid');
    grids.forEach(initChromaGrid);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
