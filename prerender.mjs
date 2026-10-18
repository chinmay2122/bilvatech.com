import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const servicePages = {
  kernel: {
    file: "separation-kernel-hypervisor.html",
    title: "Separation Kernel Hypervisor",
    category: "Mission-critical computing",
    accent: "85,216,255",
    color: "#55d8ff",
    headline: "Secure, isolated and predictable computing.",
    intro: "Bilva Tech enables multiple applications, operating systems and workloads to operate on a shared computing platform while maintaining clearly defined boundaries between them.",
    note: "Multiple workloads. One platform. Controlled by design.",
    values: [
      ["fa-border-all", "Strong isolation", "Independent execution environments"],
      ["fa-shield-halved", "Fault containment", "Limit interference between workloads"],
      ["fa-clock", "Deterministic execution", "Predictable resource allocation"],
      ["fa-layer-group", "Platform consolidation", "More functions on common hardware"]
    ],
    overviewTitle: "Defined boundaries for complex computing environments.",
    overview: "Controlled access to CPU, memory, I/O, peripherals and communication resources creates a structured foundation for greater security, predictability, fault containment and resource efficiency.",
    highlight: "Different workloads can share the platform without sharing unrestricted access.",
    enables: [
      "Independent workload partitioning",
      "Controlled cross-domain communication",
      "Predictable execution behaviour",
      "Efficient hardware resource use",
      "Reduced risk of fault propagation"
    ],
    capabilities: [
      ["fa-border-all", "Strong System Isolation", "Create independent execution environments that help contain software faults and prevent unauthorized interference."],
      ["fa-microchip", "Resource Management", "Control processor cores, memory, peripherals, interrupts and I/O resources for each workload."],
      ["fa-code-branch", "Mixed-Criticality Workloads", "Support applications with different safety, security, timing and performance requirements on shared hardware."],
      ["fa-clock", "Deterministic Execution", "Enable predictable allocation for real-time and time-sensitive applications."],
      ["fa-right-left", "Controlled Communication", "Establish defined data paths between selected environments while preserving separation."],
      ["fa-layer-group", "Platform Consolidation", "Bring multiple computing functions onto common hardware while retaining boundaries and control."]
    ],
    industries: [
      ["Aerospace", "Avionics and flight-control partitioning"],
      ["Defense", "Separated mission and communication workloads"],
      ["Automotive", "Mixed-criticality platform consolidation"],
      ["Industrial Automation", "Control and monitoring isolation"],
      ["Robotics", "Safety-sensitive and analytical workloads"],
      ["Transportation", "Control and passenger-information systems"],
      ["Embedded Systems", "Advanced multi-environment platforms"]
    ],
    process: [
      ["Discovery & Scoping", "Identify partitions, trust requirements and platform constraints."],
      ["System Architecture", "Define partitions, workloads and trust boundaries."],
      ["Hardware Mapping", "Allocate CPU, memory, I/O and peripherals."],
      ["Software Integration", "Integrate operating systems, applications and data flows."],
      ["Configuration & Verification", "Apply separation rules and validate predictable behaviour."],
      ["Deployment Support", "Support production embedded and mission-critical environments."]
    ],
    why: [
      ["fa-microchip", "Embedded security expertise", "A low-level understanding of hardware, software and system boundaries."],
      ["fa-shield-halved", "Mission-critical understanding", "Engineering decisions shaped around controlled, dependable operation."],
      ["fa-diagram-project", "End-to-end support", "Support spanning architecture, integration, verification and deployment."]
    ],
    cta: "Build secure systems on a controlled foundation.",
    ctaText: "Talk to Bilva Tech about Separation Kernel Hypervisor solutions for embedded, real-time and mission-critical platforms."
  },
  iot: {
    file: "iot-solutions.html",
    title: "IoT Solutions",
    category: "Connected operations",
    accent: "89,232,188",
    color: "#59e8bc",
    headline: "Connect devices, data and intelligent operations.",
    intro: "Bilva Tech brings together devices, sensors, machines, edge platforms, gateways and cloud environments to create a reliable flow of operational information.",
    note: "From physical systems to actionable intelligence.",
    values: [
      ["fa-link", "Connected systems", "Unify diverse devices and machines"],
      ["fa-bolt", "Edge response", "Process information closer to source"],
      ["fa-eye", "Operational visibility", "Monitor equipment in real time"],
      ["fa-expand", "Scalable management", "Manage growing device environments"]
    ],
    overviewTitle: "A complete connected technology chain.",
    overview: "We design IoT environments that connect embedded devices to local processing, secure networks, data platforms and the applications that turn raw signals into useful operational insight.",
    highlight: "Connected architecture works best when devices, data and security are designed as one system.",
    enables: [
      "Unified device and sensor integration",
      "Near real-time edge processing",
      "Gateway-based protocol translation",
      "Cloud and enterprise data connectivity",
      "Consistent device lifecycle management"
    ],
    capabilities: [
      ["fa-plug", "Connected Device Integration", "Connect sensors, machines, controllers and embedded devices into a unified environment."],
      ["fa-microchip", "Edge Computing", "Process information closer to the source to improve response and reduce unnecessary transfer."],
      ["fa-tower-broadcast", "IoT Gateway Solutions", "Bridge field devices, local networks, cloud platforms and enterprise applications."],
      ["fa-chart-line", "Real-Time Monitoring", "Create visibility into devices, equipment and operational conditions."],
      ["fa-cloud-arrow-up", "Data & Cloud Connectivity", "Move collected information into analytics, dashboards and digital services."],
      ["fa-gears", "Scalable Device Management", "Support consistent configuration, monitoring, updates and security as deployments grow."]
    ],
    industries: [
      ["Industrial Automation", "Connected production equipment"],
      ["Smart Infrastructure", "Distributed sensing and monitoring"],
      ["Transportation", "Vehicle and network telemetry"],
      ["Energy Systems", "Remote operational visibility"],
      ["Robotics", "Connected control and diagnostics"],
      ["Automotive", "Embedded data and services"],
      ["Remote Monitoring", "Distributed asset intelligence"]
    ],
    process: [
      ["Environment Discovery", "Map devices, data sources and operational needs."],
      ["Edge Architecture", "Choose local compute, gateways and protocols."],
      ["Secure Connectivity", "Define trusted communication and access."],
      ["Platform Integration", "Connect data, cloud and enterprise applications."],
      ["Deployment & Scale", "Roll out, monitor and manage the device estate."]
    ],
    why: [
      ["fa-network-wired", "End-to-end architecture", "One view from field devices through edge, gateway and cloud."],
      ["fa-shield-halved", "Security by design", "Protection considered within the connected architecture."],
      ["fa-gears", "Operational focus", "Solutions shaped around real environments and evolving requirements."]
    ],
    cta: "Turn connected-device data into controlled intelligence.",
    ctaText: "Talk to Bilva Tech about scalable IoT architecture for devices, edge platforms, gateways and connected operations."
  },
  cyber: {
    file: "cybersecurity-solutions.html",
    title: "Cybersecurity Solutions",
    category: "Embedded & connected security",
    accent: "120,147,255",
    color: "#7893ff",
    headline: "Protect connected systems from the inside out.",
    intro: "Bilva Tech protects embedded, connected and mission-critical systems across their operational lifecycle—building security into platform and application architecture from the beginning.",
    note: "Security engineered into the platform. Protection built for the lifecycle.",
    values: [
      ["fa-sitemap", "Secure architecture", "Define trust boundaries early"],
      ["fa-key", "Trusted access", "Authenticate devices and users"],
      ["fa-lock", "Protected data", "Secure stored and transmitted information"],
      ["fa-rotate", "Lifecycle security", "Maintain protection after deployment"]
    ],
    overviewTitle: "Security belongs inside the system architecture.",
    overview: "Our approach strengthens system configurations, protects sensitive information, controls access to critical resources and supports security throughout development, deployment, updates and ongoing maintenance.",
    highlight: "Cybersecurity should be engineered into the product—not applied as an additional layer at the end.",
    enables: [
      "Clearly defined trust boundaries",
      "Authorized device and user access",
      "Protected data at rest and in transit",
      "Verified startup and controlled updates",
      "Security event visibility and response"
    ],
    capabilities: [
      ["fa-sitemap", "Secure System Architecture", "Design trust boundaries, access controls and protection mechanisms into connected products."],
      ["fa-user-check", "Device & User Authentication", "Establish trusted identities for devices, applications and users."],
      ["fa-lock", "Data Protection & Encryption", "Protect sensitive information on devices and across connected endpoints."],
      ["fa-power-off", "Secure Boot & Platform Integrity", "Verify authorized software before execution to support a trusted startup foundation."],
      ["fa-bug-slash", "Vulnerability Management", "Identify weaknesses and support remediation, updates and configuration improvements."],
      ["fa-file-shield", "Monitoring & Secure Updates", "Control software updates and provide visibility into security-related events."]
    ],
    industries: [
      ["Industrial Systems", "Protect connected control platforms"],
      ["IoT Devices", "Secure device and service lifecycles"],
      ["Automotive", "Protect embedded applications"],
      ["Critical Infrastructure", "Strengthen operational foundations"],
      ["Defense Systems", "Control trusted access and data"],
      ["Connected Products", "Maintain security after launch"]
    ],
    process: [
      ["Threat & Risk Review", "Identify assets, interfaces and exposure."],
      ["Security Architecture", "Define trust boundaries and controls."],
      ["Implementation", "Integrate identity, data and platform protection."],
      ["Verification", "Assess configurations and security behaviour."],
      ["Lifecycle Support", "Manage vulnerabilities, updates and monitoring."]
    ],
    why: [
      ["fa-microchip", "Platform-level focus", "Security shaped for embedded and connected environments."],
      ["fa-arrows-spin", "Lifecycle perspective", "Protection from architecture through updates and maintenance."],
      ["fa-diagram-project", "Integrated controls", "Identity, data, platform and monitoring treated as one system."]
    ],
    cta: "Engineer security into every stage of the product lifecycle.",
    ctaText: "Discuss embedded, connected or mission-critical system security requirements with Bilva Tech."
  },
  consulting: {
    file: "information-security-consulting.html",
    title: "Information Security Consulting",
    category: "Risk & resilience",
    accent: "192,130,255",
    color: "#c082ff",
    headline: "Strengthen security. Manage risk. Build resilience.",
    intro: "Bilva Tech helps organizations understand security exposure, protect critical information and create practical strategies aligned with their technology and business requirements.",
    note: "Understand your risks. Strengthen your security. Protect what matters.",
    values: [
      ["fa-magnifying-glass", "Clear risk picture", "Identify and prioritize exposure"],
      ["fa-compass", "Practical roadmap", "Turn findings into achievable action"],
      ["fa-scale-balanced", "Governance readiness", "Align policies and responsibilities"],
      ["fa-life-ring", "Incident preparedness", "Plan for effective response and recovery"]
    ],
    overviewTitle: "A security strategy built around your organization.",
    overview: "Every organization has a different technology landscape and risk profile. Our tailored, risk-based approach connects governance, data protection, access control, compliance and incident preparedness.",
    highlight: "Recommendations are practical, scalable and aligned with operational requirements.",
    enables: [
      "Prioritized security improvement",
      "Business-aligned security architecture",
      "Clear policies and accountability",
      "Compliance and maturity roadmaps",
      "Structured incident response planning"
    ],
    capabilities: [
      ["fa-magnifying-glass", "Security Risk Assessment", "Evaluate technology, processes and controls to identify and prioritize potential exposure."],
      ["fa-sitemap", "Security Architecture & Strategy", "Align security controls with business and technology objectives."],
      ["fa-database", "Data Protection", "Strengthen access, storage, transmission and handling of critical information."],
      ["fa-id-card", "Identity & Access Management", "Define appropriate roles and permissions for users, devices and applications."],
      ["fa-scale-balanced", "Policies, Governance & Readiness", "Improve responsibilities, procedures and preparation for applicable requirements."],
      ["fa-life-ring", "Incident & Vulnerability Improvement", "Prepare response processes and establish continuous security improvement."]
    ],
    industries: [
      ["Growing Enterprises", "Establish scalable security foundations"],
      ["Regulated Operations", "Understand readiness and gaps"],
      ["Technology Teams", "Align architecture and controls"],
      ["Leadership Teams", "Translate risk into priorities"],
      ["Connected Businesses", "Protect complex environments"],
      ["Critical Operations", "Prepare for disruption and response"]
    ],
    process: [
      ["Discover", "Understand technology, business and risk context."],
      ["Assess", "Evaluate controls, weaknesses and priorities."],
      ["Strategize", "Define objectives and an actionable roadmap."],
      ["Guide Implementation", "Support practical control and process improvement."],
      ["Improve", "Reassess as threats and requirements evolve."]
    ],
    why: [
      ["fa-compass", "Risk-based guidance", "Priorities shaped by business impact and real exposure."],
      ["fa-people-group", "Stakeholder alignment", "Security objectives connected across leadership and technical teams."],
      ["fa-road", "Actionable roadmaps", "Clear, scalable recommendations built for implementation."]
    ],
    cta: "Create a clearer path to stronger information security.",
    ctaText: "Talk to Bilva Tech about risk assessment, security strategy, governance, data protection and incident readiness."
  }
};

