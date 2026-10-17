import { mkdir, readFile, writeFile } from "node:fs/promises";

const assets = [
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
  "homepage.css",
  "testimonials.css",
  "service-page.css",
  "unified-theme.css",
  "inner-pages.css",
  "inner-pages.js",
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
  "assets/cta-texture.jpg",
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
