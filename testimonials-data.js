/**
 * Bilva Tech — Testimonials & Perspectives Data
 * 
 * Reusable testimonial cards supporting:
 * - Quote
 * - Customer / Executive name
 * - Designation
 * - Organization
 * - Avatar or monogram
 */

var testimonialsConfig = {
  // Mode: "marquee" (animated opposing rows) | "factual" (factual engineering overview)
  defaultMode: "marquee",
  
  // Animation duration in seconds for one complete seamless loop
  speedRow1: 42,
  speedRow2: 46,
  
  // Interactivity options
  pauseOnHover: true,
  pauseOnFocus: true,
  cursorReactiveGlow: true,
};

/**
 * Row 1 — Scrolls continuously from Right to Left
 */
var testimonialsRow1 = [
  {
    id: "perspective-kernel-1",
    solutionArea: "Separation Kernel",
    badgeColor: "#F2F0ED",
    quote: "In mixed-criticality edge controllers, ensuring zero unintended cross-partition leakage between safety tasks and telemetry processes is non-negotiable. Strict spatial and temporal isolation must be enforced at the hardware-hypervisor boundary.",
    author: "Dr. Aris Thorne",
    designation: "Chief Systems Architect",
    organization: "Mission-Critical Systems Group",
    avatar: "assets/testimonials/aris-thorne.webp",
    initials: "AT",
  },
  {
    id: "perspective-iot-1",
    solutionArea: "Secure IoT",
    badgeColor: "#F2F0ED",
    quote: "Connected gateways often represent the widest attack surface across industrial fleets. Enforcing an immutable root of trust and compartmentalized network interfaces prevents a compromised peripheral from penetrating core controllers.",
    author: "Elena Rostova",
    designation: "VP of IoT Engineering",
    organization: "Distributed Fleet Infrastructure",
    avatar: "assets/testimonials/elena-rostova.webp",
    initials: "ER",
  },
  {
    id: "perspective-design-1",
    solutionArea: "Security-by-Design",
    badgeColor: "#F2F0ED",
    quote: "Security bolted on after development is fragile and prohibitively expensive to verify. Embedding least-privilege principles into memory maps and boot sequences during early architecture prevents foundational vulnerabilities.",
    author: "Marcus Vance",
    designation: "Principal Firmware Security Engineer",
    organization: "Embedded Systems Engineering",
    avatar: "assets/testimonials/marcus-vance.webp",
    initials: "MV",
  },
  {
    id: "perspective-cyber-1",
    solutionArea: "Secure QR Code",
    badgeColor: "#F2F0ED",
    quote: "Threat landscapes in connected infrastructure demand continuous posture evaluation rather than static compliance audits. Risk models must reflect active attack vectors against operational workflows.",
    author: "Sarah Jenkins",
    designation: "Director of Information Security",
    organization: "Enterprise Defense Advisory",
    avatar: "assets/testimonials/sarah-jenkins.webp",
    initials: "SJ",
  },
  {
    id: "perspective-embedded-1",
    solutionArea: "Embedded Systems",
    badgeColor: "#F2F0ED",
    quote: "Deploying microkernels in constrained microcontrollers requires microsecond context switching determinism while guaranteeing complete protection against buffer overflows and memory corruption.",
    author: "David K. Lindqvist",
    designation: "Lead RTOS Architect",
    organization: "Real-Time Computing Systems",
    avatar: "assets/testimonials/david-lindqvist.webp",
    initials: "DL",
  },
  {
    id: "perspective-infra-1",
    solutionArea: "Digital Infrastructure",
    badgeColor: "#F2F0ED",
    quote: "Segmenting operational technology from enterprise data planes ensures that external network anomalies cannot disrupt deterministic physical processes and field control loops.",
    author: "Hana Chen",
    designation: "Head of Infrastructure Defense",
    organization: "Critical Infrastructure Operations",
    avatar: "assets/testimonials/hana-chen.webp",
    initials: "HC",
  },
];

/**
 * Row 2 — Scrolls continuously from Left to Right
 */
