/**
 * Bilva Tech — Animated Customer Perspectives Component
 * Recreates Framer Marketplace "Testimonial Animated" dual-direction infinite marquee,
 * cursor-reactive glow, focus/hover pause, and accessible fallback.
 */

const getTestimonialsConfig = () => window.testimonialsConfig || {};
const getTestimonialsRow1 = () => window.testimonialsRow1 || [];
const getTestimonialsRow2 = () => window.testimonialsRow2 || [];

/**
 * Creates HTML string for a single testimonial card
 * @param {Object} item 
 * @param {boolean} isDuplicate
 */
function createCardElement(item, isDuplicate = false) {
  const card = document.createElement("article");
  card.className = "testimonial-card";
  card.setAttribute("tabindex", isDuplicate ? "-1" : "0");
  card.setAttribute("role", isDuplicate ? "presentation" : "article");
  if (isDuplicate) {
    card.setAttribute("aria-hidden", "true");
  } else {
    card.setAttribute("aria-label", `${item.solutionArea} perspective by ${item.author}`);
  }

  // Avatar / Monogram with graceful fallback to initials on error
  const altText = `Portrait of ${item.author}`;
  const avatarContent = item.avatar
    ? `<img src="${item.avatar}" alt="${altText}" loading="lazy" width="36" height="36" onerror="this.style.display='none';if(this.nextElementSibling){this.nextElementSibling.style.display='flex';}" /><span class="avatar-fallback" style="display:none;">${item.initials || "BT"}</span>`
    : `<span class="avatar-fallback">${item.initials || "BT"}</span>`;

  card.innerHTML = `
    <div class="card-quote-body">
      <blockquote class="card-quote-text">${item.quote}</blockquote>
    </div>
    <div class="card-author-footer">
      <div class="card-avatar-box testimonial-avatar" aria-hidden="true">
        ${avatarContent}
      </div>
      <div class="card-author-details">
        <h4 class="card-author-name">${item.author}</h4>
        <p class="card-author-title">${item.designation}</p>
        <p class="card-author-org">${item.organization}</p>
      </div>
    </div>
  `;

  // Attach cursor-reactive glow (Framer component highlight behavior)
  const config = getTestimonialsConfig();
  if (config.cursorReactiveGlow) {
    let ticking = false;
    card.addEventListener("pointermove", (e) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
        ticking = false;
      });
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--mouse-x", "-999px");
      card.style.setProperty("--mouse-y", "-999px");
    });
  }

  return card;
}

/**
 * Mounts a marquee row with Group 1 + Group 2 (duplicate) for seamless loop
 */
function mountMarqueeRow(container, items, speedSeconds, isReverse = false) {
  if (!container) return;

  const track = document.createElement("div");
  track.className = "marquee-track";

  // Group 1 (Primary track content)
  const group1 = document.createElement("div");
  group1.className = "marquee-group";
  items.forEach((item) => {
    group1.appendChild(createCardElement(item, false));
  });

  // Group 2 (Duplicate track for seamless gapless loop)
  const group2 = document.createElement("div");
  group2.className = "marquee-group";
  group2.setAttribute("aria-hidden", "true");
  group2.setAttribute("data-duplicate", "true");
  items.forEach((item) => {
    group2.appendChild(createCardElement(item, true));
  });

  track.appendChild(group1);
  track.appendChild(group2);
  container.appendChild(track);

  // Set speed
  container.style.setProperty(isReverse ? "--speed-2" : "--speed-1", `${speedSeconds}s`);

  // Mobile touch support: tap or hold to pause marquee
  let touchTimeout;
  container.addEventListener("touchstart", () => {
    container.classList.add("is-paused");
  }, { passive: true });

  container.addEventListener("touchend", () => {
    clearTimeout(touchTimeout);
    touchTimeout = setTimeout(() => {
      container.classList.remove("is-paused");
    }, 1800);
  }, { passive: true });
}

/**
 * Initializes the entire Testimonials & Perspectives Section
 */
function initTestimonials() {
  const section = document.getElementById("testimonials");
  if (!section) return;

  const row1Container = document.getElementById("testimonials-row-1");
  const row2Container = document.getElementById("testimonials-row-2");

  const config = getTestimonialsConfig();
  const row1 = getTestimonialsRow1();
  const row2 = getTestimonialsRow2();

  // Populate Row 1 (Right to Left)
  if (row1Container) {
    row1Container.innerHTML = "";
    mountMarqueeRow(row1Container, row1, config.speedRow1 || 42, false);
  }

  // Populate Row 2 (Left to Right)
  if (row2Container) {
    row2Container.innerHTML = "";
    mountMarqueeRow(row2Container, row2, config.speedRow2 || 46, true);
  }

  // Entrance Reveal Animation
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add("is-visible");
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    observer.observe(section);
  } else {
    section.classList.add("is-visible");
  }
}

// Expose to window
if (typeof window !== "undefined") {
  window.initTestimonials = initTestimonials;
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTestimonials);
} else {
  initTestimonials();
}
