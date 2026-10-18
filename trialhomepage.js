/**
 * Bilva Tech: Final Website Refinement Scripts
 * trialhomepage.js
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initExpertiseShowcase();
  initFaqAccordion();
  initQrGenerator();
});

/* --------------------------------------------------
   1. Mobile Navigation
   -------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector(".menu-toggle");
  const overlay = document.querySelector(".mobile-overlay");
  if (!toggleBtn || !overlay) return;

  const toggle = (isOpen) => {
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      overlay.removeAttribute("hidden");
    } else {
      overlay.setAttribute("hidden", "");
    }
  };

  toggleBtn.addEventListener("click", () => {
    const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
    toggle(!expanded);
  });

  overlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => toggle(false));
  });
}

/* --------------------------------------------------
   2. Interactive Expertise Showcase
   3 States:
     01. Secure Architecture (#C38B92)
     02. Connected Intelligence (#A58AAE)
     03. Security Strategy (#9376AD)
   -------------------------------------------------- */
function initExpertiseShowcase() {
  const frame = document.getElementById("interactive-expertise");
  if (!frame) return;

  const tabs = frame.querySelectorAll(".exp-tab-btn");
  const panels = frame.querySelectorAll(".exp-panel");
  const arcs = [
    document.getElementById("exp-arc-0"),
    document.getElementById("exp-arc-1"),
    document.getElementById("exp-arc-2"),
  ];
  const coreTag = document.getElementById("exp-core-tag");
  const coreGlow = document.getElementById("core-glow-point");

  const stateConfigs = [
    {
      color: "#C38B92",
      tag: "ISOLATION",
      arcIdx: 0,
    },
    {
      color: "#A58AAE",
      tag: "CONNECTIVITY",
      arcIdx: 1,
    },
    {
      color: "#9376AD",
      tag: "STRATEGY",
      arcIdx: 2,
    },
  ];

  const activateState = (idx) => {
    const config = stateConfigs[idx];
    if (!config) return;

    frame.setAttribute("data-active-state", String(idx));

    // Update Tabs
    tabs.forEach((tab, i) => {
      const active = i === idx;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.setAttribute("tabindex", active ? "0" : "-1");
    });

    // Update Panels
    panels.forEach((panel, i) => {
      const active = i === idx;
      panel.classList.toggle("is-active", active);
      if (active) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });

    // Update SVG Arcs: selected arc illuminates, other two become dark graphite
    arcs.forEach((arc, i) => {
      if (!arc) return;
      if (i === idx) {
        arc.setAttribute("stroke", config.color);
        arc.setAttribute("stroke-width", "7");
        arc.classList.add("is-active");
      } else {
        arc.setAttribute("stroke", "#26222b");
        arc.setAttribute("stroke-width", "5");
        arc.classList.remove("is-active");
      }
    });

    // Update Dial Core Glow & Tag
    if (coreTag) {
      coreTag.textContent = config.tag;
      coreTag.style.color = config.color;
    }
    if (coreGlow) {
      coreGlow.style.backgroundColor = config.color;
      coreGlow.style.boxShadow = `0 0 16px ${config.color}`;
    }
  };

  tabs.forEach((tab, idx) => {
    tab.addEventListener("click", () => activateState(idx));

    // Keyboard Arrow Navigation
    tab.addEventListener("keydown", (e) => {
      let targetIdx = idx;
      if (e.key === "ArrowRight") {
        targetIdx = (idx + 1) % tabs.length;
      } else if (e.key === "ArrowLeft") {
        targetIdx = (idx - 1 + tabs.length) % tabs.length;
      }
      if (targetIdx !== idx) {
        tabs[targetIdx].focus();
        activateState(targetIdx);
      }
    });
  });

  // Initialize State 0
  activateState(0);
}

/* --------------------------------------------------
   3. FAQ Accordion
   -------------------------------------------------- */
