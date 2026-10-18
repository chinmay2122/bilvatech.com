/* A consistent outline icon set, confined to the alternate page below the hero. */
(() => {
  if (!document.body.classList.contains('cto-home')) return;
  const paths = {
    right: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    up: '<path d="M12 19V5m-6 6 6-6 6 6"/>',
    diagonal: '<path d="m7 17 10-10M7 7h10v10"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    play: '<path d="m8 5 11 7-11 7V5Z"/>'
  };
  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const [key, value] of Object.entries({class:'ui-icon',width:'20',height:'20',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':'1.5','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',focusable:'false'})) svg.setAttribute(key,value);
    svg.innerHTML = paths[name];
    return svg;
  }
  document.querySelectorAll('.site-footer i.fa-arrow-up,.site-footer i.fa-arrow-right').forEach(el => el.replaceWith(icon(el.classList.contains('fa-arrow-up') ? 'up' : 'right')));
  document.querySelectorAll('.cto-home > section span[aria-hidden="true"]').forEach(el => {
    const name = {'→':'right','↗':'diagonal'}[el.textContent.trim()];
    if (name) el.replaceWith(icon(name));
  });
  const playback = document.querySelector('.dial-playback');
  function playbackIcon() {
    const glyph = playback?.querySelector('span');
    if (glyph) glyph.replaceWith(icon(playback.getAttribute('aria-pressed') === 'true' ? 'play' : 'pause'));
  }
  if (playback) {
    new MutationObserver(playbackIcon).observe(playback,{childList:true});
    playbackIcon();
  }
})();
