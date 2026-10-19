import { mkdir, readFile, writeFile } from "node:fs/promises";

const assets = [
  "assets/image-breaker.mp4",
  "index.html",
  "trialhomepage.html",
  "trialhomepage.css",
  "trialhomepage.js",
  "homepage.html",
  "homepage-original.html",
  "cto-homepage.css",
  "cto-homepage.js",
  "cto-globe.js",
  "solutions.html",
  "about.html",
  "contact.html",
  "separation-kernel-hypervisor.html",
  "globe.html",
  "iot-solutions.html",
  "cybersecurity-solutions.html",
  "cybersecurity-visual.html",
  "iot-visual.html",
  "information-security-consulting.html",
  "consulting-visual.html",
  "styles.css",
  "solutions.css",
  "homepage.css",
  "testimonials.css",
  "service-page.css",
  "unified-theme.css",
  "inner-pages.css",
  "inner-pages.js",
  "applications-chroma-grid.css",
  "applications-chroma-grid.js",
  "our-approach-zigzag.css",
  "our-approach-zigzag.js",
  "DotGrid.css",
  "service-overview-dot-grid.css",
  "solution-cta.css",
  "pseudocode-panel.css",
  "pseudocode-panel.js",
  "dither.js",
  "dot-grid.js",
  "bento-polish.css",
  "bento-polish.js",
  "black-motion.css",
  "site-motion.js",
  "main.js",
  "service-dial.js",
  "why-globe.js",
  "architecture.js",
  "testimonials.js",
  "testimonials-data.js",
  "service-page.js",
  "assets/logo.webp",
  "assets/favicon.ico",
  "assets/cta-texture.jpg",
  "assets/cta-background.png",
  "assets/Bento/Bento-01-poster.jpg",
  "assets/Bento/Bento-01.mp4",
  "assets/Bento/Bento-02-poster.jpg",
  "assets/Bento/Bento-02.mp4",
  "assets/Bento/Bento-03-poster.jpg",
  "assets/Bento/Bento-03.mp4",
  "assets/Bento/Bento-04-poster.jpg",
  "assets/Bento/Bento-04.mp4",
  "assets/testimonials/aris-thorne.webp",
  "assets/testimonials/elena-rostova.webp",
  "assets/testimonials/marcus-vance.webp",
  "assets/testimonials/sarah-jenkins.webp",
  "assets/testimonials/david-lindqvist.webp",
  "assets/testimonials/hana-chen.webp",
  "assets/testimonials/alexandre-mercier.webp",
  "assets/testimonials/claire-fontaine.webp",
  "assets/testimonials/siddharth-menon.webp",
  "assets/testimonials/rachel-sterling.webp",
  "assets/testimonials/thomas-weber.webp",
  "assets/testimonials/henrik-aasgaard.webp",
  "assets/ASSETS FOR SOLUTIONS/KERNEL HYPERVISOR.png",
  "assets/ASSETS FOR SOLUTIONS/IOT SOLUTIONS.png",
  "assets/ASSETS FOR SOLUTIONS/CYBERSECURITY SOLUTIONS.png",
  "assets/ASSETS FOR SOLUTIONS/INFORMATION SECURITY.png",
];

const encodedAssets = {};

for (const asset of assets) {
  const contents = await readFile(new URL(asset, import.meta.url));
  encodedAssets[`/${asset.replaceAll("\\", "/")}`] = contents.toString("base64");
}

const workerTemplate = await readFile(new URL("worker.js", import.meta.url), "utf8");
const workerBundle = workerTemplate.replace(
  "const files = Object.create(null);",
  `const files = ${JSON.stringify(encodedAssets)};`,
);

await mkdir(new URL("dist/server/", import.meta.url), { recursive: true });
await writeFile(new URL("dist/server/index.js", import.meta.url), workerBundle);

console.log(`Built ${assets.length} assets into dist/server/index.js`);