function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-accordion-item");
  if (!items.length) return;

  items.forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // Close all other items
      items.forEach((other) => {
        if (other !== item) {
          other.classList.remove("is-open");
          other.querySelector(".faq-trigger")?.setAttribute("aria-expanded", "false");
        }
      });

      // Toggle current item
      item.classList.toggle("is-open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });
  });
}

/* --------------------------------------------------
   4. Scannable QR Code Generator Tool
   -------------------------------------------------- */
function initQrGenerator() {
  const qrTarget = document.getElementById("qr-code-target");
  const generateBtn = document.getElementById("generate-qr-btn");
  const downloadBtn = document.getElementById("download-qr-btn");
  const openToolBtn = document.getElementById("open-qr-tool-btn");
  const scrollToolBtn = document.getElementById("scroll-qr-tool-btn");
  const drawer = document.getElementById("qr-tool-drawer");

  if (!qrTarget) return;

  let currentMode = "url";

  // Mode Tabs (URL, Email, vCard)
  const modeBtns = document.querySelectorAll(".qr-mode-btn");
  const groupUrl = document.getElementById("qr-group-url");
  const groupEmail = document.getElementById("qr-group-email");
  const groupVcard = document.getElementById("qr-group-vcard");

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeBtns.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      currentMode = btn.dataset.qrMode;

      if (groupUrl) groupUrl.hidden = currentMode !== "url";
      if (groupEmail) groupEmail.hidden = currentMode !== "email";
      if (groupVcard) groupVcard.hidden = currentMode !== "vcard";

      renderQrCode();
    });
  });

  // Helper to compile payload string
  function getPayload() {
    if (currentMode === "url") {
      const input = document.getElementById("qr-input-url");
      return (input && input.value.trim()) || "https://bilvatech.vercel.app";
    }

    if (currentMode === "email") {
      const input = document.getElementById("qr-input-email");
      const email = (input && input.value.trim()) || "contact@bilvatech.com";
      return `mailto:${email}`;
    }

    if (currentMode === "vcard") {
      const name = document.getElementById("qr-vcard-name")?.value.trim() || "Bilva Tech";
      const org = document.getElementById("qr-vcard-org")?.value.trim() || "Bilva Tech Engineering";
      const phone = document.getElementById("qr-vcard-phone")?.value.trim() || "+91 80 0000 0000";
      const email = document.getElementById("qr-vcard-email")?.value.trim() || "contact@bilvatech.com";

      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${name}`,
        `ORG:${org}`,
        `TEL:${phone}`,
        `EMAIL:${email}`,
        "END:VCARD",
      ].join("\n");
    }

    return "https://bilvatech.vercel.app";
  }

  // Generate QR Code onto Canvas
  function renderQrCode() {
    const payload = getPayload();

    try {
      if (typeof qrcode !== "undefined") {
        // qrcode-generator library
        const qr = qrcode(0, "M");
        qr.addData(payload);
        qr.make();

        // Render to HTML image tag
        qrTarget.innerHTML = qr.createImgTag(5, 8);
      } else {
        // Fallback placeholder if library unavailable
        qrTarget.innerHTML = `<svg width="140" height="140" viewBox="0 0 100 100"><rect width="100" height="100" fill="#000"/><text x="50" y="55" fill="#fff" font-size="10" text-anchor="middle">BILVA QR</text></svg>`;
      }
    } catch (e) {
      console.warn("QR Generation error:", e);
    }
  }

  // PNG Download
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const img = qrTarget.querySelector("img");
      if (!img) return;

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 300;
      canvas.height = img.naturalHeight || 300;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `bilva-qr-${currentMode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }

  // Interactive buttons
  generateBtn?.addEventListener("click", renderQrCode);

  openToolBtn?.addEventListener("click", () => {
    drawer?.scrollIntoView({ behavior: "smooth" });
    const firstInput = drawer?.querySelector("input:not([hidden])");
    firstInput?.focus();
  });

  scrollToolBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    drawer?.scrollIntoView({ behavior: "smooth" });
  });

  // Initial render
  renderQrCode();
}
