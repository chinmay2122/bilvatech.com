import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { ORGANIZATION_ID, SITE_URL, WEBSITE_ID, pages } from "../seo.config.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seoStart = "<!-- SEO:START -->";
const seoEnd = "<!-- SEO:END -->";
const socialImage = `${SITE_URL}/assets/logo-full.png`;

const absoluteUrl = (pathname) => `${SITE_URL}${pathname === "/" ? "/" : pathname}`;
const escapeHtml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "Bilva Tech",
    alternateName: "Bilva Tech Business Solutions",
    url: `${SITE_URL}/`,
    logo: {
      "@type": "ImageObject",
      url: socialImage,
      width: 1302,
      height: 354,
    },
  };
}

function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: "Bilva Tech",
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "en",
  };
}

function breadcrumbSchema(page) {
  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
  ];

  if (page.breadcrumbParents) {
    for (const parent of page.breadcrumbParents) {
      items.push({
        "@type": "ListItem",
        position: items.length + 1,
        name: parent.name,
        item: absoluteUrl(parent.path),
      });
    }
  } else if (page.serviceType) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: "Solutions",
      item: `${SITE_URL}/solutions`,
    });
  }

  items.push({
    "@type": "ListItem",
    position: items.length + 1,
    name: page.breadcrumb,
    item: absoluteUrl(page.path),
  });

  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(page.path)}#breadcrumb`,
    itemListElement: items,
  };
}

