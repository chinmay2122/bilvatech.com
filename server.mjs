import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".gif": "image/gif",
};

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Default to index.html for root
  if (pathname === "/") {
    pathname = "/index.html";
  }

  const safePath = path.normalize(path.join(ROOT, pathname));

  // Prevent directory traversal
  if (!safePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }

  // Helper to serve a file path
  function serveFile(filePath) {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        // Try with .html extension (clean URLs)
        if (!path.extname(filePath)) {
          const htmlPath = `${filePath}.html`;
          fs.stat(htmlPath, (htmlErr, htmlStats) => {
            if (!htmlErr && htmlStats.isFile()) {
              serveExistingFile(htmlPath);
              return;
            }
            // Try directory index.html
            const indexPath = path.join(filePath, "index.html");
            fs.stat(indexPath, (indexErr, indexStats) => {
              if (!indexErr && indexStats.isFile()) {
                serveExistingFile(indexPath);
                return;
              }
              res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
              res.end(`<h1>404 Not Found</h1><p>The path <code>${pathname}</code> was not found.</p>`);
            });
          });
          return;
        }

        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`<h1>404 Not Found</h1><p>The path <code>${pathname}</code> was not found.</p>`);
        return;
      }

      if (stats.isDirectory()) {
        const indexPath = path.join(filePath, "index.html");
        fs.stat(indexPath, (indexErr, indexStats) => {
          if (!indexErr && indexStats.isFile()) {
            serveExistingFile(indexPath);
          } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not Found");
          }
        });
        return;
      }

      serveExistingFile(filePath);
    });
  }

  function serveExistingFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });

    const stream = fs.createReadStream(filePath);
    stream.on("error", (err) => {
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain" });
      }
      res.end("Internal Server Error");
    });
    stream.pipe(res);
  }

  serveFile(safePath);
});

server.listen(PORT, () => {
  console.log(`BilvaTech local server running at http://localhost:${PORT}/`);
});
