# Bilva Tech production handover audit

Audit date: 22 October 2026

Audited deployment: `https://bilvatechcom.vercel.app/`
Repository: `chinmay2122/bilvatech.com`

The audit began as a non-destructive inventory. After owner approval, files that
were proven unreachable from the current website and build were removed. The
existing visual design and active runtime code were left untouched.

## 1. Files required by the current website

Keep these public pages:

```text
index.html
solutions.html
about.html
contact.html
separation-kernel-hypervisor.html
iot-solutions.html
cybersecurity-solutions.html
information-security-consulting.html
insights.html
user-policy.html
terms-and-conditions.html
404.html
robots.txt
sitemap.xml
```

Keep the active shared styles and scripts:

```text
styles.css
homepage.css
cto-homepage.css
solutions.css
inner-pages.css
black-motion.css
contact-page.css
testimonials.css
applications-chroma-grid.css
DotGrid.css
service-overview-dot-grid.css
solution-cta.css
pseudocode-panel.css
our-approach-zigzag.css

main.js
inner-pages.js
site-motion.js
lazy-globe.js
why-globe.js
service-dial.js
testimonials-data.js
testimonials.js
applications-chroma-grid.js
dot-grid.js
dither.js
pseudocode-panel.js
our-approach-zigzag.js
```

Keep the active media:

```text
assets/favicon.ico
assets/logo.webp
assets/logo-icon.webp
assets/logo-full.png
assets/contact-halftone-clouds.jpg
assets/cta-texture.jpg
assets/cta-background.png
assets/image-breaker.mp4
assets/Bento/
assets/testimonials/
assets/ASSETS FOR SOLUTIONS/
```

The current pages directly reference these files, or load them from an active
script or stylesheet. In particular, `cto-homepage.css` and `why-globe.js` must
not be mistaken for obsolete files: both are used by the live homepage.

## 2. Completed removal

The following items were not referenced by the current public pages or active
runtime and have now been removed. Together they accounted for approximately
**46 MB**. Git history provides recovery after the cleanup is committed.

### Generated output — 38.53 MB

```text
dist/
```

`dist/server/index.js` is a generated edge-worker bundle. Recreate it with the
build script when that deployment format is required; do not treat it as source
or upload it to Hostinger shared hosting.

### Nested legacy snapshot — 1.05 MB

```text
BilvaTech/
```

This is an older site copy nested inside the real repository. It contains another
set of pages, PDFs, an archive, and generated output. Nothing in the active site
references it.

### Exact duplicate Bento media — 2.78 MB

```text
assets/Bento Assets/
```

These eight files duplicate `assets/Bento/`. The live homepage uses
`assets/Bento/`, so retain that directory and remove only `assets/Bento Assets/`.

### Old pages and experiment — 0.16 MB

```text
homepage.html
homepage-original.html
trialhomepage.html
trialhomepage.css
trialhomepage.js
privacy.html
gloe 2.html
```

`vercel.json` already redirects the old homepage URLs to `/` and `/privacy` to
`/user-policy`. Keep those redirects after deleting the physical legacy pages.

### Superseded service-page generator — 0.25 MB

```text
service-page.css
service-page.js
unified-theme.css
service-content.json
prerender.mjs
globe.html
consulting-visual.html
cybersecurity-visual.html
iot-visual.html
architecture.js
cto-globe.js
cto-homepage.js
```

These form an older generic service renderer and homepage implementation. The
four current service pages instead use `inner-pages.css`, their current component
styles, and the active component scripts listed in section 1.

### Unused prototype source — 0.09 MB

```text
DotGrid.jsx
DotGrid.js
Stepper.jsx
Stepper.css
components/
```

The production site is static HTML/CSS/JavaScript and has no React build step.
The active runtime equivalents are `DotGrid.css`, `dot-grid.js`, `dither.js`, and
the pseudocode panel files; keep those active files.

### Unreferenced assets — 3.29 MB

```text
assets/image-breaker.png
assets/logo-attached.png
assets/logo-attached.webp
assets/logo-full.webp
assets/logo-icon.png
assets/logo.png
fonts/GeistPixel-Circle.woff2
```

The live site uses the MP4 image breaker, WebP header/footer logos, PNG social
image, and externally loaded Inter/Space Grotesk fonts. No current HTML, CSS, or
JavaScript reference the files above.

### Unused Bento polish files — 0.01 MB

```text
bento-polish.css
bento-polish.js
```

No current page imports these files.

## 3. Retained conservatively

