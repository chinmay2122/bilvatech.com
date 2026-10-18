import { mkdir, readFile, writeFile } from "node:fs/promises";

const assets = [
  "index.html",
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
  "service-page.css",
  "main.js",
  "why-globe.js",
  "service-page.js",
  "assets/logo.webp",
  "fonts/GeistPixel-Circle.woff2",
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