const nav = [
  ['kernel', 'Separation Kernel', 'separation-kernel-hypervisor.html'],
  ['iot', 'IoT Solutions', 'iot-solutions.html'],
  ['cyber', 'Cybersecurity', 'cybersecurity-solutions.html'],
  ['consulting', 'Security Consulting', 'information-security-consulting.html']
];

function renderSubnav(currentKey) {
  const menuItems = nav.map(([k, n, u], i) =>
    `<a href="${u}" class="${k === currentKey ? 'active' : ''}" ${k === currentKey ? 'aria-current="page"' : ''} role="menuitem" tabindex="0"><span class="sol-num">0${i + 1}</span>${n}</a>`
  ).join('');

  return `
    <button class="sol-hamburger" type="button" aria-label="Open solutions menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <div class="sol-dropdown" role="menu">${menuItems}</div>
  `.trim();
}

function renderVisual(key) {
  if (key === 'kernel') {
    return `<div class="system-visual globe-container" style="padding:0; border:1px solid var(--line); border-radius:12px; background:radial-gradient(ellipse at 50% 50%, rgba(85,216,255,0.06), transparent 70%), #0c0b10; overflow:hidden;"><iframe src="globe.html" style="width: 100%; height: 100%; border: none; min-height: 580px;" title="Separation Kernel Architecture Visualization"></iframe></div>`;
  }
  if (key === 'cyber') {
    return `<div class="system-visual globe-container" style="padding:0; border:1px solid var(--line); border-radius:12px; background:radial-gradient(ellipse at 50% 50%, rgba(120,147,255,0.06), transparent 70%), #0c0b10; overflow:hidden;"><iframe src="cybersecurity-visual.html" style="width: 100%; height: 100%; border: none; min-height: 580px;" title="Cybersecurity Lifecycle Architecture Visualization"></iframe></div>`;
  }
  if (key === 'iot') {
    return `<div class="system-visual globe-container" style="padding:0; border:1px solid var(--line); border-radius:12px; background:radial-gradient(ellipse at 50% 50%, rgba(89,232,188,0.06), transparent 70%), #0c0b10; overflow:hidden;"><iframe src="iot-visual.html" style="width: 100%; height: 100%; border: none; min-height: 580px;" title="IoT Solutions Architecture Visualization"></iframe></div>`;
  }
  if (key === 'consulting') {
    return `<div class="system-visual globe-container" style="padding:0; border:1px solid var(--line); border-radius:12px; background:radial-gradient(ellipse at 50% 50%, rgba(192,130,255,0.06), transparent 70%), #0c0b10; overflow:hidden;"><iframe src="consulting-visual.html" style="width: 100%; height: 100%; border: none; min-height: 580px;" title="Security Strategy Architecture Visualization"></iframe></div>`;
  }
  return '';
}

