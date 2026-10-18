/**
 * AnimatedBackground Component & Engine for Bilva Tech
 *
 * Provides both the shared animated hover highlight engine (using GSAP spring physics)
 * and exports matching the Motion Primitives AnimatedBackground API.
 */

export function createAnimatedBackground(container, options = {}) {
  if (!container || container.__animatedBgInitialized) return;
  container.__animatedBgInitialized = true;

  const defaultTransition = {
    type: 'spring',
    bounce: 0.2,
    duration: 0.6,
  };

  const config = {
    highlightClass: options.className || 'animated-background-highlight',
    transition: { ...defaultTransition, ...options.transition },
    enableHover: options.enableHover !== undefined ? options.enableHover : true,
    defaultValue: options.defaultValue || null,
    onValueChange: options.onValueChange || null,
  };

  let activeId = config.defaultValue;
  let activeElement = null;

  // Ensure container has relative positioning
  const containerStyle = window.getComputedStyle(container);
  if (containerStyle.position === 'static') {
    container.style.position = 'relative';
  }

  // Create single shared highlight element
  let highlight = container.querySelector(`.${config.highlightClass}`);
  if (!highlight) {
    highlight = document.createElement('div');
    highlight.className = config.highlightClass;
    highlight.setAttribute('aria-hidden', 'true');
    container.insertBefore(highlight, container.firstChild);
  }

  // Ensure sharp corners and positioning
  highlight.style.position = 'absolute';
  highlight.style.pointerEvents = 'none';
  highlight.style.zIndex = '1';
  highlight.style.borderRadius = '0';
  highlight.style.top = '0';
  highlight.style.left = '0';

  const isReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getTargetBounds = (el) => {
    const parentRect = container.getBoundingClientRect();
    const childRect = el.getBoundingClientRect();
    return {
      x: childRect.left - parentRect.left + container.scrollLeft,
      y: childRect.top - parentRect.top + container.scrollTop,
      width: childRect.width,
      height: childRect.height,
    };
  };

  const updateHighlight = (el, animate = true) => {
    if (!el) {
      if (window.gsap && animate && !isReducedMotion()) {
        window.gsap.to(highlight, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      } else {
        highlight.style.opacity = '0';
      }
      activeElement = null;
      activeId = null;
      if (config.onValueChange) config.onValueChange(null);
      return;
    }

    const { x, y, width, height } = getTargetBounds(el);
    const wasVisible = parseFloat(highlight.style.opacity || '0') > 0.05;
    const reduced = isReducedMotion();

    activeElement = el;
    activeId = el.getAttribute('data-id') || null;
    if (config.onValueChange) config.onValueChange(activeId);

    if (window.gsap && animate && !reduced) {
      // Spring transition configuration matching { type: 'spring', bounce: 0.2, duration: 0.6 }
      // A bounce of 0.2 corresponds to a gentle overshoot with fast settle, modeled with power3.out or elastic
      const duration = config.transition.duration || 0.6;
      
      if (!wasVisible) {
        // Instant position placement on first entrance, smooth fade-in
        window.gsap.set(highlight, {
          x,
          y,
          width,
          height,
          opacity: 0,
        });
        window.gsap.to(highlight, {
          opacity: 1,
          duration: Math.min(0.25, duration * 0.4),
          ease: 'power2.out',
          overwrite: 'auto',
        });
      } else {
        // Smooth layout glide between cards across rows and columns
        window.gsap.to(highlight, {
          x,
          y,
          width,
          height,
          opacity: 1,
          duration: duration,
          ease: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
          overwrite: 'auto',
        });
      }
    } else {
      // Fallback without GSAP
      highlight.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      highlight.style.width = `${width}px`;
      highlight.style.height = `${height}px`;
      highlight.style.opacity = '1';
      if (!reduced && animate) {
        highlight.style.transition = wasVisible
          ? `transform ${config.transition.duration || 0.6}s cubic-bezier(0.2, 0.9, 0.3, 1), width 0.3s ease, height 0.3s ease, opacity 0.25s ease`
          : 'opacity 0.25s ease';
      } else {
        highlight.style.transition = 'none';
      }
    }
  };

  const getCards = () => container.querySelectorAll('[data-id]');

  const setupEvents = () => {
    const cards = getCards();

    cards.forEach((card) => {
      // Ensure content inside card is above highlight
      const cardChildren = card.children;
      for (let i = 0; i < cardChildren.length; i++) {
        const child = cardChildren[i];
        if (child !== highlight) {
          child.style.position = 'relative';
          child.style.zIndex = '2';
        }
      }

      if (config.enableHover) {
        card.addEventListener('pointerenter', () => updateHighlight(card, true));
        card.addEventListener('focusin', () => updateHighlight(card, true));
      } else {
        card.addEventListener('click', () => updateHighlight(card, true));
      }
    });

    container.addEventListener('pointerleave', () => {
      if (config.enableHover) updateHighlight(null, true);
    });

    container.addEventListener('focusout', (e) => {
      if (!container.contains(e.relatedTarget)) {
        updateHighlight(null, true);
      }
    });

    // Reposition highlight on window resize or card dimension changes
    const onResize = () => {
      if (activeElement) {
        updateHighlight(activeElement, false);
      }
    };

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(onResize);
      ro.observe(container);
      cards.forEach((card) => ro.observe(card));
    }
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', onResize, { passive: true });

    // Initial value if specified
    if (config.defaultValue) {
      const initialCard = container.querySelector(`[data-id="${config.defaultValue}"]`);
      if (initialCard) updateHighlight(initialCard, false);
    }
  };

  setupEvents();

  return {
    setActive: (id) => {
      const card = container.querySelector(`[data-id="${id}"]`);
      updateHighlight(card, true);
    },
    destroy: () => {
      if (highlight && highlight.parentNode) {
        highlight.parentNode.removeChild(highlight);
      }
      container.__animatedBgInitialized = false;
    },
  };
}

export { AnimatedBackground } from './animated-background.jsx';
export default createAnimatedBackground;
