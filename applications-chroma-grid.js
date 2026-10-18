/**
 * Applications Section — Horizontal Card Carousel & AnimatedBackground Integration
 *
 * Scoped strictly to .applications-chroma-grid.
 * Implements:
 * 1. Functional horizontal slider with accessible Next/Prev controls and touch support.
 * 2. CSS scroll snapping with controlled step advancement.
 * 3. Directional boundary detection (disabling / hiding arrows at ends).
 * 4. Keyboard arrow navigation and focus alignment.
 * 5. Smooth shared hover highlight via GSAP.
 */
(() => {
  const SPRING_CONFIG = {
    duration: 0.5,
    ease: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
  };

  const isReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initCarousel(gridRoot) {
    if (!gridRoot || gridRoot.__carouselInitialized) return;
    gridRoot.__carouselInitialized = true;

    const innerGrid = gridRoot.querySelector('.applications-chroma-inner');
    if (!innerGrid) return;

    // Accessibility attributes on the scroll region
    if (!innerGrid.getAttribute('role')) {
      innerGrid.setAttribute('role', 'region');
      innerGrid.setAttribute('aria-label', 'Applications horizontal carousel');
      innerGrid.setAttribute('tabindex', '0');
    }

    // Ensure Navigation Buttons exist
    let prevBtn = gridRoot.querySelector('.applications-nav-prev');
    if (!prevBtn) {
      prevBtn = document.createElement('button');
      prevBtn.className = 'applications-nav-btn applications-nav-prev';
      prevBtn.type = 'button';
      prevBtn.setAttribute('aria-label', 'Previous applications');
      prevBtn.disabled = true;
      prevBtn.innerHTML = `
        <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      `;
      gridRoot.insertBefore(prevBtn, innerGrid);
    }

    let nextBtn = gridRoot.querySelector('.applications-nav-next');
    if (!nextBtn) {
      nextBtn = document.createElement('button');
      nextBtn.className = 'applications-nav-btn applications-nav-next';
      nextBtn.type = 'button';
      nextBtn.setAttribute('aria-label', 'Next applications');
      nextBtn.innerHTML = `
        <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      `;
      gridRoot.appendChild(nextBtn);
    }

    // Helper: calculate scroll step based on card dimensions + gap
    const getScrollStep = () => {
      const card = innerGrid.querySelector('.applications-chroma-card');
      const gap = 18;
      if (card) {
        return card.getBoundingClientRect().width + gap;
      }
      return 320;
    };

    // Update disabled and visibility states on navigation buttons
    const updateNavButtons = () => {
      const maxScroll = Math.max(0, innerGrid.scrollWidth - innerGrid.clientWidth);
      const currentScroll = innerGrid.scrollLeft;

      // Generous threshold to tolerate subpixel rounding
      const isAtStart = currentScroll <= 8;
      const isAtEnd = currentScroll >= maxScroll - 8;

      if (prevBtn) {
        prevBtn.disabled = isAtStart;
        prevBtn.setAttribute('aria-disabled', String(isAtStart));
        prevBtn.classList.toggle('is-disabled', isAtStart);
      }

      if (nextBtn) {
        nextBtn.disabled = isAtEnd;
        nextBtn.setAttribute('aria-disabled', String(isAtEnd));
        nextBtn.classList.toggle('is-disabled', isAtEnd);
      }
    };

    // Smooth navigation interaction guarded against rapid repeated clicks
    let isNavigating = false;
    const scrollCarousel = (direction) => {
      if (isNavigating) return;
      isNavigating = true;

      const step = getScrollStep();
      const currentScroll = innerGrid.scrollLeft;
      const maxScroll = Math.max(0, innerGrid.scrollWidth - innerGrid.clientWidth);
      const targetScroll = Math.max(0, Math.min(maxScroll, currentScroll + step * direction));

      if (Math.abs(targetScroll - currentScroll) < 1) {
        isNavigating = false;
        updateNavButtons();
        return;
      }

      innerGrid.scrollTo({
        left: targetScroll,
        behavior: isReducedMotion() ? 'auto' : 'smooth',
      });

      // Release lock after smooth scroll settle
      setTimeout(() => {
        isNavigating = false;
        updateNavButtons();
      }, 340);
    };

    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollCarousel(-1);
    });

    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollCarousel(1);
    });

    // Listen to scroll events to update arrows immediately
    let scrollRafId = null;
    innerGrid.addEventListener(
      'scroll',
      () => {
        if (scrollRafId) cancelAnimationFrame(scrollRafId);
        scrollRafId = requestAnimationFrame(updateNavButtons);
      },
      { passive: true }
    );

    // Keyboard navigation: Left/Right arrows on innerGrid
    innerGrid.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollCarousel(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollCarousel(-1);
      }
    });

    // Setup AnimatedBackground highlight
    let highlight = innerGrid.querySelector('.animated-background-highlight');
    if (!highlight) {
      highlight = document.createElement('div');
      highlight.className = 'animated-background-highlight';
      highlight.setAttribute('aria-hidden', 'true');
      innerGrid.insertBefore(highlight, innerGrid.firstChild);
    }

    highlight.style.borderRadius = '0';
    highlight.style.pointerEvents = 'none';
    highlight.style.position = 'absolute';
    highlight.style.top = '0';
    highlight.style.left = '0';
    highlight.style.zIndex = '1';
    highlight.style.opacity = '0';

    const cards = Array.from(innerGrid.querySelectorAll('.applications-chroma-card'));

    cards.forEach((card, idx) => {
      if (!card.getAttribute('data-id')) {
        card.setAttribute('data-id', `card-${idx}`);
      }
      card.style.borderRadius = '0';

      // Keep focused card fully visible
      card.addEventListener('focusin', () => {
        const parentRect = innerGrid.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        if (cardRect.left < parentRect.left) {
          innerGrid.scrollBy({
            left: cardRect.left - parentRect.left - 12,
            behavior: isReducedMotion() ? 'auto' : 'smooth',
          });
        } else if (cardRect.right > parentRect.right) {
          innerGrid.scrollBy({
            left: cardRect.right - parentRect.right + 12,
            behavior: isReducedMotion() ? 'auto' : 'smooth',
          });
        }
      });
    });

    let activeCard = null;
    let isVisible = false;

    const getCardBounds = (card) => {
      const parentRect = innerGrid.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      return {
        x: cardRect.left - parentRect.left + innerGrid.scrollLeft,
        y: cardRect.top - parentRect.top + innerGrid.scrollTop,
        width: cardRect.width,
        height: cardRect.height,
      };
    };

    const activateCard = (card, animate = true) => {
      if (!card) return;
      activeCard = card;
      const { x, y, width, height } = getCardBounds(card);
      const reduced = isReducedMotion();
      const gsap = window.gsap;

      if (gsap && !reduced && animate) {
        if (!isVisible) {
          gsap.set(highlight, { x, y, width, height, opacity: 0 });
          gsap.to(highlight, {
            opacity: 1,
            duration: 0.22,
            ease: 'power2.out',
            overwrite: 'auto',
          });
          isVisible = true;
        } else {
          gsap.to(highlight, {
            x,
            y,
            width,
            height,
            opacity: 1,
            duration: SPRING_CONFIG.duration,
            ease: SPRING_CONFIG.ease,
            overwrite: 'auto',
          });
        }
      } else {
        highlight.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        highlight.style.width = `${width}px`;
        highlight.style.height = `${height}px`;
        highlight.style.opacity = '1';
        isVisible = true;
      }
    };

    const deactivateHighlight = (animate = true) => {
      activeCard = null;
      isVisible = false;
      const gsap = window.gsap;
      const reduced = isReducedMotion();

      if (gsap && !reduced && animate) {
        gsap.to(highlight, {
          opacity: 0,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      } else {
        highlight.style.opacity = '0';
      }
    };

    cards.forEach((card) => {
      card.addEventListener('pointerenter', () => activateCard(card, true));
      card.addEventListener('focusin', () => activateCard(card, true));
    });

    innerGrid.addEventListener('pointerleave', () => deactivateHighlight(true));
    innerGrid.addEventListener('focusout', (e) => {
      if (!innerGrid.contains(e.relatedTarget)) {
        deactivateHighlight(true);
      }
    });

    // Handle resize and reflow
    const handleReflow = () => {
      updateNavButtons();
      if (activeCard) {
        const { x, y, width, height } = getCardBounds(activeCard);
        if (window.gsap) {
          window.gsap.set(highlight, { x, y, width, height });
        } else {
          highlight.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          highlight.style.width = `${width}px`;
          highlight.style.height = `${height}px`;
        }
      }
    };

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(handleReflow);
      ro.observe(innerGrid);
      cards.forEach((c) => ro.observe(c));
    }
    window.addEventListener('resize', handleReflow, { passive: true });

    // Initial button state check
    updateNavButtons();
    setTimeout(updateNavButtons, 100);
  }

  function init() {
    const grids = document.querySelectorAll('.applications-chroma-grid');
    grids.forEach(initCarousel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
