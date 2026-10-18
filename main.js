const menuToggle = document.querySelector(".menu-toggle");
const mobileOverlay = document.querySelector(".mobile-overlay");
const mobileMenu = document.querySelector(".mobile-menu");

const setMenuState = (open) => {
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  mobileOverlay.hidden = !open;
  mobileOverlay.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("menu-open", open);

  if (open) {
    requestAnimationFrame(() => mobileMenu.querySelector("a")?.focus());
  } else if (document.activeElement && mobileMenu.contains(document.activeElement)) {
    menuToggle.focus();
  }
};

if (menuToggle && mobileOverlay && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  mobileOverlay.addEventListener("click", (event) => {
    if (event.target === mobileOverlay) setMenuState(false);
  });

  mobileMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuState(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuState(false);
    }

    if (event.key === "Tab" && menuToggle.getAttribute("aria-expanded") === "true") {
      const links = [...mobileMenu.querySelectorAll("a")];
      const focusable = [menuToggle, ...links];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720 && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuState(false);
    }
  });
}

const counters = document.querySelectorAll(".count");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const animateCounter = (counter, index) => {
  if (counter.dataset.counted === "true") return;
  counter.dataset.counted = "true";

  const target = Number(counter.dataset.target);
  if (reduceMotion) {
    counter.textContent = String(target);
    return;
  }

  const duration = 900 + index * 80;
  const delay = 480 + index * 90;
  const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

  window.setTimeout(() => {
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      counter.textContent = String(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, delay);
};

if (counters.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        counters.forEach(animateCounter);
        observer.disconnect();
      });
    },
    { threshold: 0.25 },
  );

  observer.observe(document.querySelector(".stats"));
} else if (counters.length) {
  counters.forEach(animateCounter);
}

const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = contactForm.querySelector(".form-status");
    status.textContent = "Your request is prepared. Form delivery can be connected to Bilva Tech’s preferred inbox before launch.";
  });
}

const globalFooter = document.querySelector(".site-footer");
if (globalFooter) {
  globalFooter.innerHTML = `
    <div class="footer-top">
      <div class="footer-brand"><a href="index.html" aria-label="Bilva Tech home"><img src="assets/logo-icon.webp" alt="" width="44" height="44"><span><strong>Bilva Tech</strong><small>Business Solutions</small></span></a><p>Security engineered for connected and critical systems.</p></div>
      <div class="footer-nav-group"><div><span>Navigate</span><a href="index.html">Home</a><a href="solutions.html">Solutions</a><a href="about.html">About</a><a href="contact.html">Contact</a></div><div><span>Solutions</span><a href="separation-kernel-hypervisor.html">Separation Kernel</a><a href="iot-solutions.html">IoT Solutions</a><a href="cybersecurity-solutions.html">Cybersecurity</a><a href="information-security-consulting.html">Security Consulting</a></div></div>
      <div class="footer-legal"><span>Information</span><a href="contact.html">Security contact</a><a href="contact.html">Privacy enquiry</a><a href="contact.html">Responsible disclosure</a></div>
    </div>
    <div class="footer-bottom">
      <button class="back-to-top" type="button">Back to top <i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>
      <form class="footer-signup"><label for="footer-email">Security insights, without the noise.</label><div><input id="footer-email" type="email" autocomplete="email" placeholder="Business email" aria-label="Business email"><button type="submit" aria-label="Subscribe"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button></div><p role="status" aria-live="polite"></p></form>
      <div class="footer-contact"><a href="contact.html">Contact Bilva Tech</a><small>© 2026 Bilva Tech Business Solutions</small></div>
    </div>`;
  globalFooter.querySelector(".back-to-top")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  globalFooter.querySelector(".footer-signup")?.addEventListener("submit", (event) => { event.preventDefault(); event.currentTarget.querySelector("p").textContent = "Thank you. Subscription delivery can be connected before launch."; });
}

/* ==================================================
   ORBIT CARD STACK COMPONENT
   ================================================== */