```text
bilva-site.tar.gz
Cybersecurity Solutions.pdf
Information Security Consulting.pdf
IoT Solutions.pdf
Separation Kernel Hypervisor (2).pdf
.vscode/settings.json
```

These are not linked from the public website, but they may have source, recovery,
or developer-workflow value. They were deliberately retained because the owner
requested that doubtful files be kept. Do not upload them to the public web root.

## 4. Files that depend on the selected hosting model

Do not delete either group until the final Hostinger hosting type is confirmed.

### Vercel / Node serverless

```text
api/contact.js
vercel.json
.vercelignore
package.json
package-lock.json
```

The live form submits to `/api/contact`. The Node endpoint pins the recipient to
`karthik@bilvatechsolutions.com`, but delivery still requires valid `SMTP_HOST`,
`SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and sender settings on the host.

### PHP-capable shared hosting

```text
contact.php
api/contact.php
contact-config.php
contact-config.local.example.php
composer.json
composer.lock
vendor/
```

The PHP route is the natural candidate when the host executes PHP but not Node.
It is **not ready to publish unchanged**:

1. The form posts to extensionless `/api/contact`; shared hosting needs a rewrite
   to `api/contact.php` or an explicit PHP endpoint.
2. `contact-config.php` still contains the placeholder recipient
   `////client mail////` rather than the client's address.
3. The endpoint currently allows wildcard CORS, exposes configuration details on
   `GET`, and returns raw SMTP error details. Those disclosures must be removed.
4. SMTP credentials must be stored in server environment variables or an ignored
   `contact-config.local.php`, never committed.
5. A real controlled submission and mailbox receipt check is required before
   delivery can be claimed as working.

Composer's `vendor/` directory is deployment output. Prefer generating it with
`composer install --no-dev --optimize-autoloader` for the release package instead
of maintaining it as application source. Some shared-host deployments may still
need the generated directory uploaded if Composer is unavailable on the server.

### Optional edge-worker build

```text
build.mjs
worker.js
```

Keep these only if the client wants the self-contained edge-worker build. They
are not part of a normal Vercel static deployment or a PHP shared-host upload.

### Local development and SEO maintenance

```text
server.mjs
seo.config.mjs
scripts/
docs/
.gitignore
```

These are not public runtime files, but they should remain in the source
repository for maintenance, QA, and handover. Exclude them from the Hostinger
`public_html` upload.

The `gsap` npm package is also an unused dependency candidate: active pages load
GSAP from the jsDelivr CDN, while the Node code only imports `nodemailer`. Remove
the package dependency only in the dedicated cleanup pass and regenerate
`package-lock.json`; it is not necessary to edit it for the non-destructive audit.

## 5. Recommended handover structure

To avoid breaking the current relative paths, keep the source repository layout
unchanged for now. Produce a separate deployment package rather than moving live
files in place:

```text
bilvatech.com/                 # source repository
  active HTML/CSS/JS files
  assets/
  api/                         # selected backend source
  scripts/                     # maintenance and QA
  docs/                        # handover documentation
  README.md

release/hostinger/public_html/ # generated, untracked deployment package
  active public HTML/CSS/JS
  assets/
  selected contact backend
  host-specific rewrite rules
```

The release directory should be generated from an explicit allow-list, not by
uploading the repository wholesale. This keeps Git metadata, documentation,
source PDFs, experiments, generated worker bundles, and unused duplicates out of
the public web root.

## 6. Production checklist before Hostinger launch

- Confirm whether the account is PHP-capable shared hosting or a Node/VPS setup.
- Choose one contact backend and remove the other from the deployment package.
- Configure SMTP privately and send a controlled test submission.
- Confirm the message arrives at `karthik@bilvatechsolutions.com` and that reply-to
  targets the submitting visitor.
- Add and test host-specific clean-URL and legacy redirect rules.
- Confirm unknown routes return the custom `404.html` with an actual 404 status.
- Preserve HTTPS and redirect HTTP and duplicate hostnames to the canonical host.
- Change `SITE_URL` only when the final custom domain is known, then regenerate
  and verify canonical tags, Open Graph URLs, structured data, `robots.txt`, and
  `sitemap.xml`.
- Run `npm run seo:check` and a full desktop/mobile link, form, console, animation,
  and performance check against the final hostname.
- Submit the final sitemap in Google Search Console and Bing Webmaster Tools.

## 7. Remaining handover order

1. Review and commit the completed cleanup as a dedicated commit.
2. Confirm the Hostinger runtime and contact backend.
3. Generate a clean Hostinger release directory from an allow-list.
4. Test the release on a staging hostname before switching DNS.
