(() => {
  const overlay = document.querySelector("#site-preloader");
  const grid = overlay?.querySelector("[data-preloader-grid]");

  if (!overlay || !grid) {
    document.body.classList.remove("site-is-preloading");
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fragment = document.createDocumentFragment();
  const center = 4;

  for (let row = 0; row < 9; row += 1) {
    for (let column = 0; column < 9; column += 1) {
      const x = column - center;
      const y = row - center;
      const distance = Math.hypot(x, y);
      const dot = document.createElement("span");

      dot.className = "site-preloader__dot";
      dot.style.setProperty("--dot-size", `${Math.max(3.2, 11.5 - distance * 1.35).toFixed(2)}px`);
      dot.style.setProperty("--wave-delay", `${Math.round(distance * 74)}ms`);

      if (distance > 4.65) dot.style.visibility = "hidden";
      fragment.append(dot);
    }
  }

  grid.append(fragment);

  const startedAt = performance.now();
  const minimumVisibleTime = reduceMotion ? 80 : 1250;
  let dismissed = false;

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;

    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, minimumVisibleTime - elapsed);

    window.setTimeout(() => {
      overlay.classList.add("is-leaving");
      document.body.classList.remove("site-is-preloading");

      const removeDelay = reduceMotion ? 140 : 520;
      window.setTimeout(() => overlay.remove(), removeDelay);
    }, remaining);
  };

  if (document.readyState === "complete") dismiss();
  else window.addEventListener("load", dismiss, { once: true });

  window.setTimeout(dismiss, 4500);
})();
