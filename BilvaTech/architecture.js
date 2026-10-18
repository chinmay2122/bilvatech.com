document.addEventListener("DOMContentLoaded", () => {
  const world = document.getElementById('bta-world');
  const gridFloor = document.querySelector('.bta-grid-floor');
  const visualContainer = document.getElementById('bta-visual-container');
  const tabs = document.querySelectorAll('.bta-tab');
  const viewToggle = document.getElementById('bta-toggle-view');
  const infoBox = document.getElementById('bta-info-box');
  const infoTitle = document.getElementById('bta-info-title');
  const infoDesc = document.getElementById('bta-info-desc');

  // State management
  let isExploded = true;
  let activeLayerData = null; // Holds the currently "pinned/locked" layer
  let isMouseOverCanvas = false;
  const MAX_Z_HEIGHT = 220;
  
  const defaultInfo = {
    title: "System Architecture",
    desc: "Select a mode above. Hover over a layer to inspect it, or click to pin its details."
  };

  const architectures = {
    kernel: [
      { title: "APPLICATIONS & WORKLOADS", desc: "Independent applications and operating systems running securely without interfering with one another." },
      { title: "SEPARATION KERNEL HYPERVISOR", desc: "The core control layer. Strictly isolates workloads and controls explicit communication and hardware access.", isCore: true },
      { title: "HARDWARE", desc: "Shared physical resources securely partitioned and allocated by the kernel.", isGrid: true }
    ],
    iot: [
      { title: "APPLICATIONS & ANALYTICS", desc: "Cloud or on-premise logic executing on verified data streams." },
      { title: "DATA PLATFORM", desc: "Aggregates, structures, and protects data arriving from the edge." },
      { title: "SECURE CONNECTIVITY", desc: "Encrypted, authenticated transit tunnels protecting data in motion." },
      { title: "IOT GATEWAY", desc: "The central control hub aggregating local device networks before external transmission.", isCore: true },
      { title: "EDGE PLATFORM", desc: "Local processing nodes making immediate, low-latency decisions." },
      { title: "SENSORS & DEVICES", desc: "Physical endpoints collecting telemetry and executing local commands." }
    ],
    cybersecurity: [
      { title: "SECURE SYSTEM ARCHITECTURE", desc: "Security is engineered directly into the system's foundation, not bolted on.", isCore: true },
      { title: "IDENTITY & AUTHENTICATION", desc: "Cryptographic verification of all users, devices, and workloads." },
      { title: "DATA PROTECTION", desc: "Safeguarding data at rest, in use, and in transit against unauthorized access." },
      { title: "PLATFORM INTEGRITY", desc: "Ensuring the system boots and operates in a mathematically proven trusted state." },
      { title: "SECURE OPERATION", desc: "Runtime protections isolating processes and preventing memory-based exploits." },
      { title: "MONITORING & AUDIT", desc: "Continuous observation of system states to detect and log anomalies." },
      { title: "SECURE UPDATES", desc: "Cryptographically signed over-the-air updates to patch vulnerabilities." },
      { title: "VULNERABILITY MANAGEMENT", desc: "Continuous lifecycle approach to identifying and mitigating new threats." }
    ],
    consulting: [
      { title: "RISK ASSESSMENT", desc: "Identifying business-critical assets and modeling potential threat vectors." },
      { title: "SECURITY ARCHITECTURE & STRATEGY", desc: "Designing resilient enterprise structures aligned with business goals.", isCore: true },
      { title: "DATA PROTECTION / IDENTITY / GOVERNANCE", desc: "Implementing the core triad of enterprise security controls." },
      { title: "COMPLIANCE & SECURITY READINESS", desc: "Verifying posture against global regulatory and industry standards." },
      { title: "INCIDENT PREPAREDNESS", desc: "Establishing and testing proactive response and recovery playbooks." },
      { title: "SECURITY IMPROVEMENT", desc: "Iterative hardening based on audit findings and evolving threats." }
    ]
  };

  // Render the 3D layers
  function renderArchitecture(mode) {
    world.innerHTML = '';
    activeLayerData = null; // reset lock
    updateInfoPanel();
    
    const layersData = architectures[mode];
    const layerCount = layersData.length;

    layersData.forEach((layer, index) => {
      const el = document.createElement('div');
      el.className = 'bta-layer';
      if (layer.isCore) el.classList.add('is-core');
      
      if (layer.isGrid) {
        el.innerHTML = `<div class="bta-hw-grid"><div>CPU</div><div>MEMORY</div><div>I/O</div><div>PERIPHERALS</div></div>`;
      } else {
        el.textContent = layer.title;
      }

      // Generate Connector
      let connector;
      if (index < layerCount - 1) {
        connector = document.createElement('div');
        connector.className = 'bta-connector';
        el.appendChild(connector);
      }

      // Storing index for positional updates
      el.dataset.index = index;
      el.dataset.total = layerCount;
      world.appendChild(el);

      // Interaction Logic
      const setFocus = () => {
        if (!activeLayerData) { // Only highlight if nothing is pinned
          infoTitle.textContent = layer.title;
          infoDesc.textContent = layer.desc;
          infoBox.classList.add('highlight');
        }
      };
      const removeFocus = () => {
        if (!activeLayerData) updateInfoPanel();
      };

      el.addEventListener('mouseenter', setFocus);
      el.addEventListener('mouseleave', removeFocus);
      
      // Click to Pin Feature
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // If clicking the already locked layer, unlock it
        if (activeLayerData === layer) {
          activeLayerData = null;
          document.querySelectorAll('.bta-layer').forEach(l => l.classList.remove('is-locked'));
          setFocus(); // Keep hover state since mouse is still over it
        } else {
          // Lock new layer
          activeLayerData = layer;
          document.querySelectorAll('.bta-layer').forEach(l => l.classList.remove('is-locked'));
          el.classList.add('is-locked');
          updateInfoPanel();
        }
      });

      // Entry Animation
      requestAnimationFrame(() => {
        setTimeout(() => {
          el.style.opacity = '1';
          applyLayerTransforms(el, index, layerCount);
        }, index * 40);
      });
    });
  }

  // Calculate and apply Z-depths and Connector heights
  function applyLayerTransforms(layerEl, index, total) {
    const gap = isExploded ? (total > 1 ? MAX_Z_HEIGHT / (total - 1) : 0) : 10;
    const totalHeight = isExploded ? MAX_Z_HEIGHT : (total - 1) * 10;
    const zPos = totalHeight - (index * gap);
    
    // When collapsed, offset X/Y slightly so you can see the edges of the stack
    const compressOffsetX = !isExploded ? (index * -2) : 0;
    const compressOffsetY = !isExploded ? (index * -2) : 0;

    layerEl.style.transform = `translate3d(${compressOffsetX}px, ${compressOffsetY}px, ${zPos}px)`;
    
    const connector = layerEl.querySelector('.bta-connector');
    if (connector) {
      connector.style.height = `${gap}px`;
    }
  }

  function updateAllLayerPositions() {
    const layers = document.querySelectorAll('.bta-layer');
    layers.forEach(el => {
      applyLayerTransforms(el, parseInt(el.dataset.index), parseInt(el.dataset.total));
    });
  }

  function updateInfoPanel() {
    if (activeLayerData) {
      infoTitle.textContent = activeLayerData.title;
      infoDesc.textContent = activeLayerData.desc;
      infoBox.classList.add('highlight', 'is-pinned');
    } else {
      infoTitle.textContent = defaultInfo.title;
      infoDesc.textContent = defaultInfo.desc;
      infoBox.classList.remove('highlight', 'is-pinned');
    }
  }

  // --- MOUSE PARALLAX ENGINE ---
  let rafId = null;
  let targetX = -45; // Base Z rotation
  let targetY = 60;  // Base X rotation
  let currentX = -45;
  let currentY = 60;

  function renderParallax() {
    if (isMouseOverCanvas) {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      world.style.transform = `rotateX(${currentY}deg) rotateZ(${currentX}deg)`;
      gridFloor.style.transform = `rotateX(${currentY}deg) rotateZ(${currentX}deg) translateZ(-100px)`;
      rafId = requestAnimationFrame(renderParallax);
    }
  }

  visualContainer.addEventListener('mousemove', (e) => {
    // Prevent parallax if reduced motion is preferred
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (!isMouseOverCanvas) {
      isMouseOverCanvas = true;
      world.classList.remove('snapping');
      gridFloor.classList.remove('snapping');
      renderParallax();
    }

    const rect = visualContainer.getBoundingClientRect();
    const xPercent = (e.clientX - rect.left) / rect.width - 0.5;
    const yPercent = (e.clientY - rect.top) / rect.height - 0.5;

    // Calculate limits: RotateZ (-45 base), RotateX (60 base)
    targetX = -45 + (xPercent * 25);
    targetY = 60 - (yPercent * 25);
  });

  visualContainer.addEventListener('mouseleave', () => {
    isMouseOverCanvas = false;
    cancelAnimationFrame(rafId);
    
    world.classList.add('snapping');
    gridFloor.classList.add('snapping');
    
    targetX = -45;
    targetY = 60;
    currentX = -45;
    currentY = 60;
    
    world.style.transform = `rotateX(60deg) rotateZ(-45deg)`;
    gridFloor.style.transform = `rotateX(60deg) rotateZ(-45deg) translateZ(-100px)`;
  });

  // Clear pinned item if clicking empty space in the visual container
  visualContainer.addEventListener('click', () => {
    activeLayerData = null;
    document.querySelectorAll('.bta-layer').forEach(l => l.classList.remove('is-locked'));
    updateInfoPanel();
  });

  // Toggle View Event
  viewToggle.addEventListener('click', () => {
    isExploded = !isExploded;
    viewToggle.innerHTML = isExploded ? '<span class="icon">⬍</span> COMPACT VIEW' : '<span class="icon">⬍</span> EXPLODE VIEW';
    updateAllLayerPositions();
  });

  // Tab Events
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      e.target.classList.add('active');
      e.target.setAttribute('aria-selected', 'true');
      
      renderArchitecture(e.target.getAttribute('data-mode'));
    });
  });

  // Initialize
  renderArchitecture('kernel');
});
