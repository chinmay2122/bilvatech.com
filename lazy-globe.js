(function () {
  "use strict";

  const target = document.getElementById("globe-canvas-container");
  if (!target) return;

  let started = false;
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

  const start = async () => {
    if (started) return;
    started = true;
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js");
      await loadScript("why-globe.js");
    } catch {
      const loader = document.getElementById("globe-loader");
      if (loader) loader.textContent = "Interactive system map unavailable";
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        start();
      },
      { rootMargin: "700px 0px" },
    );
    observer.observe(target);
  } else {
    window.addEventListener("load", start, { once: true });
  }
})();
