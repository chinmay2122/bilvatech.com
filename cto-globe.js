import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(function initWhyGlobe() {
  const container = document.getElementById('globe-canvas-container');
  const loader = document.getElementById('globe-loader');
  const section = document.getElementById('final-cta');
  if (!container) return;

  // Clear previous content if any
  const existingCanvas = container.querySelector('canvas');
  if (existingCanvas) {
    existingCanvas.remove();
  }

  // --- Scene, Camera, Renderer ---
  const scene = new THREE.Scene();

  const initialW = container.clientWidth || 600;
  const initialH = container.clientHeight || 640;

  const camera = new THREE.PerspectiveCamera(45, initialW / initialH, 0.1, 200);
  // Centered camera aligned to origin
  camera.position.set(0, 0, 35);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(initialW, initialH);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // --- Orbit Controls ---
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = false;
  controls.enableZoom = false; // Prevent page scroll disruption
  controls.minDistance = 20;
  controls.maxDistance = 60;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.75;

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const GLOBE_RADIUS = 10;

  // --- 1. Solid Inner Sphere (Engineering Dark Core) ---
  const innerGeo = new THREE.SphereGeometry(GLOBE_RADIUS - 0.05, 64, 64);
  const innerMat = new THREE.MeshBasicMaterial({ color: 0x0c0a0e });
  const innerSphere = new THREE.Mesh(innerGeo, innerMat);
  globeGroup.add(innerSphere);

  // --- 2. Latitude / Longitude Technical Grid ---
  const gridGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 36, 18);
  const gridMat = new THREE.MeshBasicMaterial({
    color: 0x30242e,
    wireframe: true,
    transparent: true,
    opacity: 0.65
  });
  const gridSphere = new THREE.Mesh(gridGeo, gridMat);
  globeGroup.add(gridSphere);

  // --- 3. Subtle Ethereal Atmosphere Aura ---
  const haloGeo = new THREE.RingGeometry(GLOBE_RADIUS + 0.02, GLOBE_RADIUS + 0.8, 64);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xc38b92,
    transparent: true,
    opacity: 0.12,
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
    const fbMat = new THREE.LineBasicMaterial({ color: 0xd9c2cb, transparent: true, opacity: 0.35 });
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
      const bordersMat = new THREE.LineBasicMaterial({ color: 0xd9c2cb, transparent: true, opacity: 0.55 });
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
      color: 0xc38b92,
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
  function createConnection(startPos, endPos, index) {
    const distance = startPos.distanceTo(endPos);
    const midPoint = startPos.clone().lerp(endPos, 0.5);
    const arcHeight = distance * 0.22;
    midPoint.normalize().multiplyScalar(GLOBE_RADIUS + arcHeight);

    const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
    const points = curve.getPoints(50);

    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x80566d,
      transparent: true,
      opacity: 0.55
    });
    const line = new THREE.Line(lineGeo, lineMat);
    line.userData = { id: index, origColor: 0x80566d, origOpacity: 0.55 };
    networkGroup.add(line);
    connectionLines.push(line);

    // Data packet particle traveling along wire
    const particleGeo = new THREE.SphereGeometry(0.11, 10, 10);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
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

  // --- 7. Interactive Link between Principles & Globe ---
  let activePrincipleIdx = -1;
  const principleElements = document.querySelectorAll('.why-principle');

  function setGlobeState(state) {
    activePrincipleIdx = state;

    if (state === 0) {
      // 01 SECURITY BY DESIGN: Emphasize node architecture
      controls.autoRotateSpeed = 0.45;
      nodeMeshes.forEach(m => {
        m.material.color.setHex(0xffffff);
        m.scale.set(1.4, 1.4, 1.4);
      });
      connectionLines.forEach(l => {
        l.material.color.setHex(0xc38b92);
        l.material.opacity = 0.85;
      });
      activeParticles.forEach(p => p.speed = p.baseSpeed);
    } else if (state === 1) {
      // 02 SYSTEM-LEVEL THINKING: Multi-connectivity and active data flow
      controls.autoRotateSpeed = 1.1;
      nodeMeshes.forEach(m => {
        m.material.color.setHex(0xffffff);
        m.scale.set(1.2, 1.2, 1.2);
      });
      connectionLines.forEach(l => {
        l.material.color.setHex(0xc38b92);
        l.material.opacity = 0.9;
      });
      activeParticles.forEach(p => p.speed = p.baseSpeed * 2.2);
    } else if (state === 2) {
      // 03 MISSION-CRITICAL FOCUS: Stability, controlled connections & core activity
      controls.autoRotateSpeed = 0.35;
      nodeMeshes.forEach((m, i) => {
        m.material.color.setHex(i % 2 === 0 ? 0xffffff : 0x80566d);
        m.scale.set(1.25, 1.25, 1.25);
      });
      connectionLines.forEach((l, i) => {
        if (i % 2 === 0) {
          l.material.color.setHex(0xc38b92);
          l.material.opacity = 0.95;
        } else {
          l.material.color.setHex(0x30242e);
          l.material.opacity = 0.35;
        }
      });
      activeParticles.forEach(p => p.speed = p.baseSpeed * 0.9);
    } else if (state === 3) {
      // 04 TAILORED APPROACH: Focused targeted activity pattern
      controls.autoRotateSpeed = 0.55;
      nodeMeshes.forEach((m, i) => {
        if (i === 6 || i === 7 || i === 0) {
          m.material.color.setHex(0xc38b92);
          m.scale.set(1.4, 1.4, 1.4);
        } else {
          m.material.color.setHex(0x666666);
          m.scale.set(0.9, 0.9, 0.9);
        }
      });
      connectionLines.forEach((l, i) => {
        if (i === 0 || i === 1 || i === 12 || i === 13) {
          l.material.color.setHex(0xc38b92);
          l.material.opacity = 0.95;
        } else {
          l.material.color.setHex(0x30242e);
          l.material.opacity = 0.25;
        }
      });
      activeParticles.forEach(p => p.speed = p.baseSpeed * 1.3);
    } else {
      // Default idle state
      controls.autoRotateSpeed = 0.75;
      nodeMeshes.forEach(m => {
        m.material.color.setHex(0xffffff);
        m.scale.set(1, 1, 1);
      });
      connectionLines.forEach(l => {
        l.material.color.setHex(l.userData.origColor);
        l.material.opacity = l.userData.origOpacity;
      });
      activeParticles.forEach(p => p.speed = p.baseSpeed);
    }
  }

  principleElements.forEach((el) => {
    const idx = parseInt(el.getAttribute('data-principle'), 10);

    const onEnter = () => {
      principleElements.forEach(p => p.classList.remove('active-principle'));
      el.classList.add('active-principle');
      setGlobeState(idx);
    };

    const onLeave = () => {
      el.classList.remove('active-principle');
      setGlobeState(-1);
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('focus', onEnter);
    el.addEventListener('blur', onLeave);
  });

  // --- 8. Responsive Resizing & Centering ---
  function onResize() {
    if (!container) return;
    const w = container.clientWidth || 600;
    const h = container.clientHeight || 640;
    if (w === 0 || h === 0) return;

    camera.aspect = w / h;

    // Mathematically scale distance so globe + arcs fit comfortably within bounds
    let targetDist = 34;
    if (w < 480) {
      targetDist = 42;
    } else if (w < 768) {
      targetDist = 38;
    } else if (w < 1024) {
      targetDist = 35;
    } else {
      targetDist = 33;
    }

    camera.position.set(0, 0, targetDist);
    controls.target.set(0, 0, 0);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onResize);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(onResize);
    ro.observe(container);
  }
  onResize();

  // --- 9. Lifecycle & prefers-reduced-motion ---
  let isVisible = true;
  if ('IntersectionObserver' in window && section) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(section);
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    controls.autoRotate = false;
  }

  // --- 10. Animation Loop ---
  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    controls.update();

    // Keep aura ring aligned with camera perspective
    haloMesh.lookAt(camera.position);

    if (!prefersReducedMotion) {
      activeParticles.forEach(p => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
        }
        const point = p.curve.getPointAt(p.progress);
        p.mesh.position.copy(point);
      });
    }

    renderer.render(scene, camera);
  }

  animate();
})();
