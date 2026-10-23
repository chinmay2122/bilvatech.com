const DEFAULT_SITE_URL = "https://bilvatechcom.vercel.app";

export const SITE_URL = (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const pages = [
  {
    file: "index.html",
    path: "/",
    title: "Bilva Tech | Cybersecurity, IoT & Business Solutions",
    description:
      "Bilva Tech engineers separation kernel hypervisors, secure IoT and edge systems, cybersecurity solutions, and information security consulting.",
    type: "home",
  },
  {
    file: "solutions.html",
    path: "/solutions",
    title: "Cybersecurity, IoT & Secure Systems Solutions | Bilva Tech",
    description:
      "Explore Bilva Tech solutions for workload isolation, secure IoT and edge systems, embedded cybersecurity, and information security consulting.",
    breadcrumb: "Solutions",
  },
  {
    file: "about.html",
    path: "/about",
    title: "About Bilva Tech | Security Engineering Expertise",
    description:
      "Learn how Bilva Tech combines systems engineering, security architecture, and risk management for connected, embedded, and critical systems.",
    breadcrumb: "About",
  },
  {
    file: "contact.html",
    path: "/contact",
    title: "Contact Bilva Tech | Discuss Your Security Project",
    description:
      "Contact Bilva Tech to discuss separation kernels, IoT architecture, connected-system cybersecurity, or information security consulting.",
    breadcrumb: "Contact",
  },
  {
    file: "separation-kernel-hypervisor.html",
    path: "/separation-kernel-hypervisor",
    title: "Separation Kernel Hypervisor Solutions | Bilva Tech",
    description:
      "Design isolated, predictable computing environments with Bilva Tech separation kernel and hypervisor architecture, integration, and verification services.",
    breadcrumb: "Separation Kernel Hypervisor",
    serviceType: "Separation kernel and hypervisor engineering",
    faqs: [
      {
        question: "What does a separation kernel architecture isolate?",
        answer:
          "It divides workloads into controlled partitions and assigns resources such as CPU time, memory, and I/O according to an explicit system policy. The required isolation and verification depend on the target platform and assurance goals.",
      },
      {
        question: "How is a separation kernel different from a general-purpose hypervisor?",
        answer:
          "A separation kernel is designed around strict partitioning, a small control surface, and predictable resource boundaries. A general-purpose hypervisor may prioritize broader workload flexibility; the exact properties depend on each implementation.",
      },
      {
        question: "Can different operating systems run on the same platform?",
        answer:
          "A partitioned architecture can support multiple operating systems or bare-metal workloads when the processor, devices, guest software, and integration requirements are compatible. Those constraints are validated during architecture and scoping.",
      },
    ],
  },
  {
    file: "iot-solutions.html",
    path: "/iot-solutions",
    title: "IoT & Edge Solutions | Bilva Tech",
    description:
      "Connect devices, gateways, edge computing, cloud platforms, and operational data with secure, scalable IoT solutions from Bilva Tech.",
    breadcrumb: "IoT & Edge Solutions",
    serviceType: "IoT and edge systems engineering",
    faqs: [
      {
        question: "What should be defined first in an IoT architecture?",
        answer:
          "Start with device purpose, data flows, operating conditions, connectivity, identity, update paths, and lifecycle ownership. Those decisions determine the appropriate edge, gateway, cloud, and security controls.",
      },
      {
        question: "When should processing remain at the edge?",
        answer:
          "Edge processing is useful when latency, bandwidth, availability, privacy, or local control requirements make cloud-only processing unsuitable. The split should be based on measured operational needs.",
      },
      {
        question: "How are IoT devices updated securely?",
        answer:
          "A secure update design verifies authorized software, protects delivery, records device state, and plans for rollback or recovery. The implementation must match the device hardware, connectivity, and support lifecycle.",
      },
    ],
  },
  {
    file: "cybersecurity-solutions.html",
    path: "/cybersecurity-solutions",
    title: "Cybersecurity Solutions for Connected Systems | Bilva Tech",
    description:
      "Build security into embedded and connected systems with architecture, identity, data protection, secure boot, updates, and vulnerability management.",
    breadcrumb: "Cybersecurity Solutions",
    serviceType: "Cybersecurity engineering for embedded and connected systems",
    faqs: [
      {
        question: "What does connected-system cybersecurity cover?",
        answer:
          "It covers trust boundaries, device and user identity, data protection, platform integrity, update mechanisms, event visibility, and vulnerability handling across the product lifecycle.",
      },
      {
        question: "Are secure boot and secure updates the same control?",
        answer:
          "No. Secure boot checks whether authorized software starts on the platform, while secure update controls how new software is authenticated, delivered, installed, and recovered. A resilient design usually needs both.",
      },
      {
        question: "What makes vulnerability management effective for embedded products?",
        answer:
          "Teams need an accurate component inventory, a way to assess exposure, prioritized remediation, controlled release processes, and verification that fixes work on supported product versions.",
      },
    ],
  },
  {
    file: "secure-qr-printing.html",
    path: "/secure-qr-printing",
    title: "Secure QR Printing Software for Windows | Bilva Tech",
    description:
      "Print unique QR codes and dynamic secure patterns on each unit with Windows software supporting AUTO, API, and CSV data for digital printing.",
    breadcrumb: "Secure QR Printing",
    breadcrumbParents: [
      { name: "Solutions", path: "/solutions" },
      { name: "Cybersecurity Solutions", path: "/cybersecurity-solutions" },
    ],
    serviceType: "Secure QR printing software for digital printing workflows",
    faqs: [
      {
        question: "What does the Secure QR Printing software print?",
        answer:
          "It places a dynamic QR code with human-readable text and a dynamic secure pattern with a message inside the configured print region. The variable output can change for every printed unit.",
      },
      {
        question: "How can QR code data be supplied?",
        answer:
          "A print run can use codes generated automatically by the software, codes fetched from an API endpoint, or codes imported from a CSV file.",
      },
      {
        question: "Can a print setup be reused?",
        answer:
          "Yes. The configured region, size, orientation, human-readable text, and message can be saved as a job configuration and reused for later print runs.",
      },
      {
        question: "What production information is available?",
        answer:
          "The software provides MIS reporting for production information such as the total number of codes printed and other print-run reports.",
      },
    ],
  },
  {
    file: "information-security-consulting.html",
    path: "/information-security-consulting",
    title: "Information Security Consulting | Bilva Tech",
    description:
      "Strengthen governance, risk management, security architecture, data protection, access control, and incident readiness with Bilva Tech consulting.",
    breadcrumb: "Information Security Consulting",
    serviceType: "Information security consulting",
    faqs: [
      {
        question: "What should a security risk assessment produce?",
        answer:
          "It should document relevant assets, threats, weaknesses, existing controls, business impact, and prioritized actions. The result should be an evidence-based roadmap rather than an undifferentiated list of findings.",
      },
      {
        question: "Can consulting support compliance readiness?",
        answer:
          "Consulting can map applicable requirements to policies, responsibilities, processes, and technical controls, then identify readiness gaps. Formal certification or legal compliance depends on the relevant authority and assessment process.",
      },
      {
        question: "What is included in incident-readiness planning?",
        answer:
          "Planning typically defines roles, escalation paths, evidence handling, communication, containment, recovery dependencies, and exercises. The plan should reflect the organization’s actual systems and operating constraints.",
      },
    ],
  },
  {
    file: "insights.html",
    path: "/insights",
    title: "Cybersecurity & IoT Insights | Bilva Tech",
    description:
      "Bilva Tech technical insights will cover secure systems, workload isolation, IoT and edge architecture, cybersecurity, and information security.",
    breadcrumb: "Insights",
  },
  {
    file: "user-policy.html",
    path: "/user-policy",
    title: "User Policy | Bilva Tech",
    description:
      "Read how Bilva Tech handles website use, contact-form information, privacy, security, and acceptable use.",
    breadcrumb: "User Policy",
  },
  {
    file: "terms-and-conditions.html",
    path: "/terms-and-conditions",
    title: "Terms and Conditions | Bilva Tech",
    description:
      "Read the terms and conditions governing use of the Bilva Tech website and its informational content.",
    breadcrumb: "Terms and Conditions",
  },
];