function renderUnifiedServiceContent(key, data) {
  return `
  <!-- Box 01: Hero Specification & Visual -->
  <section class="section-box">
    <div class="section-meta">
      <span><span class="tech-icon-badge" style="width:22px;height:22px;font-size:10px;"><i class="fa-solid fa-microchip"></i></span> 01 / SERVICE SPECIFICATION</span>
      <span>${data.category.toUpperCase()}</span>
    </div>
    <div class="section-body">
      <div style="display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(400px, 0.95fr); gap: clamp(36px, 5vw, 64px); align-items: center;">
        <div>
          <p class="home-kicker">SERVICES / ${data.title.toUpperCase()}</p>
          <h1 class="page-title">${data.title}</h1>
          <h2 style="font-family: var(--font-main); font-size: clamp(22px, 2.5vw, 32px); font-weight: 500; color: #eee9f0; margin: 0 0 18px; line-height: 1.2;">
            ${data.headline}
          </h2>
          <p class="body-copy">${data.intro}</p>
          <div style="display: flex; flex-wrap: wrap; gap: 14px; margin-top: 28px;">
            <a class="btn-primary" href="contact.html">Talk to an Expert <i class="fa-solid fa-arrow-right"></i></a>
            <a class="btn-secondary" href="#capabilities">Explore Capabilities</a>
          </div>
          <p style="margin-top: 22px; color: var(--ink-muted); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;">
            ${data.note}
          </p>
        </div>
        ${renderVisual(key)}
      </div>

      <!-- Values Strip -->
      <div class="service-specs-strip" style="margin-top: 48px;">
        ${data.values.map((v, i) => `
          <div class="service-spec-item">
            <span class="spec-num">0${i + 1} // ${v[1].toUpperCase()}</span>
            <strong>${v[1]}</strong>
            <span>${v[2]}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Box 02: Platform Architecture & What it Enables -->
  <section class="section-box">
    <div class="section-meta">
      <span>02 / ARCHITECTURE &amp; CAPABILITIES</span>
      <span>CONTROLLED ACCESS FOUNDATION</span>
    </div>
    <div class="section-body">
      <div style="display: grid; grid-template-columns: 1fr 0.85fr; gap: clamp(40px, 6vw, 80px); align-items: start;">
        <div>
          <p class="home-kicker">OVERVIEW</p>
          <h2 class="section-title">${data.overviewTitle}</h2>
          <p class="body-copy">${data.overview}</p>
          <p style="margin-top: 28px; padding-left: 20px; border-left: 2px solid var(--kicker-color); color: #fff; font-size: 15px; font-weight: 500; line-height: 1.7;">
            ${data.highlight}
          </p>
        </div>
        <div style="border: 1px solid var(--line); border-radius: 10px; background: var(--surface-card); padding: 32px;">
          <h3 style="font-family: var(--font-main); font-size: 20px; font-weight: 500; color: #eee9f0; margin: 0 0 20px;">
            What It Enables
          </h3>
          <ul style="list-style: none; padding: 0; margin: 0; display: grid; gap: 14px;">
            ${data.enables.map(item => `
              <li style="display: flex; gap: 12px; color: var(--ink-secondary); font-size: 14px; line-height: 1.6;">
                <span style="color: var(--kicker-color); font-weight: 700;">+</span>
                <span>${item}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Box 03: Core Capabilities -->
  <section class="section-box" id="capabilities">
    <div class="section-meta">
      <span>03 / CORE CAPABILITIES</span>
      <span>CONTROL BUILT INTO EVERY LAYER</span>
    </div>
    <div class="section-body">
      <p class="home-kicker">CORE CAPABILITIES</p>
      <h2 class="section-title">Control built into every layer.</h2>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 36px;">
        ${data.capabilities.map((cap, i) => `
          <article class="tech-card flip-card capability-card" style="min-height: 240px; padding: 0;">
            <div class="flip-card-inner">
              <div class="flip-card-front" style="padding: 26px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface-card); display: flex; flex-direction: column;">
                <span class="tech-icon-badge" style="width: 38px; height: 38px;"><i class="fa-solid ${cap[0]}"></i></span>
                <h3 style="margin-top: 36px; font-size: 19px;">${cap[1]}</h3>
                <span style="font-size: 11px; color: var(--ink-muted); margin-top: auto;">Hover or tap to inspect →</span>
              </div>
              <div class="flip-card-back" style="padding: 26px; border: 1px solid var(--line-hover); border-radius: 10px; background: var(--surface-hover); display: flex; align-items: center;">
                <p style="margin: 0; color: var(--ink); font-size: 14px; line-height: 1.7;">${cap[2]}</p>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Box 04: Demanding Use Cases -->
  <section class="section-box">
    <div class="section-meta">
      <span>04 / MISSION-CRITICAL ENVIRONMENTS</span>
      <span>SECTOR APPLICATIONS</span>
    </div>
    <div class="section-body">
      <p class="home-kicker">USE CASES</p>
      <h2 class="section-title">Built for demanding environments.</h2>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 36px;">
        ${data.industries.map((ind, i) => `
          <div class="tech-card" style="padding: 22px;">
            <div class="tech-card-meta">
              <span class="meta-tag">0${i + 1} //</span>
              <span style="font-size: 8px; color: var(--ink-muted);">MISSION DEPLOYED</span>
            </div>
            <h3 style="font-size: 17px; margin-bottom: 8px;">${ind[0]}</h3>
            <p style="margin: 0; font-size: 12px; line-height: 1.6; color: var(--ink-secondary);">${ind[1]}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Box 05: Delivery Circuit Board Timeline -->
  <section class="section-box delivery-section" id="delivery">
    <div class="section-meta">
      <span>05 / DELIVERY TIMELINE</span>
      <span>FROM DISCOVERY TO DEPLOYMENT</span>
    </div>
    <div class="section-body">
      <p class="home-kicker">STRUCTURED PHASING</p>
      <h2 class="section-title">From discovery to deployment.</h2>

      <div class="circuit-board" style="--total-steps: ${data.process.length}; margin-top: 36px; border: 1px solid var(--line); border-radius: 10px; background: #0c0b10;">
        <div class="circuit-grid-pattern" aria-hidden="true"></div>
        <div class="circuit-track" aria-hidden="true">
          <div class="circuit-wire"></div>
          <div class="circuit-wire-active" id="circuit-wire-active"></div>
          <div class="circuit-signal" id="circuit-signal"></div>
        </div>
        <div class="circuit-milestones" role="list">
          ${data.process.map((step, idx) => `
            <article class="circuit-milestone ${idx === 0 ? 'is-active' : ''}" data-step="${idx}" role="listitem" tabindex="0" aria-label="Milestone 0${idx + 1}: ${step[0]}">
              <div class="circuit-node-wrap">
                <div class="circuit-pad"><span class="circuit-solder-ring"></span><span class="circuit-node-number">0${idx + 1}</span></div>
                <div class="circuit-lead-line" aria-hidden="true"></div>
              </div>
              <div class="circuit-card" style="border: 1px solid var(--line); background: var(--surface-card);">
                <div class="circuit-card-header">
                  <span class="circuit-tag">STAGE 0${idx + 1}</span>
                  <span class="circuit-status-dot" aria-hidden="true"></span>
                </div>
                <h3 class="circuit-title">${step[0]}</h3>
                <p class="circuit-desc">${step[1]}</p>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </div>
  </section>

  <!-- Box 06: Why Bilva Tech & Call to Action -->
  <section class="section-box">
    <div class="section-meta">
      <span>06 / WHY BILVA TECH</span>
      <span>PRACTICAL ENGINEERING DELIVERY</span>
    </div>
    <div class="section-body">
      <p class="home-kicker">TECHNICAL THINKING</p>
      <h2 class="section-title">Technical thinking. Practical delivery.</h2>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin: 36px 0 48px;">
        ${data.why.map(w => `
          <div class="tech-card" style="border: 1px solid var(--line); background: var(--surface-card);">
            <span class="tech-icon-badge" style="margin-bottom: 24px;"><i class="fa-solid ${w[0]}"></i></span>
            <h3 style="font-size: 18px; margin-bottom: 10px;">${w[1]}</h3>
            <p style="margin: 0; color: var(--ink-secondary); font-size: 13px; line-height: 1.7;">${w[2]}</p>
          </div>
        `).join('')}
      </div>

      <!-- Action Panel Inside Box -->
      <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 40px; text-align: center; max-width: 680px; margin: 0 auto;">
        <h3 style="font-family: var(--font-main); font-size: clamp(26px, 3vw, 38px); font-weight: 500; color: #fff; margin: 0 0 16px;">
          ${data.cta}
        </h3>
        <p style="color: var(--ink-secondary); font-size: 15px; line-height: 1.7; margin: 0 0 28px;">
          ${data.ctaText}
        </p>
        <a class="btn-primary" href="contact.html">
          Discuss Your Requirement <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </div>
  </section>
  `.trim();
}

const dirs = [__dirname, path.join(__dirname, "BilvaTech")].filter(d => fs.existsSync(d));

for (const dir of dirs) {
  for (const [key, data] of Object.entries(servicePages)) {
    const filePath = path.join(dir, data.file);
    if (!fs.existsSync(filePath)) continue;

    const subnavContent = renderSubnav(key);
    const mainContent = renderUnifiedServiceContent(key, data);

    const fullHTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#080809">
  <meta name="description" content="Bilva Tech ${data.title} solutions for secure, connected, mission-critical systems.">
  <title>${data.title} | Bilva Tech</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <link rel="stylesheet" href="styles.css?v=20261016">
  <link rel="stylesheet" href="homepage.css?v=20261016">
  <link rel="stylesheet" href="cto-homepage.css?v=20261016">
  <link rel="stylesheet" href="unified-theme.css?v=20261016">
  <link rel="stylesheet" href="service-page.css?v=20261016">
</head>
<body class="unified-theme bilva-home cto-home service-page" data-service="${key}">
  <a class="skip-link" href="#service-content">Skip to main content</a>
  
  <!-- Atmospheric video background matching index.html -->
  <div class="unified-bg" aria-hidden="true">
    <video class="bg-video" autoplay muted loop playsinline>
      <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4" type="video/mp4" />
    </video>
  </div>

  <header class="site-header" aria-label="Primary navigation">
    <a class="logo-button" href="index.html" aria-label="Bilva Tech home">
      <img src="assets/logo.webp" alt="" width="52" height="52">
      <span class="brand-copy" aria-hidden="true"><strong>Bilva Tech</strong><span>Business Solutions</span></span>
    </a>
    <nav class="nav-pill" aria-label="Desktop navigation">
      <a href="index.html">Home</a>
      <a class="active" href="solutions.html">Solutions</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
    </nav>
    <a class="header-cta" href="contact.html">Get Started</a>
    <button class="menu-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobile-menu">
      <span></span><span></span><span></span>
    </button>
  </header>

  <div class="mobile-overlay" hidden>
    <nav class="mobile-menu" id="mobile-menu">
      <a href="index.html">Home</a>
      <a class="active" href="solutions.html">Solutions</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
    </nav>
  </div>

  <nav class="solution-subnav" aria-label="Solution pages">
${subnavContent}
  </nav>

  <main class="page-container" id="service-content" style="padding-top: 24px;">
${mainContent}
  </main>

  <footer class="site-footer"></footer>
  <script src="main.js?v=20261016"></script>
  <script src="service-page.js?v=20261016"></script>
</body>
</html>
`;

    fs.writeFileSync(filePath, fullHTML, "utf8");
    console.log(`Pre-rendered unified ${filePath}`);
  }
}