var testimonialsRow2 = [
  {
    id: "perspective-kernel-2",
    solutionArea: "Separation Kernel",
    badgeColor: "#F2F0ED",
    quote: "When migrating legacy software stacks onto multi-core platforms, deterministic hardware virtualization provides the isolation assurance necessary to run unverified guest code alongside safety-certified modules.",
    author: "Alexandre Mercier",
    designation: "Chief Virtualization Architect",
    organization: "High-Assurance Computing Labs",
    avatar: "assets/testimonials/alexandre-mercier.webp",
    initials: "AM",
  },
  {
    id: "perspective-iot-2",
    solutionArea: "Secure IoT",
    badgeColor: "#F2F0ED",
    quote: "Over-the-air firmware update mechanisms require cryptographic signing and fail-safe rollback buffers. If verification fails mid-transmission, device integrity and uptime must remain completely uncompromised.",
    author: "Claire Fontaine",
    designation: "Director of Connected Operations",
    organization: "Autonomous IoT Platforms",
    avatar: "assets/testimonials/claire-fontaine.webp",
    initials: "CF",
  },
  {
    id: "perspective-consulting-2",
    solutionArea: "Security Strategy",
    badgeColor: "#F2F0ED",
    quote: "Navigating complex standards like IEC 62443 and ISO 27001 requires translating theoretical governance into concrete, testable technical controls that engineering teams can sustain.",
    author: "Siddharth Menon",
    designation: "Head of Security Strategy",
    organization: "Regulatory & Risk Consulting",
    avatar: "assets/testimonials/siddharth-menon.webp",
    initials: "SM",
  },
  {
    id: "perspective-infra-2",
    solutionArea: "Digital Infrastructure",
    badgeColor: "#F2F0ED",
    quote: "Visibility without actionable telemetry creates blind spots. Resilient monitoring demands low-overhead kernel tracing that alerts operators to privilege escalations before lateral movement occurs.",
    author: "Rachel Sterling",
    designation: "Principal Telemetry Architect",
    organization: "Cyber Defense Infrastructure",
    avatar: "assets/testimonials/rachel-sterling.webp",
    initials: "RS",
  },
  {
    id: "perspective-design-2",
    solutionArea: "Security-by-Design",
    badgeColor: "#F2F0ED",
    quote: "Rigorous verification of memory access partitions and IPC channels dramatically minimizes the audit surface required for high-integrity industrial and aerospace certifications.",
    author: "Thomas Weber",
    designation: "Head of Systems Verification",
    organization: "Secure Architecture Research",
    avatar: "assets/testimonials/thomas-weber.webp",
    initials: "TW",
  },
  {
    id: "perspective-embedded-2",
    solutionArea: "Embedded Systems",
    badgeColor: "#F2F0ED",
    quote: "Hardware-enforced secure enclaves protect cryptographic key material even in scenarios where physical tamper or memory bus sniffing is attempted on edge equipment.",
    author: "Henrik Aasgaard",
    designation: "Silicon Security Architect",
    organization: "Hardware Security Engineering",
    avatar: "assets/testimonials/henrik-aasgaard.webp",
    initials: "HA",
  },
];

/**
 * Factual Engineering Perspectives (used when mode is switched to "factual")
 */
var factualPerspectivesData = [
  {
    id: "factual-1",
    title: "Kernel Separation & Spatial Isolation",
    area: "Separation Kernel Hypervisor",
    body: "Eliminating cross-workload interference through hardware-enforced memory segmentation, CPU core affinity, and deterministic timing budgets for safety-critical and standard operating systems.",
    iconClass: "fa-solid fa-microchip",
  },
  {
    id: "factual-2",
    title: "Secure Connected Architectures",
    area: "IoT & Edge Solutions",
    body: "End-to-end device identity from silicon root of trust to cloud telemetry. Encrypted message routing, mutual TLS authentication, and verified atomic OTA recovery.",
    iconClass: "fa-solid fa-network-wired",
  },
  {
    id: "factual-3",
    title: "Security-by-Design & Threat Mitigation",
    area: "Consulting & Architecture",
    body: "Architectural threat modeling, least-privilege boundary design, and vulnerability assessments aligned with IEC 62443, ISO 27001, and zero-trust engineering standards.",
    iconClass: "fa-solid fa-shield-halved",
  },
];

if (typeof window !== "undefined") {
  window.testimonialsConfig = testimonialsConfig;
  window.testimonialsRow1 = testimonialsRow1;
  window.testimonialsRow2 = testimonialsRow2;
  window.factualPerspectivesData = factualPerspectivesData;
}
