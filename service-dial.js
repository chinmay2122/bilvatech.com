(() => {
  const root = document.querySelector('.service-dial');
  if (!root) return;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];
  const segments = [...root.querySelectorAll('[data-segment]')];
  const playback = root.querySelector('.dial-playback');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0, paused = motion.matches, visible = false, timer;
  function select(index) {
    active = index;
    root.dataset.service = String(index);
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
      segments[i].classList.toggle('is-active', i === index);
    });
    root.dispatchEvent(new CustomEvent('bilva:service-change', { detail: { index } }));
    root.querySelector('#service-count').textContent = `0${index + 1}`;
    root.querySelector('#dial-core-label').textContent = ['ISOLATE', 'CONNECT', 'FORTIFY'][index];
  }
  function schedule() {
    clearInterval(timer);
    if (!paused && !motion.matches && visible && !document.hidden && !root.matches(':hover') && !root.contains(document.activeElement)) {
      timer = setInterval(() => select((active + 1) % 3), 6000);
    }
  }
  function updatePlayback() {
    playback.setAttribute('aria-pressed', String(paused));
    playback.innerHTML = paused ? 'Play animation <span aria-hidden="true">▷</span>' : 'Pause animation <span aria-hidden="true">Ⅱ</span>';
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => { select(i); schedule(); });
    tab.addEventListener('keydown', event => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (active + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
      select(next); tabs[next].focus();
    });
  });
  segments.forEach((segment, i) => segment.addEventListener('click', () => { select(i); tabs[i].focus(); }));
  playback.addEventListener('click', () => { paused = !paused; updatePlayback(); schedule(); });
  root.addEventListener('pointerenter', () => clearInterval(timer));
  root.addEventListener('pointerleave', schedule);
  root.addEventListener('focusin', () => clearInterval(timer));
  root.addEventListener('focusout', () => setTimeout(schedule, 0));
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { paused = motion.matches; updatePlayback(); schedule(); });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: .25 }).observe(root);
  updatePlayback();
})();
