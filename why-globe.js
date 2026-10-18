(function () {
  'use strict';

  // Neutral Color Palette (White, Silver, Slate, Charcoal, Off-Black)
  const PALETTE = {
    offBlack: 0x090a0d,       // Core inner sphere
    charcoalDark: 0x181a1f,   // Perimeter inactive conduits
    charcoal: 0x242830,       // Technical wireframe grid, inactive conduits
    slate: 0x585e6b,          // Dimmed non-primary nodes
    silverMuted: 0x78808d,    // Conduit baseline line color
    silver: 0xc8ccd6,         // Country borders & fallback
    silverLight: 0xdce0e8,    // Atmosphere aura halo & node rings
    silverWhite: 0xe8ecf2,    // Highlighted conduits & accent nodes
    white: 0xffffff           // Nodes & data packet particles
  };

  function initWhyGlobe() {
    const THREE = window.THREE;
    if (!THREE) {
      if (initWhyGlobe._retries === undefined) initWhyGlobe._retries = 0;
      if (initWhyGlobe._retries < 50) {
        initWhyGlobe._retries++;
        setTimeout(initWhyGlobe, 100);
      }
      return;
    }

    const container = document.getElementById('globe-canvas-container');
    if (!container) return;

    // Prevent duplicate initialization and cleanly teardown existing instance if present
    if (typeof container.__whyGlobeCleanup === 'function') {
      container.__whyGlobeCleanup();
    }

    const loader = document.getElementById('globe-loader');
    const section = container.closest('section') || container;

    // Remove any leftover canvas from previous runs
    const existingCanvas = container.querySelector('canvas');
    if (existingCanvas) {
      existingCanvas.remove();
    }

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();

    let initialW = container.clientWidth || 600;
    let initialH = container.clientHeight || 640;
    if (initialW <= 0) initialW = 600;
    if (initialH <= 0) initialH = 640;

    const camera = new THREE.PerspectiveCamera(45, initialW / initialH, 0.1, 250);
    camera.position.set(0, 0, 35);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(initialW, initialH);

    // Optimize device pixel ratio: clamp to 1.5 on mobile/laptops for smooth 60fps
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    container.appendChild(renderer.domElement);

    // --- Orbit Controls (Native or Resilient Fallback) ---
    const OrbitControls = THREE.OrbitControls || window.OrbitControls;
    let controls;
    if (typeof OrbitControls === 'function') {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0, 0);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enablePan = false;
      controls.enableZoom = false; // Prevent page scroll disruption
      controls.minDistance = 20;
      controls.maxDistance = 60;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.75;
    } else {
      let isDragging = false;
      let prevMouseX = 0;
      let prevMouseY = 0;
      controls = {
        autoRotate: true,
        autoRotateSpeed: 0.75,
        target: new THREE.Vector3(0, 0, 0),
        update: () => {
          if (controls.autoRotate && !isDragging) {
            globeGroup.rotation.y += 0.003 * (controls.autoRotateSpeed || 1);
          }
        }
      };
      renderer.domElement.addEventListener('pointerdown', (e) => {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      });
      window.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        globeGroup.rotation.y += dx * 0.005;
        globeGroup.rotation.x += dy * 0.005;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      });
      window.addEventListener('pointerup', () => { isDragging = false; });
    }

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 10;

    // --- 1. Solid Inner Sphere (Engineering Dark Core) ---
    const innerGeo = new THREE.SphereGeometry(GLOBE_RADIUS - 0.05, 36, 36);
    const innerMat = new THREE.MeshBasicMaterial({ color: PALETTE.offBlack });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    globeGroup.add(innerSphere);

    // --- 2. Latitude / Longitude Technical Grid ---
    const gridGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 36, 18);
    const gridMat = new THREE.MeshBasicMaterial({
      color: PALETTE.charcoal,
      wireframe: true,
      transparent: true,
      opacity: 0.55
    });
    const gridSphere = new THREE.Mesh(gridGeo, gridMat);
    globeGroup.add(gridSphere);

    // --- 3. Subtle Ethereal Atmosphere Aura ---
    const haloGeo = new THREE.RingGeometry(GLOBE_RADIUS + 0.02, GLOBE_RADIUS + 0.8, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: PALETTE.silverLight,
      transparent: true,
      opacity: 0.10,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.lookAt(camera.position);
    scene.add(haloMesh);

    // --- Utility: Lat/Lon to 3D Vector ---
    function latLongToVector3(lat, lon, radius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    // --- Helper to hide loader cleanly ---
    const hideLoader = () => {
      if (loader) {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(() => {
          loader.style.display = 'none';
        }, 350);
      }
    };

    // Auto-hide loader after 1500ms max
    const loaderTimeout = setTimeout(hideLoader, 1500);

    // --- 4. Country Outlines with Robust Procedural Fallback ---
    let bordersMesh = null;

    function buildFallbackBorders() {
      if (bordersMesh) return;
      const fallbackPoints = [];
      // Procedural tactical landmass rings (Equator, Tropics, Major Meridian Arcs)
      [-60, -40, -20, 0, 20, 40, 60].forEach(lat => {
        for (let lon = -180; lon < 180; lon += 6) {
          fallbackPoints.push(latLongToVector3(lat, lon, GLOBE_RADIUS));
          fallbackPoints.push(latLongToVector3(lat, lon + 3, GLOBE_RADIUS));
        }
      });
      for (let lon = -180; lon < 180; lon += 45) {
        for (let lat = -80; lat < 80; lat += 4) {
          fallbackPoints.push(latLongToVector3(lat, lon, GLOBE_RADIUS));
          fallbackPoints.push(latLongToVector3(lat + 2, lon, GLOBE_RADIUS));
        }
      }
      const fbGeo = new THREE.BufferGeometry().setFromPoints(fallbackPoints);
      const fbMat = new THREE.LineBasicMaterial({
        color: PALETTE.silver,
        transparent: true,
        opacity: 0.38
      });
      bordersMesh = new THREE.LineSegments(fbGeo, fbMat);
      globeGroup.add(bordersMesh);
      hideLoader();
    }

    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
      .then(response => {
        if (!response.ok) throw new Error('Network error');
        return response.json();
      })
      .then(data => {
        clearTimeout(loaderTimeout);
        if (bordersMesh) return;
        const points = [];
        function processRing(ring) {
          for (let i = 0; i < ring.length - 1; i++) {
            const p1 = latLongToVector3(ring[i][1], ring[i][0], GLOBE_RADIUS);
            const p2 = latLongToVector3(ring[i + 1][1], ring[i + 1][0], GLOBE_RADIUS);
            points.push(p1, p2);
          }
        }
        data.features.forEach(feature => {
          if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates.forEach(ring => processRing(ring));
          } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach(poly => {
              poly.forEach(ring => processRing(ring));
            });
          }
        });
        const bordersGeo = new THREE.BufferGeometry().setFromPoints(points);
        const bordersMat = new THREE.LineBasicMaterial({
          color: PALETTE.silver,
          transparent: true,
          opacity: 0.58
        });
        bordersMesh = new THREE.LineSegments(bordersGeo, bordersMat);
        globeGroup.add(bordersMesh);
        hideLoader();
      })
      .catch(() => {
        clearTimeout(loaderTimeout);
        buildFallbackBorders();
      });

    // --- 5. Distributed Network Points & Nodes ---
    const networkGroup = new THREE.Group();
    globeGroup.add(networkGroup);

    const coordinates = [
      { lat: 40.71, lon: -74.00, region: 'A' }, // New York
      { lat: 51.50, lon: -0.12, region: 'A' },  // London
      { lat: 35.68, lon: 139.69, region: 'B' }, // Tokyo
      { lat: -33.86, lon: 151.20, region: 'B' },// Sydney
      { lat: -23.55, lon: -46.63, region: 'C' },// Sao Paulo
      { lat: -33.92, lon: 18.42, region: 'C' }, // Cape Town
      { lat: 19.07, lon: 72.87, region: 'D' },  // Mumbai
      { lat: 37.77, lon: -122.41, region: 'D' } // San Francisco
    ];

    const nodeMeshes = [];
    const nodes = [];
    const activeParticles = [];
    const connectionLines = [];

    const nodeGeo = new THREE.CircleGeometry(0.18, 16);
    const ringGeo = new THREE.RingGeometry(0.22, 0.32, 16);

    coordinates.forEach((loc) => {
      const pos = latLongToVector3(loc.lat, loc.lon, GLOBE_RADIUS + 0.02);
      nodes.push(pos);

      // Inner node disc
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.copy(pos);
      mesh.lookAt(new THREE.Vector3(0, 0, 0));
      networkGroup.add(mesh);
      nodeMeshes.push(mesh);

      // Outer accent ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: PALETTE.silverLight,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      networkGroup.add(ringMesh);
    });

    // --- 6. Curved Connection Conduits ---
    // Shared geometry and material for particles to eliminate duplicate GPU allocations
    const particleGeo = new THREE.SphereGeometry(0.11, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: PALETTE.white });

    function createConnection(startPos, endPos, index) {
      const distance = startPos.distanceTo(endPos);
      const midPoint = startPos.clone().lerp(endPos, 0.5);
      const arcHeight = distance * 0.22;
      midPoint.normalize().multiplyScalar(GLOBE_RADIUS + arcHeight);

      const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
      const points = curve.getPoints(50);

      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: PALETTE.silverMuted,
        transparent: true,
        opacity: 0.55
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.userData = { id: index, origColor: PALETTE.silverMuted, origOpacity: 0.55 };
      networkGroup.add(line);
      connectionLines.push(line);

      // Data packet particle traveling along wire
      const particle = new THREE.Mesh(particleGeo, particleMat);
      networkGroup.add(particle);

      activeParticles.push({
        mesh: particle,
        curve: curve,
        progress: Math.random(),
        speed: 0.0022 + (Math.random() * 0.0025),
        baseSpeed: 0.0022 + (Math.random() * 0.0025)
      });
    }

    // Connect the nodes (mesh architecture)
    let connIdx = 0;
    nodes.forEach((startNode, i) => {
      for (let j = 1; j <= 2; j++) {
        const targetIndex = (i + j) % nodes.length;
        createConnection(startNode, nodes[targetIndex], connIdx++);
      }
    });


    function setGlobeState(state) {
      if (state === 0) {
        // 01 SECURITY BY DESIGN: Emphasize node architecture
        controls.autoRotateSpeed = 0.45;
        nodeMeshes.forEach(m => {
          m.material.color.setHex(PALETTE.white);
          m.scale.set(1.4, 1.4, 1.4);
        });
        connectionLines.forEach(l => {
          l.material.color.setHex(PALETTE.silverWhite);
          l.material.opacity = 0.85;
        });
        activeParticles.forEach(p => p.speed = p.baseSpeed);
      } else if (state === 1) {
        // 02 SYSTEM-LEVEL THINKING: Multi-connectivity and active data flow
        controls.autoRotateSpeed = 1.1;
        nodeMeshes.forEach(m => {
          m.material.color.setHex(PALETTE.white);
          m.scale.set(1.2, 1.2, 1.2);
        });
        connectionLines.forEach(l => {
          l.material.color.setHex(PALETTE.silverWhite);
          l.material.opacity = 0.9;
        });
        activeParticles.forEach(p => p.speed = p.baseSpeed * 2.2);
      } else if (state === 2) {
        // 03 MISSION-CRITICAL FOCUS: Stability, controlled connections & core activity
        controls.autoRotateSpeed = 0.35;
        nodeMeshes.forEach((m, i) => {
          m.material.color.setHex(i % 2 === 0 ? PALETTE.white : PALETTE.silverMuted);
          m.scale.set(1.25, 1.25, 1.25);
        });
        connectionLines.forEach((l, i) => {
          if (i % 2 === 0) {
            l.material.color.setHex(PALETTE.silverWhite);
            l.material.opacity = 0.95;
          } else {
            l.material.color.setHex(PALETTE.charcoal);
            l.material.opacity = 0.30;
          }
        });
        activeParticles.forEach(p => p.speed = p.baseSpeed * 0.9);
      } else if (state === 3) {
        // 04 DIGITAL INFRASTRUCTURE: Focused monitoring pattern
        controls.autoRotateSpeed = 0.55;
        nodeMeshes.forEach((m, i) => {
          if (i === 6 || i === 7 || i === 0) {
            m.material.color.setHex(PALETTE.silverLight);
            m.scale.set(1.4, 1.4, 1.4);
          } else {
            m.material.color.setHex(PALETTE.slate);
            m.scale.set(0.9, 0.9, 0.9);
          }
        });
        connectionLines.forEach((l, i) => {
          if (i === 0 || i === 1 || i === 12 || i === 13) {
            l.material.color.setHex(PALETTE.silverWhite);
            l.material.opacity = 0.95;
          } else {
            l.material.color.setHex(PALETTE.charcoal);
            l.material.opacity = 0.25;
          }
        });
        activeParticles.forEach(p => p.speed = p.baseSpeed * 1.3);
      } else if (state === 4) {
        // 05 ENTERPRISE: Broader information flow with controlled access
        controls.autoRotateSpeed = 0.85;
        nodeMeshes.forEach((m, i) => {
          m.material.color.setHex(i % 3 === 0 ? PALETTE.silverLight : PALETTE.white);
          m.scale.set(1.15, 1.15, 1.15);
        });
        connectionLines.forEach((l, i) => {
          l.material.color.setHex(i % 3 === 0 ? PALETTE.white : PALETTE.silverMuted);
          l.material.opacity = i % 3 === 0 ? 0.78 : 0.5;
        });
        activeParticles.forEach(p => p.speed = p.baseSpeed * 1.65);
      } else if (state === 5) {
        // 06 BRAND: A measured perimeter state for external exposure
        controls.autoRotateSpeed = 0.3;
        nodeMeshes.forEach((m, i) => {
          m.material.color.setHex(i === 0 || i === 1 || i === 7 ? PALETTE.silverLight : PALETTE.slate);
          m.scale.set(i === 0 || i === 1 || i === 7 ? 1.5 : 0.85, i === 0 || i === 1 || i === 7 ? 1.5 : 0.85, 1);
        });
        connectionLines.forEach((l, i) => {
          const isPerimeterPath = i < 4 || i > 12;
          l.material.color.setHex(isPerimeterPath ? PALETTE.silverWhite : PALETTE.charcoalDark);
          l.material.opacity = isPerimeterPath ? 0.9 : 0.25;
        });
        activeParticles.forEach(p => p.speed = p.baseSpeed * 0.7);
      } else {
        // Default idle state
        controls.autoRotateSpeed = 0.75;
        nodeMeshes.forEach(m => {
          m.material.color.setHex(PALETTE.white);
          m.scale.set(1, 1, 1);
        });
        connectionLines.forEach(l => {
          l.material.color.setHex(l.userData.origColor);
          l.material.opacity = l.userData.origOpacity;
        });
        activeParticles.forEach(p => p.speed = p.baseSpeed);
      }
    }

    const protectionElements = document.querySelectorAll('.protect-item[data-protection]');
    const itemListeners = [];

    protectionElements.forEach((el) => {
      const idx = parseInt(el.getAttribute('data-protection'), 10);

      const onEnter = () => {
        protectionElements.forEach(item => item.classList.remove('is-active'));
        el.classList.add('is-active');
        setGlobeState(idx);
        renderSingleFrame();
      };

      const onLeave = () => {
        el.classList.remove('is-active');
        setGlobeState(-1);
        renderSingleFrame();
      };

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      el.addEventListener('focus', onEnter);
      el.addEventListener('blur', onLeave);

      itemListeners.push({ el, onEnter, onLeave });
    });

    // --- 8. Dynamic Frustum & Container-Responsive Sizing ---
    // Mathematically calculates exact camera distance to fit globe + conduits without cropping
    function updateDimensions() {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 640;
      if (w === 0 || h === 0) return;

      const aspect = w / h;
      camera.aspect = aspect;

      // Bound sphere encompasses globe radius (10), arched conduits (up to 14.4), and atmosphere halo
      const boundingRadius = 14.8;
      const vFovHalfRad = (camera.fov * Math.PI) / 360;
      const vDist = boundingRadius / Math.tan(vFovHalfRad); // ~35.7

      // If container aspect < 1 (mobile, tablet portrait, narrow column), horizontal FOV narrows.
      // Scale camera distance inversely by min(1, aspect) to ensure 0% cropping on any viewport.
      const targetDist = Math.max(32, Math.min(56, vDist / Math.min(1, aspect)));

      // Preserve current user drag view orientation if already rotated
      const offset = camera.position.clone().sub(controls.target);
      if (offset.lengthSq() < 0.001) {
        offset.set(0, 0, 1);
      }
      offset.setLength(targetDist);
      camera.position.copy(controls.target).add(offset);

      if (controls) {
        if (typeof controls.minDistance === 'number') controls.minDistance = targetDist * 0.65;
        if (typeof controls.maxDistance === 'number') controls.maxDistance = targetDist * 1.6;
        if (typeof controls.update === 'function') controls.update();
      }

      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderSingleFrame();
    }

    window.addEventListener('resize', updateDimensions);
    let resizeObserver = null;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(container);
    }
    updateDimensions();

    // --- 9. Visibility, Lifecycle & Reduced Motion ---
    let isIntersecting = true;
    let isDocVisible = !document.hidden;
    let isRunning = false;
    let rafId = null;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = mediaQuery.matches;
    if (prefersReducedMotion) {
      controls.autoRotate = false;
    }

    const onMotionChange = (e) => {
      prefersReducedMotion = e.matches;
      if (controls) {
        controls.autoRotate = !prefersReducedMotion;
      }
      renderSingleFrame();
    };
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onMotionChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(onMotionChange);
    }

    function renderSingleFrame() {
      if (controls && typeof controls.update === 'function') {
        controls.update();
      }
      if (haloMesh) {
        haloMesh.lookAt(camera.position);
      }
      renderer.render(scene, camera);
    }

    // --- 10. Animation Loop ---
    function animate() {
      rafId = null;
      if (!isIntersecting || !isDocVisible) {
        isRunning = false;
        return; // Complete pause when offscreen or backgrounded
      }

      if (controls && typeof controls.update === 'function') {
        controls.update();
      }

      // Keep aura ring aligned with camera perspective
      if (haloMesh) {
        haloMesh.lookAt(camera.position);
      }

      if (!prefersReducedMotion) {
        // Zero-allocation particle animation: pass target mesh.position to avoid GC pauses
        for (let i = 0; i < activeParticles.length; i++) {
          const p = activeParticles[i];
          p.progress += p.speed;
          if (p.progress >= 1) {
            p.progress = 0;
          }
          p.curve.getPointAt(p.progress, p.mesh.position);
        }
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }

    function startAnimationLoop() {
      if (isRunning) return;
      if (!isIntersecting || !isDocVisible) return;
      isRunning = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(animate);
    }

    function stopAnimationLoop() {
      isRunning = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    // IntersectionObserver: Pause rendering when offscreen
    let intersectionObserver = null;
    if ('IntersectionObserver' in window && section) {
      intersectionObserver = new IntersectionObserver((entries) => {
        for (let i = 0; i < entries.length; i++) {
          isIntersecting = entries[i].isIntersecting;
        }
        if (isIntersecting && isDocVisible) {
          startAnimationLoop();
        } else {
          stopAnimationLoop();
        }
      }, { threshold: [0, 0.05], rootMargin: '60px' });
      intersectionObserver.observe(section);
    }

    // Page Visibility API: Pause rendering when browser tab is inactive/minimized
    const onVisibilityChange = () => {
      isDocVisible = !document.hidden;
      if (isDocVisible && isIntersecting) {
        startAnimationLoop();
      } else {
        stopAnimationLoop();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Initial render and start loop
    renderSingleFrame();
    startAnimationLoop();

    // --- Cleanup & Resource Disposal ---
    container.__whyGlobeCleanup = function () {
      stopAnimationLoop();
      clearTimeout(loaderTimeout);

      window.removeEventListener('resize', updateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      if (intersectionObserver) {
        intersectionObserver.disconnect();
        intersectionObserver = null;
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);

      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', onMotionChange);
      } else if (typeof mediaQuery.removeListener === 'function') {
        mediaQuery.removeListener(onMotionChange);
      }

      itemListeners.forEach(({ el, onEnter, onLeave }) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.removeEventListener('focus', onEnter);
        el.removeEventListener('blur', onLeave);
      });
      itemListeners.length = 0;

      if (controls && typeof controls.dispose === 'function') {
        controls.dispose();
      }

      // Dispose geometries and materials
      scene.traverse((obj) => {
        if (obj.geometry && typeof obj.geometry.dispose === 'function') {
          obj.geometry.dispose();
        }
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m && typeof m.dispose === 'function' && m.dispose());
          } else if (typeof obj.material.dispose === 'function') {
            obj.material.dispose();
          }
        }
      });

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
      }

      delete container.__whyGlobeCleanup;
    };
  }

  // Self-boot with loading state check
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWhyGlobe, { once: true });
  } else {
    initWhyGlobe();
  }
})();