function initOrbitCardStack() {
  const container = document.getElementById("orbit-stack-root");
  if (!container) return;

  const stage = document.getElementById("orbit-stage");
  const cards = Array.from(container.querySelectorAll(".orbit-card"));
  if (!cards.length) return;

  const dots = Array.from(container.querySelectorAll(".orbit-dot"));
  const prevBtn = document.getElementById("orbit-prev");
  const nextBtn = document.getElementById("orbit-next");
  const hudNum = document.getElementById("orbit-active-num");
  const hudTitle = document.getElementById("orbit-active-title");
  const hudLink = document.getElementById("orbit-active-link");

  const total = cards.length;
  const midpoint = (total - 1) / 2;
  const restingIndex = 1;
  let activeIndex = restingIndex;
  let isOpen = false;

  const inRange = (idx) => Math.min(Math.max(0, idx), total - 1);

  function getDimensions() {
    const w = window.innerWidth;
    if (w < 480) return { spread: 36, lift: 20, rotationMult: 5.2 };
    if (w < 768) return { spread: 64, lift: 26, rotationMult: 6.8 };
    if (w < 1100) return { spread: 125, lift: 34, rotationMult: 7.8 };
    return { spread: 168, lift: 38, rotationMult: 8.5 };
  }

  function updateHUD(idx) {
    const card = cards[idx];
    if (!card) return;
    const num = card.dataset.num || `0${idx + 1}`;
    const name = card.dataset.name || "";
    const url = card.dataset.url || "#";

    if (hudNum) hudNum.textContent = num;
    if (hudTitle) hudTitle.textContent = name;
    if (hudLink) {
      hudLink.href = url;
      hudLink.setAttribute("aria-label", `Explore ${name}`);
    }

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === idx);
    });
  }

  function render() {
    const { spread, lift, rotationMult } = getDimensions();

    cards.forEach((card, index) => {
      const orbit = index - midpoint;
      const stack = index - restingIndex;

      let x, y, rotation;
      if (isOpen) {
        x = orbit * spread;
        y = Math.abs(orbit) * 28 + Math.max(0, Math.abs(orbit) - 1) * 8;
        rotation = orbit * rotationMult;
      } else {
        x = stack * 10;
        y = Math.abs(stack) * 5;
        rotation = stack * 2.8;
      }

      const isActive = index === activeIndex;
      const zIndex = isActive ? 80 : 50 - Math.abs(index - activeIndex);
      const activeLift = (isOpen && isActive) ? lift : 0;
      const scale = isOpen ? 0.985 : 0.97;

      card.style.zIndex = zIndex;
      card.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y - activeLift}px)) rotate(${rotation}deg) scale(${scale})`;
      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-current", isActive ? "true" : "false");
    });

    updateHUD(activeIndex);
  }

  function activate(index, userNav = false) {
    const next = inRange(index);
    const wasActive = (activeIndex === next && isOpen);
    isOpen = true;
    activeIndex = next;
    render();

    if (userNav && wasActive) {
      const url = cards[next]?.dataset.url;
      if (url) window.location.href = url;
    }
  }

  function close() {
    isOpen = false;
    activeIndex = restingIndex;
    render();
  }

  // Hover on stage
  stage.addEventListener("mouseenter", () => {
    isOpen = true;
    render();
  });

  stage.addEventListener("mouseleave", () => {
    close();
  });

  // Card interactions
  cards.forEach((card, index) => {
    card.addEventListener("mouseenter", () => {
      activate(index);
    });

    card.addEventListener("focus", () => {
      activate(index);
    });

    card.addEventListener("click", (e) => {
      if (e.target.closest(".orbit-arrow") || e.target.closest(".orbit-cta-link")) {
        return;
      }
      if (activeIndex === index && isOpen) {
        window.location.href = card.dataset.url;
      } else {
        activate(index, true);
      }
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = (index + 1) % total;
        activate(next);
        cards[next]?.focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = (index - 1 + total) % total;
        activate(prev);
        cards[prev]?.focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.location.href = card.dataset.url;
      } else if (e.key === "Escape") {
        card.blur();
        close();
      }
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const prev = (activeIndex - 1 + total) % total;
      activate(prev);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const next = (activeIndex + 1) % total;
      activate(next);
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.dataset.index);
      activate(idx);
    });
  });

  window.addEventListener("resize", () => {
    render();
  });

  let touchStartX = 0;
  stage.addEventListener("touchstart", (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      touchStartX = e.changedTouches[0].clientX;
    }
    isOpen = true;
    render();
  }, { passive: true });

  stage.addEventListener("touchend", (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          activate((activeIndex + 1) % total);
        } else {
          activate((activeIndex - 1 + total) % total);
        }
      }
    }
  }, { passive: true });

  render();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initOrbitCardStack();
    initFaqAccordion();
    initBentoVideos();
  });
} else {
  initOrbitCardStack();
  initFaqAccordion();
  initBentoVideos();
}

/* ==================================================
   FAQ ACCORDION COMPONENT
   ================================================== */
function initFaqAccordion() {
  const faqDetails = document.querySelectorAll("#faq details");
  if (faqDetails.length) {
    faqDetails.forEach((targetDetail) => {
      targetDetail.addEventListener("toggle", () => {
        if (targetDetail.open) {
          faqDetails.forEach((otherDetail) => {
            if (otherDetail !== targetDetail && otherDetail.open) {
              otherDetail.open = false;
            }
          });
        }
      });
    });
  }

  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";

      // Close other items for focused reading
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove("active");
          const otherTrigger = other.querySelector(".faq-trigger");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        }
      });

      // Toggle current
      if (isExpanded) {
        item.classList.remove("active");
        trigger.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("active");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* ==================================================
   BENTO VIDEO AUTOPLAY & RESOURCE MANAGER
   ================================================== */
function initBentoVideos() {
  const bentoVideos = document.querySelectorAll(".solutions-bento video");
  if (!bentoVideos.length) return;

  bentoVideos.forEach((video) => {
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    const p = video.play();
    if (p !== undefined) p.catch(() => {});
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            const playPromise = video.play();
            if (playPromise !== undefined) playPromise.catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );
    bentoVideos.forEach((video) => observer.observe(video));
  }
}

