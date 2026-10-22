# Bilva Tech website

Production source for the Bilva Tech marketing website currently published at
`https://bilvatechcom.vercel.app/`.

## Current public routes

- `/`
- `/solutions`
- `/about`
- `/contact`
- `/separation-kernel-hypervisor`
- `/iot-solutions`
- `/cybersecurity-solutions`
- `/information-security-consulting`
- `/insights`
- `/user-policy`
- `/terms-and-conditions`

The site intentionally keeps its active HTML, CSS, JavaScript, and assets at the
repository root because the pages use root-relative deployment and relative asset
paths. Do not move those files into new folders without updating and testing every
reference.

## Local checks

```powershell
npm install
npm run seo:check
npm run test:contact
npm run dev
```

`npm run dev` serves the static site locally. The Vercel contact endpoint is in
`api/contact.js`; it requires SMTP environment variables on the deployment host.

## Deployment targets

- Vercel uses `vercel.json` and `api/contact.js`.
- A PHP-capable shared host uses `contact.php`, `api/contact.php`, Composer's
  PHPMailer dependency, and a private `contact-config.local.php` file. This path
  needs the hardening and routing work identified in
  [`docs/PRODUCTION_HANDOVER.md`](docs/PRODUCTION_HANDOVER.md) before launch.
- `build.mjs` and `worker.js` create an optional edge-worker bundle. The generated
  `dist/` directory is not a source file and should not be uploaded to shared
  hosting.

## Handover safety

Do not place SMTP passwords or other secrets in Git. Copy
`contact-config.local.example.php` to `contact-config.local.php` only on the
server, then fill in the server-specific values. The local override is ignored by
Git.

The audited keep/remove inventory and recommended production package structure
are documented in [`docs/PRODUCTION_HANDOVER.md`](docs/PRODUCTION_HANDOVER.md).
