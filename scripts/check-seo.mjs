import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { SITE_URL, pages } from "../seo.config.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

const matches = (html, pattern) => [...html.matchAll(pattern)];

for (const page of pages) {
  const filePath = path.join(root, page.file);
  const html = await readFile(filePath, "utf8");
  const expectedCanonical = `${SITE_URL}${page.path === "/" ? "/" : page.path}`;

  if (matches(html, /<h1\b/gi).length !== 1) {
    errors.push(`${page.file}: expected exactly one h1`);
  }
  if (matches(html, /<title>/gi).length !== 1) {
    errors.push(`${page.file}: missing or incorrect title`);
  }
  if (matches(html, /name=["']description["']/gi).length !== 1) {
    errors.push(`${page.file}: expected one meta description`);
  }
  if (!html.includes(`rel="canonical" href="${expectedCanonical}"`)) {
    errors.push(`${page.file}: incorrect canonical URL`);
  }
  if (/noindex/i.test(html)) {
    errors.push(`${page.file}: unexpected noindex`);
  }

  for (const match of matches(
    html,
    /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${page.file}: invalid JSON-LD (${error.message})`);
    }
  }

  if (page.type === "home" && (!html.includes('"@type": "Organization"') || !html.includes('"@type": "WebSite"'))) {
    errors.push(`${page.file}: missing Organization or WebSite schema`);
  }
  if (page.serviceType && (!html.includes('"@type": "Service"') || !html.includes('"@type": "BreadcrumbList"'))) {
    errors.push(`${page.file}: missing Service or BreadcrumbList schema`);
  }

  for (const hrefMatch of matches(html, /href=["']([^"']+)["']/gi)) {
    const href = hrefMatch[1];
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const pathname = href.split(/[?#]/, 1)[0];
    if (pathname === "/") continue;
    const routeFile = pages.find((candidate) => candidate.path === pathname)?.file;
    if (routeFile) continue;
    if (/\.[a-z0-9]+$/i.test(pathname)) {
      try {
        await access(path.join(root, pathname.slice(1)));
      } catch {
        errors.push(`${page.file}: missing linked asset ${pathname}`);
      }
    }
  }
}

const [robots, sitemap] = await Promise.all([
  readFile(path.join(root, "robots.txt"), "utf8"),
  readFile(path.join(root, "sitemap.xml"), "utf8"),
]);

if (!robots.includes("User-agent: OAI-SearchBot") || !robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) {
  errors.push("robots.txt: missing OAI-SearchBot allowance or canonical sitemap URL");
}
for (const page of pages) {
  const url = `${SITE_URL}${page.path === "/" ? "/" : page.path}`;
  if (!sitemap.includes(`<loc>${url}</loc>`)) errors.push(`sitemap.xml: missing ${url}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`SEO checks passed for ${pages.length} public pages.`);
}
