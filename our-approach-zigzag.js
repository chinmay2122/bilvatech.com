/**
 * Our Approach — Continuous Zigzag Process Timeline Controller
 * Bilva Tech Design System
 * Dynamically computes mathematical marker centers and renders a continuous
 * snake-like dotted timeline path connecting every stage without crossing text.
 */

(function () {
  'use strict';

  function initZigzagTimelines() {
    const timelines = document.querySelectorAll('.zigzag-timeline-wrap');
    if (!timelines.length) return;

    timelines.forEach((timeline) => {
      const grid = timeline.querySelector('.zigzag-grid');
      const svg = timeline.querySelector('.zigzag-svg-canvas');
      const path = timeline.querySelector('.zigzag-connector-path');

      if (!grid || !svg || !path) return;

      function updatePath() {
        if (window.innerWidth <= 768) {
          path.setAttribute('d', '');
          return;
        }

        const timelineRect = timeline.getBoundingClientRect();
        if (timelineRect.width <= 0) return;

        // Set SVG viewport to timeline wrap bounds
        svg.setAttribute('viewBox', `0 0 ${timelineRect.width} ${timelineRect.height}`);

        const stepEls = Array.from(grid.querySelectorAll('.zigzag-step')).sort((a, b) => {
          return parseInt(a.dataset.step || '0', 10) - parseInt(b.dataset.step || '0', 10);
        });

        if (!stepEls.length) return;

        // Get coordinates relative to timeline wrap
        const points = stepEls.map((step) => {
          const marker = step.querySelector('.zigzag-marker');
          const stepRect = step.getBoundingClientRect();
          if (!marker) {
            return {
              x: stepRect.left + stepRect.width / 2 - timelineRect.left,
              y: stepRect.top + 21 - timelineRect.top,
              right: stepRect.right - timelineRect.left,
              left: stepRect.left - timelineRect.left,
              stepNum: parseInt(step.dataset.step || '0', 10)
            };
          }
          const mRect = marker.getBoundingClientRect();
          return {
            x: mRect.left + mRect.width / 2 - timelineRect.left,
            y: mRect.top + mRect.height / 2 - timelineRect.top,
            right: stepRect.right - timelineRect.left,
            left: stepRect.left - timelineRect.left,
            stepNum: parseInt(step.dataset.step || '0', 10)
          };
        });

        const totalSteps = points.length;
        const radius = 18;
        let d = '';

        if (totalSteps <= 3) {
          d = `M ${points[0].x} ${points[0].y}`;
          for (let i = 1; i < totalSteps; i++) {
            d += ` L ${points[i].x} ${points[i].y}`;
          }
        } else {
          // Row 1: Steps 1, 2, 3 (Left -> Right)
          d = `M ${points[0].x} ${points[0].y}`;
          d += ` L ${points[1].x} ${points[1].y}`;
          d += ` L ${points[2].x} ${points[2].y}`;

          // Right turnaround to Row 2
          const p3 = points[2];
          const p4 = points[3];
          const p5 = points[4];
          const p6 = points[5];

          const maxCardRight = Math.max(p3.right, p4.right);
          // Position turn cleanly in the dedicated right padding area
          let turnX = maxCardRight + 24;

          if (turnX + radius > timelineRect.width - 4) {
            turnX = timelineRect.width - radius - 4;
          }

          const y1 = p3.y;
          const y2 = p4.y;

          // Draw continuous snake-like turnaround
          // Exit Marker 3 to the right
          d += ` L ${turnX - radius} ${y1}`;
          // Smooth 90-deg corner turning down
          d += ` A ${radius} ${radius} 0 0 1 ${turnX} ${y1 + radius}`;
          // Drop down vertically clear of any text
          d += ` L ${turnX} ${y2 - radius}`;
          // Smooth 90-deg corner turning left into row 2
          d += ` A ${radius} ${radius} 0 0 1 ${turnX - radius} ${y2}`;
          // Flow left into Marker 4
          d += ` L ${p4.x} ${y2}`;

          // Row 2: flow left into Marker 5
          d += ` L ${p5.x} ${y2}`;

          // If Step 6 exists: continue left into Marker 6
          if (p6) {
            d += ` L ${p6.x} ${y2}`;
          }
        }

        path.setAttribute('d', d);
      }

      // Initial execution
      updatePath();

      // Update on resize
      if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
          requestAnimationFrame(updatePath);
        });
        ro.observe(grid);
        ro.observe(timeline);
      }

      window.addEventListener('resize', updatePath, { passive: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initZigzagTimelines);
  } else {
    initZigzagTimelines();
  }
})();