function schemaGraph(page) {
  if (page.type === "home") {
    return {
      "@context": "https://schema.org",
      "@graph": [organizationSchema(), websiteSchema()],
    };
  }

  const graph = [
    {
      "@type": "WebPage",
      "@id": `${absoluteUrl(page.path)}#webpage`,
      url: absoluteUrl(page.path),
      name: page.title,
      description: page.description,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORGANIZATION_ID },
      breadcrumb: { "@id": `${absoluteUrl(page.path)}#breadcrumb` },
      inLanguage: "en",
    },
    breadcrumbSchema(page),
  ];

  if (page.serviceType) {
    graph.push({
      "@type": "Service",
      "@id": `${absoluteUrl(page.path)}#service`,
      name: page.breadcrumb,
      serviceType: page.serviceType,
      url: absoluteUrl(page.path),
      description: page.description,
      provider: { "@id": ORGANIZATION_ID },
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

function seoBlock(page) {
  const canonical = absoluteUrl(page.path);
  const schema = JSON.stringify(schemaGraph(page), null, 2).replaceAll("<", "\\u003c");
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  return `${seoStart}
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Bilva Tech" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${socialImage}" />
    <meta property="og:image:width" content="1302" />
    <meta property="og:image:height" content="354" />
    <meta property="og:image:alt" content="Bilva Tech Business Solutions" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${socialImage}" />
    <script type="application/ld+json" data-bilva-seo>
${schema}
    </script>
    ${seoEnd}`;
}

function faqSection(page) {
  if (!page.faqs) return "";

  const items = page.faqs
    .map(
      ({ question, answer }) =>
        `<details name="service-faq-group"><summary>${question}<span class="faq-icon" aria-hidden="true">+</span></summary><div class="faq-answer-wrap"><p>${answer}</p></div></details>`,
    )
    .join("");

  return `<!-- SEO-FAQ:START --><section class="inner-box compact-faq" id="faq" aria-labelledby="faq-heading"><div class="inner-meta"><span>${escapeHtml(page.faqLabel || "06 / SERVICE QUESTIONS")}</span><span>TECHNICAL ANSWERS</span></div><div class="compact-faq-body"><div class="compact-faq-intro"><p class="inner-kicker">SERVICE-SPECIFIC QUESTIONS</p><h2 id="faq-heading">Practical answers<br>for planning.</h2><p><a class="inner-text-link" href="/solutions">Compare all solutions →</a><br><a class="inner-text-link" href="/contact">Discuss your requirements →</a></p></div><div class="compact-faq-list">${items}</div></div></section><!-- SEO-FAQ:END -->`;
}

function stripLegacySeo(html) {
  if (html.includes(seoStart)) {
    return html.replace(new RegExp(`${seoStart}[\\s\\S]*?${seoEnd}`), "");
  }

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name=["']description["'][^>]*>/i, "")
    .replace(/<meta\s+name=["']robots["'][^>]*>/i, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>/i, "")
    .replace(/<meta\s+(?:property|name)=["'](?:og:|twitter:)[^"']+["'][^>]*>/gi, "")
    .replace(/<script\s+type=["']application\/ld\+json["'][^>]*data-bilva-seo[^>]*>[\s\S]*?<\/script>/gi, "");
}

for (const page of pages) {
  const filePath = path.join(root, page.file);
  let html = await readFile(filePath, "utf8");
  const hasManagedSeoBlock = html.includes(seoStart);
  if (!hasManagedSeoBlock) html = stripLegacySeo(html);
  html = html
    .replaceAll('href="index.html"', 'href="/"')
    .replaceAll('href="solutions.html"', 'href="/solutions"')
    .replaceAll('href="about.html"', 'href="/about"')
    .replaceAll('href="contact.html"', 'href="/contact"')
    .replaceAll('href="separation-kernel-hypervisor.html"', 'href="/separation-kernel-hypervisor"')
    .replaceAll('href="iot-solutions.html"', 'href="/iot-solutions"')
    .replaceAll('href="cybersecurity-solutions.html"', 'href="/cybersecurity-solutions"')
    .replaceAll('href="secure-qr-printing.html"', 'href="/secure-qr-printing"')
    .replaceAll('href="information-security-consulting.html"', 'href="/information-security-consulting"');
  html = html
    .replaceAll('href="privacy.html"', 'href="/user-policy"')
    .replaceAll('href="user-policy.html"', 'href="/user-policy"')
    .replaceAll('href="terms-and-conditions.html"', 'href="/terms-and-conditions"');

  if (page.file === "solutions.html") {
    html = html
      .replace('id="bilva-scan-content" inert aria-hidden="true"', 'id="bilva-scan-content"')
      .replace(
        "Interactive reference architecture and technical walkthrough.",
<<<<<<< HEAD
        "Bilva Tech brings four disciplines into one secure-systems practice: separation kernel hypervisors, IoT and edge solutions, Secure QR Code, and information security consulting.",
=======
        "Bilva Tech brings four disciplines into one secure-systems practice: separation kernel hypervisors, IoT and edge solutions, connected-system cybersecurity, and information security consulting.",
>>>>>>> a8dd296c550f54f403e78c0fd81df86b2c014592
      )
      .replace('aria-controls="bilva-scan-content bilva-scan-keywords"', 'aria-controls="bilva-scan-keywords"')
      .replace("for (const el of [details, keywords])", "for (const el of [keywords])");

    if (!html.includes('id="final-cta"')) {
      const finalCta = '<section class="inner-box architecture-cta" id="final-cta" aria-labelledby="cta-heading"><div class="inner-meta"><span>04 / START A TECHNICAL CONVERSATION</span><span>BUILT AROUND YOUR SYSTEM</span></div><div class="architecture-cta-body"><div class="architecture-cta-copy"><p class="home-kicker cta-kicker">SECURITY, BUILT WITH PURPOSE</p><h2 id="cta-heading">Security built for the systems that matter.</h2><p>Clear architecture. Practical controls. Protection designed around your environment.</p><a class="cta-primary-btn" href="/contact">Start a conversation <span aria-hidden="true">→</span></a></div></div></section>';
      html = html.replace("</main>", `${finalCta}</main>`);
    }
  }

  if (page.faqs) {
    html = html.replace(/<!-- SEO-FAQ:START -->[\s\S]*?<!-- SEO-FAQ:END -->/g, "");
    html = html.replace(
      '<section class="inner-box solution-cta"',
      `${faqSection(page)}<section class="inner-box solution-cta"`,
    );
  }

  if (hasManagedSeoBlock) {
    html = html.replace(new RegExp(`${seoStart}[\\s\\S]*?${seoEnd}`), seoBlock(page));
  } else {
    html = html.replace(/<\/head>/i, `  ${seoBlock(page)}\n  </head>`);
  }
  html = html.replace(/[ \t]+$/gm, "");
  await writeFile(filePath, html);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${absoluteUrl(page.path)}</loc>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const robots = `# Bilva Tech public crawler directives
User-agent: *
Allow: /
Disallow: /api/
Disallow: /404

User-agent: OAI-SearchBot
Allow: /
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;

await Promise.all([
  writeFile(path.join(root, "sitemap.xml"), sitemap),
  writeFile(path.join(root, "robots.txt"), robots),
]);

console.log(`Generated SEO metadata for ${pages.length} pages using ${SITE_URL}`);
