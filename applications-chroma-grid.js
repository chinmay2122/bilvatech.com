/**
 * Applications Section — Horizontal Card Carousel Controller
 *
 * Scoped strictly to .applications-chroma-grid and .applications-layout-container.
 * Implements:
 * 1. Functional horizontal slider with accessible Next/Prev controls and touch support.
 * 2. Responsive step advancement (1 card + gap).
 * 3. Directional boundary detection (disabling arrows at start/end).
 * 4. Keyboard arrow navigation and focus alignment.
 */
(() => {
  const isReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initCarousel(gridRoot) {
    if (!gridRoot || gridRoot.__carouselInitialized) return;
    gridRoot.__carouselInitialized = true;

    const innerGrid = gridRoot.querySelector('.applications-chroma-inner');
    if (!innerGrid) return;

    if (!innerGrid.getAttribute('role')) {
      innerGrid.setAttribute('role', 'region');
      innerGrid.setAttribute('aria-label', 'Applications carousel');
      innerGrid.setAttribute('tabindex', '0');
    }

    // Locate navigation controls within container or gridRoot
    const container = gridRoot.closest('.applications-layout-container') || gridRoot.parentElement;
    const prevBtn = container.querySelector('.applications-nav-prev');
    const nextBtn = container.querySelector('.applications-nav-next');

    // Calculate step width based on card width + gap
    const getScrollStep = () => {
      const card = innerGrid.querySelector('.applications-chroma-card');
      if (card) {
        const style = window.getComputedStyle(innerGrid);
        const gap = parseFloat(style.columnGap || style.gap) || 24;
        return card.getBoundingClientRect().width + gap;
      }
      return 320;
    };

    // Update disabled state on navigation controls
    const updateNavButtons = () => {
      const maxScroll = Math.max(0, innerGrid.scrollWidth - innerGrid.clientWidth);
      const currentScroll = innerGrid.scrollLeft;

      const isAtStart = currentScroll <= 4;
      const isAtEnd = currentScroll >= maxScroll - 4;

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

    // Smooth navigation interaction
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

      setTimeout(() => {
        isNavigating = false;
        updateNavButtons();
      }, 340);
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scrollCarousel(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scrollCarousel(1);
      });
    }

    // Scroll listener with requestAnimationFrame
    let scrollRafId = null;
    innerGrid.addEventListener(
      'scroll',
      () => {
        if (scrollRafId) cancelAnimationFrame(scrollRafId);
        scrollRafId = requestAnimationFrame(updateNavButtons);
      },
      { passive: true }
    );

    // Keyboard navigation: Left/Right arrow keys
    innerGrid.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollCarousel(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollCarousel(-1);
      }
    });

    // Keep focused card fully visible within scroll window
    const cards = Array.from(innerGrid.querySelectorAll('.applications-chroma-card'));
    cards.forEach((card) => {
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

    // Resize handling
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(updateNavButtons);
      ro.observe(innerGrid);
      cards.forEach((c) => ro.observe(c));
    }
    window.addEventListener('resize', updateNavButtons, { passive: true });

    // Initial check
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
